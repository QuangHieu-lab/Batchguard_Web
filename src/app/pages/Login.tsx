import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Activity, Loader2, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

export default function Login() {
  const navigate = useNavigate();
  const { login, register, isLoading, isAuthenticated, user } = useAuth();

  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerName, setRegisterName] = useState('');

  // Navigate based on user role when authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'admin') {
        navigate('/admin', { replace: true });
      } else {
        // customer or producer role goes to dashboard (homepage)
        navigate('/dashboard', { replace: true });
      }
    }
  }, [isAuthenticated, user, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(loginEmail, loginPassword);
      toast.success('Đăng nhập thành công');
      // Navigation is handled by useEffect
    } catch (error) {
      toast.error('Email hoặc mật khẩu không đúng');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await register(registerEmail, registerPassword, registerName);
      toast.success('Đăng ký thành công');
      // Navigation is handled by useEffect
    } catch (error) {
      toast.error('Đăng ký thất bại');
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0E27] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background */}
      <div className="fixed inset-0 opacity-10 pointer-events-none">
        <div className="absolute inset-0" style={{ 
          backgroundImage: 'linear-gradient(#38BDF8 1px, transparent 1px), linear-gradient(90deg, #38BDF8 1px, transparent 1px)',
          backgroundSize: '50px 50px',
          opacity: 0.1
        }} />
      </div>

      {/* Glowing orbs */}
      <div className="fixed top-20 left-20 w-96 h-96 bg-sky-500/20 rounded-full blur-3xl animate-pulse" />
      <div className="fixed bottom-20 right-20 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />

      <div className="w-full max-w-md relative z-10">
        {/* Logo & Header */}
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
                <div className="text-3xl font-bold text-white tracking-tight">MYLONGAI</div>
                <div className="flex items-center gap-1 px-2 py-0.5 bg-sky-400/20 border border-sky-400/30 rounded-lg">
                  <Sparkles className="w-3 h-3 text-sky-400" />
                  <span className="text-xs font-bold text-sky-400">AI</span>
                </div>
              </div>
              <div className="text-sm text-slate-400">BatchGuard System</div>
            </div>
          </div>
          <p className="text-slate-400 text-sm">
            Hệ thống AI kiểm soát quá trình phơi bánh tráng
          </p>
        </div>

        {/* Auth Card */}
        <Card className="border-2 border-slate-700 shadow-2xl shadow-sky-500/10 bg-slate-800/80 backdrop-blur-xl rounded-3xl">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-white text-2xl">Chào mừng trở lại</CardTitle>
            <CardDescription className="text-slate-400">
              Đăng nhập để truy cập hệ thống giám sát
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6 bg-slate-900 border border-slate-700 p-1 rounded-xl">
                <TabsTrigger 
                  value="login"
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-sky-500 data-[state=active]:to-cyan-500 data-[state=active]:text-navy-950 data-[state=active]:shadow-lg text-slate-400 rounded-lg"
                >
                  Đăng nhập
                </TabsTrigger>
                <TabsTrigger 
                  value="register"
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-sky-500 data-[state=active]:to-cyan-500 data-[state=active]:text-navy-950 data-[state=active]:shadow-lg text-slate-400 rounded-lg"
                >
                  Đăng ký
                </TabsTrigger>
              </TabsList>

              {/* Login Tab */}
              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email" className="text-slate-300">Email</Label>
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="email@example.com"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      required
                      disabled={isLoading}
                      className="bg-slate-900 border-slate-700 text-white placeholder:text-slate-500 focus:border-sky-400 focus:ring-sky-400/30 rounded-xl h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password" className="text-slate-300">Mật khẩu</Label>
                    <Input
                      id="login-password"
                      type="password"
                      placeholder="••••••••"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
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
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Đang xử lý...
                      </>
                    ) : (
                      'Đăng nhập'
                    )}
                  </Button>
                </form>
              </TabsContent>

              {/* Register Tab */}
              <TabsContent value="register">
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="register-name" className="text-slate-300">Họ và tên</Label>
                    <Input
                      id="register-name"
                      type="text"
                      placeholder="Nguyễn Văn A"
                      value={registerName}
                      onChange={(e) => setRegisterName(e.target.value)}
                      required
                      disabled={isLoading}
                      className="bg-slate-900 border-slate-700 text-white placeholder:text-slate-500 focus:border-sky-400 focus:ring-sky-400/30 rounded-xl h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-email" className="text-slate-300">Email</Label>
                    <Input
                      id="register-email"
                      type="email"
                      placeholder="email@example.com"
                      value={registerEmail}
                      onChange={(e) => setRegisterEmail(e.target.value)}
                      required
                      disabled={isLoading}
                      className="bg-slate-900 border-slate-700 text-white placeholder:text-slate-500 focus:border-sky-400 focus:ring-sky-400/30 rounded-xl h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-password" className="text-slate-300">Mật khẩu</Label>
                    <Input
                      id="register-password"
                      type="password"
                      placeholder="••••••••"
                      value={registerPassword}
                      onChange={(e) => setRegisterPassword(e.target.value)}
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
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Đang xử lý...
                      </>
                    ) : (
                      'Tạo tài khoản'
                    )}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Demo Accounts */}
      

        {/* Footer Note */}
        <p className="text-center text-sm text-slate-500 mt-6">
          From Experience to{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-cyan-400">
            Predictability
          </span>
        </p>
      </div>
    </div>
  );
}