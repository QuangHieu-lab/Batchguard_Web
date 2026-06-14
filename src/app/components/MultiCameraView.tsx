import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Camera, Eye, Trash2 } from 'lucide-react'; // 🚀 Thêm icon Trash2 để xóa
import { useSystem } from '../contexts/SystemContext';

// Khai báo kiểu dữ liệu Camera
export interface CameraData {
  id: string;
  name: string;
  zone: string;
  status: 'active' | 'offline';
  hasDetection: boolean;
  streamUrl?: string;
}

// 🚀 Nhận dữ liệu từ ngoài truyền vào
interface MultiCameraViewProps {
  cameras: CameraData[];
  selectedCamera: string;
  onSelectCamera: (id: string) => void;
  onDeleteCamera: (id: string) => void;
}

export function MultiCameraView({ cameras, selectedCamera, onSelectCamera, onDeleteCamera }: MultiCameraViewProps) {
  const { isDetecting } = useSystem();

  const selectedCam = cameras.find(c => c.id === selectedCamera) || cameras[0];

  if (!selectedCam) return null; // An toàn nếu xóa hết camera

  return (
    <div className="space-y-6">
      {/* Camera Grid View */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {cameras.map((camera) => (
          <Card
            key={camera.id}
            onClick={() => onSelectCamera(camera.id)}
            className={`cursor-pointer transition-all duration-300 relative group ${
              selectedCamera === camera.id
                ? 'border-cyan-500 bg-cyan-500/5 shadow-[0_0_20px_rgba(6,182,212,0.2)]'
                : 'border-slate-800 bg-[#151E2F] hover:border-slate-700'
            }`}
          >
            {/* 🚀 Nút xóa hiển thị khi hover */}
            <button
              onClick={(e) => {
                e.stopPropagation(); // Tránh bị click nhầm vào Card
                onDeleteCamera(camera.id);
              }}
              className="absolute top-2 right-2 p-1.5 bg-red-500/80 hover:bg-red-500 text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity z-20"
              title="Ngắt kết nối"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>

            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    camera.status === 'active' ? 'bg-emerald-500/10' : 'bg-slate-700/50'
                  }`}>
                    <Camera className={`w-4 h-4 ${
                      camera.status === 'active' ? 'text-emerald-400' : 'text-slate-500'
                    }`} />
                  </div>
                  <div>
                    <CardTitle className="text-sm text-white">{camera.id}</CardTitle>
                  </div>
                </div>
                {camera.status === 'active' && (
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse mr-6 group-hover:hidden" />
                )}
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-0 space-y-3">
              {/* Mini Camera Feed */}
              <div className="relative aspect-video bg-[#0B1121] rounded-lg overflow-hidden border border-slate-800">
                {camera.status === 'active' ? (
                  <>
                    <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
                      {camera.hasDetection ? (
                        <div className="absolute inset-0 flex items-center justify-center p-4">
                          <div className="relative w-full h-full max-w-32 max-h-32">
                            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-amber-100/20 via-yellow-50/10 to-amber-200/20 shadow-lg opacity-80" />
                            <div className="absolute inset-0 border border-emerald-400/50 rounded-full animate-pulse" />
                          </div>
                        </div>
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Eye className="w-8 h-8 text-slate-700" />
                        </div>
                      )}
                    </div>
                    {camera.hasDetection && (
                      <div className="absolute top-1 left-1 bg-emerald-500/20 border border-emerald-500/30 px-1.5 py-0.5 rounded text-[10px] font-mono text-emerald-400 z-10">
                        DETECTED
                      </div>
                    )}
                    <div className="absolute top-1 right-1 flex items-center gap-1 bg-red-500/20 border border-red-500/30 px-1.5 py-0.5 rounded z-10">
                      <div className="w-1 h-1 bg-red-500 rounded-full animate-pulse" />
                      <span className="text-[10px] font-semibold text-red-400">REC</span>
                    </div>
                  </>
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Camera className="w-8 h-8 text-slate-700" />
                  </div>
                )}
              </div>

              {/* Camera Info */}
              <div className="space-y-1">
                <p className="text-xs font-medium text-white truncate" title={camera.name}>{camera.name}</p>
                <p className="text-[10px] text-slate-500 truncate" title={camera.zone}>{camera.zone}</p>
              </div>

              {/* Status Badge */}
              <Badge className={`text-[10px] w-full justify-center ${
                camera.hasDetection
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                  : camera.status === 'active'
                    ? 'bg-slate-700 text-slate-400 border-slate-600'
                    : 'bg-red-500/10 text-red-400 border-red-500/30'
              }`}>
                {camera.hasDetection ? 'Đang phát hiện' : camera.status === 'active' ? 'Đang chờ' : 'Offline'}
              </Badge>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Large Selected Camera View */}
      <Card className="border-slate-800 bg-[#151E2F] shadow-[0_4px_20px_rgba(0,0,0,0.3)]">
        <CardHeader className="border-b border-slate-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-sky-500 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-400/30">
                <Camera className="w-5 h-5 text-navy-950" />
              </div>
              <div>
                <CardTitle className="text-white">{selectedCam.id} - {selectedCam.name}</CardTitle>
                <p className="text-sm text-slate-400 mt-1">{selectedCam.zone}</p>
              </div>
            </div>
            <Badge className={`${
              selectedCam.hasDetection
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.2)]'
                : selectedCam.status === 'active'
                  ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'
                  : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}>
              {selectedCam.hasDetection
                ? 'Đang theo dõi'
                : selectedCam.status === 'active'
                  ? 'Đang chờ'
                  : 'Offline'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="relative aspect-video bg-[#0B1121] overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative w-full h-full">
                {/* Grid overlay */}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#0B1121]/80 z-10" />
                <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 z-10">
                  {Array.from({ length: 9 }).map((_, i) => (
                    <div key={i} className="border border-cyan-500/5" />
                  ))}
                </div>

                {/* Main scene */}
                <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
                  {selectedCam.status === 'active' && selectedCam.hasDetection ? (
                    <div className="absolute inset-0 flex items-center justify-center p-12">
                      <div className="relative w-full h-full max-w-2xl max-h-96">
                        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-amber-100/20 via-yellow-50/10 to-amber-200/20 shadow-2xl opacity-80" />
                        <div className="absolute inset-0 rounded-full" style={{
                          background: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.1) 0%, transparent 50%)',
                        }} />
                        <div className="absolute inset-0 border border-emerald-400/50 rounded-full animate-pulse shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                          <div className="absolute -top-6 left-0 bg-emerald-500 text-white text-xs px-2 py-1 rounded font-mono shadow-[0_0_10px_rgba(16,185,129,0.5)]">
                            BÁNH TRÁNG DETECTED
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : selectedCam.status === 'active' ? (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center space-y-3">
                        <Eye className="w-16 h-16 text-slate-700 mx-auto" />
                        <p className="text-slate-500 font-mono text-sm">Đang chờ phát hiện...</p>
                        {isDetecting && selectedCam.id === 'CAM-01' && (
                          <div className="flex items-center gap-2 justify-center">
                            <div className="w-2 h-2 bg-cyan-400 rounded-full animate-ping" />
                            <span className="text-cyan-400 text-xs">Scanning...</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center space-y-3">
                        <Camera className="w-16 h-16 text-slate-700 mx-auto" />
                        <p className="text-slate-500 font-mono text-sm">Camera offline</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Camera info overlay */}
                <div className="absolute top-4 left-4 bg-[#0B1121]/80 backdrop-blur-md px-3 py-2 rounded-lg z-20 font-mono text-xs text-slate-300 space-y-1 border border-slate-800">
                  <div>{selectedCam.id} | {selectedCam.zone.split(' - ')[0]}</div>
                  <div className="text-cyan-400">{new Date().toLocaleTimeString('vi-VN')}</div>
                  {/* 🚀 Thể hiện URL stream ảo */}
                  {selectedCam.streamUrl && (
                    <div className="text-[10px] text-slate-500 mt-1 truncate max-w-[200px]">
                      {selectedCam.streamUrl}
                    </div>
                  )}
                </div>

                {/* Recording indicator */}
                {selectedCam.status === 'active' && (
                  <div className="absolute top-4 right-4 flex items-center gap-2 bg-red-500/20 border border-red-500/30 backdrop-blur-md px-3 py-1.5 rounded-lg z-20">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
                    <span className="text-red-400 text-xs font-semibold">REC</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}