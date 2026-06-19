import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Switch } from '../components/ui/switch';
import { Button } from '../components/ui/button';
import { useSystem } from '../contexts/SystemContext';
import { 
  Volume2, 
  VolumeX,
  Mic,
  Radio,
  AlertTriangle,
  CloudRain,
  TrendingUp,
  CheckCircle2,
  Bell,
  Settings,
  Clock,
  MessageSquare,
  Waves
} from 'lucide-react';
import { notificationApi } from '../../services/endpoints';

interface VoiceAlert {
  id: string;
  time: string;
  message: string;
  type: 'warning' | 'info' | 'critical' | 'success';
  played: boolean;
  priority: 'high' | 'medium' | 'low';
}

export default function VoiceAlerts() {
  const { activeBatch } = useSystem();
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [volume, setVolume] = useState(80);
  const [alerts, setAlerts] = useState<VoiceAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);

  // Fetch real notifications from API
  useEffect(() => {
    let isMounted = true;
    
    const fetchNotifications = async () => {
      try {
        // Gọi API thật, giả sử ID user là 'me' hoặc tuỳ ý theo API thiết kế
        const res: any = await notificationApi.getByUserId('me');
        const data = res?.data || res;
        
        if (data && Array.isArray(data)) {
          const mappedAlerts = data.map((n: any) => ({
            id: n.id || String(Math.random()),
            time: n.created_at ? new Date(n.created_at).toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'}) : 'Vừa xong',
            message: n.content || n.message || 'Có thông báo mới',
            type: n.type || 'info', // warning, info, critical, success
            played: n.is_read || true,
            priority: n.priority || 'medium',
          }));
          
          if (isMounted) {
            setAlerts(mappedAlerts);
          }
        }
      } catch (error) {
        console.log("Lỗi hoặc không có API thông báo, dùng dữ liệu mẫu...");
        // Fallback data
        if (isMounted && alerts.length === 0) {
          setAlerts([
            { id: '1', time: '15:30', message: 'Độ ẩm tăng cao lên 68%, cân nhắc thu bánh trong 30 phút tới.', type: 'warning', played: true, priority: 'high' },
            { id: '2', time: '16:00', message: 'Nguy cơ mưa trong 30 phút tới, khả năng 75%.', type: 'critical', played: true, priority: 'high' },
          ]);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000); // Polling mỗi 15s để lấy thông báo mới
    
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []); // Remove alerts.length to avoid infinite reset

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'critical':
        return <AlertTriangle className="w-5 h-5 text-red-400" />;
      case 'warning':
        return <CloudRain className="w-5 h-5 text-amber-400" />;
      case 'success':
        return <CheckCircle2 className="w-5 h-5 text-emerald-400" />;
      default:
        return <TrendingUp className="w-5 h-5 text-blue-400" />;
    }
  };

  const getAlertStyle = (type: string) => {
    switch (type) {
      case 'critical':
        return 'border-red-500/30 bg-gradient-to-r from-red-500/10 to-red-500/5 shadow-[0_0_10px_rgba(239,68,68,0.05)]';
      case 'warning':
        return 'border-amber-500/30 bg-gradient-to-r from-amber-500/10 to-amber-500/5 shadow-[0_0_10px_rgba(245,158,11,0.05)]';
      case 'success':
        return 'border-emerald-500/30 bg-gradient-to-r from-emerald-500/10 to-emerald-500/5 shadow-[0_0_10px_rgba(16,185,129,0.05)]';
      default:
        return 'border-blue-500/30 bg-gradient-to-r from-blue-500/10 to-blue-500/5 shadow-[0_0_10px_rgba(59,130,246,0.05)]';
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Badge className="bg-red-500/20 text-red-400 border-red-500/30">Ưu tiên cao</Badge>;
      case 'medium':
        return <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">Ưu tiên TB</Badge>;
      default:
        return <Badge className="bg-slate-800 text-slate-300 border-slate-700">Ưu tiên thấp</Badge>;
    }
  };

  const unplayedCount = alerts.filter(a => !a.played).length;

  return (
    <div className="max-w-7xl mx-auto space-y-6 text-slate-200">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">AI Voice Alert System</h1>
          <p className="text-sm md:text-base text-slate-400">Hệ thống thông báo bằng giọng nói tự động</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-purple-500/10 border border-purple-500/30 rounded-lg shadow-[0_0_15px_rgba(168,85,247,0.15)]">
          <Radio className="w-4 h-4 text-purple-400" />
          <span className="text-sm font-semibold text-purple-400">AI Assistant</span>
        </div>
      </div>

      {/* Control Panel */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Voice Settings */}
        <Card className="border-slate-800 bg-[#151E2F] shadow-[0_4px_20px_rgba(0,0,0,0.3)]">
          <CardHeader className="border-b border-slate-800 bg-[#151E2F]">
            <CardTitle className="flex items-center gap-2 text-base md:text-lg text-white">
              <Settings className="w-5 h-5 text-purple-400" />
              Cài đặt giọng nói
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            {/* Voice Enable/Disable */}
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-[#D8DAE0] via-[#F1F3F5] to-[#B3B6BD] rounded-xl shadow-inner border-none">
              <div className="flex items-center gap-3">
                {voiceEnabled ? (
                  <div className="w-12 h-12 bg-[#A855F7] rounded-xl flex items-center justify-center shadow-lg animate-pulse">
                    <Volume2 className="w-7 h-7 text-white" />
                  </div>
                ) : (
                  <div className="w-12 h-12 bg-slate-400 rounded-xl flex items-center justify-center">
                    <VolumeX className="w-7 h-7 text-white" />
                  </div>
                )}
                <div>
                  <p className="font-bold text-slate-900">Thông báo giọng nói</p>
                  <p className="text-sm font-medium text-slate-700">
                    {voiceEnabled ? 'Đang bật' : 'Đã tắt'}
                  </p>
                </div>
              </div>
              <Switch 
                checked={voiceEnabled} 
                onCheckedChange={setVoiceEnabled}
                className="data-[state=checked]:bg-[#581C87] border-slate-400"
              />
            </div>

            {/* Volume Control */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-slate-300">Âm lượng</label>
                <span className="text-sm font-semibold text-purple-400">{volume}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={volume}
                onChange={(e) => setVolume(Number(e.target.value))}
                disabled={!voiceEnabled}
                className="w-full h-2 rounded-lg appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  background: voiceEnabled 
                    ? `linear-gradient(to right, #a855f7 0%, #a855f7 ${volume}%, #334155 ${volume}%, #334155 100%)`
                    : '#334155'
                }}
              />
              <div className="flex justify-between text-xs text-slate-500">
                <span>Thấp</span>
                <span>Cao</span>
              </div>
            </div>

            {/* Voice Type */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Giọng đọc</label>
              <select 
                className="w-full p-3 border border-slate-700 rounded-lg bg-[#0B1121] text-white text-sm focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all shadow-inner"
                disabled={!voiceEnabled}
              >
                <option>Giọng nữ (Tiếng Việt)</option>
                <option>Giọng nam (Tiếng Việt)</option>
                <option>Giọng nữ (English)</option>
              </select>
            </div>

            {/* Test Button */}
            <Button 
              className="w-full bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 text-white shadow-[0_0_15px_rgba(147,51,234,0.3)] border-none"
              disabled={!voiceEnabled}
              onClick={() => {
                setIsPlaying(true);
                setTimeout(() => setIsPlaying(false), 2000);
              }}
            >
              <Mic className="w-4 h-4 mr-2" />
              Thử giọng đọc
            </Button>
          </CardContent>
        </Card>

        {/* Status & Stats (ĐÃ CẬP NHẬT GIAO DIỆN MỚI) */}
        <div className="space-y-6">
          {/* Playing Status */}
          {isPlaying && voiceEnabled && (
            <Card className="border border-purple-500/50 bg-purple-500/10 shadow-[0_0_20px_rgba(168,85,247,0.2)] animate-pulse rounded-[24px]">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-purple-500 rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(168,85,247,0.8)]">
                    <Waves className="w-8 h-8 text-white animate-pulse" />
                  </div>
                  <div className="flex-1">
                    <p className="text-lg font-bold text-purple-300 mb-1">Đang phát thông báo...</p>
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1">
                        {[...Array(5)].map((_, i) => (
                          <div
                            key={i}
                            className="w-1 bg-purple-400 rounded-full animate-pulse"
                            style={{
                              height: `${Math.random() * 20 + 10}px`,
                              animationDelay: `${i * 0.1}s`,
                            }}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-purple-400">AI Voice</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Stats Cards - Soft UI Style */}
          <div className="grid grid-cols-2 gap-5">
            {/* Tổng thông báo */}
            <Card className="border-none rounded-[24px] bg-gradient-to-br from-white to-[#E2E8F0] shadow-[0_8px_30px_rgba(0,0,0,0.4)]">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-[#2563EB] rounded-full flex items-center justify-center shadow-sm">
                    <Bell className="w-5 h-5 text-white fill-current" />
                  </div>
                  <span className="text-[15px] text-slate-800 font-bold">Tổng thông báo</span>
                </div>
                <p className="text-5xl font-black text-[#1D4ED8]">{alerts.length}</p>
              </CardContent>
            </Card>

            {/* Chưa phát */}
            <Card className="border-none rounded-[24px] bg-gradient-to-br from-[#FDF6F0] to-[#E6D5C3] shadow-[0_8px_30px_rgba(0,0,0,0.4)]">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-[#EA580C] rounded-full flex items-center justify-center shadow-sm">
                    <MessageSquare className="w-5 h-5 text-white fill-current" />
                  </div>
                  <span className="text-[15px] text-slate-800 font-bold">Chưa phát</span>
                </div>
                <p className="text-5xl font-black text-[#C2410C]">{unplayedCount}</p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Info - Soft UI Style */}
          <Card className="border-none rounded-[24px] shadow-[0_8px_30px_rgba(0,0,0,0.4)] bg-gradient-to-br from-[#F8FAFC] to-[#CBD5E1]">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-[15px] font-semibold">
                  <div className="w-5 flex justify-center">
                    <div className="w-2.5 h-2.5 bg-emerald-400 rounded-full shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                  </div>
                  <span className="text-slate-800">AI Voice System hoạt động</span>
                </div>
                <div className="flex items-center gap-3 text-[15px] font-semibold">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <span className="text-slate-800">Kết nối ổn định</span>
                </div>
                <div className="flex items-center gap-3 text-[15px] font-semibold">
                  <Clock className="w-5 h-5 text-blue-700" />
                  <span className="text-slate-800">Cập nhật: {new Date().toLocaleTimeString('vi-VN')}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Alert History */}
      <Card className="border-slate-800 bg-[#151E2F] shadow-[0_4px_20px_rgba(0,0,0,0.3)]">
        <CardHeader className="border-b border-slate-800 bg-[#151E2F]">
          <CardTitle className="flex items-center justify-between text-base md:text-lg text-white">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-cyan-400" />
              Lịch sử thông báo
            </div>
            <Badge className="bg-slate-800 text-slate-300 border-slate-700">{alerts.length} tin nhắn</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 md:p-6">
          <div className="space-y-3">
            {alerts.length > 0 ? (
              alerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`border rounded-xl p-4 transition-all ${getAlertStyle(alert.type)} ${
                    !alert.played ? 'shadow-md shadow-white/5' : 'opacity-75'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-1 flex-shrink-0">
                      {getAlertIcon(alert.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span className="font-mono text-xs font-semibold text-slate-300 bg-[#0B1121] border border-slate-700 px-2 py-1 rounded">
                          {alert.time}
                        </span>
                        {getPriorityBadge(alert.priority)}
                        {alert.played ? (
                          <Badge className="bg-slate-800 text-slate-400 border-slate-700">
                            <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-500" />
                            Đã phát
                          </Badge>
                        ) : (
                          <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30 animate-pulse">
                            <Volume2 className="w-3 h-3 mr-1" />
                            Đang chờ
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-slate-300 leading-relaxed">{alert.message}</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <MessageSquare className="w-16 h-16 text-slate-600 mx-auto mb-3" />
                <p className="text-lg font-medium text-slate-300 mb-2">Chưa có thông báo</p>
                <p className="text-sm text-slate-500">
                  AI sẽ tự động tạo thông báo khi phát hiện điều kiện bất thường
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* AI Info */}
      <Card className="border border-cyan-500/30 bg-[#151E2F] shadow-[0_4px_20px_rgba(0,0,0,0.3)]">
        <CardHeader className="border-b border-slate-800 bg-[#0B1121]/50">
          <CardTitle className="flex items-center gap-3 text-base md:text-lg">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-violet-600 rounded-lg flex items-center justify-center shadow-[0_0_10px_rgba(168,85,247,0.5)]">
              <Radio className="w-6 h-6 text-white" />
            </div>
            <span className="text-cyan-400">Giới thiệu AI Voice Assistant</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 md:p-6 space-y-3">
          <div className="flex items-start gap-3 p-3 md:p-4 bg-[#0B1121] rounded-xl border border-cyan-500/20 shadow-inner">
            <Volume2 className="w-5 h-5 text-cyan-400 mt-0.5 flex-shrink-0" />
            <p className="text-slate-300 leading-relaxed text-sm">
              <strong className="text-cyan-400 font-semibold mr-1">Thông báo tự động:</strong> AI phân tích điều kiện real-time và tự động phát cảnh báo bằng giọng nói khi phát hiện rủi ro
            </p>
          </div>
          <div className="flex items-start gap-3 p-3 md:p-4 bg-[#0B1121] rounded-xl border border-cyan-500/20 shadow-inner">
            <Mic className="w-5 h-5 text-cyan-400 mt-0.5 flex-shrink-0" />
            <p className="text-slate-300 leading-relaxed text-sm">
              <strong className="text-cyan-400 font-semibold mr-1">Giọng nói tự nhiên:</strong> Sử dụng công nghệ Text-to-Speech tiên tiến, phát âm rõ ràng bằng tiếng Việt
            </p>
          </div>
          <div className="flex items-start gap-3 p-3 md:p-4 bg-[#0B1121] rounded-xl border border-cyan-500/20 shadow-inner">
            <Bell className="w-5 h-5 text-cyan-400 mt-0.5 flex-shrink-0" />
            <p className="text-slate-300 leading-relaxed text-sm">
              <strong className="text-cyan-400 font-semibold mr-1">Ưu tiên thông minh:</strong> Hệ thống tự động phân loại và ưu tiên thông báo theo mức độ quan trọng
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}