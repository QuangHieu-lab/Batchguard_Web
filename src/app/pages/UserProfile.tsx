import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router'; 
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { User, Mail, Shield, LogOut, CheckCircle2, Loader2, Crown, Zap, CalendarDays } from 'lucide-react';
import { toast } from 'sonner';
import { authApi } from '../../services/endpoints';
import { useAuth } from '../contexts/AuthContext'; 

export default function UserProfile() {
  const navigate = useNavigate(); 
  const { logout } = useAuth(); 

  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res: any = await authApi.getProfile();
        const data = res?.data || res;
        setProfile(data);
      } catch (error) {
        console.error("Lỗi tải thông tin cá nhân:", error);
        toast.error("Không thể tải thông tin cá nhân. Vui lòng đăng nhập lại!");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
    toast.info("Đã đăng xuất tài khoản");
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-cyan-500">
        <Loader2 className="w-10 h-10 animate-spin mb-4" />
        <p className="text-slate-400 font-medium">Đang tải thông tin cá nhân...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-slate-400">
        <User className="w-16 h-16 mb-4 opacity-20" />
        <p>Không tìm thấy thông tin tài khoản.</p>
      </div>
    );
  }

  const getInitial = (name: string) => {
    return name ? name.charAt(0).toUpperCase() : 'U';
  };

  // 🚀 ĐỊNH NGHĨA CÁC BIẾN GIAO DIỆN DỰA VÀO ROLE
  const isPremium = profile.role === 'premium';
  const isAdmin = profile.role === 'admin';

  // Dải màu bìa (Cover background)
  const coverGradient = isPremium 
    ? 'from-amber-500 to-orange-600' 
    : isAdmin 
      ? 'from-purple-600 to-indigo-600' 
      : 'from-cyan-600 to-blue-600';

  // Dải màu cho chữ Avatar
  const textGradient = isPremium 
    ? 'from-amber-400 to-orange-500' 
    : isAdmin 
      ? 'from-purple-400 to-indigo-500' 
      : 'from-cyan-400 to-blue-500';

  return (
    <div className="max-w-4xl mx-auto p-6 md:p-8 space-y-8">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Hồ sơ cá nhân</h1>
          <p className="text-slate-400">Quản lý thông tin tài khoản và bảo mật</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* CỘT TRÁI: THÔNG TIN TỔNG QUAN CỦA USER */}
        <div className="md:col-span-1 space-y-6">
          <Card className={`border-slate-800 bg-[#151E2F] shadow-[0_4px_20px_rgba(0,0,0,0.3)] text-center overflow-hidden transition-all ${isPremium ? 'border-amber-500/30 shadow-[0_0_30px_rgba(245,158,11,0.1)]' : ''}`}>
            
            {/* Background cover thay đổi màu theo Role */}
            <div className={`h-24 bg-gradient-to-r w-full relative ${coverGradient}`}></div>
            
            <CardContent className="px-6 pb-6 pt-0 relative flex flex-col items-center">
              {/* Avatar Circle */}
              <div className="w-24 h-24 mx-auto bg-[#0B1121] border-4 border-[#151E2F] rounded-full flex items-center justify-center -mt-12 relative z-10 shadow-lg">
                <span className={`text-4xl font-black text-transparent bg-clip-text bg-gradient-to-br ${textGradient}`}>
                  {getInitial(profile.name)}
                </span>
                {/* Icon vương miện nhỏ đính kèm góc avatar nếu là Premium */}
                {isPremium && (
                  <div className="absolute -bottom-1 -right-1 bg-[#0B1121] rounded-full p-1">
                    <Crown className="w-5 h-5 text-amber-500 drop-shadow-[0_0_5px_rgba(245,158,11,0.8)]" />
                  </div>
                )}
              </div>
              
              <h2 className="text-xl font-bold text-white mt-4">{profile.name}</h2>
              <p className="text-slate-400 text-sm mb-4">{profile.email}</p>
              
              {/* 🚀 BADGE CHỈ ĐỊNH ROLE CHUẨN MỰC */}
              <Badge className={`px-4 py-1.5 font-semibold text-sm transition-all duration-300 w-full justify-center ${
                isPremium 
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 shadow-[0_0_15px_rgba(245,158,11,0.3)]' 
                  : isAdmin
                  ? 'bg-purple-500/20 text-purple-400 border-purple-500/30'
                  : 'bg-slate-700 text-slate-300 border-slate-600'
              }`}>
                {isPremium ? (
                  <span className="flex items-center gap-1.5">
                    <Crown className="w-4 h-4" /> GÓI PREMIUM
                  </span>
                ) : isAdmin ? (
                  <span className="flex items-center gap-1.5">
                    <Shield className="w-4 h-4" /> QUẢN TRỊ VIÊN
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5">
                    <User className="w-4 h-4" /> GÓI MIỄN PHÍ (FREE)
                  </span>
                )}
              </Badge>

              {/* 🚀 HIỂN THỊ THỜI HẠN NẾU LÀ PREMIUM */}
              {isPremium && (
                <div className="mt-4 flex items-center justify-center gap-2 text-xs font-medium text-amber-400 bg-amber-500/10 px-3 py-1.5 rounded-lg border border-amber-500/20 w-full">
                  <CalendarDays className="w-4 h-4" />
                  {/* Backend của bạn cần trả về trường expiry_date, nếu không thì hiện text dự phòng */}
                  <span>Hạn dùng: {profile.expiry_date ? new Date(profile.expiry_date).toLocaleDateString('vi-VN') : '1 Tháng kể từ ngày mua'}</span>
                </div>
              )}

              {/* 🚀 NÚT UPGRADE DÀNH CHO BẢN FREE */}
              {!isPremium && !isAdmin && (
                <Button 
                  onClick={() => navigate('/dashboard/payment')}
                  className="w-full mt-5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold shadow-lg shadow-amber-500/25 transition-all hover:-translate-y-0.5"
                >
                  <Zap className="w-4 h-4 mr-2" /> Nâng Cấp Premium
                </Button>
              )}

            </CardContent>
          </Card>

          <Card className="border-slate-800 bg-[#151E2F] shadow-lg">
            <CardContent className="p-4">
              <Button 
                onClick={handleLogout}
                variant="ghost" 
                className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors font-medium"
              >
                <LogOut className="w-5 h-5 mr-3" /> Đăng xuất tài khoản
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* CỘT PHẢI: CHI TIẾT TÀI KHOẢN VÀ FORM SỬA (GIẢ LẬP) */}
        <div className="md:col-span-2 space-y-6">
          <Card className="border-slate-800 bg-[#151E2F] shadow-[0_4px_20px_rgba(0,0,0,0.3)]">
            <CardHeader className="border-b border-slate-800">
              <CardTitle className="flex items-center gap-2 text-white">
                <User className="w-5 h-5 text-cyan-400" />
                Thông tin chi tiết
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              
              {/* Box ID (Chỉ đọc) */}
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-400 flex items-center gap-2">
                  <Shield className="w-4 h-4" /> Account ID
                </label>
                <div className="flex items-center gap-2">
                  <Input 
                    value={profile.id} 
                    disabled 
                    className="bg-slate-900/50 border-slate-800 text-slate-500 font-mono text-sm" 
                  />
                </div>
              </div>

              {/* Box Tên */}
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-400 flex items-center gap-2">
                  <User className="w-4 h-4" /> Họ và tên
                </label>
                <div className="flex gap-3">
                  <Input 
                    defaultValue={profile.name} 
                    className="bg-[#0B1121] border-slate-700 text-white" 
                    readOnly
                  />
                </div>
              </div>

              {/* Box Email */}
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-400 flex items-center gap-2">
                  <Mail className="w-4 h-4" /> Email liên hệ
                </label>
                <div className="flex items-center gap-3">
                  <div className="relative w-full">
                    <Input 
                      value={profile.email} 
                      disabled 
                      className="bg-slate-900/50 border-slate-800 text-slate-400 pl-10" 
                    />
                    <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  </div>
                  <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 whitespace-nowrap">
                    <CheckCircle2 className="w-3 h-3 mr-1" /> Đã xác thực
                  </Badge>
                </div>
                <p className="text-xs text-slate-500 mt-1">Email được dùng để nhận các cảnh báo từ hệ thống AI.</p>
              </div>

            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}