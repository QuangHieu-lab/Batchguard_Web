import React from 'react';
import { Sun, Moon, ArrowRight, Thermometer, Droplets, Clock, Calendar } from 'lucide-react';

export default function DryingCycles() {
  // Mock Data: Danh sách chu kỳ
  const cycles = [
    { id: 1, date: "Hôm nay", timeOut: "07:30", timeIn: "11:45", duration: "4h 15m", avgTemp: 36.5, avgHumid: 48 },
    { id: 2, date: "Hôm qua", timeOut: "08:00", timeIn: "13:10", duration: "5h 10m", avgTemp: 34.2, avgHumid: 55 },
  ];

  return (
    <div className="p-4 md:p-8 space-y-6 text-slate-200">
      {/* HEADER */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">Chu kỳ phơi bánh</h1>
        <p className="text-sm md:text-base text-slate-400">Theo dõi lịch trình ra/vào sân & môi trường</p>
      </div>

      <div className="max-w-4xl">
        <h2 className="text-slate-400 font-bold uppercase tracking-wider text-xs mb-4 ml-1">Lịch sử chu kỳ phơi</h2>

        <div className="grid gap-6">
          {cycles.map((cycle) => (
            <div key={cycle.id} className="w-full bg-[#1e293b] p-6 rounded-[24px] border border-slate-700/50 shadow-lg hover:border-slate-600 transition-colors">
              {/* Ngày tháng */}
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2 bg-slate-800 px-4 py-2 rounded-full border border-slate-700">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  <span className="text-slate-300 font-bold text-sm">{cycle.date}</span>
                </div>
              </div>

              {/* Timeline (Ra sân -> Vào kho) */}
              <div className="flex items-center justify-between bg-slate-800/80 p-5 rounded-2xl border border-slate-700 mb-6 relative">
                {/* Bánh ra */}
                <div className="flex flex-col items-center z-10 bg-slate-800/80 px-3 rounded-xl">
                  <Sun className="w-7 h-7 text-yellow-400 mb-2" />
                  <span className="text-slate-400 text-[11px] uppercase font-bold mb-1">Bánh ra sân</span>
                  <span className="text-white font-bold text-2xl">{cycle.timeOut}</span>
                </div>

                {/* Dây nối ở giữa */}
                <div className="flex-1 flex items-center justify-center relative px-4">
                  <div className="w-full border-t-2 border-dashed border-slate-600 absolute top-1/2" />
                  <div className="bg-[#0f172a] px-4 py-2 rounded-full z-10 flex items-center gap-2 border border-slate-600 shadow-md">
                    <Clock className="w-3.5 h-3.5 text-cyan-400" />
                    <span className="text-cyan-400 text-xs font-bold">{cycle.duration}</span>
                  </div>
                </div>

                {/* Bánh vào */}
                <div className="flex flex-col items-center z-10 bg-slate-800/80 px-3 rounded-xl">
                  <Moon className="w-7 h-7 text-indigo-400 mb-2" />
                  <span className="text-slate-400 text-[11px] uppercase font-bold mb-1">Bánh vào kho</span>
                  <span className="text-white font-bold text-2xl">{cycle.timeIn}</span>
                </div>
              </div>

              {/* Thông số môi trường lúc phơi */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="bg-orange-500/10 p-4 rounded-2xl border border-orange-500/20 flex items-center gap-4">
                  <Thermometer className="w-6 h-6 text-orange-500" />
                  <div>
                    <p className="text-orange-400/80 text-xs font-bold uppercase mb-0.5">Nhiệt độ TB</p>
                    <p className="text-orange-500 font-extrabold text-lg">{cycle.avgTemp}°C</p>
                  </div>
                </div>

                <div className="bg-blue-500/10 p-4 rounded-2xl border border-blue-500/20 flex items-center gap-4">
                  <Droplets className="w-6 h-6 text-blue-500" />
                  <div>
                    <p className="text-blue-400/80 text-xs font-bold uppercase mb-0.5">Độ ẩm TB</p>
                    <p className="text-blue-500 font-extrabold text-lg">{cycle.avgHumid}%</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}