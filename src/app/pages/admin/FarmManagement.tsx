import React, { useState, useEffect } from 'react';
import { ChevronLeft, Home, Wifi, Camera, Plus, Settings, X, PlayCircle, Trash2, Link as LinkIcon } from 'lucide-react';
import { cameraApi } from '../../../services/endpoints';
import { toast } from 'sonner';

export default function HouseholdsWebScreen() {
  const [households, setHouseholds] = useState<any[]>([]);
  
  // State quản lý Modals
  const [selectedHousehold, setSelectedHousehold] = useState<any | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // State cho Form Thêm Hộ mới
  const [newName, setNewName] = useState('');
  const [newAddress, setNewAddress] = useState('');
  const [newUrls, setNewUrls] = useState<string[]>(['']); 

  // =========================================================================
  // GỌI API THẬT
  // =========================================================================
  const fetchHouseholds = async () => {
    try {
      const data: any = await cameraApi.getAll();
      
      // Nhóm camera theo location để tạo thành danh sách Hộ/Trang trại
      const farmsMap = new Map();
      data.forEach((cam: any) => {
         const loc = cam.location || 'Chưa cập nhật địa chỉ';
         if (!farmsMap.has(loc)) {
            farmsMap.set(loc, {
                id: loc, // Dùng location làm ID tạm
                name: `Khu vực: ${loc}`,
                address: loc,
                cameras: 0,
                sensors: 'Online',
                status: 'active',
                streamUrls: []
            });
         }
         const farm = farmsMap.get(loc);
         farm.cameras += 1;
         // Giả lập stream URL vì API chưa có trường lưu url
         farm.streamUrls.push(`rtsp://camera-${cam.id}.mylong.vn/live`);
      });
      
      setHouseholds(Array.from(farmsMap.values()));
    } catch (error) {
      console.error(error);
      toast.error('Lỗi tải danh sách hộ liên kết');
    }
  };

  useEffect(() => {
    fetchHouseholds();
  }, []);

  // =========================================================================
  // CÁC HÀM XỬ LÝ FORM
  // =========================================================================
  const handleAddUrlField = () => {
    setNewUrls([...newUrls, '']);
  };

  const handleRemoveUrlField = (indexToRemove: number) => {
    setNewUrls(newUrls.filter((_, index) => index !== indexToRemove));
  };

  const handleUrlChange = (text: string, index: number) => {
    const updatedUrls = [...newUrls];
    updatedUrls[index] = text;
    setNewUrls(updatedUrls);
  };

  const handleSubmitNewHousehold = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) {
      toast.error("Vui lòng nhập tên hộ kinh doanh!");
      return;
    }

    const validUrls = newUrls.filter(url => url.trim() !== '');
    const addressToSave = newAddress || newName;

    try {
      // Tạo camera trên DB cho khu vực mới
      const camerasToCreate = validUrls.length > 0 ? validUrls.length : 1;
      for (let i = 0; i < camerasToCreate; i++) {
        await cameraApi.create({
          name: `${newName} - Camera ${i + 1}`,
          location: addressToSave
        });
      }

      toast.success('Thêm hộ liên kết thành công!');
      
      setNewName('');
      setNewAddress('');
      setNewUrls(['']);
      setIsAddModalOpen(false);

      // Load lại dữ liệu từ server
      fetchHouseholds();
    } catch (error) {
      toast.error('Lưu trên server thất bại!');
      console.error(error);
    }
  };

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
          <p className="text-slate-400 mt-1">Quản lý hạ tầng, camera giám sát và cảm biến của các hộ liên kết</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-end mb-6">
          <h2 className="text-slate-400 font-bold text-sm uppercase tracking-widest ml-1">
            Danh sách hộ liên kết
          </h2>
          <span className="text-sm font-medium text-cyan-400 bg-cyan-500/10 px-3 py-1 rounded-full border border-cyan-500/20">
            Tổng: {households.length} hộ
          </span>
        </div>

        {/* ================= GRID DANH SÁCH HỘ ================= */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {households.map(house => (
            <div 
              key={house.id} 
              onClick={() => setSelectedHousehold(house)}
              className="bg-[#151E2F] p-6 rounded-[24px] border border-slate-800 hover:border-cyan-500/40 transition-all duration-300 shadow-lg hover:shadow-[0_0_20px_rgba(6,182,212,0.15)] group relative cursor-pointer flex flex-col"
            >
              <button 
                onClick={(e) => { e.stopPropagation(); console.log('Mở cài đặt hộ', house.id); }}
                className="absolute top-6 right-6 p-2 bg-slate-800/80 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-slate-700"
              >
                <Settings className="w-4 h-4 text-slate-300" />
              </button>

              <div className="flex items-center gap-4 mb-4">
                <div className={`p-4 rounded-[18px] ${house.status === 'active' ? 'bg-blue-500/10 border border-blue-500/20' : 'bg-rose-500/10 border border-rose-500/20'}`}>
                  <Home className={`w-7 h-7 ${house.status === 'active' ? 'text-blue-400' : 'text-rose-400'}`} />
                </div>
                <div>
                  <h3 className="text-white font-bold text-xl line-clamp-1">{house.name}</h3>
                  <div className="flex items-center gap-1.5 mt-1">
                    <div className={`w-2 h-2 rounded-full ${house.status === 'active' ? 'bg-emerald-400' : 'bg-rose-500'}`} />
                    <span className="text-slate-400 text-xs font-medium uppercase tracking-wider">
                      {house.status === 'active' ? 'Đang hoạt động' : 'Cần kiểm tra'}
                    </span>
                  </div>
                </div>
              </div>
              
              <p className="text-sm text-slate-500 mb-6 flex-1 line-clamp-1">{house.address}</p>

              <div className="mt-auto grid grid-cols-2 gap-4 bg-[#0f172a] p-4 rounded-2xl border border-slate-800/80 group-hover:border-cyan-500/30 transition-colors">
                <div className="flex flex-col items-center justify-center border-r border-slate-700/50">
                  <Camera className="w-5 h-5 text-slate-400 mb-1.5 group-hover:text-cyan-400 transition-colors" />
                  <span className="text-white font-bold text-lg">{house.cameras}</span>
                  <span className="text-slate-500 text-xs">Camera</span>
                </div>
                
                <div className="flex flex-col items-center justify-center">
                  <Wifi className={`w-5 h-5 mb-1.5 ${house.sensors === 'Online' ? 'text-emerald-400' : 'text-rose-400'}`} />
                  <span className={`font-bold text-lg ${house.sensors === 'Online' ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {house.sensors}
                  </span>
                  <span className="text-slate-500 text-xs">Cảm biến</span>
                </div>        
              </div>
            </div>
          ))}

          {/* ================= THẺ ADD NEW ================= */}
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="bg-[#151E2F]/50 border-2 border-dashed border-slate-700 hover:border-cyan-500/50 hover:bg-[#1e293b]/50 transition-all duration-300 rounded-[24px] p-6 flex flex-col items-center justify-center min-h-[220px] group cursor-pointer"
          >
            <div className="p-4 rounded-full bg-slate-800/50 group-hover:bg-cyan-500/20 transition-colors mb-3">
              <Plus className="w-8 h-8 text-slate-400 group-hover:text-cyan-400 transition-colors" />
            </div>
            <span className="text-slate-400 font-bold group-hover:text-cyan-400 transition-colors">Thêm hộ liên kết mới</span>
          </button>

        </div>
      </div>

      {/* ========================================================================= */}
      {/* 🚀 MODAL XEM CAMERA KHI NHẤP VÀO HỘ                                       */}
      {/* ========================================================================= */}
      {selectedHousehold && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#0B1121] border border-slate-700 w-full max-w-5xl rounded-[32px] shadow-2xl flex flex-col max-h-[90vh]">
            
            <div className="flex items-center justify-between p-6 border-b border-slate-800">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-cyan-500/10 rounded-xl border border-cyan-500/20">
                  <Camera className="w-6 h-6 text-cyan-400" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Camera Giám Sát</h2>
                  <p className="text-cyan-400 text-sm mt-0.5">{selectedHousehold.name} • {selectedHousehold.address}</p>
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
              {selectedHousehold.streamUrls.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {selectedHousehold.streamUrls.map((url: string, idx: number) => (
                    <div key={idx} className="bg-[#151E2F] rounded-2xl overflow-hidden border border-slate-700 group">
                      <div className="p-3 bg-slate-800/50 border-b border-slate-700 flex justify-between items-center">
                        <span className="text-slate-300 font-medium text-sm">Luồng Camera #{idx + 1}</span>
                        <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-emerald-500/10 border border-emerald-500/20">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          <span className="text-[10px] text-emerald-400 font-bold uppercase">LIVE</span>
                        </div>
                      </div>
                      
                      <div className="aspect-video bg-black relative flex items-center justify-center">
                        <PlayCircle className="w-12 h-12 text-white/20 group-hover:text-white/50 transition-colors" />
                        <div className="absolute bottom-2 left-2 right-2 flex justify-between text-[10px] text-white/50 font-mono">
                          <span className="truncate pr-4">{url}</span>
                          <span className="flex-shrink-0">H.264 / 30fps</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-slate-500">
                  <Wifi className="w-12 h-12 mb-4 opacity-20" />
                  <p className="text-lg font-medium text-slate-400">Không tìm thấy luồng Camera</p>
                  <p className="text-sm mt-1">Hộ này đang offline hoặc chưa cấu hình URL Camera.</p>
                </div>
              )}
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 🚀 MODAL THÊM HỘ LIÊN KẾT MỚI                                             */}
      {/* ========================================================================= */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#0B1121] border border-slate-700 w-full max-w-xl rounded-[32px] shadow-2xl flex flex-col max-h-[90vh]">
            
            <div className="flex items-center justify-between p-6 border-b border-slate-800">
              <h2 className="text-2xl font-bold text-white">Thêm Hộ Liên Kết</h2>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitNewHousehold} className="p-6 overflow-y-auto space-y-6">
              
              {/* Info section */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-slate-400 mb-2">TÊN HỘ KINH DOANH <span className="text-rose-500">*</span></label>
                  <input 
                    type="text"
                    required
                    placeholder="VD: Hộ Nguyễn Văn C"
                    className="w-full bg-[#151E2F] border border-slate-700 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-cyan-500 transition-colors"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-400 mb-2">ĐỊA CHỈ</label>
                  <input 
                    type="text"
                    placeholder="VD: Khu số 3, Mỹ Lồng"
                    className="w-full bg-[#151E2F] border border-slate-700 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-cyan-500 transition-colors"
                    value={newAddress}
                    onChange={(e) => setNewAddress(e.target.value)}
                  />
                </div>
              </div>

              <div className="border-t border-slate-800 my-2" />

              {/* Cameras section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-bold text-slate-400">LUỒNG CAMERA (RTSP/URL)</label>
                  <button 
                    type="button"
                    onClick={handleAddUrlField}
                    className="text-xs font-bold text-cyan-400 flex items-center gap-1 hover:text-cyan-300"
                  >
                    <Plus className="w-3 h-3" /> THÊM LINK
                  </button>
                </div>
                
                {newUrls.map((url, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="flex-1 flex items-center bg-[#151E2F] border border-slate-700 rounded-xl overflow-hidden focus-within:border-cyan-500 transition-colors">
                      <div className="px-4 text-slate-500">
                        <LinkIcon className="w-4 h-4" />
                      </div>
                      <input 
                        type="text"
                        placeholder="rtsp://ip_address/live"
                        className="w-full bg-transparent text-white py-3 pr-4 focus:outline-none"
                        value={url}
                        onChange={(e) => handleUrlChange(e.target.value, index)}
                      />
                    </div>
                    {newUrls.length > 1 && (
                      <button 
                        type="button"
                        onClick={() => handleRemoveUrlField(index)}
                        className="p-3 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-xl transition-colors border border-rose-500/20"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Submit */}
              <div className="pt-4 flex justify-end gap-3">
                <button 
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-6 py-3 rounded-xl font-bold text-slate-300 hover:bg-slate-800 transition-colors"
                >
                  Hủy
                </button>
                <button 
                  type="submit"
                  className="px-6 py-3 rounded-xl font-bold text-slate-900 bg-cyan-400 hover:bg-cyan-300 transition-colors shadow-[0_0_15px_rgba(6,182,212,0.3)]"
                >
                  Xác nhận lưu
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}