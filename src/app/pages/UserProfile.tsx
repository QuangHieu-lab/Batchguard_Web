import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router'; // Thêm Hook điều hướng
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { User, Mail, Shield, Key, Edit, Loader2, LogOut, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { authApi } from '../../services/endpoints';
import { useAuth } from '../contexts/AuthContext'; // Thêm AuthContext để lấy hàm logout

export default function UserProfile() {
  const navigate = useNavigate(); // Khởi tạo điều hướng
  const { logout } = useAuth(); // Lấy hàm logout từ context

  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        // Gọi API Profile
        const res: any = await authApi.getProfile();
        // Xử lý lấy data tùy theo cách cấu hình interceptor của axios
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

  // Hàm xử lý đăng xuất
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

  // Lấy chữ cái đầu của tên để làm Avatar
  const getInitial = (name: string) => {
    return name ? name.charAt(0).toUpperCase() : 'U';
  };

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
          <Card className="border-slate-800 bg-[#151E2F] shadow-[0_4px_20px_rgba(0,0,0,0.3)] text-center overflow-hidden">
            {/* Background cover (Dải màu phía trên avatar) */}
            <div className="h-24 bg-gradient-to-r from-cyan-600 to-blue-600 w-full relative"></div>
            
            <CardContent className="px-6 pb-6 pt-0 relative">
              {/* Avatar Circle */}
              <div className="w-24 h-24 mx-auto bg-[#0B1121] border-4 border-[#151E2F] rounded-full flex items-center justify-center -mt-12 relative z-10 shadow-lg">
                <span className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-br from-cyan-400 to-blue-500">
                  {getInitial(profile.name)}
                </span>
              </div>
              
              <h2 className="text-xl font-bold text-white mt-4">{profile.name}</h2>
              <p className="text-slate-400 text-sm mb-4">{profile.email}</p>
              
              <Badge className={`px-3 py-1 font-semibold ${
                profile.role === 'admin' 
                  ? 'bg-purple-500/20 text-purple-400 border-purple-500/30' 
                  : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
              }`}>
                {profile.role === 'admin' ? 'Quản trị viên (Admin)' : 'Khách hàng (Customer)'}
              </Badge>
            </CardContent>
          </Card>

          <Card className="border-slate-800 bg-[#151E2F] shadow-lg">
            <CardContent className="p-4 space-y-2">
              {/* Thêm sự kiện onClick vào nút Đăng xuất */}
              <Button 
                onClick={handleLogout}
                variant="ghost" 
                className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
              >
                <LogOut className="w-4 h-4 mr-3" /> Đăng xuất
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
                  readOnly/>
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