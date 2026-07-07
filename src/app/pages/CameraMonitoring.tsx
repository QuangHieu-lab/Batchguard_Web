import { useState, useEffect } from "react";
import { Activity, Plus } from "lucide-react";
import { useSystem } from "../contexts/SystemContext";
import { useWeather } from "../hooks/useWeather";
import { cameraApi, detectionApi, predictionApi, sensorApi } from "../../services/endpoints"; // 🚀 IMPORT THÊM predictionApi & sensorApi
import { toast } from "sonner";
import { MultiCameraView, CameraData } from "../components/MultiCameraView"; 
import { MetricsPanel } from "../components/camera/MetricsPanel";
import { YoloUploadDemo } from "../components/camera/YoloUploadDemo";
import { RealtimeCameraYolo } from "../components/camera/RealtimeCameraYolo";
import { AddCameraModal } from "../components/camera/AddCameraModal";

export default function CameraMonitoring() {
  const { activeBatch } = useSystem();
  const { currentWeather } = useWeather();

  // ===============================================
  // 🚀 STATE QUẢN LÝ CAMERA 
  // ===============================================
  const [cameras, setCameras] = useState<CameraData[]>([]);
  const [selectedCameraId, setSelectedCameraId] = useState<string>('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isYoloActive, setIsYoloActive] = useState(false);
  
  // 🚀 STATE HỨNG DỮ LIỆU TỪ METRICS PANEL
  const [latestMetrics, setLatestMetrics] = useState({ temp: 34.0, hum: 58.0, minutesLeft: 0, dryness: 0 });

  const isBackgroundDetecting = cameras.find(c => c.id === selectedCameraId)?.hasDetection || false;

  const fetchCameras = async () => {
    try {
      const data: any = await cameraApi.getAll();
      const formattedCameras: CameraData[] = data.map((c: any) => ({
        id: c.id,
        name: c.name,
        zone: c.location,
        status: 'active',
        hasDetection: false,
      }));
      setCameras(formattedCameras);
      if (formattedCameras.length > 0 && !selectedCameraId) {
        setSelectedCameraId(formattedCameras[0].id);
      }
    } catch (error) {
      console.error('Lỗi tải danh sách camera:', error);
      toast.error('Không thể tải danh sách camera');
    }
  };

  useEffect(() => {
    fetchCameras();
  }, []);

  // 🚀 HÀM LƯU SNAPSHOT VÀO DATABASE KHI ẤN CHỌN CAMERA
  const captureAndSaveLog = async (cameraId: string) => {
    try {
      // Lấy nhanh sensor hiện tại để log chính xác nhất có thể
      let temp = latestMetrics.temp;
      let hum = latestMetrics.hum;
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

  const handleAddNewCamera = async (newCamData: any) => {
    if (isYoloActive) {
      toast.error("Không thể thêm Camera khi hệ thống AI YOLO đang hoạt động!");
      return;
    }

    try {
      const res: any = await cameraApi.create({
        name: newCamData.name,
        location: newCamData.location
      });
      if (res.success) {
        toast.success('Thêm camera thành công');
        await fetchCameras();
        
        // 🚀 TỰ ĐỘNG CHUYỂN SANG CAMERA VỪA TẠO VÀ LƯU LOG
        if (res.data && res.data.id) {
          setSelectedCameraId(res.data.id);
          captureAndSaveLog(res.data.id);
        }
      }
    } catch (error) {
      toast.error('Thêm camera thất bại');
      console.error(error);
    }
  };

  const handleDeleteCamera = async (idToDelete: string) => {
    try {
      const res: any = await cameraApi.delete(idToDelete);
      if (res.success) {
        toast.success('Đã xóa camera');
        setCameras(prev => {
          const filtered = prev.filter(c => c.id !== idToDelete);
          if (selectedCameraId === idToDelete && filtered.length > 0) {
            setSelectedCameraId(filtered[0].id);
          } else if (filtered.length === 0) {
            setSelectedCameraId('');
          }
          return filtered;
        });
      }
    } catch (error) {
      toast.error('Xóa camera thất bại');
      console.error(error);
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

  const handleYoloDataUpdate = (data: { dryness: number; minutesLeft: number; hasDetection: boolean }) => {
    if (selectedCameraId) {
      setCameras(prev => prev.map(c => 
        c.id === selectedCameraId ? { ...c, hasDetection: data.hasDetection } : c
      ));
    }
  };

  return (
    <div className="p-4 md:p-8 space-y-6 text-slate-200">
      
      <AddCameraModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        onAdd={handleAddNewCamera} 
      />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">Camera Quan Sát</h1>
          <p className="text-sm md:text-base text-slate-400">Theo dõi tất cả vị trí phơi bánh real-time</p>
        </div>
        
        <div className="flex items-center gap-4">
          <button 
            onClick={() => {
              if (isYoloActive) {
                toast.error("Vui lòng tắt YOLO AI trước khi thêm Camera!");
              } else {
                setIsAddModalOpen(true);
              }
            }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-colors ${
              isYoloActive 
                ? 'bg-slate-700 text-slate-400 cursor-not-allowed border border-slate-600' 
                : 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-[0_0_15px_rgba(6,182,212,0.3)]'
            }`}
          >
            <Plus className="w-4 h-4" /> Thêm Camera
          </button>

          <div className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500/10 border border-emerald-500/30 rounded-lg shadow-[0_0_15px_rgba(16,185,129,0.15)]">
            <Activity className="w-4 h-4 text-emerald-400 animate-pulse" />
            <span className="text-sm font-semibold text-emerald-400">LIVE</span>
          </div>
        </div>
      </div>

      {/* 🚀 KHUNG VIEW MULTI CAMERA */}
      <MultiCameraView 
        cameras={cameras}
        selectedCamera={selectedCameraId}
        onSelectCamera={(id) => {
          setSelectedCameraId(id);
          captureAndSaveLog(id); // 🚀 LƯU LOG KHI ẤN CHỌN CAMERA
        }}
        onDeleteCamera={handleDeleteCamera}
      />

      {/* 🚀 CHỈ SỐ MÔI TRƯỜNG & AI PREDICT */}
      <div className="space-y-6">
        <MetricsPanel 
          activeBatch={activeBatch} 
          cameraId={selectedCameraId} 
          hasDetection={cameras.find(c => c.id === selectedCameraId)?.hasDetection || false} 
          isYoloActive={isYoloActive}
          onMetricsUpdate={setLatestMetrics} // 🚀 HỨNG DỮ LIỆU TỪ METRICS PANEL
        />
      </div>

      {/* 🚀 TÍNH NĂNG AI YOLO */}
      <RealtimeCameraYolo 
        onYoloStateChange={setIsYoloActive}
        isBackgroundActive={isBackgroundDetecting}
        onDataUpdate={handleYoloDataUpdate} 
        cameraId={selectedCameraId} // 🚀 ĐÃ BỔ SUNG cameraId VÀO ĐÂY
      />
      
      <YoloUploadDemo />
    </div>
  );
}