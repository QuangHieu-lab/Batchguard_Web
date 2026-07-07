import { useEffect, useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Thermometer, Droplets, TrendingUp, Clock, Activity, CloudRain, Badge, Lock } from 'lucide-react';
import type { Batch } from '../../contexts/SystemContext';
import { predictionApi, sensorApi } from '../../../services/endpoints';
import apiClient from '../../../services/api'; 
import { useAuth } from '../../contexts/AuthContext'; 

interface MetricsPanelProps {
  activeBatch: Batch | null;
  cameraId?: string | null;
  hasDetection?: boolean;
  isYoloActive?: boolean;
  // 🚀 1. THÊM CALLBACK ĐỂ ĐẨY DỮ LIỆU LÊN COMPONENT CHA
  onMetricsUpdate?: (data: { temp: number; hum: number; minutesLeft: number; dryness: number }) => void;
}

const AI_URL = 'https://huntrot-mylongai-backed-modelai.hf.space';

export function MetricsPanel({ activeBatch, cameraId, hasDetection = false, isYoloActive = false, onMetricsUpdate }: MetricsPanelProps) {
  const { user } = useAuth(); 
  const isPremium = user?.role === 'premium'; 

  const [weatherData, setWeatherData] = useState({ temp: 0, hum: 0, rainLabel: '', isRaining: false });
  const [predictionData, setPredictionData] = useState({ dryness: 0, minutesLeft: 0 });

  const lastSavedDataRef = useRef({ temp: 0, hum: 0, minutesLeft: 0, time: 0 });

  const IS_DEMO_MODE = false; 
  const showPredictionUI = hasDetection && isPremium;

  useEffect(() => {
    let isMounted = true;

    const fetchRealtimeData = async () => {
      if (!cameraId || isYoloActive) return;

      try {
        let currentTemp = 0;
        let currentHum = 0;
        let rainLabel = '';
        let isRaining = false;
        
        let realDryness = 0;
        let realMinutesLeft = 0;

        // 1. LẤY NHIỆT ĐỘ, ĐỘ ẨM VÀ CẢNH BÁO MƯA (TỪ RENDER)
        try {
          const weatherRes: any = await apiClient.get('/weather/analyze');
          const data = weatherRes?.data || weatherRes;
          
          if (data) {
            currentTemp = data.sensor_data?.temperature_c || data.api_weather?.temperature_c || 34.0;
            currentHum = data.sensor_data?.humidity_percent || data.api_weather?.humidity_percent || 58.0;
            
            if (isPremium && data.prediction) {
              rainLabel = data.prediction.rain_label || '';
              isRaining = data.prediction.currently_raining || false;
            }
          }
        } catch (e: any) {
          console.warn("Không lấy được dữ liệu thời tiết:", e);
        }

        // Ưu tiên cao nhất: Lấy từ sensorApi theo cameraId
        try {
          const sensorRes: any = await sensorApi.getLatest(cameraId);
          const sData = sensorRes?.data || sensorRes;
          if (sData && sData.temperature !== undefined) {
            currentTemp = sData.temperature;
            currentHum = sData.humidity;
          }
        } catch (e) { }

        // 2. TÍNH THỜI GIAN KHÔ TỪ AI MODEL
        if (showPredictionUI) {
          let predictedMinutesFromAI = 120; 

          const calcTemp = currentTemp > 0 ? currentTemp : 34.0;
          const calcHum = currentHum > 0 ? currentHum : 58.0;

          try {
            const aiResponse = await fetch(`${AI_URL}/drying/predict`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ avg_temperature: calcTemp, avg_humidity: calcHum })
            });
            
            if (aiResponse.ok) {
              const aiData = await aiResponse.json();
              if (aiData.predicted_drying_time) {
                predictedMinutesFromAI = aiData.predicted_drying_time;
              }
            }
          } catch (aiError) {
            console.error("Lỗi khi gọi AI dự báo thời gian:", aiError);
            predictedMinutesFromAI = 120 - ((calcTemp - 30) * 5) + ((calcHum - 60) * 2);
            predictedMinutesFromAI = Math.max(60, Math.min(predictedMinutesFromAI, 1440)); 
          }

          // 3. TÍNH % TIẾN ĐỘ THỰC TẾ
          const storageKey = `real_start_time_${cameraId}`;
          let savedStartTime = localStorage.getItem(storageKey);
          
          if (!savedStartTime) {
            savedStartTime = Date.now().toString();
            localStorage.setItem(storageKey, savedStartTime);
          }

          const elapsedMins = (Date.now() - parseInt(savedStartTime, 10)) / 60000;
          
          realMinutesLeft = Math.max(0, predictedMinutesFromAI - elapsedMins); 
          realDryness = 100 - ((realMinutesLeft / predictedMinutesFromAI) * 100);
          
          realDryness = Math.min(100, Math.max(0, realDryness));

          if (realMinutesLeft <= 0) {
            realDryness = 100;
            realMinutesLeft = 0;
          }
        } else {
          if (currentTemp === 0) currentTemp = 34.0;
          if (currentHum === 0) currentHum = 58.0;
        }

        if (isMounted) {
          setWeatherData({ temp: currentTemp, hum: currentHum, rainLabel, isRaining });
          setPredictionData({ dryness: realDryness, minutesLeft: realMinutesLeft });

          // 🚀 2. ĐẨY DỮ LIỆU LÊN COMPONENT CHA NGAY LẬP TỨC
          onMetricsUpdate?.({
            temp: currentTemp,
            hum: currentHum,
            minutesLeft: realMinutesLeft,
            dryness: realDryness
          });

          // 4. CẬP NHẬT DATABASE THEO CHU KỲ (Nếu có thay đổi)
          if (currentTemp > 0 && currentHum > 0) {
            const now = Date.now();
            const lastData = lastSavedDataRef.current;
            
            const timePassed = now - lastData.time > 5000; 
            const tempChanged = Math.abs(currentTemp - lastData.temp) >= 0.5;
            const minsChanged = showPredictionUI && Math.abs(realMinutesLeft - lastData.minutesLeft) >= 1;

            if (timePassed && (tempChanged || minsChanged)) {
              if (showPredictionUI) {
                predictionApi.create({
                  camera_id: cameraId,
                  temperature: currentTemp,
                  humidity: currentHum,
                  predicted_minutes: Math.round(realMinutesLeft)
                }).catch(() => {});
              } else {
                sensorApi.createEspData({
                  camera_id: cameraId,
                  temperature: currentTemp,
                  humidity: currentHum
                }).catch(() => {});
              }

              lastSavedDataRef.current = {
                temp: currentTemp, hum: currentHum, minutesLeft: realMinutesLeft, time: now
              };
            }
          }
        }

      } catch (error) {}
    };

    fetchRealtimeData();
    const interval = setInterval(fetchRealtimeData, 5000); 
    
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [cameraId, showPredictionUI, isPremium, isYoloActive, onMetricsUpdate]);

  const estimatedCompletion = new Date(Date.now() + predictionData.minutesLeft * 60000);

  if (isYoloActive) {
    return (
      <Card className="border-slate-800 bg-[#151E2F] shadow-[0_4px_20px_rgba(0,0,0,0.3)]">
        <CardContent className="p-8 text-center flex flex-col items-center justify-center">
          <Activity className="w-12 h-12 text-cyan-500 mb-4 animate-pulse" />
          <h3 className="text-xl font-bold text-white mb-2">Quyền kiểm soát thuộc về YOLO Realtime</h3>
          <p className="text-sm text-slate-400 max-w-md mx-auto">
            Hệ thống dự báo thời gian đang được tính toán trực tiếp từ Camera YOLO bên dưới. Nếu muốn dùng Camera Nền, hãy tắt YOLO đi.
          </p>
        </CardContent>
      </Card>
    );
  }

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
        {IS_DEMO_MODE && <Badge className="bg-orange-500/10 text-orange-400 border-orange-500/30">Chế độ Demo</Badge>}
      </CardHeader>
      
      <CardContent className="p-4 md:p-5 space-y-5 pt-5">
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-[#0B1121] rounded-xl border border-slate-800 flex flex-col items-center justify-center shadow-inner">
            <Thermometer className="w-6 h-6 text-orange-400 mb-2" />
            <span className="text-2xl font-bold text-white">{weatherData.temp > 0 ? weatherData.temp.toFixed(1) : "34.0"}°C</span>
            <span className="text-xs text-slate-500 font-medium mt-1">Nhiệt độ</span>
          </div>
          <div className="p-4 bg-[#0B1121] rounded-xl border border-slate-800 flex flex-col items-center justify-center shadow-inner">
            <Droplets className="w-6 h-6 text-cyan-400 mb-2" />
            <span className="text-2xl font-bold text-white">{weatherData.hum > 0 ? weatherData.hum.toFixed(1) : "58.0"}%</span>
            <span className="text-xs text-slate-500 font-medium mt-1">Độ ẩm</span>
          </div>
        </div>

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

        {!isPremium ? (
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
                  {predictionData.minutesLeft > 0 ? estimatedCompletion.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                </div>
                <div className="text-xs text-violet-400 font-medium animate-pulse">
                  {predictionData.minutesLeft > 0 ? `Còn lại: ${Math.floor(predictionData.minutesLeft / 60)}h ${Math.round(predictionData.minutesLeft % 60)}p` : '🎉 Bánh đã khô hoàn toàn!'}
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
                <span className="text-2xl font-bold text-emerald-400">{Math.round(predictionData.dryness)}%</span>
              </div>
              <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)] transition-all duration-300 ease-linear"
                  style={{ width: `${Math.round(predictionData.dryness)}%` }}
                />
              </div>
            </div>
          </>
        ) : (
          <div className="p-4 bg-slate-800/30 rounded-xl border border-dashed border-slate-700 text-center">
            <p className="text-sm text-slate-400">Không phát hiện bánh tráng trên vỉ.</p>
            <p className="text-xs text-slate-500 mt-1">Hệ thống AI đo thời gian đang tạm dừng.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}