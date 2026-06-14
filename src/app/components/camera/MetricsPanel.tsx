import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Thermometer, Droplets, TrendingUp, Clock, Activity, Loader2, CloudRain } from 'lucide-react';
import type { Batch } from '../../contexts/SystemContext';

// =========================================================================
// 🚀 LẤY ĐƯỜNG LINK TỪ BIẾN MÔI TRƯỜNG (.env)
// =========================================================================
const WEATHER_API_URL = (import.meta as any).VITE_WEATHER_BASE_URL || 'https://mylongaiv2.onrender.com';
const DRYING_API_URL = (import.meta as any).VITE_API_URL || 'https://mylongai-backend-v2.onrender.com';

// Thời gian phơi tiêu chuẩn để AI làm mốc tính % độ khô (VD: 12 tiếng = 720 phút)
const STANDARD_DRYING_MINUTES = 720; 

interface MetricsPanelProps {
  activeBatch: Batch | null;
}

export function MetricsPanel({ activeBatch }: MetricsPanelProps) {
  const [weatherData, setWeatherData] = useState({ temp: 0, hum: 0, rainLabel: '', isRaining: false });
  const [predictedMinutes, setPredictedMinutes] = useState<number>(0);
  const [estimatedCompletion, setEstimatedCompletion] = useState<Date | null>(null);
  const [isFetching, setIsFetching] = useState<boolean>(false);
  const [isUsingMockData, setIsUsingMockData] = useState<boolean>(false);

  // TỰ ĐỘNG TÍNH TOÁN % ĐỘ KHÔ DỰA VÀO SỐ PHÚT AI TRẢ VỀ THẬT
  const calculatedDryness = Math.round(
    Math.max(0, Math.min(100, 100 - (predictedMinutes / STANDARD_DRYING_MINUTES) * 100))
  );

  useEffect(() => {
    if (!activeBatch) return;

    let isMounted = true;

    const fetchRealtimeData = async () => {
      setIsFetching(true);
      setIsUsingMockData(false); 

      try {
        let currentTemp = 35.0; 
        let currentHum = 60.0;  
        let rainLabel = '';
        let isRaining = false;

        // 1. LẤY THÔNG SỐ THỜI TIẾT
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

        // 2. GỌI API DỰ ĐOÁN TỪ AI VỚI DỮ LIỆU THỜI TIẾT Ở TRÊN
        const predictRes = await fetch(`${DRYING_API_URL}/drying/predict`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            avg_temperature: currentTemp,
            avg_humidity: currentHum
          })
        });

        if (predictRes.ok) {
          const predictJson = await predictRes.json();
          // Lấy DỮ LIỆU THẬT từ Backend trả về
          const minutesLeft = Math.round(predictJson.predicted_drying_time || 0);
          
          // Tính toán chính xác thời điểm hoàn thành theo giờ thực tế
          const completionTime = new Date();
          completionTime.setMinutes(completionTime.getMinutes() + minutesLeft);

          if (isMounted) {
            setPredictedMinutes(minutesLeft);
            setEstimatedCompletion(completionTime);
          }
        }
      } catch (error) {
        console.error("Lỗi đồng bộ AI:", error);
      } finally {
        if (isMounted) setIsFetching(false);
      }
    };

    fetchRealtimeData();
    
    // Tự động quét 5 phút/lần
    const interval = setInterval(fetchRealtimeData, 300000); 

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [!!activeBatch]); // <-- Dùng !! để không bị spam request

  return (
    <Card className="border-slate-800 bg-[#151E2F] shadow-md">
      <CardHeader className="border-b border-slate-800 bg-[#151E2F] flex-row justify-between items-center">
        <CardTitle className="text-base md:text-lg text-white">
          Chỉ số hiện tại
        </CardTitle>
        {isUsingMockData && (
          <span className="text-[10px] bg-orange-500/20 text-orange-400 px-2 py-1 rounded border border-orange-500/30">
            Dữ liệu dự phòng
          </span>
        )}
      </CardHeader>
      <CardContent className="p-4 md:p-5 space-y-4 pt-5">
        {activeBatch ? (
          <>
            {/* Cảnh báo mưa */}
            {weatherData.rainLabel && (
              <div className={`p-3 rounded-lg border flex-row items-center gap-2 ${
                weatherData.isRaining || weatherData.rainLabel.includes('cao')
                  ? 'bg-rose-500/10 border-rose-500/30 text-rose-400' 
                  : 'bg-blue-500/10 border-blue-500/30 text-blue-400'
              }`}>
                <CloudRain className="w-5 h-5" />
                <span className="text-sm font-bold">{weatherData.rainLabel}</span>
              </div>
            )}

            {/* Nhiệt độ */}
            <div className="p-4 bg-[#0B1121] rounded-xl border border-slate-800 shadow-inner">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-orange-500/10 rounded-lg flex items-center justify-center">
                    <Thermometer className="w-5 h-5 text-orange-400" />
                  </div>
                  <span className="text-sm font-medium text-slate-400">
                    Nhiệt độ (Sensor)
                  </span>
                </div>
              </div>
              <div className="text-3xl font-bold text-white">
                {weatherData.temp.toFixed(1)}°C
              </div>
            </div>

            {/* Độ ẩm */}
            <div className="p-4 bg-[#0B1121] rounded-xl border border-slate-800 shadow-inner">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-cyan-500/10 rounded-lg flex items-center justify-center">
                    <Droplets className="w-5 h-5 text-cyan-400" />
                  </div>
                  <span className="text-sm font-medium text-slate-400">
                    Độ ẩm (Sensor)
                  </span>
                </div>
              </div>
              <div className="text-3xl font-bold text-white">
                {weatherData.hum.toFixed(1)}%
              </div>
            </div>

            {/* KHỐI HIỂN THỊ DỮ LIỆU DỰ ĐOÁN TỪ AI */}
            <div className="p-4 bg-[#0B1121] rounded-xl border border-slate-800 shadow-inner relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-violet-500 to-transparent opacity-50" />
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-violet-500/10 rounded-lg flex items-center justify-center">
                    <Clock className="w-5 h-5 text-violet-400" />
                  </div>
                  <span className="text-sm font-medium text-slate-400">
                    Dự kiến khô (AI Predict)
                  </span>
                </div>
              </div>
              <div className="space-y-1">
                {/* 1. Mấy giờ sẽ khô (Chữ to in đậm) */}
                <div className="text-2xl font-bold text-white flex items-center gap-2">
                  {estimatedCompletion 
                    ? estimatedCompletion.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) 
                    : '--:--'
                  }
                  {isFetching && <Loader2 className="w-4 h-4 animate-spin text-slate-500" />}
                </div>
                {/* 2. Đếm ngược còn bao nhiêu tiếng (Chữ nhỏ màu tím) */}
                <div className="text-xs text-violet-400 font-medium">
                  {predictedMinutes > 0 
                    ? `Đếm ngược: ${Math.floor(predictedMinutes / 60)}h ${predictedMinutes % 60}p` 
                    : 'Đang tính toán...'}
                </div>
              </div>
            </div>

            {/* Tiến trình Độ khô tự tính toán từ AI */}
            <div className="p-4 bg-[#0B1121] rounded-xl border border-slate-800 shadow-inner">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-emerald-500/10 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-emerald-400" />
                  </div>
                  <span className="text-sm font-medium text-slate-400">
                    Độ khô (Ước tính)
                  </span>
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
                  ? "Giai đoạn đầu"
                  : calculatedDryness < 80
                    ? "Đang khô nhanh"
                    : calculatedDryness < 100 
                      ? "Sắp hoàn thành" 
                      : "🎉 Đã khô hoàn toàn!"}
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <Activity className="w-12 h-12 text-slate-700 mx-auto mb-3" />
            <p className="text-sm text-slate-500">
              Chưa có mẻ bánh đang phơi
            </p>
            <p className="text-xs text-slate-600 mt-1">
              Hệ thống cảm biến đang chờ...
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}