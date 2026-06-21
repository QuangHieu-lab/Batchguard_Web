import { useNavigate } from 'react-router'; 
import { useWeather } from '../hooks/useWeather';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { VoiceNotification } from '../components/VoiceNotification';
import { 
  Cloud, CloudRain, Droplets, Thermometer, Wind,
  Sun, CloudDrizzle, AlertTriangle, Lightbulb, Cpu, CheckCircle2, Gauge,
  ChevronRight 
} from 'lucide-react';

export default function Weather() {
  const navigate = useNavigate(); 
  const { currentWeather, advice, sensorData, loading, error } = useWeather();

  const getWeatherIcon = (icon: string | undefined, size: string = 'w-8 h-8') => {
    switch (icon) {
      case 'cloudrain': return <CloudRain className={`${size} text-blue-400`} />;
      case 'cloud': return <Cloud className={`${size} text-slate-400`} />;
      case 'drizzle': return <CloudDrizzle className={`${size} text-cyan-400`} />;
      default: return <Sun className={`${size} text-yellow-400`} />;
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64 text-slate-400">
      <Cloud className="w-6 h-6 animate-pulse mr-2" /> Đang tải dữ liệu thời tiết & AI...
    </div>
  );

  if (error) return (
    <div className="flex items-center justify-center h-64 text-red-400">
      <AlertTriangle className="w-6 h-6 mr-2" /> {error}
    </div>
  );

  if (!currentWeather) return null;

  return (
    <div className="max-w-7xl mx-auto space-y-6 text-slate-200">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">Thời tiết & Môi trường Xưởng</h1>
          <p className="text-sm md:text-base text-slate-400">Phân tích tự động bởi AI và Hệ thống Cảm biến</p>
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full md:w-auto">
          <VoiceNotification weatherData={currentWeather} />
          <div className="flex items-center gap-2 px-4 py-2 bg-cyan-500/10 border border-cyan-500/30 rounded-lg shadow-[0_0_15px_rgba(6,182,212,0.15)]">
            <Cloud className="w-4 h-4 text-cyan-400 animate-pulse" />
            <span className="text-sm font-semibold text-cyan-400">AI Active</span>
          </div>
        </div>
      </div>

      {/* 5 THẺ THỜI TIẾT */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        <Card className="border border-[#3A2E2A] bg-gradient-to-br from-[#2A2421] to-[#1F1A18] shadow-[0_4px_15px_rgba(0,0,0,0.3)]">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-orange-500/20 rounded-xl flex items-center justify-center border border-orange-500/30">
                  <Thermometer className="w-6 h-6 text-orange-400" />
                </div>
                <span className="text-sm font-medium text-slate-300">Nhiệt độ</span>
              </div>
            </div>
            <div className="text-4xl font-bold text-orange-500 mb-2 drop-shadow-[0_0_8px_rgba(249,115,22,0.5)]">
              {currentWeather.temperature}°C
            </div>
            <div className="flex items-center gap-1.5 text-xs text-orange-400/80">
              <Gauge className="w-3.5 h-3.5" />
              <span>Áp suất: {currentWeather.pressure} hPa</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-[#2A344D] bg-gradient-to-br from-[#1E2335] to-[#171A28] shadow-[0_4px_15px_rgba(0,0,0,0.3)]">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center border border-blue-500/30">
                  <Droplets className="w-6 h-6 text-blue-400" />
                </div>
                <span className="text-sm font-medium text-slate-300">Độ ẩm</span>
              </div>
            </div>
            <div className="text-4xl font-bold text-blue-500 mb-1 drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]">
              {currentWeather.humidity}%
            </div>
          </CardContent>
        </Card>

        <Card className="border border-[#25424D] bg-gradient-to-br from-[#1A2C35] to-[#14222A] shadow-[0_4px_15px_rgba(0,0,0,0.3)]">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-cyan-500/20 rounded-xl flex items-center justify-center border border-cyan-500/30">
                  <CloudRain className="w-6 h-6 text-cyan-400" />
                </div>
                <span className="text-sm font-medium text-slate-300">Rủi ro mưa</span>
              </div>
            </div>
            <div className="text-4xl font-bold text-cyan-500 mb-2 drop-shadow-[0_0_8px_rgba(6,182,212,0.5)]">
              {currentWeather.rainChance}%
            </div>
            <div className="flex items-center gap-1.5 text-xs text-cyan-400/80">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Đỉnh điểm 12h: {currentWeather.maxPrecip12h}%</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-[#3D2547] bg-gradient-to-br from-[#26182D] to-[#1A0F1F] shadow-[0_4px_15px_rgba(0,0,0,0.3)]">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-violet-500/20 rounded-xl flex items-center justify-center border border-violet-500/30">
                  <CloudDrizzle className="w-6 h-6 text-violet-400" />
                </div>
                <span className="text-sm font-medium text-slate-300">Lượng mưa</span>
              </div>
            </div>
            <div className="text-4xl font-bold text-violet-500 mb-1 drop-shadow-[0_0_8px_rgba(139,92,246,0.5)]">
              {currentWeather.precipitation_mm || 0} <span className="text-2xl text-violet-500/70">mm</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-[#24453F] bg-gradient-to-br from-[#192E2B] to-[#132421] shadow-[0_4px_15px_rgba(0,0,0,0.3)]">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-teal-500/20 rounded-xl flex items-center justify-center border border-teal-500/30">
                  <Wind className="w-6 h-6 text-teal-400" />
                </div>
                <span className="text-sm font-medium text-slate-300">Tốc độ gió</span>
              </div>
            </div>
            <div className="text-4xl font-bold text-teal-500 mb-1 drop-shadow-[0_0_8px_rgba(20,184,166,0.5)]">
              {currentWeather.windSpeed} <span className="text-2xl text-teal-500/70">m/s</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* BANNER HIỆN TRẠNG AI */}
      <Card 
        onClick={() => navigate('/dashboard/weather-alert')} 
        className="border-none shadow-[0_8px_30px_rgba(0,0,0,0.5)] bg-gradient-to-r from-[#D8DAE0] via-[#F1F3F5] to-[#B3B6BD] cursor-pointer hover:shadow-[0_10px_40px_rgba(6,182,212,0.3)] hover:-translate-y-1 transition-all duration-300 group"
      >
        <CardContent className="p-4 md:p-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-slate-700 to-slate-900 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-300">
                {getWeatherIcon(currentWeather.icon, 'w-10 h-10 text-white')}
              </div>
              <div>
                <h3 className="text-2xl font-bold text-slate-900 mb-1 drop-shadow-sm group-hover:text-cyan-700 transition-colors">
                  {currentWeather.isRaining ? 'Trời đang mưa' : currentWeather.condition}
                </h3>
                <p className="text-sm font-medium text-slate-700">
                  Đánh giá bởi AI lúc {new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 w-full md:w-auto mt-2 md:mt-0">
              {/* 🚀 ĐÃ CẬP NHẬT LOGIC 3 MỨC ĐỘ 70 - 40 - <40 TẠI ĐÂY */}
              {currentWeather.isRaining || currentWeather.rainChance >= 70 ? (
                <Badge className="bg-red-500 text-white border-none shadow-md text-base px-4 py-2 font-semibold flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" /> Cảnh báo: Khả năng mưa cao
                </Badge>
              ) : currentWeather.rainChance >= 40 ? (
                <Badge className="bg-orange-500 text-white border-none shadow-md text-base px-4 py-2 font-semibold flex items-center gap-2">
                  <Cloud className="w-4 h-4" /> Lưu ý: Có thể có mưa
                </Badge>
              ) : (
                <Badge className="bg-emerald-500 text-white border-none shadow-md text-base px-4 py-2 font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" /> An toàn: Ít khả năng mưa
                </Badge>
              )}
              
              <div className="bg-black/10 group-hover:bg-cyan-500 p-2 rounded-full transition-colors duration-300 ml-1">
                <ChevronRight className="w-5 h-5 text-slate-700 group-hover:text-white transition-transform duration-300 group-hover:translate-x-1" />
              </div>
            </div>

          </div>
        </CardContent>
      </Card>

      {/* CẢM BIẾN VÀ LỜI KHUYÊN AI */}
      <div className="grid lg:grid-cols-2 gap-6">
        {sensorData && (
          <Card className="border-slate-800 bg-[#151E2F] shadow-[0_4px_20px_rgba(0,0,0,0.3)] overflow-hidden">
            <CardHeader className="border-b border-slate-800 bg-[#151E2F]">
              <CardTitle className="flex items-center gap-2 text-base md:text-lg text-white">
                <Cpu className="w-5 h-5 text-indigo-400" /> Cảm biến môi trường thực tế (Sensor)
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="p-4 bg-slate-800/50 rounded-2xl border border-slate-700">
                  <p className="text-slate-400 text-xs uppercase font-bold mb-1">Nhiệt độ Sân</p>
                  <p className="text-2xl font-bold text-white">{sensorData.temperature_c}°C</p>
                </div>
                <div className="p-4 bg-slate-800/50 rounded-2xl border border-slate-700">
                  <p className="text-slate-400 text-xs uppercase font-bold mb-1">Độ ẩm Sân</p>
                  <p className="text-2xl font-bold text-white">{sensorData.humidity_percent}%</p>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-indigo-500/10 rounded-xl border border-indigo-500/20">
                <div>
                  <p className="text-indigo-400 font-bold mb-1">Trạng thái Xưởng phơi</p>
                  <p className="text-slate-300 text-sm">Phát hiện bởi Camera AI</p>
                </div>
                {sensorData.has_rice_paper ? (
                  <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 px-3 py-1 flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" /> Đang phơi bánh
                  </Badge>
                ) : (
                  <Badge className="bg-slate-700 text-slate-300 border-slate-600 px-3 py-1 flex items-center gap-1">
                    <Sun className="w-4 h-4" /> Sân trống
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {advice && advice.length > 0 && (
          <Card className="border border-purple-500/30 bg-[#1A1625] shadow-[0_0_20px_rgba(168,85,247,0.1)] h-full">
            <CardHeader className="border-b border-purple-900/50 bg-[#1A1625]">
              <CardTitle className="flex items-center gap-2 text-base md:text-lg text-purple-400">
                <Lightbulb className="w-5 h-5 text-purple-500" /> AI Khuyến nghị
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {advice.map((adv, index) => (
                  <div key={index} className="flex items-start gap-3 p-4 bg-purple-500/5 rounded-xl border border-purple-500/10">
                    <div className="mt-0.5 min-w-[20px] text-purple-400 text-lg">💡</div>
                    <p className="text-purple-100/90 leading-relaxed">{adv}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}