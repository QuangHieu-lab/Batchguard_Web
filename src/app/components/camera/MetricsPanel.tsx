import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Thermometer, Droplets, TrendingUp, Clock, Activity, CloudRain } from 'lucide-react';
import type { Batch } from '../../contexts/SystemContext';
import { predictionApi, sensorApi } from '../../../services/endpoints';

const WEATHER_API_URL = (import.meta as any).VITE_WEATHER_BASE_URL || 'https://mylongaiv2.onrender.com';

interface MetricsPanelProps {
  activeBatch: Batch | null;
  cameraId?: string | null;
  hasDetection?: boolean;
}

export function MetricsPanel({ activeBatch, cameraId, hasDetection = true }: MetricsPanelProps) {
  const [weatherData, setWeatherData] = useState({ temp: 0, hum: 0, rainLabel: '', isRaining: false });
  
  const [predictionData, setPredictionData] = useState({
    dryness: 0,
    minutesLeft: 0,
  });

  useEffect(() => {
    let isMounted = true;

    const fetchRealtimeData = async () => {
      try {
        let currentTemp = 0; 
        let currentHum = 0;  
        let rainLabel = '';
        let isRaining = false;
        
        let realDryness = 0;
        let realMinutesLeft = 0;

        // 1. Fetch Dữ liệu từ Sensor (API thật)
        if (cameraId) {
           try {
             const sensorRes: any = await sensorApi.getLatest(cameraId);
             const sData = sensorRes?.data || sensorRes;
             if (sData && sData.temperature_c !== undefined) {
               currentTemp = sData.temperature_c;
               currentHum = sData.humidity_percent;
             }
           } catch(e) {
             console.error("Lỗi fetch sensor:", e);
           }
           
           // 2. Fetch Dự đoán Dryness (API thật)
           try {
             const predRes: any = await predictionApi.getLatest(cameraId);
             const pData = predRes?.data || predRes;
             if (pData && pData.dryness_percentage !== undefined) {
               realDryness = pData.dryness_percentage;
               realMinutesLeft = pData.remaining_minutes;
             }
           } catch(e) {
             console.error("Lỗi fetch prediction:", e);
           }
        }

        // 3. Gọi AI Thời tiết để lấy cảnh báo mưa (dùng chung)
        try {
          const weatherRes = await fetch(`${WEATHER_API_URL}/weather/analyze`, {
            method: 'GET',
            headers: { 'Accept': 'application/json' }
          });
          
          if (weatherRes.ok) {
            const weatherJson = await weatherRes.json();
            rainLabel = weatherJson.prediction?.rain_label || '';
            isRaining = weatherJson.prediction?.currently_raining || false;
            // Nếu sensor không có dữ liệu, dùng thời tiết API làm tham khảo
            if (currentTemp === 0 && weatherJson.api_weather?.temperature_c) {
               currentTemp = weatherJson.api_weather.temperature_c;
               currentHum = weatherJson.api_weather.humidity_percent;
            }
          }
        } catch (weatherErr) {
          console.error("Lỗi fetch weather:", weatherErr);
        }

        if (isMounted) {
          setWeatherData({ temp: currentTemp, hum: currentHum, rainLabel, isRaining });
          setPredictionData({ dryness: realDryness, minutesLeft: realMinutesLeft });
        }

      } catch (error) {
        console.error("Lỗi đồng bộ dữ liệu:", error);
      }
    };

    fetchRealtimeData();
    const interval = setInterval(fetchRealtimeData, 60000); // 1 phút cập nhật 1 lần
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [cameraId]); 

  const estimatedCompletion = new Date(Date.now() + predictionData.minutesLeft * 60000);

  return (
    <Card className="border-slate-800 bg-[#151E2F] shadow-md">
      <CardHeader className="border-b border-slate-800 bg-[#151E2F] flex-row justify-between items-center py-4">
        <CardTitle className="text-base md:text-lg text-white">
          Chỉ số môi trường & AI Dự đoán
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-4 md:p-5 space-y-5 pt-5">
        {(activeBatch || cameraId) ? (
          <>
            {/* Cảnh báo mưa */}
            {weatherData.rainLabel && (
              <div className={`p-3 rounded-xl border flex-row items-center gap-2 ${
                weatherData.isRaining || weatherData.rainLabel.includes('cao')
                  ? 'bg-rose-500/10 border-rose-500/30 text-rose-400' 
                  : 'bg-blue-500/10 border-blue-500/30 text-blue-400'
              }`}>
                <CloudRain className="w-5 h-5 inline-block mr-2" />
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
                    Dự kiến hoàn thành
                  </span>
                </div>
              </div>
              <div className="space-y-1">
                {hasDetection === false ? (
                  <div className="text-sm font-semibold text-rose-400 mt-2">
                    Không có bánh trên vỉ. Đang chờ AI YOLO...
                  </div>
                ) : (
                  <>
                    <div className="text-2xl font-bold text-white flex items-center gap-2">
                      {predictionData.minutesLeft > 0 
                        ? estimatedCompletion.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
                        : '--:--'}
                    </div>
                    <div className="text-xs text-violet-400 font-medium">
                      {predictionData.minutesLeft > 0 
                        ? `Còn lại: ${Math.floor(predictionData.minutesLeft / 60)}h ${Math.round(predictionData.minutesLeft % 60)}p` 
                        : (predictionData.dryness >= 100 ? 'Đã khô hoàn toàn!' : 'Đang tính toán...')}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Tiến trình Độ khô */}
            <div className="p-4 bg-[#0B1121] rounded-xl border border-slate-800 shadow-inner">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-emerald-500/10 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-emerald-400" />
                  </div>
                  <span className="text-sm font-medium text-slate-400">Độ khô</span>
                </div>
                <span className="text-2xl font-bold text-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]">
                  {Math.round(predictionData.dryness)}%
                </span>
              </div>
              <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)] transition-all duration-1000"
                  style={{ width: `${Math.round(predictionData.dryness)}%` }}
                />
              </div>
              <div className="mt-2 text-xs text-slate-400 font-medium">
                {hasDetection === false
                  ? "Chưa thể đo độ khô vì không có bánh."
                  : predictionData.dryness === 0
                    ? "Đang cập nhật..."
                    : predictionData.dryness < 50
                      ? "Giai đoạn đầu (Đang ráo mặt)"
                      : predictionData.dryness < 80
                        ? "Đang khô nhanh"
                        : predictionData.dryness < 100 
                          ? "Sắp hoàn thành (Chuẩn bị thu hoạch)" 
                          : "🎉 Bánh đã khô hoàn toàn!"}
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <Activity className="w-12 h-12 text-slate-700 mx-auto mb-3" />
            <p className="text-sm text-slate-500">Vui lòng chọn Camera để xem chỉ số môi trường</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}