import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Activity, Loader2, Sparkles, KeyRound } from 'lucide-react';
import { toast } from 'sonner';
import { authApi } from '../../services/endpoints'; 

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Nếu không có token trên URL, đá user về trang login
    if (!token) {
      toast.error('Đường dẫn không hợp lệ!');
      navigate('/login');
    }
  }, [token, navigate]);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      return toast.error('Mật khẩu xác nhận không khớp!');
    }
    if (newPassword.length < 6) {
      return toast.error('Mật khẩu phải chứa ít nhất 6 ký tự');
    }

    setIsLoading(true);
    try {
      await authApi.resetPassword({ 
        token: token, 
        new_password: newPassword 
      });
      toast.success('Đổi mật khẩu thành công! Vui lòng đăng nhập lại.');
      navigate('/login');
    } catch (error: any) {
      const errDetail = error.response?.data?.detail || 'Liên kết hết hạn hoặc không hợp lệ.';
      toast.error(errDetail);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0E27] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background & Orbs (Giữ nguyên concept) */}
      <div className="fixed inset-0 opacity-10 pointer-events-none">
        <div className="absolute inset-0" style={{ 
          backgroundImage: 'linear-gradient(#38BDF8 1px, transparent 1px), linear-gradient(90deg, #38BDF8 1px, transparent 1px)',
          backgroundSize: '50px 50px',
          opacity: 0.1
        }} />
      </div>
      <div className="fixed top-20 left-20 w-96 h-96 bg-sky-500/20 rounded-full blur-3xl animate-pulse" />
      <div className="fixed bottom-20 right-20 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="relative">
              <div className="absolute inset-0 bg-sky-400 rounded-2xl blur-lg opacity-50" />
              <div className="relative w-14 h-14 bg-gradient-to-br from-sky-400 to-cyan-400 rounded-2xl flex items-center justify-center shadow-xl shadow-sky-400/30">
                <Activity className="w-8 h-8 text-navy-950" />
              </div>
            </div>
            <div className="text-left">
              <div className="flex items-center gap-2">
                <div className="text-3xl font-bold text-white tracking-tight">LANGAI</div>
                <div className="flex items-center gap-1 px-2 py-0.5 bg-sky-400/20 border border-sky-400/30 rounded-lg">
                  <Sparkles className="w-3 h-3 text-sky-400" />
                  <span className="text-xs font-bold text-sky-400">AI</span>
                </div>
              </div>
              <div className="text-sm text-slate-400">BatchGuard System</div>
            </div>
          </div>
        </div>

        <Card className="border-2 border-slate-700 shadow-2xl shadow-sky-500/10 bg-slate-800/80 backdrop-blur-xl rounded-3xl overflow-hidden">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto w-12 h-12 bg-sky-500/20 rounded-full flex items-center justify-center mb-2 border border-sky-500/30">
              <KeyRound className="w-6 h-6 text-sky-400" />
            </div>
            <CardTitle className="text-white text-2xl">Đặt lại mật khẩu</CardTitle>
            <CardDescription className="text-slate-400">
              Vui lòng nhập mật khẩu mới cho tài khoản của bạn
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="new-password" className="text-slate-300">Mật khẩu mới</Label>
                <Input
                  id="new-password"
                  type="password"
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  className="bg-slate-900 border-slate-700 text-white placeholder:text-slate-500 focus:border-sky-400 focus:ring-sky-400/30 rounded-xl h-11"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password" className="text-slate-300">Xác nhận mật khẩu</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  className="bg-slate-900 border-slate-700 text-white placeholder:text-slate-500 focus:border-sky-400 focus:ring-sky-400/30 rounded-xl h-11"
                />
              </div>
              
              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-400 hover:to-cyan-400 text-navy-950 font-bold shadow-lg shadow-sky-500/30 rounded-xl h-11 mt-6"
                disabled={isLoading}
              >
                {isLoading ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Đang cập nhật...</>
                ) : 'Xác nhận đổi mật khẩu'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}