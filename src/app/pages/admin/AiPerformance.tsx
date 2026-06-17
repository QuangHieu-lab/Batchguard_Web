import React, { useState } from 'react';
import { 
  Target, BrainCircuit, Calendar, 
  Thermometer, Droplets, ScanLine, Clock 
} from 'lucide-react';

// =========================================================================
// 🚀 DỮ LIỆU MOCK THEO NGÀY CỤ THỂ (Dành cho phân tích AI)
// =========================================================================
const mockDailyData = {
  'today': {
    dateLabel: 'Hôm nay (15/06/2026)',
    confidence: 94.8,
    detectCount: 1845,
    avgTemp: 34.5,
    avgHum: 62.0,
    avgDryingTime: '4h 15p',
  },
  'yesterday': {
    dateLabel: 'Hôm qua (14/06/2026)',
    confidence: 96.2,
    detectCount: 2120,
    avgTemp: 36.2,
    avgHum: 55.4,
    avgDryingTime: '3h 50p',
  },
  'day_before': {
    dateLabel: 'Hôm kia (13/06/2026)',
    confidence: 91.5,
    detectCount: 1450,
    avgTemp: 31.0,
    avgHum: 75.5,
    avgDryingTime: '5h 30p',
  }
};

export default function AiPerformance() {
  const [selectedDay, setSelectedDay] = useState<'today' | 'yesterday' | 'day_before'>('today');
  
  const currentData = mockDailyData[selectedDay];

  return (
    <div className="p-4 md:p-8 space-y-6 text-slate-200">
      
      {/* ================= HEADER & BỘ LỌC NGÀY ================= */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-2">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">Độ tin cậy Model AI</h1>
          <p className="text-sm md:text-base text-slate-400">Phân tích hiệu suất YOLO Vision theo điều kiện môi trường</p>
        </div>

        {/* Nút Chọn Ngày */}
        <div className="flex bg-[#1e293b] p-1 rounded-xl border border-slate-700">
          <button 
            onClick={() => setSelectedDay('today')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${selectedDay === 'today' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'}`}
          >
            Hôm nay
          </button>
          <button 
            onClick={() => setSelectedDay('yesterday')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${selectedDay === 'yesterday' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'}`}
          >
            Hôm qua
          </button>
          <button 
            onClick={() => setSelectedDay('day_before')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${selectedDay === 'day_before' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'}`}
          >
            Hôm kia
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2 text-slate-400 text-sm mb-6 ml-1">
        <Calendar className="w-4 h-4 text-purple-400" />
        Đang hiển thị dữ liệu của: <strong className="text-white">{currentData.dateLabel}</strong>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* ================= KHỐI 1: CHỈ SỐ CONFIDENCE LỚN ================= */}
        <div className="lg:col-span-2 w-full bg-[#1e293b] p-6 md:p-8 rounded-[32px] border border-slate-700/50 shadow-lg relative overflow-hidden flex flex-col justify-between">
          <div className="absolute -right-10 -top-10 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div>
            <div className="flex justify-between items-center mb-6 relative z-10">
              <div className="bg-purple-500/20 p-3.5 rounded-2xl border border-purple-500/30">
                <Target className="w-7 h-7 text-purple-400" />
              </div>
              <BrainCircuit className="w-8 h-8 text-slate-500" />
            </div>

            <p className="text-slate-400 text-sm font-semibold mb-2 relative z-10">Độ tin cậy (Confidence Score)</p>
            <div className="flex items-end gap-1 mb-5 relative z-10">
              <span className="text-white text-7xl font-extrabold tracking-tight">{currentData.confidence}</span>
              <span className="text-purple-400 text-3xl font-bold mb-2">%</span>
            </div>

            <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden mb-4 border border-slate-700/50 relative z-10">
              <div 
                className={`h-full rounded-full transition-all duration-1000 ${currentData.confidence > 90 ? 'bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.8)]' : 'bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.8)]'}`}
                style={{ width: `${currentData.confidence}%` }} 
              />
            </div>
          </div>
          
          <div className="relative z-10 bg-slate-800/50 border border-slate-700 rounded-2xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <ScanLine className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="text-xs text-slate-400">Số bánh đã detect (Count)</p>
                <p className="text-lg font-bold text-white">{currentData.detectCount.toLocaleString('vi-VN')} chiếc</p>
              </div>
            </div>
          </div>
        </div>

        {/* ================= KHỐI 2: THÔNG SỐ MÔI TRƯỜNG TRUNG BÌNH ================= */}
        <div className="space-y-4">
          <h2 className="text-slate-400 font-bold uppercase tracking-wider text-xs mb-2 ml-1">Môi trường trung bình</h2>
          
          <div className="bg-gradient-to-br from-orange-500/10 to-transparent p-5 rounded-3xl border border-orange-500/20">
            <div className="flex items-center gap-3 mb-2">
              <Thermometer className="w-5 h-5 text-orange-400" />
              <p className="text-orange-400/80 text-xs font-bold uppercase">Nhiệt độ TB</p>
            </div>
            <p className="text-orange-400 font-extrabold text-3xl">{currentData.avgTemp.toFixed(1)}°C</p>
          </div>

          <div className="bg-gradient-to-br from-cyan-500/10 to-transparent p-5 rounded-3xl border border-cyan-500/20">
            <div className="flex items-center gap-3 mb-2">
              <Droplets className="w-5 h-5 text-cyan-400" />
              <p className="text-cyan-400/80 text-xs font-bold uppercase">Độ ẩm TB</p>
            </div>
            <p className="text-cyan-400 font-extrabold text-3xl">{currentData.avgHum.toFixed(1)}%</p>
          </div>

          <div className="bg-gradient-to-br from-emerald-500/10 to-transparent p-5 rounded-3xl border border-emerald-500/20">
            <div className="flex items-center gap-3 mb-2">
              <Clock className="w-5 h-5 text-emerald-400" />
              <p className="text-emerald-400/80 text-xs font-bold uppercase">TG Phơi TB</p>
            </div>
            <p className="text-emerald-400 font-extrabold text-3xl">{currentData.avgDryingTime}</p>
          </div>
        </div>

      </div>
    </div>
  );
}