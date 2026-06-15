import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Thermometer, Droplets, TrendingUp, Clock, Activity, CloudRain } from 'lucide-react';
import type { Batch } from '../../contexts/SystemContext';

// CẤU HÌNH API
const WEATHER_API_URL = (import.meta as any).VITE_WEATHER_BASE_URL || 'https://mylongaiv2.onrender.com';

interface MetricsPanelProps {
  activeBatch: Batch | null;
}

export function MetricsPanel({ activeBatch }: MetricsPanelProps) {
  const [weatherData, setWeatherData] = useState({ temp: 0, hum: 0, rainLabel: '', isRaining: false });
  const [isUsingMockData, setIsUsingMockData] = useState<boolean>(false);
  
  // 🚀 Ghim mốc thời gian bắt đầu phơi. 
  // (Nếu activeBatch không có startTime, tạm giả lập mẻ bánh đã phơi được 3 tiếng để thấy được thanh Progress)
  const [batchStartTime] = useState<Date>(
    (activeBatch as any)?.startTime ? new Date((activeBatch as any).startTime) : new Date(Date.now() - 3 * 60 * 60 * 1000)
  );

  // =========================================================================
  // 🧠 CÔNG THỨC DỰ ĐOÁN THỜI GIAN KHÔ (Dựa vào Nhiệt độ, Độ ẩm)
  // =========================================================================
  // Mốc chuẩn: 12 tiếng (720 phút) ở 35°C, 60% ẩm
  const baseTime = 720; 
  const tempFactor = 35 / Math.max(weatherData.temp, 10); // Nóng hơn -> Khô nhanh hơn (< 1)
  const humFactor = Math.max(weatherData.hum, 10) / 60;   // Ẩm cao hơn -> Khô chậm hơn (> 1)
  
  // Tổng số phút cần thiết để khô hoàn toàn
  const totalPredictedMinutes = Math.round(baseTime * tempFactor * humFactor);
  
  // Số phút đã trôi qua kể từ lúc bắt đầu phơi
  const elapsedMinutes = Math.floor((Date.now() - batchStartTime.getTime()) / 60000);
  
  // % Độ khô hiện tại
  const calculatedDryness = Math.min(100, Math.max(0, Math.round((elapsedMinutes / totalPredictedMinutes) * 100)));
  
  // Thời gian dự kiến hoàn thành (Cố định, ít bị nhảy lùi)
  const estimatedCompletion = new Date(batchStartTime.getTime() + totalPredictedMinutes * 60000);
  
  // Số phút đếm ngược còn lại
  const minutesLeft = Math.max(0, totalPredictedMinutes - elapsedMinutes);

  useEffect(() => {
    if (!activeBatch) return;
    let isMounted = true;

    const fetchRealtimeData = async () => {
      setIsUsingMockData(false); 

      try {
        let currentTemp = 35.0; 
        let currentHum = 60.0;  
        let rainLabel = '';
        let isRaining = false;

        // 1. LẤY THÔNG SỐ THỜI TIẾT TỪ CẢM BIẾN/API
        try {
          const weatherRes = await fetch(`${WEATHER_API_URL}/weather/analyze`, {
            method: 'GET',
            headers: { 'Accept': 'application/json' }
          });
          
          if (weatherRes.ok) {
            const weatherJson = await weatherRes.json();
            currentTemp = weatherJson.sensor_data?.temperature_c || weatherJson.api_weather?.temperature_c || 35.0;
            currentHum = weatherJson.sensor_data?.humidity_percent || weatherJson.api_weather?.humidity_percent || 60;
            rainLabel = weatherJson.prediction?.rain_label || '';
            isRaining = weatherJson.prediction?.currently_raining || false;
          } else {
            if (isMounted) setIsUsingMockData(true);
          }
        } catch (weatherErr) {
          if (isMounted) setIsUsingMockData(true);
        }

        if (isMounted) {
          setWeatherData({ temp: currentTemp, hum: currentHum, rainLabel, isRaining });
        }

      } catch (error) {
        console.error("Lỗi đồng bộ dữ liệu:", error);
      }
    };

    fetchRealtimeData();
    const interval = setInterval(fetchRealtimeData, 300000); // 5 phút cập nhật thời tiết 1 lần
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [!!activeBatch]); 

  return (
    <Card className="border-slate-800 bg-[#151E2F] shadow-md">
      <CardHeader className="border-b border-slate-800 bg-[#151E2F] flex-row justify-between items-center py-4">
        <CardTitle className="text-base md:text-lg text-white">
          Chỉ số môi trường
        </CardTitle>
        {isUsingMockData && (
          <span className="text-[10px] bg-orange-500/20 text-orange-400 px-2 py-1 rounded border border-orange-500/30">
            Dữ liệu dự phòng
          </span>
        )}
      </CardHeader>
      
      <CardContent className="p-4 md:p-5 space-y-5 pt-5">
        {activeBatch ? (
          <>
            {/* Cảnh báo mưa */}
            {weatherData.rainLabel && (
              <div className={`p-3 rounded-xl border flex-row items-center gap-2 ${
                weatherData.isRaining || weatherData.rainLabel.includes('cao')
                  ? 'bg-rose-500/10 border-rose-500/30 text-rose-400' 
                  : 'bg-blue-500/10 border-blue-500/30 text-blue-400'
              }`}>
                <CloudRain className="w-5 h-5" />
                <span className="text-sm font-bold">{weatherData.rainLabel}</span>
              </div>
            )}

            {/* LƯỚI 2 CHỈ SỐ: NHIỆT ĐỘ - ĐỘ ẨM */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-[#0B1121] rounded-xl border border-slate-800 flex flex-col items-center justify-center shadow-inner">
                <Thermometer className="w-6 h-6 text-orange-400 mb-2" />
                <span className="text-2xl font-bold text-white">{weatherData.temp.toFixed(1)}°C</span>
                <span className="text-xs text-slate-500 font-medium mt-1">Nhiệt độ</span>
              </div>
              
              <div className="p-4 bg-[#0B1121] rounded-xl border border-slate-800 flex flex-col items-center justify-center shadow-inner">
                <Droplets className="w-6 h-6 text-cyan-400 mb-2" />
                <span className="text-2xl font-bold text-white">{weatherData.hum.toFixed(1)}%</span>
                <span className="text-xs text-slate-500 font-medium mt-1">Độ ẩm</span>
              </div>
            </div>

            {/* KHỐI HIỂN THỊ DỮ LIỆU DỰ ĐOÁN */}
            <div className="p-4 bg-[#0B1121] rounded-xl border border-slate-800 shadow-inner relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-violet-500 to-transparent opacity-50" />
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-violet-500/10 rounded-lg flex items-center justify-center">
                    <Clock className="w-5 h-5 text-violet-400" />
                  </div>
                  <span className="text-sm font-medium text-slate-400">
                    Dự kiến khô (Dựa theo Môi trường)
                  </span>
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-bold text-white flex items-center gap-2">
                  {estimatedCompletion.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                </div>
                <div className="text-xs text-violet-400 font-medium">
                  {minutesLeft > 0 
                    ? `Đếm ngược: ${Math.floor(minutesLeft / 60)}h ${minutesLeft % 60}p` 
                    : 'Đã hoàn thành!'}
                </div>
              </div>
            </div>

            {/* Tiến trình Độ khô */}
            <div className="p-4 bg-[#0B1121] rounded-xl border border-slate-800 shadow-inner">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-emerald-500/10 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-emerald-400" />
                  </div>
                  <span className="text-sm font-medium text-slate-400">Độ khô (Ước tính)</span>
                </div>
                <span className="text-2xl font-bold text-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]">
                  {calculatedDryness}%
                </span>
              </div>
              <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)] transition-all duration-1000"
                  style={{ width: `${calculatedDryness}%` }}
                />
              </div>
              <div className="mt-2 text-xs text-slate-400 font-medium">
                {calculatedDryness < 50
                  ? "Giai đoạn đầu (Đang ráo mặt)"
                  : calculatedDryness < 80
                    ? "Đang khô nhanh"
                    : calculatedDryness < 100 
                      ? "Sắp hoàn thành (Chuẩn bị thu hoạch)" 
                      : "🎉 Bánh đã khô hoàn toàn!"}
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <Activity className="w-12 h-12 text-slate-700 mx-auto mb-3" />
            <p className="text-sm text-slate-500">Chưa có mẻ bánh đang phơi</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}