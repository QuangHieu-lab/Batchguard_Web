import { useRef, useState, useCallback, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { 
  Camera, Scan, Tag, AlertTriangle, Upload, Video, LayoutGrid, Settings2, Percent,
  Thermometer, Droplets, CloudRain, Lock, Clock, TrendingUp
} from 'lucide-react';

import apiClient from '../../../services/api'; 
import { detectionApi } from '../../../services/endpoints'; 
import { useAuth } from '../../contexts/AuthContext'; 

// 🚀 1. THÊM cameraId VÀO PROPS
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

// 🚀 2. NHẬN cameraId TỪ CHA
export function RealtimeCameraYolo({ onYoloStateChange, isBackgroundActive, onDataUpdate, cameraId }: RealtimeCameraYoloProps) {
  const { user } = useAuth(); 
  const isPremium = user?.role === 'premium';

  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const intervalRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  const isDetectingRef = useRef(false);
  const loopRef = useRef(false);
  const hasDetectionRef = useRef(false); 

  const [availableCameras, setAvailableCameras] = useState<MediaDeviceInfo[]>([]);
  const [selectedCameraId, setSelectedCameraId] = useState<string>('');

  const [cameraActive, setCameraActive] = useState(false);
  const [videoDemoUrl, setVideoDemoUrl] = useState<string | null>(null);
  const [realtimeDetections, setRealtimeDetections] = useState<{ label: string; confidence: number; bbox: number[] }[]>([]);
  const [realtimeError, setRealtimeError] = useState<string | null>(null);
  const [realtimeLoading, setRealtimeLoading] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [groupMode, setGroupMode] = useState(true);

  const [weatherData, setWeatherData] = useState({ temp: 0, hum: 0, rainLabel: '', isRaining: false });
  const [predictionData, setPredictionData] = useState({ dryness: 0, minutesLeft: 0 });

  useEffect(() => {
    const getHardwareCameras = async () => {
      try {
        await navigator.mediaDevices.getUserMedia({ video: true }).then(s => s.getTracks().forEach(t => t.stop()));
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter(device => device.kind === 'videoinput');
        
        setAvailableCameras(videoDevices);
        if (videoDevices.length > 0) setSelectedCameraId(videoDevices[0].deviceId);
      } catch (err) {
        console.warn("Không thể lấy danh sách Webcam", err);
      }
    };

    getHardwareCameras();
    // 🚀 ĐÃ XÓA hàm getDatabaseCameras() vì giờ đã lấy cameraId từ cha
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

      const showPredictionUI = hasDetectionRef.current && isPremium;
      
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

        // 🚀 3. LƯU THỜI GIAN THEO ĐÚNG cameraId TỪ CHA TRUYỀN VÀO
        const storageKey = `real_start_time_yolo_${cameraId || 'default'}`;
        let savedStartTime = localStorage.getItem(storageKey);

        if (!savedStartTime) {
          savedStartTime = Date.now().toString();
          localStorage.setItem(storageKey, savedStartTime);
        }

        const elapsedMins = (Date.now() - parseInt(savedStartTime, 10)) / 60000;

        realMinutesLeft = Math.max(0, predictedMinutesFromAI - elapsedMins);
        realDryness = 100 - ((realMinutesLeft / predictedMinutesFromAI) * 100);

        if (realMinutesLeft <= 0) {
          localStorage.removeItem(storageKey);
          realDryness = 100;
          realMinutesLeft = 0;
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
  }, [cameraActive, isPremium, onDataUpdate, cameraId]); // 🚀 4. CẬP NHẬT DEPENDENCY LÀ cameraId

  const captureAndDetect = useCallback(async (): Promise<DetectStatus> => {
    if (isDetectingRef.current) return 'busy';
    
    const video = videoRef.current;
    if (!video || video.readyState < 2 || video.videoWidth === 0) return 'error'; 
    
    isDetectingRef.current = true;
    setIsScanning(true);

    try {
      const vw = video.videoWidth;
      const vh = video.videoHeight;

      const MAX_DIM = 416;
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
      snap.getContext("2d")?.drawImage(video, 0, 0, w, h);
      
      const rawDataUrl = snap.toDataURL("image/jpeg", 0.5);
      const base64 = rawDataUrl.includes(",") ? rawDataUrl.split(",")[1] : rawDataUrl;
      
      if (base64.length < 1000) return 'error';

      const DETECT_URL = `${AI_URL}/ai/detect-realtime`;
      
      const res = await fetch(DETECT_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: base64 }),
      });
      
      if (res.status === 429) {
        setRealtimeError("Server AI báo bận, đang lùi thời gian chờ...");
        return 'rate_limit'; 
      }

      if (!res.ok) throw new Error(`API lỗi: ${res.status}`);
      
      const ct = res.headers.get('content-type') ?? '';
      if (!ct.includes('application/json')) return 'error';
      
      const data = await res.json();
      setRealtimeError(null); 

      const raw: any[] = data.objects ?? [];
      const scaleX = vw / w;
      const scaleY = vh / h;

      const dets = raw.map((d) => {
        let mappedBbox: number[] = [];
        if (d.bbox && d.bbox.length === 4) {
          mappedBbox = [
            d.bbox[0] * scaleX,
            d.bbox[1] * scaleY,
            d.bbox[2] * scaleX,
            d.bbox[3] * scaleY
          ];
        }
        return {
          label: d.label ?? (CLASS_NAMES[d.class] ?? `Nhãn lạ (ID: ${d.class})`),
          confidence: d.confidence,
          bbox: mappedBbox,
        };
      });
      
      const validDets = dets.filter(d => d.confidence >= 0.4);
      const count = validDets.length;
      
      const totalConf = validDets.reduce((sum, d) => sum + d.confidence, 0);
      const avgConf = count > 0 ? (totalConf / count) : 0;

      setRealtimeDetections(validDets.length > 0 ? validDets : prev => prev);
      
      hasDetectionRef.current = validDets.length > 0; 

      // 🚀 5. GỬI DỮ LIỆU NHẬN DIỆN VỀ ĐÚNG ID CAMERA MÀ CHA TRUYỀN XUỐNG
      if (cameraId) {
        try {
          detectionApi.create({
            camera_id: cameraId,
            detected_count: count,
            confidence: avgConf
          })
          .catch((err) => {
            console.error("❌ LỖI LƯU DATABASE YOLO:", err.response?.status || err.message);
          });
        } catch (e) {
          console.error("Lỗi code khi gọi detectionApi:", e);
        }
      }
      
      return 'success';
    } catch (err: any) {
      if (!err.message?.includes('429')) {
        setRealtimeError("Đứt kết nối, đang thử lại...");
      }
      return 'error';
    } finally { 
      setIsScanning(false); 
      isDetectingRef.current = false; 
    }
  }, [cameraId]); // 🚀 6. SỬA DEPENDENCY THÀNH cameraId

  const detectLoop = useCallback(async () => {
    if (!loopRef.current) return;
    
    const status = await captureAndDetect();
    
    if (loopRef.current) {
      let sleepDelay = 2500; 
      
      if (status === 'rate_limit') {
        sleepDelay = 4000; 
      } else if (status === 'error') {
        sleepDelay = 3000; 
      } else if (status === 'busy') {
        sleepDelay = 500; 
      }
      
      intervalRef.current = setTimeout(detectLoop, sleepDelay);
    }
  }, [captureAndDetect]);

  const stopAny = () => {
    loopRef.current = false;
    isDetectingRef.current = false;
    hasDetectionRef.current = false; 
    if (intervalRef.current) clearTimeout(intervalRef.current);
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
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
    onDataUpdate?.({ dryness: 0, minutesLeft: 0, hasDetection: false }); 
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const startCamera = async (targetDeviceId?: string) => {
    const deviceIdToUse = targetDeviceId || selectedCameraId;
    stopAny();
    setRealtimeError(null);
    setRealtimeLoading(true);
    
    try {
      const constraints = {
        video: deviceIdToUse 
          ? { deviceId: { exact: deviceIdToUse }, width: 640, height: 480 } 
          : { width: 640, height: 480 }
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setCameraActive(true);
      loopRef.current = true;
      detectLoop();
      onYoloStateChange(true);
    } catch (err: any) {
      setRealtimeError(err.message ?? "Không thể truy cập camera");
    } finally {
      setRealtimeLoading(false);
    }
  };

  const handleCameraChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newDeviceId = e.target.value;
    setSelectedCameraId(newDeviceId);
    
    if (cameraActive && !videoDemoUrl) {
      stopAny();
      setTimeout(() => startCamera(newDeviceId), 300);
    }
  };

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    stopAny();
    setRealtimeError(null);

    const url = URL.createObjectURL(file);
    setVideoDemoUrl(url);

    if (videoRef.current) {
      videoRef.current.srcObject = null;
      videoRef.current.src = url;
      videoRef.current.loop = true;
      videoRef.current.play().catch(e => console.warn("Trình duyệt chặn autoplay:", e));
      
      setCameraActive(true);
      loopRef.current = true;
      onYoloStateChange(true);
      
      setTimeout(() => detectLoop(), 1000);
    }
  };

  useEffect(() => () => stopAny(), []);

  const validDetections = realtimeDetections.filter(d => d.confidence >= 0.4);
  const totalConfidence = validDetections.reduce((sum, d) => sum + d.confidence, 0);
  const avgConfidence = validDetections.length > 0 ? (totalConfidence / validDetections.length) * 100 : 0;
  
  const estimatedCompletion = new Date(Date.now() + predictionData.minutesLeft * 60000);

  return (
    <Card className="border-slate-800 bg-[#151E2F] shadow-[0_4px_20px_rgba(0,0,0,0.3)]">
      <CardHeader className="border-b border-slate-800 bg-[#151E2F]">
        <CardTitle className="flex flex-col xl:flex-row items-start xl:items-center justify-between text-white gap-4">
          <div className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-cyan-400" />
            YOLO – Camera Realtime
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            {availableCameras.length > 0 && !videoDemoUrl && (
              <div className="flex items-center bg-[#0B1121] border border-slate-700 rounded-lg px-2 py-1" title="Chọn Webcam máy tính">
                <Settings2 className="w-4 h-4 text-slate-400 mr-2" />
                <select 
                  value={selectedCameraId}
                  onChange={handleCameraChange}
                  className="bg-transparent text-sm font-medium text-cyan-400 focus:outline-none cursor-pointer max-w-[120px] truncate"
                >
                  {availableCameras.map((cam, idx) => (
                    <option key={cam.deviceId} value={cam.deviceId} className="bg-[#151E2F] text-white">
                      {cam.label || `Webcam ${idx + 1}`}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <button
              onClick={() => setGroupMode(!groupMode)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
                groupMode ? "bg-purple-500/20 text-purple-400 border border-purple-500/30" : "bg-slate-800 text-slate-400 border border-slate-700 hover:bg-slate-700"
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
              <span className="hidden sm:inline">{groupMode ? "Thống kê theo Vỉ" : "Chi tiết từng Bánh"}</span>
            </button>

            <input 
              type="file" 
              accept="video/mp4,video/webm,video/ogg,video/quicktime" 
              className="hidden" 
              ref={fileInputRef} 
              onChange={handleVideoUpload} 
            />
            
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={realtimeLoading}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20 disabled:opacity-50`}
            >
              <Upload className="w-4 h-4" />
              <span className="hidden sm:inline">Upload Video</span>
            </button>

            <button
              onClick={() => {
                if (cameraActive) {
                    stopAny();
                    onYoloStateChange(false);
                } else {
                    startCamera();
                }
              }}
              disabled={realtimeLoading}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-bold transition-colors ${
                cameraActive
                  ? "bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/20"
                  : "bg-cyan-500 hover:bg-cyan-600 text-white shadow-lg shadow-cyan-500/20"
              } disabled:opacity-50`}
            >
              {realtimeLoading ? "Đang kết nối..." : cameraActive ? "Dừng AI" : "Chạy AI Camera"}
            </button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="relative bg-[#0B1121] rounded-xl overflow-hidden border border-slate-800 aspect-video flex items-center justify-center shadow-inner">
            {!cameraActive && !realtimeLoading && (
              <div className="text-center text-slate-600">
                <Video className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Bật Webcam hoặc Tải Video để bắt đầu giám sát</p>
                <p className="text-xs text-emerald-500/70 mt-2 font-medium">Kết quả sẽ được tự động lưu vào Database hệ thống</p>
              </div>
            )}
            
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={`w-full h-full object-contain ${cameraActive ? "" : "hidden"}`}
            />

            {cameraActive && (
              <div className="absolute top-2 left-2 flex items-center gap-1.5 bg-[#0B1121]/80 px-2 py-1 rounded text-xs font-mono text-cyan-400 border border-cyan-500/20">
                <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse" />
                {videoDemoUrl ? "VIDEO giám sát" : "LIVE Camera"}
              </div>
            )}
            {isScanning && (
              <div className="absolute top-2 right-2 flex items-center gap-1.5 bg-orange-500/20 px-2 py-1 rounded text-xs font-mono text-orange-400 border border-orange-500/30">
                <Scan className="w-3 h-3 animate-spin" />
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
            {cameraActive && (
              <div className="p-4 bg-[#0B1121] rounded-xl border border-slate-800 flex flex-col justify-between">
                <div>
                  <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-2">Thông tin giám sát</p>
                  <div className="text-3xl font-bold text-cyan-400">
                    {groupMode && validDetections.length >= 4 ? "1 Vỉ" : validDetections.length}
                  </div>
                  <p className="text-sm text-slate-400 mt-1">
                    {groupMode && validDetections.length >= 4 
                      ? `Phát hiện 1 Vỉ Bánh Tráng (Gồm ${validDetections.length} bánh)` 
                      : "đối tượng được tìm thấy"}
                  </p>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-800/50 flex justify-between items-center">
                  <div className="flex items-center gap-2 text-slate-400 text-sm">
                    <Percent className="w-4 h-4 text-emerald-400" />
                    Độ tin cậy AI:
                  </div>
                  <div className={`font-bold text-lg ${avgConfidence >= 80 ? 'text-emerald-400' : avgConfidence >= 50 ? 'text-amber-400' : 'text-red-400'}`}>
                    {validDetections.length > 0 ? `${avgConfidence.toFixed(1)}%` : "0%"}
                  </div>
                </div>
              </div>
            )}
            
            {validDetections.length > 0 && !groupMode && (
              <div className="space-y-2 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider sticky top-0 bg-[#151E2F] py-1 z-10">Chi tiết ({validDetections.length})</p>
                {validDetections.map((d, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-[#0B1121] rounded-lg border border-slate-800">
                    <div className="flex items-center gap-2">
                      <Tag className="w-4 h-4 text-cyan-400" />
                      <span className="text-sm text-slate-200">{d.label}</span>
                    </div>
                    <Badge className={`text-xs ${
                      d.confidence >= 0.9 ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                      : d.confidence >= 0.75 ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/30"
                      : "bg-slate-700 text-slate-400 border-slate-600"
                    }`}>
                      {Math.round(d.confidence * 100)}%
                    </Badge>
                  </div>
                ))}
              </div>
            )}
            {cameraActive && validDetections.length === 0 && !realtimeError && (
              <div className="text-center py-6 text-slate-600">
                <Scan className="w-8 h-8 mx-auto mb-2 animate-pulse" />
                <p className="text-sm">Đang quét... Không có sản phẩm trên sân</p>
              </div>
            )}

            {cameraActive && (
              <div className="bg-[#0B1121] rounded-xl border border-slate-800 shadow-inner p-4 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-[#151E2F] rounded-lg border border-slate-800/50 flex flex-col items-center justify-center">
                    <Thermometer className="w-5 h-5 text-orange-400 mb-1" />
                    <span className="text-xl font-bold text-white">{weatherData.temp > 0 ? weatherData.temp.toFixed(1) : "34.0"}°C</span>
                    <span className="text-[10px] text-slate-500 uppercase font-medium mt-1">Nhiệt độ</span>
                  </div>
                  <div className="p-3 bg-[#151E2F] rounded-lg border border-slate-800/50 flex flex-col items-center justify-center">
                    <Droplets className="w-5 h-5 text-cyan-400 mb-1" />
                    <span className="text-xl font-bold text-white">{weatherData.hum > 0 ? weatherData.hum.toFixed(1) : "58.0"}%</span>
                    <span className="text-[10px] text-slate-500 uppercase font-medium mt-1">Độ ẩm</span>
                  </div>
                </div>

                {isPremium && weatherData.rainLabel && (
                  <div className={`p-2.5 rounded-lg border flex-row items-center gap-2 ${
                    weatherData.isRaining || weatherData.rainLabel.includes('cao')
                      ? 'bg-rose-500/10 border-rose-500/30 text-rose-400' 
                      : 'bg-blue-500/10 border-blue-500/30 text-blue-400'
                  }`}>
                    <CloudRain className="w-4 h-4 inline-block mr-2" />
                    <span className="text-sm font-bold">{weatherData.rainLabel}</span>
                  </div>
                )}

                {!isPremium ? (
                  <div className="p-4 bg-[#151E2F] rounded-lg border border-dashed border-amber-500/50 flex flex-col items-center justify-center text-center">
                    <Lock className="w-5 h-5 text-amber-400 mb-2" />
                    <h4 className="text-amber-400 font-bold text-sm">Gói Premium</h4>
                    <p className="text-xs text-slate-400 mt-1">Mở khóa để xem AI dự báo thời gian khô.</p>
                  </div>
                ) : hasDetectionRef.current ? (
                  <div className="space-y-3 pt-2 border-t border-slate-800/50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-violet-400" />
                        <span className="text-sm font-medium text-slate-400">Dự kiến thu hoạch</span>
                      </div>
                      <span className="text-lg font-bold text-violet-400">
                        {predictionData.minutesLeft > 0 ? estimatedCompletion.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                      </span>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-emerald-400 font-medium flex items-center gap-1">
                          <TrendingUp className="w-3 h-3" /> Độ khô hiện tại
                        </span>
                        <span className="text-sm font-bold text-emerald-400">{Math.round(predictionData.dryness)}%</span>
                      </div>
                      <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)] transition-all duration-300 ease-linear"
                          style={{ width: `${Math.round(predictionData.dryness)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 bg-slate-800/30 rounded-lg border border-dashed border-slate-700 text-center">
                    <p className="text-xs text-slate-400">AI chưa phát hiện bánh trên sân.</p>
                  </div>
                )}
              </div>
            )}

          </div>
        </div>
      </CardContent>
    </Card>
  );
}