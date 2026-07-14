import { useState, useEffect } from "react";
import { Activity, BrainCircuit, RefreshCcw } from "lucide-react";
import { useSystem } from "../contexts/SystemContext";
import { cameraApi, detectionApi, predictionApi, sensorApi } from "../../services/endpoints"; 
import { toast } from "sonner";
import { MultiCameraView, CameraData } from "../components/MultiCameraView"; 
import { YoloUploadDemo } from "../components/camera/YoloUploadDemo";
import { RealtimeCameraYolo } from "../components/camera/RealtimeCameraYolo";

export default function CameraMonitoring() {
  const { activeBatch } = useSystem();

  // ===============================================
  // 🚀 STATE QUẢN LÝ CAMERA (CHỈ ĐỌC - READ ONLY)
  // ===============================================
  const [cameras, setCameras] = useState<CameraData[]>([]);
  const [selectedCameraId, setSelectedCameraId] = useState<string>('');
  const [isYoloActive, setIsYoloActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // 🚀 STATE HỨNG DỮ LIỆU TỪ TRẠM YOLO ĐỂ LƯU LOG
  const [latestMetrics, setLatestMetrics] = useState({ minutesLeft: 0, dryness: 0 });

  const isBackgroundDetecting = cameras.find(c => c.id === selectedCameraId)?.hasDetection || false;

  const fetchCameras = async () => {
    setIsLoading(true);
    try {
      const data: any = await cameraApi.getAll();
      
      // Xử lý dữ liệu an toàn, phòng hờ lệch key từ Backend
      const rawCameras = Array.isArray(data) ? data : (data?.data || []);
      
      const formattedCameras: CameraData[] = rawCameras.map((c: any) => ({
        id: c.id || c._id,
        name: c.name || c.camera_name || 'Camera chưa đặt tên',
        zone: c.location || 'Chưa cập nhật vị trí',
        status: c.status === 'offline' ? 'offline' : 'online',
        streamUrl: c.stream_url || c.streamUrl || '',
        hasDetection: false,
      }));
      
      setCameras(formattedCameras);
      
      if (formattedCameras.length > 0 && !selectedCameraId) {
        setSelectedCameraId(formattedCameras[0].id);
      }
    } catch (error) {
      console.error('Lỗi tải danh sách camera:', error);
      toast.error('Không thể kết nối đến máy chủ Camera');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCameras();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 🚀 HÀM LƯU SNAPSHOT VÀO DATABASE KHI ẤN CHỌN CAMERA
  const captureAndSaveLog = async (cameraId: string) => {
    try {
      let temp = 34.0;
      let hum = 58.0;
      
      // Ưu tiên lấy nhiệt độ thực tế từ cảm biến
      try {
        const sensorRes: any = await sensorApi.getLatest(cameraId);
        if (sensorRes?.data?.temperature) {
          temp = sensorRes.data.temperature;
          hum = sensorRes.data.humidity;
        }
      } catch (e) {}

      await predictionApi.create({
        camera_id: cameraId,
        temperature: temp,
        humidity: hum,
        predicted_minutes: Math.round(latestMetrics.minutesLeft || 0)
      });
      console.log("📸 Đã lưu Log Database cho Camera:", cameraId);
    } catch (error) {
      console.error("Không thể lưu log khi chọn camera:", error);
    }
  };

  // 🚀 Tích hợp API Detection thật (Polling Nền)
  useEffect(() => {
    if (cameras.length === 0) return;
    
    let isMounted = true;
    
    const checkDetectionsReal = async () => {
      if (isYoloActive) return;

      const updatedPromises = cameras.map(async (cam) => {
        try {
          const res: any = await detectionApi.getLatest(cam.id);
          const data = res?.data || res;
          
          const hasDet = data?.has_detection || (data?.objects && data.objects.length > 0) || (data?.detected_count > 0) || false;
          
          return { ...cam, hasDetection: hasDet };
        } catch (e) { 
          return { ...cam, hasDetection: false }; 
        }
      });

      const resolvedCameras = await Promise.all(updatedPromises);
      
      if (isMounted) {
        setCameras(resolvedCameras);
      }
    };

    checkDetectionsReal();
    const intervalId = setInterval(checkDetectionsReal, 10000);
    
    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, [cameras.length, isYoloActive]); 

  // 🚀 HỨNG DỮ LIỆU TỪ TRẠM YOLO ĐỂ CẬP NHẬT TRẠNG THÁI
  const handleYoloDataUpdate = (data: { dryness: number; minutesLeft: number; hasDetection: boolean }) => {
    setLatestMetrics({ minutesLeft: data.minutesLeft, dryness: data.dryness });
    
    if (selectedCameraId) {
      setCameras(prev => prev.map(c => 
        c.id === selectedCameraId ? { ...c, hasDetection: data.hasDetection } : c
      ));
    }
  };

  // ===============================================
  // 🚀 TRÍCH XUẤT CAMERA ID XƯỞNG (LIVEKIT IDENTITY)
  // ===============================================
  const activeCamera = cameras.find(c => c.id === selectedCameraId);
  const livekitIdentity = activeCamera?.streamUrl || '';

  return (
    <div className="p-4 md:p-8 space-y-6 text-slate-200">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">Camera Quan Sát</h1>
          <p className="text-sm md:text-base text-slate-400">Theo dõi tất cả vị trí phơi bánh real-time</p>
        </div>
        
        <div className="flex items-center gap-4">
          <button 
            onClick={fetchCameras}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors disabled:opacity-50"
          >
            <RefreshCcw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} /> Tải lại
          </button>

          <div className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500/10 border border-emerald-500/30 rounded-lg shadow-[0_0_15px_rgba(16,185,129,0.15)]">
            <Activity className="w-4 h-4 text-emerald-400 animate-pulse" />
            <span className="text-sm font-semibold text-emerald-400">LIVE</span>
          </div>
        </div>
      </div>

      {/* 🚀 KHUNG VIEW MULTI CAMERA (USER CHỈ ĐƯỢC XEM) */}
      <MultiCameraView 
        cameras={cameras}
        selectedCamera={selectedCameraId}
        onSelectCamera={(id) => {
          setSelectedCameraId(id);
          captureAndSaveLog(id); 
        }}
      />

      {/* 🚀 TRẠM PHÂN TÍCH AI WEBRTC */}
      <div id="ai-station" className="pt-6 border-t border-slate-800/50 space-y-6 mt-8">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <BrainCircuit className="w-6 h-6 text-cyan-400" /> Phân Tích Thông Minh (AI)
        </h2>
        
        <RealtimeCameraYolo 
          onYoloStateChange={setIsYoloActive}
          isBackgroundActive={isBackgroundDetecting}
          onDataUpdate={handleYoloDataUpdate} 
          cameraId={selectedCameraId} 
          livekitIdentity={livekitIdentity} // 🚀 ĐÃ BỔ SUNG PROPS NÀY VÀO TRẠM AI
        />
        
        <YoloUploadDemo />
      </div>
    </div>
  );
}