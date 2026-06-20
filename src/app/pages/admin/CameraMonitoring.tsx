import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Camera, Wifi, WifiOff, Activity, RefreshCcw, User, PlayCircle } from 'lucide-react';
import { ImageWithFallback } from '../../components/figma/ImageWithFallback';
import { FarmSelector } from '../../components/admin/FarmSelector';
import { useFarm } from '../../contexts/FarmContext';
import { cameraApi, userApi } from '../../../services/endpoints';
import { toast } from 'sonner';

export default function CameraMonitoring() {
  const { selectedFarmId } = useFarm();
  const [cameras, setCameras] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchCameras = async () => {
    try {
      setLoading(true);
      // Gọi song song API Camera và User để map chủ sở hữu
      const [cameraRes, userRes]: [any, any] = await Promise.all([
        cameraApi.getAll(),
        userApi.getAll().catch(() => ({ data: [] })) // Tránh lỗi nếu userApi tạch
      ]);
      
      const camerasData = cameraRes?.data || cameraRes || [];
      const usersData = userRes?.data || userRes || [];

      const formattedCameras = camerasData.map((c: any) => {
        // Tìm tên chủ sở hữu camera
        const owner = usersData.find((u: any) => u.id === c.user_id);
        
        return {
          id: c.id,
          name: c.camera_name || c.name || 'Camera không tên',
          location: c.location || 'Chưa cập nhật vị trí',
          ownerName: owner ? (owner.full_name || owner.name) : 'Khách hàng ẩn danh',
          status: c.status === 'offline' ? 'offline' : 'online', // Dùng data thật
          farmId: c.user_id || 'FARM-01', // Đồng bộ farmId với user_id để FarmSelector có thể lọc
          imageUrl: '', // Luồng RTSP không render trực tiếp bằng thẻ <img> được
          streamUrl: c.stream_url || `rtsp://camera-${String(c.id).substring(0,6)}.mylong.vn/live`,
          activeBatches: 0, // Đặt về 0 vì chưa có API cho Batch
          lastUpdate: c.created_at || new Date().toISOString()
        };
      });
      
      setCameras(formattedCameras);
    } catch (error) {
      console.error('Lỗi tải danh sách camera:', error);
      toast.error('Không thể tải danh sách camera');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCameras();
  }, []);
  
  // Filter cameras by selected farm (Nếu selectedFarmId khớp với user_id)
  const filteredCameras = selectedFarmId 
    ? cameras.filter(c => c.farmId === selectedFarmId)
    : cameras;

  const onlineCameras = filteredCameras.filter(c => c.status === 'online').length;
  const offlineCameras = filteredCameras.filter(c => c.status === 'offline').length;

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Camera Monitoring</h1>
          <p className="text-slate-400 mt-1">Giám sát hệ thống Camera AI toàn khu vực</p>
        </div>
        <div className="flex gap-3">
          <FarmSelector />
          <Button 
            className="bg-blue-600 hover:bg-blue-700 text-white" 
            onClick={fetchCameras}
            disabled={loading}
          >
            <RefreshCcw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Làm mới
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Tổng Camera</p>
                <p className="text-3xl font-bold text-white mt-2">{filteredCameras.length}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Camera className="w-6 h-6 text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Online</p>
                <p className="text-3xl font-bold text-green-400 mt-2">{onlineCameras}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-green-500/10 flex items-center justify-center">
                <Wifi className="w-6 h-6 text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Offline</p>
                <p className="text-3xl font-bold text-red-400 mt-2">{offlineCameras}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-red-500/10 flex items-center justify-center">
                <WifiOff className="w-6 h-6 text-red-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Camera Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCameras.map((camera) => (
          <Card key={camera.id} className="bg-slate-900 border-slate-800 overflow-hidden">
            <CardHeader className="pb-3 border-b border-slate-800/50">
              <div className="flex items-center justify-between mb-2">
                <CardTitle className="text-lg text-white truncate pr-2">{camera.name}</CardTitle>
                <Badge 
                  className={
                    camera.status === 'online' 
                      ? 'bg-green-500/10 text-green-400 border-green-500/20 whitespace-nowrap' 
                      : 'bg-red-500/10 text-red-400 border-red-500/20 whitespace-nowrap'
                  }
                >
                  {camera.status === 'online' ? (
                    <>
                      <span className="inline-block w-2 h-2 rounded-full bg-green-400 mr-2 animate-pulse"></span>
                      Online
                    </>
                  ) : (
                    <>
                      <WifiOff className="w-3 h-3 mr-1" />
                      Offline
                    </>
                  )}
                </Badge>
              </div>
              <div className="flex flex-col gap-1">
                <p className="text-sm text-slate-400 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5" />
                  <span className="truncate">{camera.ownerName}</span>
                </p>
                <p className="text-sm text-slate-500 line-clamp-1">{camera.location}</p>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {/* Camera Preview */}
              <div className="relative aspect-video bg-black flex items-center justify-center overflow-hidden">
                {camera.status === 'online' ? (
                  <>
                    <PlayCircle className="w-12 h-12 text-white/20 hover:text-white/50 transition-colors cursor-pointer" />
                    
                    <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 rounded-md bg-black/60 backdrop-blur-sm border border-slate-700">
                      <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                      <span className="text-[10px] font-bold text-white uppercase tracking-wider">LIVE</span>
                    </div>

                    <div className="absolute bottom-2 left-2 right-2 flex justify-between text-[10px] text-white/50 font-mono bg-black/40 px-2 py-1 rounded">
                      <span className="truncate pr-4">{camera.streamUrl}</span>
                      <span className="flex-shrink-0">H.264 / 30fps</span>
                    </div>
                  </>
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                    <div className="text-center">
                      <WifiOff className="w-12 h-12 text-slate-600 mx-auto mb-2" />
                      <p className="text-sm text-slate-500">Mất kết nối Camera</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Camera Info */}
              <div className="p-4 space-y-3 bg-[#0B1121]">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-400">Lượt nhận diện (Batch)</span>
                  <span className="font-medium text-white">{camera.activeBatches}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-400">Cập nhật lần cuối</span>
                  <span className="font-medium text-slate-300">
                    {new Date(camera.lastUpdate).toLocaleString('vi-VN', {
                      day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit'
                    })}
                  </span>
                </div>

                {camera.status === 'online' && camera.activeBatches > 0 && (
                  <div className="pt-3 border-t border-slate-800">
                    <div className="flex items-center gap-2 text-xs text-green-400 font-medium">
                      <Activity className="w-4 h-4" />
                      <span>AI Model đang chạy nền...</span>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
        
        {/* NẾU KHÔNG CÓ CAMERA */}
        {filteredCameras.length === 0 && !loading && (
          <div className="col-span-full py-12 text-center border-2 border-dashed border-slate-800 rounded-xl bg-slate-900/50">
            <Camera className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400 font-medium">Không tìm thấy Camera nào</p>
            <p className="text-slate-500 text-sm mt-1">Vui lòng kiểm tra lại bộ lọc nông trại hoặc thêm camera mới.</p>
          </div>
        )}
      </div>

      {/* System Info */}
      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle className="text-white">Thông tin hệ thống AI Server</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-slate-300">Cấu hình AI Detection</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">Độ chính xác trung bình</span>
                  <span className="text-white font-medium">95.2%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Tần suất quét</span>
                  <span className="text-white font-medium">5 giây/lần</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Model AI</span>
                  <span className="text-cyan-400 font-medium">YOLOv8-custom</span>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-slate-300">Trạng thái kết nối</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">Độ trễ trung bình</span>
                  <span className="text-green-400 font-medium">45ms</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Băng thông sử dụng</span>
                  <span className="text-white font-medium">2.4 MB/s</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Uptime</span>
                  <span className="text-emerald-400 font-medium">99.8%</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}