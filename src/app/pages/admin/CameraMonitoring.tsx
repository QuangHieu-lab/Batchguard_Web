import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Camera, Wifi, WifiOff, Activity, RefreshCcw } from 'lucide-react';
import { mockCameras } from '../../data/adminMockData';
import { ImageWithFallback } from '../../components/figma/ImageWithFallback';
import { FarmSelector } from '../../components/admin/FarmSelector';
import { useFarm } from '../../contexts/FarmContext';

export default function CameraMonitoring() {
  const { selectedFarmId } = useFarm();
  
  // Filter cameras by selected farm
  const filteredCameras = selectedFarmId 
    ? mockCameras.filter(c => c.farmId === selectedFarmId)
    : mockCameras;

  const onlineCameras = filteredCameras.filter(c => c.status === 'online').length;
  const offlineCameras = filteredCameras.filter(c => c.status === 'offline').length;

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Camera Monitoring</h1>
          <p className="text-slate-400 mt-1">Giám sát camera AI theo thời gian thực</p>
        </div>
        <div className="flex gap-3">
          <FarmSelector />
          <Button className="bg-blue-600 hover:bg-blue-700">
            <RefreshCcw className="w-4 h-4 mr-2" />
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
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg text-white">{camera.name}</CardTitle>
                <Badge 
                  className={
                    camera.status === 'online' 
                      ? 'bg-green-500/10 text-green-400 border-green-500/20' 
                      : 'bg-red-500/10 text-red-400 border-red-500/20'
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
              <p className="text-sm text-slate-400">{camera.location}</p>
            </CardHeader>
            <CardContent className="p-0">
              {/* Camera Preview */}
              <div className="relative aspect-video bg-slate-800">
                <ImageWithFallback
                  src={camera.imageUrl}
                  alt={camera.name}
                  className="w-full h-full object-cover"
                />
                {camera.status === 'online' && (
                  <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 rounded-md bg-black/60 backdrop-blur-sm">
                    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                    <span className="text-xs text-white">LIVE</span>
                  </div>
                )}
                {camera.status === 'offline' && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                    <div className="text-center">
                      <WifiOff className="w-12 h-12 text-slate-500 mx-auto mb-2" />
                      <p className="text-sm text-slate-400">Camera offline</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Camera Info */}
              <div className="p-4 space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-400">Batch đang theo dõi</span>
                  <span className="font-medium text-white">{camera.activeBatches}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-400">Cập nhật lần cuối</span>
                  <span className="font-medium text-white">
                    {new Date(camera.lastUpdate).toLocaleTimeString('vi-VN', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>

                {camera.status === 'online' && camera.activeBatches > 0 && (
                  <div className="pt-3 border-t border-slate-800">
                    <div className="flex items-center gap-2 text-xs text-green-400">
                      <Activity className="w-4 h-4" />
                      <span>AI đang phân tích...</span>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* System Info */}
      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle className="text-white">Thông tin hệ thống Camera</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-slate-300">Cấu hình AI Detection</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">Độ chính xác nhận diện</span>
                  <span className="text-white">95.2%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Tần suất quét</span>
                  <span className="text-white">5 giây/lần</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Model AI</span>
                  <span className="text-white">YOLOv8-custom</span>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-slate-300">Trạng thái kết nối</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">Độ trễ trung bình</span>
                  <span className="text-green-400">45ms</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Băng thông sử dụng</span>
                  <span className="text-white">2.4 MB/s</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Uptime</span>
                  <span className="text-white">99.8%</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}