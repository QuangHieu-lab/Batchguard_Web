import React, { useState, useEffect } from 'react';
import { 
  Target, BrainCircuit, Calendar, 
  Thermometer, Droplets, ScanLine, Clock, Activity 
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine
} from 'recharts';
import { adminApi } from '../../../services/endpoints';

export default function AiPerformance() {
  const [chartData, setChartData] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [loading, setLoading] = useState(true);

  // Lấy dữ liệu biểu đồ từ API thật (Kết hợp Confidence và Dryness)
  useEffect(() => {
    let isMounted = true;
    const fetchChartData = async () => {
      setLoading(true);
      try {
        const [confRes, dryRes]: any = await Promise.all([
          adminApi.getConfidenceChart(),
          adminApi.getDrynessChart().catch(() => null) // Bỏ qua lỗi nếu API dryness lỗi
        ]);
        
        const confData = confRes?.data || confRes;
        const dryData = dryRes?.data || dryRes;
        
        if (confData && Array.isArray(confData) && isMounted) {
          // Tạo Map để tra cứu dữ liệu môi trường (dryness-chart) theo ngày
          const dryMap = new Map();
          if (dryData && Array.isArray(dryData)) {
            dryData.forEach((d: any) => {
              dryMap.set(d.date, d);
            });
          }

          // Kết hợp dữ liệu
          const mappedData = confData.map(item => {
            const dateStr = item.date;
            const dryItem = dryMap.get(dateStr) || {};
            
            // Format avg_minutes sang dạng Xh Yp
            let timeStr = '--';
            if (dryItem.avg_minutes) {
              const totalMins = dryItem.avg_minutes;
              const h = Math.floor(totalMins / 60);
              const m = Math.round(totalMins % 60);
              timeStr = h > 0 ? `${h}h ${m}p` : `${m}p`;
            }

            return {
              date: dateStr,
              confidence: Math.round((item.avg_confidence || 0) * 100),
              detectCount: item.total_detected || 0,
              avgTemp: dryItem.avg_temperature || 0,
              avgHum: dryItem.avg_humidity || 0,
              avgDryingTime: timeStr
            };
          });
          
          setChartData(mappedData);
          if (mappedData.length > 0) {
            setSelectedDate(mappedData[0].date);
          }
        }
      } catch (error) {
        console.log('Lỗi fetch confidence/dryness chart:', error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchChartData();

    return () => {
      isMounted = false;
    };
  }, []);
  
  const currentData = chartData.find(d => d.date === selectedDate) || {
    date: selectedDate,
    confidence: 0,
    detectCount: 0,
    avgTemp: 0,
    avgHum: 0,
    avgDryingTime: '--'
  };

  return (
    <div className="p-4 md:p-8 space-y-6 text-slate-200">
      
      {/* ================= HEADER & BỘ LỌC NGÀY ================= */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-2">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">Độ tin cậy Model AI</h1>
          <p className="text-sm md:text-base text-slate-400">Phân tích hiệu suất YOLO Vision theo điều kiện môi trường</p>
        </div>

        {/* Nút Chọn Ngày linh động theo dữ liệu API */}
        {chartData.length > 0 && (
          <div className="flex flex-wrap gap-2 bg-[#1e293b] p-1 rounded-xl border border-slate-700">
            {chartData.map((d) => (
              <button 
                key={d.date}
                onClick={() => setSelectedDate(d.date)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${selectedDate === d.date ? 'bg-purple-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'}`}
              >
                {d.date}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 text-slate-400 text-sm mb-6 ml-1">
        <Calendar className="w-4 h-4 text-purple-400" />
        Đang hiển thị dữ liệu của: <strong className="text-white">{selectedDate || 'Chưa có dữ liệu'}</strong>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
           <Activity className="w-8 h-8 text-purple-500 animate-spin" />
        </div>
      ) : chartData.length === 0 ? (
        <div className="flex items-center justify-center h-64 text-slate-400 bg-[#1e293b] rounded-[32px]">
           Chưa có dữ liệu AI Confidence
        </div>
      ) : (
        <>
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

                <p className="text-slate-400 text-sm font-semibold mb-2 relative z-10">Độ tin cậy Trung bình (Confidence Score)</p>
                <div className="flex items-end gap-1 mb-5 relative z-10">
                  <span className="text-white text-7xl font-extrabold tracking-tight">{currentData.confidence}</span>
                  <span className="text-purple-400 text-3xl font-bold mb-2">%</span>
                </div>

                <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden mb-4 border border-slate-700/50 relative z-10">
                  <div 
                    className={`h-full rounded-full transition-all duration-1000 ${currentData.confidence >= 80 ? 'bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.8)]' : 'bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.8)]'}`}
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
                    <p className="text-xs text-slate-400">Số bánh đã detect (Total Detected)</p>
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
                <p className="text-orange-400 font-extrabold text-3xl">
                  {currentData.avgTemp > 0 ? `${currentData.avgTemp.toFixed(1)}°C` : '--'}
                </p>
              </div>

              <div className="bg-gradient-to-br from-cyan-500/10 to-transparent p-5 rounded-3xl border border-cyan-500/20">
                <div className="flex items-center gap-3 mb-2">
                  <Droplets className="w-5 h-5 text-cyan-400" />
                  <p className="text-cyan-400/80 text-xs font-bold uppercase">Độ ẩm TB</p>
                </div>
                <p className="text-cyan-400 font-extrabold text-3xl">
                  {currentData.avgHum > 0 ? `${currentData.avgHum.toFixed(1)}%` : '--'}
                </p>
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

          {/* ================= KHỐI 3: BIỂU ĐỒ CONFIDENCE TỪ API ================= */}
          <div className="bg-[#1e293b] p-6 md:p-8 rounded-[32px] border border-slate-700/50 shadow-lg mt-6">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Activity className="w-5 h-5 text-purple-400" /> 
              Biểu đồ Confidence Score Real-time
            </h2>
            
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorConfidence" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#a855f7" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis 
                    dataKey="date" 
                    stroke="#64748b" 
                    tick={{ fill: '#94a3b8' }} 
                    axisLine={{ stroke: '#334155' }}
                  />
                  <YAxis 
                    stroke="#64748b" 
                    tick={{ fill: '#94a3b8' }} 
                    axisLine={{ stroke: '#334155' }}
                    domain={[0, 100]}
                  />
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                    itemStyle={{ color: '#e2e8f0' }}
                    labelStyle={{ color: '#94a3b8', marginBottom: '4px' }}
                  />
                  <ReferenceLine y={80} stroke="#f59e0b" strokeDasharray="3 3" label={{ position: 'insideTopLeft', value: 'Ngưỡng 80%', fill: '#f59e0b', fontSize: 12 }} />
                  <Area 
                    type="monotone" 
                    dataKey="confidence" 
                    name="Độ tin cậy (%)"
                    stroke="#a855f7" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorConfidence)" 
                    activeDot={{ r: 8, fill: '#a855f7', stroke: '#fff', strokeWidth: 2 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}

    </div>
  );
}