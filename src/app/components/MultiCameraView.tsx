import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Camera, Trash2, Video } from 'lucide-react';

export interface CameraData {
  id: string;
  name: string;
  zone: string;
  status: 'active' | 'offline' | 'inactive' | 'online'; 
  hasDetection: boolean;
  streamUrl?: string; 
}

interface MultiCameraViewProps {
  cameras: CameraData[];
  selectedCamera: string;
  onSelectCamera: (id: string) => void;
  // 🚀 ĐÃ CẬP NHẬT: Thêm dấu ? để biến hàm này thành không bắt buộc
  onDeleteCamera?: (id: string) => void;
}

export function MultiCameraView({ cameras, selectedCamera, onSelectCamera, onDeleteCamera }: MultiCameraViewProps) {
  
  if (!cameras || cameras.length === 0) {
    return (
      <div className="p-8 text-center bg-[#0B1121] rounded-xl border border-dashed border-slate-700">
        <Camera className="w-12 h-12 text-slate-600 mx-auto mb-3 opacity-50" />
        <p className="text-slate-400 font-medium">Chưa có camera nào được kết nối.</p>
        {/* 🚀 ĐÃ CẬP NHẬT: Đổi câu văn vì User không còn nút Thêm nữa */}
        <p className="text-xs text-slate-500 mt-1">Đang chờ hệ thống cấp phát hoặc thêm mới.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 🚀 DANH SÁCH CAMERA (MENU LỰA CHỌN) */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {cameras.map((camera) => (
          <Card
            key={camera.id}
            onClick={() => onSelectCamera(camera.id)}
            className={`cursor-pointer transition-all duration-300 relative group overflow-hidden ${
              selectedCamera === camera.id
                ? 'border-cyan-500 bg-[#0B1121] shadow-[0_0_20px_rgba(6,182,212,0.15)] ring-1 ring-cyan-500/50'
                : 'border-slate-800 bg-[#151E2F] hover:bg-[#1a2538] hover:border-slate-600'
            }`}
          >
            {/* Vệt sáng trang trí khi được chọn */}
            {selectedCamera === camera.id && (
              <div className="absolute top-0 left-0 w-1 h-full bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,1)]" />
            )}

            {/* 🚀 ĐÃ CẬP NHẬT: Chỉ render nút xóa nếu CÓ truyền hàm onDeleteCamera */}
            {onDeleteCamera && (
              <button
                onClick={(e) => {
                  e.stopPropagation(); 
                  onDeleteCamera(camera.id);
                }}
                className="absolute top-2 right-2 p-1.5 bg-red-500/80 hover:bg-red-500 text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity z-20"
                title="Xóa Camera"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}

            <CardHeader className="pb-2 pt-4 px-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    selectedCamera === camera.id ? 'bg-cyan-500/20 text-cyan-400' : 'bg-slate-800 text-slate-400'
                  }`}>
                    <Camera className="w-4 h-4" />
                  </div>
                  <div>
                    <CardTitle className={`text-sm font-bold truncate max-w-[120px] ${
                      selectedCamera === camera.id ? 'text-white' : 'text-slate-300'
                    }`} title={camera.name}>
                      {camera.name}
                    </CardTitle>
                    <p className="text-[10px] text-slate-500 font-mono mt-0.5">{camera.id}</p>
                  </div>
                </div>
                
                {/* Chấm xanh trạng thái */}
                {(camera.status === 'active' || camera.status === 'online') && (
                  <div className={`w-2 h-2 bg-emerald-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)] ${onDeleteCamera ? 'mr-6 group-hover:hidden' : ''}`} />
                )}
              </div>
            </CardHeader>

            <CardContent className="px-4 pb-4 pt-2 space-y-3">
              {/* Vùng hiển thị "Thumbnail/Trạng thái tĩnh" */}
              <div className={`relative aspect-video rounded-lg flex items-center justify-center border border-slate-700/50 ${
                selectedCamera === camera.id ? 'bg-[#151E2F]' : 'bg-[#0B1121]'
              }`}>
                {selectedCamera === camera.id ? (
                  <div className="flex flex-col items-center justify-center text-cyan-500/60">
                    <Video className="w-8 h-8 mb-2" />
                    <span className="text-[10px] font-medium uppercase tracking-widest text-cyan-500 text-center px-2">Đang chiếu trên Màn Hình Chính</span>
                  </div>
                ) : (
                  <div className="text-center">
                    <p className="text-xs text-slate-500 font-medium">Chế độ chờ</p>
                    <p className="text-[10px] text-slate-600 mt-0.5">Nhấp để xem luồng</p>
                  </div>
                )}
              </div>

              <div className="flex justify-between items-center">
                <Badge className="text-[10px] bg-slate-800 text-slate-400 border-transparent font-normal px-2 py-0 truncate max-w-[120px]" title={camera.zone}>
                  {camera.zone}
                </Badge>
                {camera.hasDetection && (
                  <span className="text-[10px] text-emerald-400 font-semibold px-2 py-0.5 bg-emerald-500/10 rounded">Có cảnh báo</span>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}