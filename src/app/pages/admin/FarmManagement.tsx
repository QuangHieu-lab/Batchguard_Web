import React, { useState, useEffect } from 'react';
import { ChevronLeft, Home, Wifi, Camera, Settings, X, PlayCircle, User, MapPin } from 'lucide-react';
import { cameraApi, userApi } from '../../../services/endpoints';
import { toast } from 'sonner';

export default function HouseholdsWebScreen() {
  const [households, setHouseholds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedHousehold, setSelectedHousehold] = useState<any | null>(null);

  const fetchHouseholds = async () => {
    setLoading(true);
    try {
      const [usersRes, camerasRes]: [any, any] = await Promise.all([
        userApi.getAll(),
        cameraApi.getAll()
      ]);
      
      const usersData = usersRes?.data || usersRes || [];
      const camerasData = camerasRes?.data || camerasRes || [];

      // 1. Lọc ra các tài khoản là Khách hàng
      const customers = usersData.filter((u: any) => u.role !== 'admin');

      // 2. Map dữ liệu Camera vào Tài khoản (Chờ Backend bổ sung user_id vào API Camera)
      const mappedAccounts = customers.map((user: any) => {
        // ⚠️ Lưu ý: Đoạn này đang chờ Backend trả về cam.user_id
        const userCameras = camerasData.filter((cam: any) => cam.user_id === user.id);

        return {
          id: user.id,
          name: user.full_name || user.name || 'Khách hàng',
          email: user.email, 
          camerasCount: userCameras.length,
          sensors: userCameras.length > 0 ? 'Online' : 'Offline',
          status: user.role === 'disabled' || user.status === 'inactive' ? 'inactive' : 'active',
          cameraList: userCameras.map((cam: any) => ({
            id: cam.id,
            name: cam.name || 'Camera không tên',
            location: cam.location || 'Chưa cập nhật vị trí',
            streamUrl: `rtsp://camera-${cam.id}.mylong.vn/live`
          }))
        };
      });

      // 🚀 SỬA Ở ĐÂY: Hiển thị TẤT CẢ Khách hàng, không giấu đi nữa!
      // Khi nào Backend trả về user_id, số đếm camera sẽ tự động đúng.
      setHouseholds(mappedAccounts);
      
    } catch (error) {
      console.error(error);
      toast.error('Lỗi tải danh sách tài khoản và camera');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHouseholds();
  }, []);

  return (
    <div className="min-h-screen bg-[#0B1121] p-6 md:p-10 text-white relative">
      
      {/* ================= HEADER ================= */}
      <div className="flex items-center gap-4 mb-10 pb-6 border-b border-slate-800">
        <button 
          onClick={() => window.history.back()} 
          className="p-3 bg-slate-800/50 hover:bg-slate-700 rounded-full transition-colors border border-slate-700"
        >
          <ChevronLeft className="w-6 h-6 text-slate-300" />
        </button>
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Hộ Kinh Doanh Làng Nghề</h1>
          <p className="text-slate-400 mt-1">Giám sát tự động hạ tầng Camera của Khách hàng</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-end mb-6">
          <h2 className="text-slate-400 font-bold text-sm uppercase tracking-widest ml-1">
            Danh sách tài khoản khách hàng
          </h2>
          <div className="flex gap-3 items-center">
            <button 
              onClick={fetchHouseholds}
              className="text-sm font-medium text-slate-300 hover:text-white bg-slate-800/50 px-3 py-1.5 rounded-lg border border-slate-700 transition-colors"
            >
              Làm mới dữ liệu
            </button>
            <span className="text-sm font-medium text-cyan-400 bg-cyan-500/10 px-3 py-1.5 rounded-lg border border-cyan-500/20">
              Tổng: {households.length} Hộ
            </span>
          </div>
        </div>

        {/* ================= GRID DANH SÁCH HỘ ================= */}
        {loading ? (
          <div className="flex justify-center items-center py-20 text-slate-400">
            <Wifi className="w-8 h-8 animate-pulse text-cyan-500 mb-2" />
            <span className="ml-3">Đang đồng bộ dữ liệu từ máy chủ...</span>
          </div>
        ) : households.length === 0 ? (
          <div className="text-center py-20 bg-[#151E2F] rounded-[24px] border border-slate-800 border-dashed">
            <User className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400 font-medium">Chưa có Khách hàng nào đăng ký hệ thống</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {households.map(house => (
              <div 
                key={house.id} 
                onClick={() => {
                  if (house.camerasCount > 0) setSelectedHousehold(house);
                  else toast.info("Khách hàng này chưa tạo camera nào.");
                }}
                className="bg-[#151E2F] p-6 rounded-[24px] border border-slate-800 hover:border-cyan-500/40 transition-all duration-300 shadow-lg hover:shadow-[0_0_20px_rgba(6,182,212,0.15)] group relative cursor-pointer flex flex-col"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className={`p-4 rounded-[18px] ${house.status === 'active' ? 'bg-blue-500/10 border border-blue-500/20' : 'bg-rose-500/10 border border-rose-500/20'}`}>
                    <User className={`w-7 h-7 ${house.status === 'active' ? 'text-blue-400' : 'text-rose-400'}`} />
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-xl line-clamp-1">{house.name}</h3>
                    <div className="flex items-center gap-1.5 mt-1">
                      <div className={`w-2 h-2 rounded-full ${house.status === 'active' ? 'bg-emerald-400' : 'bg-rose-500'}`} />
                      <span className="text-slate-400 text-xs font-medium uppercase tracking-wider">
                        {house.status === 'active' ? 'Đang hoạt động' : 'Tài khoản bị khóa'}
                      </span>
                    </div>
                  </div>
                </div>
                
                <p className="text-sm text-slate-500 mb-6 flex-1 line-clamp-1 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-slate-600" /> {house.email}
                </p>

                <div className="mt-auto grid grid-cols-2 gap-4 bg-[#0f172a] p-4 rounded-2xl border border-slate-800/80 group-hover:border-cyan-500/30 transition-colors">
                  <div className="flex flex-col items-center justify-center border-r border-slate-700/50">
                    <Camera className="w-5 h-5 text-slate-400 mb-1.5 group-hover:text-cyan-400 transition-colors" />
                    <span className="text-white font-bold text-lg">{house.camerasCount}</span>
                    <span className="text-slate-500 text-xs">Camera</span>
                  </div>
                  
                  <div className="flex flex-col items-center justify-center">
                    <Wifi className={`w-5 h-5 mb-1.5 ${house.sensors === 'Online' ? 'text-emerald-400' : 'text-slate-600'}`} />
                    <span className={`font-bold text-lg ${house.sensors === 'Online' ? 'text-emerald-400' : 'text-slate-500'}`}>
                      {house.camerasCount > 0 ? house.sensors : '--'}
                    </span>
                    <span className="text-slate-500 text-xs">Cảm biến</span>
                  </div>        
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 🚀 MODAL XEM CHI TIẾT CAMERA CỦA KHÁCH HÀNG ĐÃ TẠO                        */}
      {/* ========================================================================= */}
      {selectedHousehold && selectedHousehold.cameraList && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#0B1121] border border-slate-700 w-full max-w-5xl rounded-[32px] shadow-2xl flex flex-col max-h-[90vh]">
            
            <div className="flex items-center justify-between p-6 border-b border-slate-800">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-cyan-500/10 rounded-xl border border-cyan-500/20">
                  <Camera className="w-6 h-6 text-cyan-400" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Chi tiết Camera của Hộ</h2>
                  <p className="text-cyan-400 text-sm mt-0.5">{selectedHousehold.name} • {selectedHousehold.email}</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedHousehold(null)}
                className="p-2 bg-slate-800 hover:bg-rose-500/20 hover:text-rose-400 text-slate-400 rounded-full transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {selectedHousehold.cameraList.map((cam: any) => (
                  <div key={cam.id} className="bg-[#151E2F] rounded-2xl overflow-hidden border border-slate-700 group flex flex-col">
                    <div className="p-4 bg-slate-800/50 border-b border-slate-700 flex justify-between items-start">
                      <div>
                        <span className="text-white font-bold text-md block">{cam.name}</span>
                        <span className="text-slate-400 text-xs flex items-center gap-1 mt-1">
                          <MapPin className="w-3 h-3" /> {cam.location}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-emerald-500/10 border border-emerald-500/20">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        <span className="text-[10px] text-emerald-400 font-bold uppercase">LIVE</span>
                      </div>
                    </div>
                    
                    <div className="aspect-video bg-black relative flex items-center justify-center flex-1">
                      <PlayCircle className="w-12 h-12 text-white/20 group-hover:text-white/50 transition-colors" />
                      <div className="absolute bottom-2 left-2 right-2 flex justify-between text-[10px] text-white/50 font-mono bg-black/40 px-2 py-1 rounded">
                        <span className="truncate pr-4">{cam.streamUrl}</span>
                        <span className="flex-shrink-0">H.264 / 30fps</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}