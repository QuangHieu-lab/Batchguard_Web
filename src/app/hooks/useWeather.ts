import { useState, useEffect } from 'react';
import apiClient from '../../services/api';

// ==========================================
// 1. CÁC TYPE INTERFACE (Đã bổ sung full trường BE)
// ==========================================
export interface WeatherData {
  id: string;
  time: string;
  hour: number;
  temperature: number;
  humidity: number;
  rainChance: number;
  windSpeed: number;
  risk: 'low' | 'medium' | 'high';
}

export interface CurrentWeather {
  temperature: number;
  humidity: number;
  rainChance: number;
  windSpeed: number;
  condition: string;
  icon: string;
  pressure: number;
  maxPrecip12h: number;
  isRaining: boolean;
  precipitation_mm: number;
}

const DEFAULT_LAT = 10.2264;
const DEFAULT_LON = 106.4214;

export function useWeather(lat: number = DEFAULT_LAT, lon: number = DEFAULT_LON) {
  const [currentWeather, setCurrentWeather] = useState<CurrentWeather | null>(null);
  const [forecastData, setForecastData] = useState<WeatherData[]>([]);
  const [advice, setAdvice] = useState<string[]>([]);
  const [sensorData, setSensorData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchWeather() {
      try {
        setLoading(true);
        
        // 1. Gọi API
        const response = await apiClient.get(`/weather/analyze?lat=${lat}&lon=${lon}&save=true`);

        // 2. 🚀 Bọc an toàn: Xử lý trường hợp Axios trả về cục response to hoặc trả thẳng data
        const data = response?.data || response;

        // Chặn lỗi nếu server không trả về gì
        if (!data) {
          throw new Error("Không nhận được dữ liệu từ máy chủ");
        }

        // 3. 🚀 Sử dụng Dấu chấm hỏi an toàn (?.) cho mọi property để không bao giờ bị Crash
        let icon = 'sun';
        if (data?.prediction?.currently_raining || data?.prediction?.rain_level === 'high') {
          icon = 'cloudrain';
        } else if (data?.prediction?.rain_level === 'medium') {
          icon = 'cloud';
        }

        // Map dữ liệu vào State
        setCurrentWeather({
          temperature: data?.api_weather?.temperature_c || 0,
          humidity: data?.api_weather?.humidity_percent || 0,
          windSpeed: data?.api_weather?.wind_speed_ms || 0,
          pressure: data?.api_weather?.pressure_hpa || 0,
          precipitation_mm: data?.api_weather?.precipitation_mm || 0,
          rainChance: data?.prediction?.rain_score || 0,
          maxPrecip12h: data?.prediction?.max_precip_probability_12h || 0,
          isRaining: data?.prediction?.currently_raining || false,
          
          condition: data?.prediction?.rain_label || 'Đang cập nhật',
          icon: icon,
        });

        setAdvice(data?.advice || []);
        setSensorData(data?.sensor_data || null);
        setForecastData([]); 
        setError(null);

      } catch (err: any) {
        console.error("🔥 Lỗi chi tiết fetchWeather:", err);
        setError(err.response?.data?.message || err.message || 'Lỗi kết nối tới Server');
      } finally {
        setLoading(false);
      }
    }

    fetchWeather();
    const interval = setInterval(fetchWeather, 10 * 60 * 1000);
    return () => clearInterval(interval);
  }, [lat, lon]);

  return { currentWeather, forecastData, advice, sensorData, loading, error };
}