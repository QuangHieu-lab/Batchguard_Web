import React from 'react';
import { ChevronLeft, Map, Wifi, Camera, Plus, Settings } from 'lucide-react';

// Giữ nguyên Data như Mobile để đồng bộ
const ZONES = [
  { id: '1', name: 'Sân phơi Khu A', cameras: 2, sensors: 'Online',  status: 'active' },
  { id: '2', name: 'Sân phơi Khu B', cameras: 3, sensors: 'Online',  status: 'active' },
  { id: '3', name: 'Lò Sấy Công Nghiệp', cameras: 1, sensors: 'Offline',  status: 'warning' },
];

export default function ZonesWebScreen() {
  return (
    <div className="min-h-screen bg-[#0B1121] p-6 md:p-10 text-white">
      
      {/* ================= HEADER ================= */}
      <div className="flex items-center gap-4 mb-10 pb-6 border-b border-slate-800">
        <button 
          onClick={() => window.history.back()} 
          className="p-3 bg-slate-800/50 hover:bg-slate-700 rounded-full transition-colors border border-slate-700"
        >
          <ChevronLeft className="w-6 h-6 text-slate-300" />
        </button>
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Khu vực & Thiết bị</h1>
          <p className="text-slate-400 mt-1">Quản lý hạ tầng, camera giám sát và cảm biến IoT</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-end mb-6">
          <h2 className="text-slate-400 font-bold text-sm uppercase tracking-widest ml-1">
            Trạng thái hạ tầng
          </h2>
          <span className="text-sm font-medium text-cyan-400 bg-cyan-500/10 px-3 py-1 rounded-full border border-cyan-500/20">
            Tổng: {ZONES.length} khu vực
          </span>
        </div>

        {/* ================= GRID DANH SÁCH (Dành cho Web) ================= */}
        {/* Trên đt thì 1 cột, Tablet 2 cột, PC rộng 3 cột */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {ZONES.map(zone => (
            <div 
              key={zone.id} 
              className="bg-[#151E2F] p-6 rounded-[24px] border border-slate-800 hover:border-slate-600 transition-all duration-300 shadow-lg hover:shadow-xl group relative cursor-pointer flex flex-col"
            >
              {/* Nút cài đặt ẩn, chỉ hiện khi rê chuột vào thẻ */}
              <button className="absolute top-6 right-6 p-2 bg-slate-800/80 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-slate-700">
                <Settings className="w-4 h-4 text-slate-300" />
              </button>

              <div className="flex items-center gap-4 mb-6">
                <div className={`p-4 rounded-[18px] ${zone.status === 'active' ? 'bg-blue-500/10 border border-blue-500/20' : 'bg-rose-500/10 border border-rose-500/20'}`}>
                  <Map className={`w-7 h-7 ${zone.status === 'active' ? 'text-blue-400' : 'text-rose-400'}`} />
                </div>
                <div>
                  <h3 className="text-white font-bold text-xl">{zone.name}</h3>
                  <div className="flex items-center gap-1.5 mt-1">
                    <div className={`w-2 h-2 rounded-full ${zone.status === 'active' ? 'bg-emerald-400' : 'bg-rose-500'}`} />
                    <span className="text-slate-400 text-xs font-medium uppercase tracking-wider">
                      {zone.status === 'active' ? 'Đang hoạt động' : 'Cần kiểm tra'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Thông số phần dưới đáy thẻ */}
              <div className="mt-auto grid grid-cols-2 gap-4 bg-[#0f172a] p-4 rounded-2xl border border-slate-800/80">
                <div className="flex flex-col items-center justify-center border-r border-slate-700/50">
                  <Camera className="w-5 h-5 text-slate-400 mb-1.5" />
                  <span className="text-white font-bold text-lg">{zone.cameras}</span>
                  <span className="text-slate-500 text-xs">Camera</span>
                </div>
                
                <div className="flex flex-col items-center justify-center">
                  <Wifi className={`w-5 h-5 mb-1.5 ${zone.sensors === 'Online' ? 'text-emerald-400' : 'text-rose-400'}`} />
                  <span className={`font-bold text-lg ${zone.sensors === 'Online' ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {zone.sensors}
                  </span>
                  <span className="text-slate-500 text-xs">Cảm biến</span>
                </div>        
              </div>
            </div>
          ))}

          {/* ================= THẺ ADD NEW (Tính năng thường có trên Web) ================= */}
          <button className="bg-[#151E2F]/50 border-2 border-dashed border-slate-700 hover:border-cyan-500/50 hover:bg-[#1e293b]/50 transition-all duration-300 rounded-[24px] p-6 flex flex-col items-center justify-center min-h-[220px] group cursor-pointer">
            <div className="p-4 rounded-full bg-slate-800/50 group-hover:bg-cyan-500/20 transition-colors mb-3">
              <Plus className="w-8 h-8 text-slate-400 group-hover:text-cyan-400 transition-colors" />
            </div>
            <span className="text-slate-400 font-bold group-hover:text-cyan-400 transition-colors">Thêm khu vực mới</span>
          </button>

        </div>
      </div>
    </div>
  );
}