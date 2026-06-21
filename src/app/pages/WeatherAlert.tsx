import React, { useState } from 'react';
import { 
  AlertTriangle, CloudLightning, Sun, 
  CheckCircle, ShieldAlert, CloudRain, 
  Activity, Wind, Droplets, RefreshCw
} from 'lucide-react';
import { useWeather } from '../hooks/useWeather'; 

export default function WeatherAlertWeb() {
  const { currentWeather, advice, loading, error } = useWeather();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    window.location.reload();
  };

  // =====================================
  // LOGIC ĐÁNH GIÁ MỨC ĐỘ RỦI RO
  // =====================================
  const getSeverityConfig = () => {
    if (!currentWeather) {
      return { 
        theme: 'emerald', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', text: 'text-emerald-400',
        title: 'Đang tải...', icon: Sun, action: 'Chờ dữ liệu AI...', desc: 'Đang phân tích...'
      };
    }
    
    // NGUY HIỂM: Đang mưa hoặc khả năng mưa > 60%
    if (currentWeather.isRaining || currentWeather.rainChance > 60) {
      return { 
        theme: 'red', bg: 'bg-red-500/10', border: 'border-red-500/40', text: 'text-red-500',
        title: 'NGUY HIỂM: CÓ MƯA!', icon: CloudLightning, 
        action: 'KÍCH HOẠT THU BÁNH KHẨN CẤP',
        desc: `Khả năng mưa cực cao ` 
      };
    }
    
    // CẢNH BÁO: Khả năng mưa > 30%
    if (currentWeather.rainChance > 30) {
      return { 
        theme: 'amber', bg: 'bg-amber-500/10', border: 'border-amber-500/40', text: 'text-amber-500',
        title: 'CẢNH BÁO RỦI RO', icon: AlertTriangle, 
        action: 'CHUẨN BỊ KÉO BẠT / THU BÁNH',
        desc: `Có nguy cơ mưa rào `
      };
    }

    // CHÚ Ý: Độ ẩm quá cao (nhưng không mưa)
    if (currentWeather.humidity > 75) {
      return { 
        theme: 'amber', bg: 'bg-amber-500/10', border: 'border-amber-500/40', text: 'text-amber-500',
        title: 'LƯU Ý ĐỘ ẨM CAO', icon: Droplets, 
        action: 'ĐẢM BẢO THÔNG GIÓ',
        desc: `Độ ẩm  , bánh lâu khô`
      };
    }
    
    // AN TOÀN
    return { 
      theme: 'emerald', bg: 'bg-emerald-500/10', border: 'border-emerald-500/40', text: 'text-emerald-500',
      title: 'ĐIỀU KIỆN AN TOÀN', icon: CheckCircle, 
      action: 'TIẾP TỤC PHƠI BÌNH THƯỜNG',
      desc: 'Ít khả năng mưa, thời tiết thuận lợi' 
    };
  };

  const severity = getSeverityConfig();
  const StatusIcon = severity.icon;

  if (loading && !isRefreshing && !currentWeather) {
    return <div className="p-8 text-center text-slate-400 animate-pulse">AI đang phân tích môi trường...</div>;
  }

  if (error) {
    return <div className="p-8 text-center text-red-400 bg-red-500/10 rounded-xl">Lỗi tải dữ liệu thời tiết. Vui lòng thử lại.</div>;
  }

  return (
    <div className="bg-[#0f172a] rounded-2xl border border-slate-800 shadow-2xl overflow-hidden">
      
      {/* ================= HEADER ================= */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800/80 bg-slate-900/50">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-cyan-500/10 rounded-full flex items-center justify-center border border-cyan-500/30">
            <ShieldAlert size={20} className="text-cyan-400" />
          </div>
          <div>
            <h2 className="text-white text-xl font-bold tracking-tight">Hệ Thống AI Cảnh Báo</h2>
            <p className="text-slate-400 text-sm mt-0.5">Phân tích điều kiện phơi bánh theo thời gian thực</p>
          </div>
        </div>
        <button 
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 transition-colors disabled:opacity-50"
        >
          <RefreshCw size={16} className={`text-cyan-400 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span className="text-slate-300 font-medium text-sm">Làm mới</span>
        </button>
      </div>

      <div className="p-6">
        {currentWeather && (
          <>
            {/* ================= BANNER CẢNH BÁO CHÍNH ================= */}
            <div className={`w-full p-8 rounded-2xl border mb-6 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6 shadow-lg ${severity.bg} ${severity.border}`}>
              
              {/* Hiệu ứng nhấp nháy nếu mưa */}
              {currentWeather.isRaining && <div className="absolute inset-0 bg-red-500/15 animate-pulse pointer-events-none" />}
              
              {/* Thông tin trạng thái */}
              <div className="flex items-center gap-6 relative z-10">
                <div className={`p-5 rounded-full bg-slate-900/50 border shadow-lg ${severity.border}`}>
                  <StatusIcon size={48} className={severity.text} />
                </div>
                <div>
                  <p className="text-slate-300 text-xs font-bold uppercase tracking-widest mb-1">Trạng thái môi trường</p>
                  <h3 className={`text-3xl font-black uppercase tracking-tight ${severity.text}`}>
                    {severity.title}
                  </h3>
                  {/* 🚀 ĐÃ SỬA: Hiển thị mô tả động dựa trên điều kiện thời tiết thực tế */}
                  <p className="text-slate-300 font-medium mt-1">
                    {severity.desc}
                  </p>
                </div>
              </div>

              {/* Lệnh Hành Động */}
              <div className={`bg-slate-900/80 px-8 py-5 rounded-xl border min-w-[300px] text-center relative z-10 ${severity.border}`}>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Lệnh Hành Động</p>
                <p className={`text-xl font-black ${severity.text}`}>
                  {severity.action}
                </p>
              </div>
            </div>

            {/* ================= LƯỚI THÔNG SỐ ================= */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              
              {/* Card 1: Khả năng mưa */}
              <div className="bg-[#1e293b] p-5 rounded-xl border border-slate-700/50 shadow-sm flex flex-col justify-between">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-2">
                    <CloudRain size={18} className="text-cyan-400" />
                    <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Khả năng mưa</span>
                  </div>
                  <div className="text-right">
                    <p className="text-slate-500 text-[10px] uppercase font-bold">Đỉnh điểm 12h</p>
                    <p className="text-red-400 font-bold text-sm">{currentWeather.maxPrecip12h}%</p>
                  </div>
                </div>
                <p className="text-white font-black text-3xl">{currentWeather.rainChance}%</p>
              </div>

              {/* Card 2: Độ ẩm */}
              <div className="bg-[#1e293b] p-5 rounded-xl border border-slate-700/50 shadow-sm flex flex-col justify-between">
                <div className="flex items-center gap-2 mb-4">
                  <Droplets size={18} className="text-blue-500" />
                  <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Độ ẩm</span>
                </div>
                <div>
                  <p className="text-white font-black text-3xl">{currentWeather.humidity}%</p>
                  {currentWeather.humidity > 80 && <p className="text-amber-400 text-xs mt-2 font-medium">Hơi ẩm cao, khó khô</p>}
                </div>
              </div>

              {/* Card 3: Sức gió */}
              <div className="bg-[#1e293b] p-5 rounded-xl border border-slate-700/50 shadow-sm flex flex-col justify-between">
                <div className="flex items-center gap-2 mb-4">
                  <Wind size={18} className="text-teal-400" />
                  <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Sức gió</span>
                </div>
                <div>
                  <p className="text-white font-black text-3xl">{currentWeather.windSpeed} <span className="text-sm font-medium text-slate-500">m/s</span></p>
                  {currentWeather.windSpeed > 5 && <p className="text-emerald-400 text-xs mt-2 font-medium">Gió tốt, phơi nhanh</p>}
                </div>
              </div>
            </div>

            {/* ================= BÁO CÁO TỪ TRỢ LÝ AI ================= */}
            {advice && advice.length > 0 && (
              <div className="bg-indigo-900/10 p-6 rounded-xl border border-indigo-500/20">
                <div className="flex items-center gap-2 mb-4">
                  <Activity size={18} className="text-indigo-400" />
                  <h4 className="text-indigo-400 font-bold uppercase tracking-wider text-sm">Khuyến nghị từ AI</h4>
                </div>
                <ul className="space-y-3">
                  {advice.map((adv, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-slate-300 font-medium">
                      <span className="min-w-[6px] h-[6px] rounded-full bg-indigo-500 mt-2" />
                      {adv}
                    </li>
                  ))}
                </ul>
              </div>
            )}

          </>
        )}
      </div>
    </div>
  );
}