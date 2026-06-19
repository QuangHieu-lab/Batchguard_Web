import { useState, useEffect } from "react";
import { Activity, Plus } from "lucide-react";
import { useSystem } from "../contexts/SystemContext";
import { useWeather } from "../hooks/useWeather";
import { cameraApi, detectionApi } from "../../services/endpoints";
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

  const handleAddNewCamera = async (newCamData: any) => {
    try {
      const res: any = await cameraApi.create({
        name: newCamData.name,
        location: newCamData.location
      });
      if (res.success) {
        toast.success('Thêm camera thành công');
        fetchCameras();
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

  // 🚀 Tích hợp API Detection thật
  useEffect(() => {
    if (cameras.length === 0) return;
    
    let isMounted = true;
    
    const checkDetectionsReal = async () => {
      const updatedPromises = cameras.map(async (cam) => {
        try {
          const res: any = await detectionApi.getLatest(cam.id);
          const data = res?.data || res;
          
          // Kiểm tra xem có nhận diện được bánh tráng hay không
          const hasDet = data?.has_detection || (data?.objects && data.objects.length > 0) || false;
          
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

    // Chạy ngay lần đầu
    checkDetectionsReal();
    
    // Polling mỗi 10 giây
    const intervalId = setInterval(checkDetectionsReal, 10000);
    
    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, [cameras.length]);

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
        <MetricsPanel 
          activeBatch={activeBatch} 
          cameraId={selectedCameraId} 
          hasDetection={cameras.find(c => c.id === selectedCameraId)?.hasDetection || false} 
        />
      </div>

      {/* 🚀 TÍNH NĂNG AI YOLO */}
      <RealtimeCameraYolo />
      <YoloUploadDemo />
    </div>
  );
}