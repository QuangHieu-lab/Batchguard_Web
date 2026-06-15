import { useState, useEffect } from "react";
import { Activity, Plus } from "lucide-react";
import { useSystem } from "../contexts/SystemContext";
import { useWeather } from "../hooks/useWeather";
import { MultiCameraView, CameraData } from "../components/MultiCameraView"; 
import { MetricsPanel } from "../components/camera/MetricsPanel";
import { YoloUploadDemo } from "../components/camera/YoloUploadDemo";
import { RealtimeCameraYolo } from "../components/camera/RealtimeCameraYolo";
import { AddCameraModal } from "../components/camera/AddCameraModal";

// 🚀 Khởi tạo danh sách Camera mặc định
const INITIAL_CAMERAS: CameraData[] = [
  { id: 'CAM-01', name: 'Camera Khu A', zone: 'Khu vực A - Sân phơi chính', status: 'active', hasDetection: true },
  { id: 'CAM-02', name: 'Camera Khu B', zone: 'Khu vực B - Sân phơi phụ', status: 'active', hasDetection: false },
  { id: 'CAM-03', name: 'Camera Khu C', zone: 'Khu vực C - Khu dự phòng', status: 'active', hasDetection: false },
  { id: 'CAM-04', name: 'Camera Khu D', zone: 'Khu vực D - Khu thử nghiệm', status: 'active', hasDetection: false },
];

export default function CameraMonitoring() {
  const { activeBatch } = useSystem();
  const { currentWeather } = useWeather();

  // ===============================================
  // 🚀 STATE QUẢN LÝ CAMERA 
  // ===============================================
  const [cameras, setCameras] = useState<CameraData[]>(INITIAL_CAMERAS);
  const [selectedCameraId, setSelectedCameraId] = useState<string>(INITIAL_CAMERAS[0].id);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Xử lý tạo camera ảo
  const handleAddNewCamera = (newCamData: any) => {
    // Tạo ID mới kiểu CAM-05, CAM-06...
    const newId = `CAM-${(cameras.length + 1).toString().padStart(2, '0')}`;
    
    const newCam: CameraData = {
      id: newId,
      name: newCamData.name,
      zone: newCamData.location,
      status: 'active',
      hasDetection: false,
      streamUrl: newCamData.streamUrl // Lưu lại link ảo
    };

    // Đẩy vào danh sách
    setCameras(prev => [...prev, newCam]);
    
    // Tự động focus vào camera mới tạo
    setSelectedCameraId(newId);
  };

  // 🚀 Xử lý xóa camera ảo
  const handleDeleteCamera = (idToDelete: string) => {
    setCameras(prev => {
      const filtered = prev.filter(c => c.id !== idToDelete);
      // Nếu xóa trúng camera đang xem, tự chuyển sang cái đầu tiên
      if (selectedCameraId === idToDelete && filtered.length > 0) {
        setSelectedCameraId(filtered[0].id);
      }
      return filtered;
    });
  };

  // Mô phỏng nháy đèn báo động cho TẤT CẢ camera
  useEffect(() => {
    const interval = setInterval(() => {
      setCameras(prev => prev.map((cam, idx) => ({
        ...cam,
        hasDetection: idx === 0 ? Boolean(activeBatch) : Math.random() > 0.7,
      })));
    }, 5000);
    return () => clearInterval(interval);
  }, [activeBatch]);

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
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg transition-colors shadow-[0_0_15px_rgba(6,182,212,0.3)] font-medium"
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
        onSelectCamera={setSelectedCameraId}
        onDeleteCamera={handleDeleteCamera}
      />

      {/* 🚀 CHỈ SỐ MÔI TRƯỜNG & AI PREDICT */}
      <div className="space-y-6">
        <MetricsPanel activeBatch={activeBatch} />
      </div>

      {/* 🚀 TÍNH NĂNG AI YOLO */}
      <RealtimeCameraYolo />
      <YoloUploadDemo />
    </div>
  );
}