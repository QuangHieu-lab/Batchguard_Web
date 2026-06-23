import { useRef, useState, useCallback, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Camera, Scan, Tag, Crosshair, AlertTriangle, Upload, Video, LayoutGrid } from 'lucide-react';

const CLASS_NAMES: Record<number, string> = {
  0: "Bánh tráng mè đen",
  1: "Bánh tráng sữa",
  2: "Bánh tráng rách (Lỗi)",
};

type DetectStatus = 'success' | 'rate_limit' | 'error' | 'busy';

export function RealtimeCameraYolo() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const intervalRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  const isDetectingRef = useRef(false);
  const loopRef = useRef(false);

  const [cameraActive, setCameraActive] = useState(false);
  const [videoDemoUrl, setVideoDemoUrl] = useState<string | null>(null);
  const [realtimeDetections, setRealtimeDetections] = useState<{ label: string; confidence: number; bbox: number[] }[]>([]);
  const [realtimeError, setRealtimeError] = useState<string | null>(null);
  const [realtimeLoading, setRealtimeLoading] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [groupMode, setGroupMode] = useState(true);

  const drawDetections = useCallback((detections: { label: string; confidence: number; bbox: number[] }[]) => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video) return;
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    const drawBox = (x1: number, y1: number, x2: number, y2: number, label: string, color: string = "#00e5ff") => {
      ctx.strokeStyle = color;
      ctx.lineWidth = Math.max(3, canvas.width / 250); 
      ctx.strokeRect(x1, y1, x2 - x1, y2 - y1);
      
      ctx.fillStyle = color === "#00e5ff" ? "rgba(0,229,255,0.15)" : "rgba(168, 85, 247, 0.15)";
      ctx.fillRect(x1, y1, x2 - x1, y2 - y1);
      
      ctx.fillStyle = color;
      const fontSize = Math.max(16, canvas.width / 35); 
      ctx.font = `bold ${fontSize}px monospace`;
      ctx.fillText(label, x1 + 4, y1 + fontSize + 2);
    };

    const validDetections = detections.filter(d => d.confidence >= 0.4);

    if (groupMode && validDetections.length >= 4) {
      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
      validDetections.forEach(d => {
        const [x1, y1, x2, y2] = d.bbox;
        minX = Math.min(minX, x1);
        minY = Math.min(minY, y1);
        maxX = Math.max(maxX, x2);
        maxY = Math.max(maxY, y2);
      });
      drawBox(minX, minY, maxX, maxY, `VỈ BÁNH TRÁNG (${validDetections.length} cái)`, "#a855f7");
    } else {
      validDetections.forEach((d) => {
        if (d.bbox.length !== 4) return;
        const [x1, y1, x2, y2] = d.bbox;
        const conf = d.confidence <= 1 ? Math.round(d.confidence * 100) : Math.round(d.confidence);
        drawBox(x1, y1, x2, y2, `${d.label} ${conf}%`);
      });
    }
  }, [groupMode]);

  const captureAndDetect = useCallback(async (): Promise<DetectStatus> => {
    if (isDetectingRef.current) return 'busy';
    
    const video = videoRef.current;
    if (!video || video.readyState < 2 || video.videoWidth === 0) return 'error'; 
    
    isDetectingRef.current = true;
    setIsScanning(true);

    try {
      const vw = video.videoWidth;
      const vh = video.videoHeight;

      const MAX_DIM = 416; // Giữ mức ép xung để request nhẹ nhất có thể
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

      const API_URL = 'https://huntrot-mylongai-backed-modelai.hf.space/ai/detect-realtime';
      
      // BƯỚC 1: SEND FRAME (Gửi request và đợi)
      const res = await fetch(API_URL, {
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
      
      // BƯỚC 2: WAIT RESPONSE (Chờ lấy kết quả)
      const data = await res.json();
      setRealtimeError(null); 

      // BƯỚC 3: HIỂN THỊ KẾT QUẢ
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
      
      setRealtimeDetections(dets.length > 0 ? dets : prev => prev);
      if (dets.length > 0) drawDetections(dets);
      
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
  }, [drawDetections]);

  // 🚀 ĐỒNG BỘ LOGIC BACKEND: Polling chuẩn
  const detectLoop = useCallback(async () => {
    if (!loopRef.current) return;
    
    // Đã gộp cả 3 bước (Send -> Wait -> Draw) vào hàm này
    const status = await captureAndDetect();
    
    if (loopRef.current) {
      // BƯỚC 4: SLEEP 1~2 GIÂY TRƯỚC KHI GỬI TIẾP
      let sleepDelay = 1500; // Mặc định 1.5 giây như BE yêu cầu
      
      // Xử lý linh hoạt nếu bị lỗi mạng/quá tải
      if (status === 'rate_limit') {
        sleepDelay = 4000; // Ngủ 4s nếu bị đánh gậy 429
      } else if (status === 'error') {
        sleepDelay = 3000; // Ngủ 3s nếu lỗi mạng
      } else if (status === 'busy') {
        sleepDelay = 500; // Đang chạy thì check lại sau 0.5s
      }
      
      intervalRef.current = setTimeout(detectLoop, sleepDelay);
    }
  }, [captureAndDetect]);

  const stopAny = () => {
    loopRef.current = false;
    isDetectingRef.current = false;
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
    if (canvasRef.current) {
      canvasRef.current.getContext("2d")?.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const startCamera = async () => {
    stopAny();
    setRealtimeError(null);
    setRealtimeLoading(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 } });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setCameraActive(true);
      loopRef.current = true;
      detectLoop();
    } catch (err: any) {
      setRealtimeError(err.message ?? "Không thể truy cập camera");
    } finally {
      setRealtimeLoading(false);
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
      
      setTimeout(() => detectLoop(), 1000);
    }
  };

  useEffect(() => () => stopAny(), []);

  useEffect(() => {
    if (realtimeDetections.length > 0) {
      drawDetections(realtimeDetections);
    }
  }, [groupMode, drawDetections, realtimeDetections]);

  return (
    <Card className="border-slate-800 bg-[#151E2F] shadow-[0_4px_20px_rgba(0,0,0,0.3)]">
      <CardHeader className="border-b border-slate-800 bg-[#151E2F]">
        <CardTitle className="flex flex-col md:flex-row items-start md:items-center justify-between text-white gap-4">
          <div className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-cyan-400" />
            YOLO – Camera Realtime
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setGroupMode(!groupMode)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
                groupMode ? "bg-purple-500/20 text-purple-400 border border-purple-500/30" : "bg-slate-800 text-slate-400 border border-slate-700 hover:bg-slate-700"
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
              {groupMode ? "Đang Gộp Vỉ" : "Tách Rời"}
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
              className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-semibold transition-colors bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20 disabled:opacity-50`}
            >
              <Upload className="w-4 h-4" />
              Upload Video
            </button>

            <button
              onClick={cameraActive ? stopAny : startCamera}
              disabled={realtimeLoading}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
                cameraActive
                  ? "bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30"
                  : "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 hover:bg-cyan-500/30"
              } disabled:opacity-50`}
            >
              {realtimeLoading ? "Đang kết nối..." : cameraActive ? "Dừng AI" : "Bật Webcam"}
            </button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="relative bg-[#0B1121] rounded-xl overflow-hidden border border-slate-800 aspect-video flex items-center justify-center">
            {!cameraActive && !realtimeLoading && (
              <div className="text-center text-slate-600">
                <Video className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Bật Webcam hoặc Tải Video để bắt đầu</p>
              </div>
            )}
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={`w-full h-full object-contain ${cameraActive ? "" : "hidden"}`}
            />
            <canvas
              ref={canvasRef}
              className="absolute inset-0 w-full h-full object-contain pointer-events-none"
            />
            {cameraActive && (
              <div className="absolute top-2 left-2 flex items-center gap-1.5 bg-[#0B1121]/80 px-2 py-1 rounded text-xs font-mono text-cyan-400 border border-cyan-500/20">
                <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse" />
                {videoDemoUrl ? "VIDEO DETECT" : "LIVE DETECT"}
              </div>
            )}
            {isScanning && (
              <div className="absolute top-2 right-2 flex items-center gap-1.5 bg-orange-500/20 px-2 py-1 rounded text-xs font-mono text-orange-400 border border-orange-500/30">
                <Scan className="w-3 h-3 animate-spin" />
                SCANNING...
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
              <div className="p-4 bg-[#0B1121] rounded-xl border border-slate-800">
                <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-2">Trạng thái phát hiện</p>
                <div className="text-3xl font-bold text-cyan-400">{realtimeDetections.length}</div>
                <p className="text-sm text-slate-400 mt-1">
                  {groupMode && realtimeDetections.length >= 4 ? "đã được gộp thành 1 Vỉ bánh" : "đối tượng được tìm thấy"}
                </p>
              </div>
            )}
            {realtimeDetections.length > 0 && (
              <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
                <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider sticky top-0 bg-[#151E2F] py-1">Chi tiết ({realtimeDetections.length})</p>
                {realtimeDetections.map((d, i) => (
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
                      {d.confidence <= 1 ? Math.round(d.confidence * 100) : Math.round(d.confidence)}%
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}