import { useRef, useState, useCallback, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { 
  Camera, Scan, Tag, AlertTriangle, Upload, Video, Settings2, Percent,
  Thermometer, Droplets, CloudRain
} from 'lucide-react'; 

import apiClient from '../../../services/api'; 
import { detectionApi, cameraApi } from '../../../services/endpoints'; 
import { useAuth } from '../../contexts/AuthContext'; 

interface RealtimeCameraYoloProps {
  onYoloStateChange: React.Dispatch<React.SetStateAction<boolean>>;
  isBackgroundActive: boolean;
  onDataUpdate?: (data: { dryness: number; minutesLeft: number; hasDetection: boolean }) => void;
  cameraId: string; 
}

const CLASS_NAMES: Record<number, string> = {
  0: "Bánh tráng mè đen",
  1: "Bánh tráng sữa",
  2: "Bánh tráng rách (Lỗi)",
};

const AI_URL = 'https://huntrot-mylongai-backed-modelai.hf.space';

type DetectStatus = 'success' | 'rate_limit' | 'error' | 'busy';

export function RealtimeCameraYolo({ onYoloStateChange, isBackgroundActive, onDataUpdate, cameraId }: RealtimeCameraYoloProps) {
  const { user } = useAuth(); 
  const isPremium = user?.role === 'premium' || user?.role === 'admin';

  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null); 
  const intervalRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  const isDetectingRef = useRef(false);
  const loopRef = useRef(false);
  const hasDetectionRef = useRef(false); 

  const [dbCameras, setDbCameras] = useState<any[]>([]);
  const [localSelectedCameraId, setLocalSelectedCameraId] = useState<string>(cameraId);

  const [cameraActive, setCameraActive] = useState(false);
  const [videoDemoUrl, setVideoDemoUrl] = useState<string | null>(null);
  const [isUsingLiveStream, setIsUsingLiveStream] = useState(false);

  const [realtimeDetections, setRealtimeDetections] = useState<{ label: string; confidence: number; bbox: number[] }[]>([]);
  const [realtimeError, setRealtimeError] = useState<string | null>(null);
  const [realtimeLoading, setRealtimeLoading] = useState(false);
  const [isScanning, setIsScanning] = useState(false);

  const [weatherData, setWeatherData] = useState({ temp: 0, hum: 0, rainLabel: '', isRaining: false });
  const [predictionData, setPredictionData] = useState({ dryness: 0, minutesLeft: 0 });

  useEffect(() => {
    setLocalSelectedCameraId(cameraId);
  }, [cameraId]);

  useEffect(() => {
    const fetchDbCameras = async () => {
      try {
        const data: any = await cameraApi.getAll();
        setDbCameras(data || []);
      } catch (err) {
        console.warn("Lỗi tải danh sách camera:", err);
      }
    };
    fetchDbCameras();
  }, []);

  useEffect(() => {
    let isMounted = true;
    const fetchRealtimeData = async () => {
      if (!cameraActive) return;

      let currentTemp = 34.0;
      let currentHum = 58.0;
      let rainLabel = '';
      let isRaining = false;
      let realDryness = 0;
      let realMinutesLeft = 0;

      try {
        const weatherRes: any = await apiClient.get('/weather/analyze');
        const data = weatherRes?.data || weatherRes;
        
        if (data) {
          currentTemp = data.sensor_data?.temperature_c || data.api_weather?.temperature_c || 34.0;
          currentHum = data.sensor_data?.humidity_percent || data.api_weather?.humidity_percent || 58.0;
          
          if (isPremium && data.prediction) {
            rainLabel = data.prediction.rain_label || '';
            isRaining = data.prediction.currently_raining || false;
          }
        }
      } catch (e) {
        console.warn("Không lấy được dữ liệu thời tiết:", e);
      }

      // 🚀 ĐỒNG BỘ LOGIC CHẠY NỀN: Đọc thời gian lưu trong máy
      const storageKey = `real_start_time_yolo_${localSelectedCameraId || 'default'}`;
      let savedStartTime = localStorage.getItem(storageKey);

      // Kích hoạt tính toán nếu AI đang nhìn thấy bánh HOẶC đã có lịch sử phơi từ trước
      const isDryingActive = hasDetectionRef.current || savedStartTime !== null;
      const showPredictionUI = isDryingActive && isPremium;
      
      if (showPredictionUI) {
        let predictedMinutesFromAI = 120; 

        try {
          const calcTemp = currentTemp > 0 ? currentTemp : 34.0;
          const calcHum = currentHum > 0 ? currentHum : 58.0;

          const aiResponse = await fetch(`${AI_URL}/drying/predict`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ avg_temperature: calcTemp, avg_humidity: calcHum })
          });
          
          if (aiResponse.ok) {
            const aiData = await aiResponse.json();
            if (aiData.predicted_drying_time) {
              predictedMinutesFromAI = aiData.predicted_drying_time;
            }
          }
        } catch (aiError) {
          console.error("Lỗi khi gọi AI dự báo thời gian (YOLO):", aiError);
        }

        // Chỉ tạo mốc thời gian mới khi chưa có và AI nhìn thấy bánh
        if (!savedStartTime && hasDetectionRef.current) {
          savedStartTime = Date.now().toString();
          localStorage.setItem(storageKey, savedStartTime);
        }

        if (savedStartTime) {
          const elapsedMins = (Date.now() - parseInt(savedStartTime, 10)) / 60000;

          realMinutesLeft = Math.max(0, predictedMinutesFromAI - elapsedMins);
          realDryness = 100 - ((realMinutesLeft / predictedMinutesFromAI) * 100);
          realDryness = Math.min(100, Math.max(0, realDryness));

          if (realMinutesLeft <= 0) {
            localStorage.removeItem(storageKey);
            realDryness = 100;
            realMinutesLeft = 0;
          }
        }
      }

      if (isMounted) {
        setWeatherData({ temp: currentTemp, hum: currentHum, rainLabel, isRaining });
        setPredictionData({ dryness: realDryness, minutesLeft: realMinutesLeft });
        
        onDataUpdate?.({ dryness: realDryness, minutesLeft: realMinutesLeft, hasDetection: hasDetectionRef.current });
      }
    };

    fetchRealtimeData();
    const interval = setInterval(fetchRealtimeData, 5000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [cameraActive, isPremium, onDataUpdate, localSelectedCameraId]);

  const captureAndDetect = useCallback(async (): Promise<DetectStatus> => {
    if (isDetectingRef.current) return 'busy';
    
    const video = videoRef.current;
    if (!video || video.readyState < 2 || video.videoWidth === 0) return 'error'; 
    
    isDetectingRef.current = true;
    setIsScanning(true);

    try {
      const vw = video.videoWidth;
      const vh = video.videoHeight;
      const MAX_DIM = 640; 
      let w = vw;
      let h = vh;
      if (w > h) {
        if (w > MAX_DIM) {
          h = Math.round(h * (MAX_DIM / w));
          w = MAX_DIM;
        }
      } else {
        if (h > MAX_DIM) {
          w = Math.round(w * (MAX_DIM / h));
          h = MAX_DIM;
        }
      }

      const snap = document.createElement("canvas");
      snap.width = w;
      snap.height = h;
      
      try {
        snap.getContext("2d")?.drawImage(video, 0, 0, w, h);
      } catch (drawErr) {
        console.error("Lỗi cắt ảnh:", drawErr);
        return 'error';
      }
      
      const rawDataUrl = snap.toDataURL("image/jpeg", 0.7);
      const base64 = rawDataUrl.includes(",") ? rawDataUrl.split(",")[1] : rawDataUrl;
      
      if (base64.length < 1000) return 'error';

      const res = await fetch(`${AI_URL}/ai/detect-realtime`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: base64 }),
      });
      
      if (res.status === 429) return 'rate_limit';
      if (!res.ok) throw new Error(`API lỗi: ${res.status}`);
      
      const data = await res.json();
      setRealtimeError(null); 

      const raw: any[] = data.objects ?? [];
      const scaleX = vw / w;
      const scaleY = vh / h;

      const dets = raw.map((d) => {
        let mappedBbox: number[] = [];
        if (d.bbox && d.bbox.length === 4) {
          mappedBbox = [
            d.bbox[0] * scaleX, d.bbox[1] * scaleY,
            d.bbox[2] * scaleX, d.bbox[3] * scaleY
          ];
        }
        return {
          label: d.label ?? (CLASS_NAMES[d.class] ?? `Nhãn lạ (ID: ${d.class})`),
          confidence: d.confidence,
          bbox: mappedBbox,
        };
      });
      
      const validDets = dets.filter(d => d.confidence >= 0.3);
      const count = validDets.length;
      const totalConf = validDets.reduce((sum, d) => sum + d.confidence, 0);
      const avgConf = count > 0 ? (totalConf / count) : 0;

      setRealtimeDetections(validDets.length > 0 ? validDets : []);
      hasDetectionRef.current = validDets.length > 0; 

      if (localSelectedCameraId) {
        detectionApi.create({
          camera_id: localSelectedCameraId,
          detected_count: count,
          confidence: avgConf
        }).catch(() => {});
      }
      
      return 'success';
    } catch (err: any) {
      setRealtimeError("Lỗi kết nối trạm AI.");
      return 'error';
    } finally { 
      setIsScanning(false); 
      isDetectingRef.current = false; 
    }
  }, [localSelectedCameraId]);

  const detectLoop = useCallback(async () => {
    if (!loopRef.current) return;
    const status = await captureAndDetect();
    if (loopRef.current) {
      let sleepDelay = 2500; 
      if (status === 'rate_limit') sleepDelay = 4000; 
      else if (status === 'error') sleepDelay = 3000; 
      else if (status === 'busy') sleepDelay = 500; 
      intervalRef.current = setTimeout(detectLoop, sleepDelay);
    }
  }, [captureAndDetect]);

  const stopAny = () => {
    loopRef.current = false;
    isDetectingRef.current = false;
    hasDetectionRef.current = false; 
    setIsUsingLiveStream(false);

    if (intervalRef.current) clearTimeout(intervalRef.current);
    if (pcRef.current) {
      pcRef.current.close();
      pcRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.srcObject = null;
      videoRef.current.src = "";
    }
    if (videoDemoUrl) {
      URL.revokeObjectURL(videoDemoUrl);
      setVideoDemoUrl(null);
    }
    setCameraActive(false);
    setRealtimeDetections([]);
    setRealtimeError(null);
    onYoloStateChange(false);
    // 🚀 KHÔNG reset progress về 0. Cứ để nguyên state để `MetricsPanel` kế thừa số phút còn lại.
    onDataUpdate?.({ 
      dryness: predictionData.dryness, 
      minutesLeft: predictionData.minutesLeft, 
      hasDetection: false 
    }); 
  };

  const startCamera = async () => {
    stopAny();
    setRealtimeError(null);
    setRealtimeLoading(true);
    
    try {
      const signalUrl = (import.meta as any).env?.VITE_WEBRTC_SIGNAL_URL || 'https://camera-relay-v1.onrender.com';
      const fetchHeaders = { 'Content-Type': 'application/json' };

      const turnUrl = (import.meta as any).env?.VITE_TURN_SERVER_URL;
      const turnUser = (import.meta as any).env?.VITE_TURN_SERVER_USER;
      const turnCred = (import.meta as any).env?.VITE_TURN_SERVER_CRED;

      const iceServersConfig: RTCIceServer[] = [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
      ];

      if (turnUrl && turnUrl.trim() !== "") {
        iceServersConfig.push({
          urls: turnUrl,
          username: turnUser || "",
          credential: turnCred || "",
        });
      }

      const pc = new RTCPeerConnection({
        iceServers: iceServersConfig,
      });
      pcRef.current = pc;

      pc.oniceconnectionstatechange = () => {
        console.log("⚡ Trạng thái ICE Trạm AI:", pc.iceConnectionState);
      };

      pc.addTransceiver('video', { direction: 'recvonly' });

      pc.ontrack = (event) => {
        console.log("✅ Trạm AI Đã nhận được luồng Video:", event);
        if (event.track.kind === 'video' && videoRef.current) {
          videoRef.current.srcObject = event.streams[0] || new MediaStream([event.track]);
          videoRef.current.play().catch(e => console.error("Trình duyệt chặn Autoplay tại AI Station:", e));
          setIsUsingLiveStream(true);
        }
      };

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      await new Promise<void>((resolve) => {
        if (pc.iceGatheringState === 'complete') {
            resolve();
        } else {
            pc.onicegatheringstatechange = () => {
                if (pc.iceGatheringState === 'complete') resolve();
            };
        }
      });

      const response = await fetch(`${signalUrl}/api/view/offer`, {
        method: 'POST',
        headers: fetchHeaders,
        body: JSON.stringify({
          sdp: pc.localDescription?.sdp,
          type: pc.localDescription?.type
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => null);
        throw new Error(errData?.detail || `Lỗi ${response.status}`);
      }

      const answer = await response.json();

      if (pc.signalingState === 'closed') {
        console.warn(`⚠️ Đường ống WebRTC [AI Station] đã đóng trước khi nhận Answer SDP. Bỏ qua.`);
        return;
      }

      await pc.setRemoteDescription(new RTCSessionDescription(answer));

      setCameraActive(true);
      loopRef.current = true;
      detectLoop();
      onYoloStateChange(true);
    } catch (err: any) {
      console.error("Lỗi WebRTC AI:", err);
      if (err.message.includes("Camera is offline") || err.message.includes("503")) {
        setRealtimeError("Camera đang ngoại tuyến. Chưa có thiết bị xưởng đẩy luồng.");
      } else {
        setRealtimeError("Trạm WebRTC Cloud đang bận hoặc từ chối truy cập.");
      }
    } finally {
      setRealtimeLoading(false);
    }
  };

  const handleCameraChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newDbId = e.target.value;
    setLocalSelectedCameraId(newDbId);
    if (cameraActive && !videoDemoUrl) {
      stopAny();
      setTimeout(() => setLocalSelectedCameraId(newDbId), 0);
      setTimeout(() => startCamera(), 300);
    }
  };

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    stopAny();
    const url = URL.createObjectURL(file);
    setVideoDemoUrl(url);
    if (videoRef.current) {
      videoRef.current.src = url;
      videoRef.current.loop = true;
      videoRef.current.play().catch(() => {});
      setCameraActive(true);
      loopRef.current = true;
      onYoloStateChange(true);
      setTimeout(() => detectLoop(), 1000);
    }
  };

  useEffect(() => () => stopAny(), []);

  const validDetections = realtimeDetections.filter(d => d.confidence >= 0.3);
  const totalConfidence = validDetections.reduce((sum, d) => sum + d.confidence, 0);
  const avgConfidence = validDetections.length > 0 ? (totalConfidence / validDetections.length) * 100 : 0;
  const estimatedCompletion = new Date(Date.now() + predictionData.minutesLeft * 60000);

  return (
    <Card className="border-slate-800 bg-[#151E2F] shadow-[0_4px_20px_rgba(0,0,0,0.3)]">
      <CardHeader className="border-b border-slate-800 bg-[#151E2F]">
        <CardTitle className="flex flex-col xl:flex-row items-start xl:items-center justify-between text-white gap-4">
          <div className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-cyan-400" />
            Trạm Phân Tích AI (WebRTC SFU)
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            {dbCameras.length > 0 && (
              <div className="flex items-center bg-[#0B1121] border border-slate-700 rounded-lg px-2 py-1">
                <Settings2 className="w-4 h-4 text-slate-400 mr-2" />
                <select 
                  value={localSelectedCameraId}
                  onChange={handleCameraChange}
                  className="bg-transparent text-sm font-medium text-cyan-400 focus:outline-none cursor-pointer max-w-[150px] truncate"
                >
                  <option value="" disabled className="text-slate-500">Chọn Camera</option>
                  {dbCameras.map((cam) => (
                    <option key={cam.id} value={cam.id} className="bg-[#151E2F] text-white">
                      {cam.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <input type="file" accept="video/*" className="hidden" ref={fileInputRef} onChange={handleVideoUpload} />
            
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={realtimeLoading}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20"
            >
              <Upload className="w-4 h-4" />
              <span>Test Video Demo</span>
            </button>

            <button
              onClick={() => {
                if (!localSelectedCameraId) { alert("Vui lòng chọn 1 Camera trước!"); return; }
                cameraActive ? stopAny() : startCamera();
              }}
              disabled={realtimeLoading}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-bold ${
                cameraActive ? "bg-red-500 text-white" : "bg-cyan-500 text-white"
              }`}
            >
              {realtimeLoading ? "Đang kết nối..." : cameraActive ? "Dừng Phân Tích" : "Kích Hoạt AI WebRTC"}
            </button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="relative bg-[#0B1121] rounded-xl overflow-hidden border border-slate-800 aspect-video flex items-center justify-center shadow-inner">
            
            {!cameraActive && !realtimeLoading && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-600 z-10">
                <Video className="w-12 h-12 mb-2 opacity-50" />
                <p className="text-sm">Chọn Camera & Bật AI để quét WebRTC</p>
              </div>
            )}
            
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              crossOrigin="anonymous" 
              className={`absolute inset-0 w-full h-full object-contain transition-opacity duration-300 z-0 ${
                cameraActive ? "opacity-100" : "opacity-0"
              }`}
            />

            {cameraActive && (
              <div className="absolute top-2 left-2 bg-[#0B1121]/80 backdrop-blur-md px-2 py-1 rounded text-xs font-mono text-cyan-400 border border-cyan-500/20 z-20">
                <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse inline-block mr-1" />
                {videoDemoUrl ? "VIDEO TEST" : "LIVE WEBRTC < 0.5s"}
              </div>
            )}
            {isScanning && (
              <div className="absolute top-2 right-2 bg-orange-500/20 px-2 py-1 rounded text-xs font-mono text-orange-400 border border-orange-500/30 z-20">
                <Scan className="w-3 h-3 animate-spin inline-block mr-1" />
                AI Đang quét...
              </div>
            )}
          </div>
          
          <div className="space-y-3">
            {realtimeError && (
              <div className="flex items-center gap-2 text-amber-400 text-sm p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                {realtimeError}
              </div>
            )}
            {cameraActive && !realtimeError && (
              <div className="p-4 bg-[#0B1121] rounded-xl border border-slate-800 flex flex-col justify-between">
                <div>
                  <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-2">Thông tin nhận diện</p>
                  <div className="text-3xl font-bold text-cyan-400">{validDetections.length} Bánh</div>
                </div>
                <div className="mt-4 pt-4 border-t border-slate-800/50 flex justify-between items-center">
                  <div className="text-slate-400 text-sm flex items-center gap-2">
                    <Percent className="w-4 h-4 text-emerald-400" /> Độ tự tin AI:
                  </div>
                  <div className="font-bold text-lg text-emerald-400">
                    {validDetections.length > 0 ? `${avgConfidence.toFixed(1)}%` : "0%"}
                  </div>
                </div>
              </div>
            )}
            
            {validDetections.length > 0 && (
              <div className="space-y-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                {validDetections.map((d, i) => (
                  <div key={i} className="flex items-center justify-between p-2.5 bg-[#0B1121] rounded-lg border border-slate-800">
                    <div className="flex items-center gap-2">
                      <Tag className="w-4 h-4 text-cyan-400" />
                      <span className="text-sm text-slate-200">{d.label}</span>
                    </div>
                    <Badge className="text-xs bg-cyan-500/10 text-cyan-400 border-cyan-500/30">
                      {Math.round(d.confidence * 100)}%
                    </Badge>
                  </div>
                ))}
              </div>
            )}

            {cameraActive && !realtimeError && (
              <div className="bg-[#0B1121] rounded-xl border border-slate-800 p-4 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-[#151E2F] rounded-lg flex flex-col items-center">
                    <Thermometer className="w-5 h-5 text-orange-400 mb-1" />
                    <span className="text-lg font-bold text-white">{weatherData.temp.toFixed(1)}°C</span>
                    <span className="text-[10px] text-slate-500 uppercase">Nhiệt độ</span>
                  </div>
                  <div className="p-3 bg-[#151E2F] rounded-lg flex flex-col items-center">
                    <Droplets className="w-5 h-5 text-cyan-400 mb-1" />
                    <span className="text-lg font-bold text-white">{weatherData.hum.toFixed(1)}%</span>
                    <span className="text-[10px] text-slate-500 uppercase">Độ ẩm</span>
                  </div>
                </div>

                {isPremium && weatherData.rainLabel && (
                  <div className={`p-2.5 rounded-lg border text-sm font-bold ${
                    weatherData.isRaining || weatherData.rainLabel.includes('cao') ? 'bg-rose-500/10 border-rose-500/30 text-rose-400' : 'bg-blue-500/10 border-blue-500/30 text-blue-400'
                  }`}>
                    <CloudRain className="w-4 h-4 inline-block mr-2" /> {weatherData.rainLabel}
                  </div>
                )}

                {/* 🚀 ĐỒNG BỘ HIỂN THỊ TIẾN ĐỘ THỜI GIAN THỰC Kể cả khi mất dấu bánh trong vài giây */}
                {(hasDetectionRef.current || predictionData.dryness > 0) ? (
                  <div className="space-y-3 pt-2 border-t border-slate-800/50">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-400">Dự kiến thu hoạch:</span>
                      <span className="text-base font-bold text-violet-400">
                        {predictionData.minutesLeft > 0 ? estimatedCompletion.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                      </span>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-emerald-400 font-medium">Độ khô bánh:</span>
                        <span className="text-xs font-bold text-emerald-400">{Math.round(predictionData.dryness)}%</span>
                      </div>
                      <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)]" style={{ width: `${Math.round(predictionData.dryness)}%` }} />
                      </div>
                    </div>
                    
                    {/* 🚀 CẢNH BÁO AI TẠM MẤT DẤU */}
                    {!hasDetectionRef.current && predictionData.minutesLeft > 0 && (
                      <div className="flex flex-col items-center justify-center p-2 bg-amber-500/10 border border-amber-500/20 rounded-lg mt-2 text-center">
                        <span className="text-xs font-semibold text-amber-400">AI đang tạm mất dấu mẻ bánh</span>
                        <span className="text-[10px] text-amber-500/80">Tiến độ vẫn được lưu và đếm ngược ngầm</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-2 bg-slate-800/30 rounded text-center text-xs text-slate-400">AI chưa thấy bánh trên giàn phơi.</div>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}