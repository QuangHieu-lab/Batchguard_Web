import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Thermometer, Droplets, TrendingUp, Clock, Activity, CloudRain, Badge, Lock } from 'lucide-react';
import type { Batch } from '../../contexts/SystemContext';
import { predictionApi, sensorApi } from '../../../services/endpoints';
import apiClient from '../../../services/api'; // 🚀 Import apiClient
import { useAuth } from '../../contexts/AuthContext'; // 🚀 Import useAuth

interface MetricsPanelProps {
  activeBatch: Batch | null;
  cameraId?: string | null;
  hasDetection?: boolean;
}

export function MetricsPanel({ activeBatch, cameraId, hasDetection = false }: MetricsPanelProps) {
  const { user } = useAuth(); // Lấy thông tin user
  const isPremium = user?.role === 'premium'; // Kiểm tra quyền Premium

  const [weatherData, setWeatherData] = useState({ temp: 0, hum: 0, rainLabel: '', isRaining: false });
  const [predictionData, setPredictionData] = useState({ dryness: 0, minutesLeft: 0 });

  // 🚀 BIẾN ÉP BẬT CHẾ ĐỘ DEMO CHO VIDEO TEST
  const IS_DEMO_MODE = true; 
  // Chỉ hiện UI Prediction nếu có bánh VÀ là tài khoản Premium
  const showPredictionUI = (hasDetection || IS_DEMO_MODE) && isPremium;

  useEffect(() => {
    let isMounted = true;

    const fetchRealtimeData = async () => {
      if (!cameraId) return;

      try {
        let currentTemp = 0;
        let currentHum = 0;
        let rainLabel = '';
        let isRaining = false;
        
        let realDryness = 0;
        let realMinutesLeft = 0;

        // ========================================================
        // 1. LUÔN LẤY DỮ LIỆU THỜI TIẾT TRƯỚC
        // ========================================================
        try {
          // 🚀 Thay fetch thuần bằng apiClient để tự động nhét Token -> Sửa lỗi 401
          const weatherJson: any = await apiClient.get('/weather/analyze');
          
          if (weatherJson) {
            // Chỉ hiển thị label mưa cho bản Premium theo bảng tính năng
            rainLabel = isPremium ? (weatherJson.prediction?.rain_label || '') : '';
            isRaining = isPremium ? (weatherJson.prediction?.currently_raining || false) : false;
            
            if (weatherJson.api_weather) {
              currentTemp = weatherJson.api_weather.temperature_c || 0;
              currentHum = weatherJson.api_weather.humidity_percent || 0;
            }
          }
        } catch (e: any) { 
          // Nếu BE trả về 403 cho bản Free thì bỏ qua không log để đỡ rác
          if (e?.response?.status !== 403) {
            console.error("Lỗi weather:", e); 
          }
        }

        // ========================================================
        // 2. NẾU CÓ CẢM BIẾN THẬT -> GHI ĐÈ LÊN DỮ LIỆU THỜI TIẾT
        // ========================================================
        try {
          const sensorRes: any = await sensorApi.getLatest(cameraId);
          const sData = sensorRes?.data || sensorRes;
          if (sData && sData.temperature !== undefined) {
            currentTemp = sData.temperature;
            currentHum = sData.humidity;
          }
        } catch (e) { 
          // Không log lỗi để tránh rác console
        }

        // ========================================================
        // 3. TÍNH TOÁN DỮ LIỆU DỰ ĐOÁN (Chỉ gọi khi là Premium)
        // ========================================================
        if (showPredictionUI) {
          try {
            const predRes: any = await predictionApi.getLatest(cameraId);
            const pData = predRes?.data || predRes;

            if (pData && pData.predicted_minutes !== undefined) {
              realMinutesLeft = pData.predicted_minutes;
              realDryness = pData.dryness_percentage !== undefined 
                ? pData.dryness_percentage 
                : Math.max(0, Math.min(100, 100 - ((realMinutesLeft / 120) * 100)));
            } else {
              throw new Error("Chưa có data prediction"); 
            }
          } catch (e) {
            // 🚀 TỰ ĐỘNG TÍNH TOÁN (FALLBACK) CHO DEMO
            const demoTemp = currentTemp > 0 ? currentTemp : 32.5;
            const demoHum = currentHum > 0 ? currentHum : 65;

            let baseMins = 120 - ((demoTemp - 30) * 5) + ((demoHum - 60) * 2);
            baseMins = Math.max(30, Math.min(baseMins, 300)); 

            const storageKey = `demo_start_time_${cameraId}`;
            let savedStartTime = localStorage.getItem(storageKey);
            
            if (!savedStartTime) {
              savedStartTime = Date.now().toString();
              localStorage.setItem(storageKey, savedStartTime);
            }

            const elapsedMins = (Date.now() - parseInt(savedStartTime, 10)) / 60000;
            realMinutesLeft = Math.max(0, baseMins - elapsedMins); 
            realDryness = 100 - ((realMinutesLeft / baseMins) * 100);
            
            const randomFluctuation = (Math.random() * 1.5) - 0.75; 
            realDryness = Math.max(0, Math.min(100, realDryness + randomFluctuation)); 
          }
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
    const interval = setInterval(fetchRealtimeData, 5000); 
    
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [cameraId, showPredictionUI, isPremium]); // Thêm isPremium vào dependency array

  const estimatedCompletion = new Date(Date.now() + predictionData.minutesLeft * 60000);

  // Giao diện khi chưa chọn Camera
  if (!cameraId && !activeBatch) {
    return (
      <Card className="border-slate-800 bg-[#151E2F] shadow-[0_4px_20px_rgba(0,0,0,0.3)]">
        <CardContent className="p-4 py-12 text-center">
          <Activity className="w-12 h-12 text-slate-700 mx-auto mb-3" />
          <p className="text-sm text-slate-500">Vui lòng chọn Camera ở trên để xem chỉ số môi trường</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-slate-800 bg-[#151E2F] shadow-[0_4px_20px_rgba(0,0,0,0.3)]">
      <CardHeader className="border-b border-slate-800 bg-[#151E2F] flex-row justify-between items-center py-4">
        <CardTitle className="text-base md:text-lg text-white">
          Chỉ số môi trường & AI Dự đoán
        </CardTitle>
        {IS_DEMO_MODE && (
          <Badge className="bg-orange-500/10 text-orange-400 border-orange-500/30">Chế độ Demo</Badge>
        )}
      </CardHeader>
      
      <CardContent className="p-4 md:p-5 space-y-5 pt-5">
        
        {/* LƯỚI 2 CHỈ SỐ: NHIỆT ĐỘ - ĐỘ ẨM (Cả Free và Premium đều xem được) */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-[#0B1121] rounded-xl border border-slate-800 flex flex-col items-center justify-center shadow-inner">
            <Thermometer className="w-6 h-6 text-orange-400 mb-2" />
            <span className="text-2xl font-bold text-white">
              {weatherData.temp > 0 ? weatherData.temp.toFixed(1) : "32.5"}°C
            </span>
            <span className="text-xs text-slate-500 font-medium mt-1">Nhiệt độ (Demo)</span>
          </div>
          
          <div className="p-4 bg-[#0B1121] rounded-xl border border-slate-800 flex flex-col items-center justify-center shadow-inner">
            <Droplets className="w-6 h-6 text-cyan-400 mb-2" />
            <span className="text-2xl font-bold text-white">
              {weatherData.hum > 0 ? weatherData.hum.toFixed(1) : "65.0"}%
            </span>
            <span className="text-xs text-slate-500 font-medium mt-1">Độ ẩm (Demo)</span>
          </div>
        </div>

        {/* Cảnh báo mưa (Chỉ hiện khi là Premium VÀ có nhãn mưa) */}
        {isPremium && weatherData.rainLabel && (
          <div className={`p-3 rounded-xl border flex-row items-center gap-2 ${
            weatherData.isRaining || weatherData.rainLabel.includes('cao')
              ? 'bg-rose-500/10 border-rose-500/30 text-rose-400' 
              : 'bg-blue-500/10 border-blue-500/30 text-blue-400'
          }`}>
            <CloudRain className="w-5 h-5 inline-block mr-2" />
            <span className="text-sm font-bold">{weatherData.rainLabel}</span>
          </div>
        )}

        {/* KHỐI HIỂN THỊ AI DỰ ĐOÁN */}
        {!isPremium ? (
           // UI Dành cho tài khoản Free
           <div className="p-5 bg-[#0B1121] rounded-xl border border-dashed border-amber-500/50 flex flex-col items-center justify-center text-center space-y-3">
             <div className="w-10 h-10 bg-amber-500/10 rounded-full flex items-center justify-center">
               <Lock className="w-5 h-5 text-amber-400" />
             </div>
             <div>
               <h4 className="text-amber-400 font-bold text-sm">Tính năng Cao cấp</h4>
               <p className="text-xs text-slate-400 mt-1 max-w-[200px] mx-auto">
                 Nâng cấp Premium để xem AI dự đoán thời gian phơi và cảnh báo mưa.
               </p>
             </div>
           </div>
        ) : showPredictionUI ? (
          // UI Dành cho tài khoản Premium (Khi đang có bánh)
          <>
            <div className="p-4 bg-[#0B1121] rounded-xl border border-slate-800 shadow-inner relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-violet-500 to-transparent opacity-50" />
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-violet-500/10 rounded-lg flex items-center justify-center">
                    <Clock className="w-5 h-5 text-violet-400" />
                  </div>
                  <span className="text-sm font-medium text-slate-400">Dự kiến hoàn thành</span>
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-bold text-white flex items-center gap-2">
                  {predictionData.minutesLeft > 0 
                    ? estimatedCompletion.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
                    : '--:--'}
                </div>
                <div className="text-xs text-violet-400 font-medium animate-pulse">
                  {predictionData.minutesLeft > 0 
                    ? `Còn lại: ${Math.floor(predictionData.minutesLeft / 60)}h ${Math.round(predictionData.minutesLeft % 60)}p` 
                    : 'Đang phân tích dữ liệu...'}
                </div>
              </div>
            </div>

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
                  className="h-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)] transition-all duration-1000 ease-in-out"
                  style={{ width: `${Math.round(predictionData.dryness)}%` }}
                />
              </div>
              <div className="mt-2 text-xs text-slate-400 font-medium">
                {predictionData.dryness === 0
                  ? "Đang cập nhật..."
                  : predictionData.dryness < 50
                    ? "Giai đoạn đầu (Đang ráo mặt)"
                    : predictionData.dryness < 80
                      ? "Đang khô nhanh (Tối ưu)"
                      : predictionData.dryness < 100 
                        ? "Sắp hoàn thành (Chuẩn bị thu hoạch)" 
                        : "🎉 Bánh đã khô hoàn toàn!"}
              </div>
            </div>
          </>
        ) : (
          // UI Dành cho tài khoản Premium (Khi KHÔNG có bánh)
          <div className="p-4 bg-slate-800/30 rounded-xl border border-dashed border-slate-700 text-center">
            <p className="text-sm text-slate-400">Không phát hiện bánh tráng trên vỉ.</p>
            <p className="text-xs text-slate-500 mt-1">Hệ thống AI đo thời gian đang tạm dừng.</p>
          </div>
        )}

      </CardContent>
    </Card>
  );
}