import { useRef, useState, useCallback, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Camera, Scan, Tag, Crosshair, AlertTriangle } from 'lucide-react';

// 🚀 1. Đồng bộ Từ điển giống hệt App Mobile & YoloUploadDemo
const CLASS_NAMES: Record<number, string> = {
  0: "Bánh tráng mè đen",
  1: "Bánh tráng sữa",
  2: "Bánh tráng rách (Lỗi)",
};

export function RealtimeCameraYolo() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [realtimeDetections, setRealtimeDetections] = useState<{ label: string; confidence: number; bbox: number[] }[]>([]);
  const [realtimeError, setRealtimeError] = useState<string | null>(null);
  const [realtimeLoading, setRealtimeLoading] = useState(false);
  const [isScanning, setIsScanning] = useState(false);

  const drawDetections = useCallback((detections: { label: string; confidence: number; bbox: number[] }[]) => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video) return;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    detections.forEach((d) => {
      const [x1, y1, x2, y2] = d.bbox;
      ctx.strokeStyle = "#00e5ff";
      ctx.lineWidth = 2;
      ctx.strokeRect(x1, y1, x2 - x1, y2 - y1);
      ctx.fillStyle = "rgba(0,229,255,0.15)";
      ctx.fillRect(x1, y1, x2 - x1, y2 - y1);
      ctx.fillStyle = "#00e5ff";
      ctx.font = "bold 13px monospace";
      const conf = d.confidence <= 1 ? Math.round(d.confidence * 100) : Math.round(d.confidence);
      ctx.fillText(`${d.label} ${conf}%`, x1 + 4, y1 + 16);
    });
  }, []);

  const captureAndDetect = useCallback(async () => {
    const video = videoRef.current;
    if (!video || video.readyState < 2) return;
    const snap = document.createElement("canvas");
    snap.width = video.videoWidth;
    snap.height = video.videoHeight;
    snap.getContext("2d")?.drawImage(video, 0, 0);
    const base64 = snap.toDataURL("image/jpeg", 0.8).split(",")[1];
    setIsScanning(true);
    
    try {
      // 🚀 2. Sử dụng Biến môi trường thay vì Proxy/Hardcode
      const API_BASE_URL = (import.meta as any).VITE_API_URL || 'https://huntrot-mylongai-backed-modelai.hf.space ';
      
      const res = await fetch(`${API_BASE_URL}/ai/detect-realtime`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: base64 }),
      });
      
      if (!res.ok) return;
      const ct = res.headers.get('content-type') ?? '';
      if (!ct.includes('application/json')) return;
      
      const data = await res.json();
      const raw: any[] = data.objects ?? [];
      const dets = raw.map((d) => ({
        // 🚀 3. Sử dụng từ điển CLASS_NAMES chuẩn để dịch tên nhãn
        label: d.label ?? (CLASS_NAMES[d.class] ?? `Nhãn lạ (ID: ${d.class})`),
        confidence: d.confidence,
        bbox: d.bbox ?? [],
      }));
      
      setRealtimeDetections(dets.length > 0 ? dets : prev => prev);
      if (dets.length > 0) drawDetections(dets);
    } catch { /* silent */ }
    finally { setIsScanning(false); }
  }, [drawDetections]);

  const loopRef = useRef(false);

  const detectLoop = useCallback(async () => {
    if (!loopRef.current) return;
    await captureAndDetect();
    if (loopRef.current) intervalRef.current = setTimeout(detectLoop, 1500) as any;
  }, [captureAndDetect]);

  const startCamera = async () => {
    setRealtimeError(null);
    setRealtimeLoading(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 } });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
      setCameraActive(true);
      loopRef.current = true;
      detectLoop();
    } catch (err: any) {
      setRealtimeError(err.message ?? "Không thể truy cập camera");
    } finally {
      setRealtimeLoading(false);
    }
  };

  const stopCamera = () => {
    loopRef.current = false;
    if (intervalRef.current) clearTimeout(intervalRef.current as any);
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setCameraActive(false);
    setRealtimeDetections([]);
    const canvas = canvasRef.current;
    if (canvas) canvas.getContext("2d")?.clearRect(0, 0, canvas.width, canvas.height);
  };

  useEffect(() => () => stopCamera(), []);

  return (
    <Card className="border-slate-800 bg-[#151E2F] shadow-[0_4px_20px_rgba(0,0,0,0.3)]">
      <CardHeader className="border-b border-slate-800 bg-[#151E2F]">
        <CardTitle className="flex items-center justify-between text-white">
          <div className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-cyan-400" />
            YOLO – Camera Realtime
          </div>
          <button
            onClick={cameraActive ? stopCamera : startCamera}
            disabled={realtimeLoading}
            className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
              cameraActive
                ? "bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30"
                : "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 hover:bg-cyan-500/30"
            } disabled:opacity-50`}
          >
            {realtimeLoading ? "Đang kết nối..." : cameraActive ? "Dừng camera" : "Bật camera"}
          </button>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid md:grid-cols-2 gap-6">
          {/* Video + Canvas overlay */}
          <div className="relative bg-[#0B1121] rounded-xl overflow-hidden border border-slate-800 aspect-video flex items-center justify-center">
            {!cameraActive && !realtimeLoading && (
              <div className="text-center text-slate-600">
                <Camera className="w-12 h-12 mx-auto mb-2" />
                <p className="text-sm">Nhấn "Bật camera" để bắt đầu</p>
              </div>
            )}
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={`w-full h-full object-cover ${cameraActive ? "" : "hidden"}`}
            />
            <canvas
              ref={canvasRef}
              className="absolute inset-0 w-full h-full pointer-events-none"
            />
            {cameraActive && (
              <div className="absolute top-2 left-2 flex items-center gap-1.5 bg-[#0B1121]/80 px-2 py-1 rounded text-xs font-mono text-cyan-400 border border-cyan-500/20">
                <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse" />
                LIVE DETECT
              </div>
            )}
            {isScanning && (
              <div className="absolute top-2 right-2 flex items-center gap-1.5 bg-orange-500/20 px-2 py-1 rounded text-xs font-mono text-orange-400 border border-orange-500/30">
                <Scan className="w-3 h-3 animate-spin" />
                SCANNING...
              </div>
            )}
          </div>
          {/* Detection results */}
          <div className="space-y-3">
            {realtimeError && (
              <div className="flex items-center gap-2 text-red-400 text-sm p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                {realtimeError}
              </div>
            )}
            {cameraActive && (
              <div className="p-4 bg-[#0B1121] rounded-xl border border-slate-800">
                <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-2">Đang phát hiện</p>
                <div className="text-3xl font-bold text-cyan-400">{realtimeDetections.length}</div>
                <p className="text-sm text-slate-400 mt-1">đối tượng trong khung hình</p>
              </div>
            )}
            {realtimeDetections.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Chi tiết</p>
                {realtimeDetections.slice(0, 8).map((d, i) => (
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
            {cameraActive && realtimeDetections.length === 0 && (
              <div className="text-center py-6 text-slate-600">
                <Scan className="w-8 h-8 mx-auto mb-2 animate-pulse" />
                <p className="text-sm">Đang quét... chưa phát hiện đối tượng</p>
              </div>
            )}
            {!cameraActive && !realtimeError && (
              <div className="text-center py-8 text-slate-600">
                <Crosshair className="w-10 h-10 mx-auto mb-2" />
                <p className="text-sm">Bật camera để detect realtime bằng YOLO</p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}