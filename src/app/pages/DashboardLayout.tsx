import { Outlet, Link, useLocation, useNavigate } from 'react-router';
import { BarChart3, History, Settings, Sparkles, LogOut, User, Camera, Cloud, Volume2 } from 'lucide-react';
import { Button } from '../components/ui/button';
import { SystemStatus } from '../components/SystemStatus';
import { WelcomeNotification } from '../components/WelcomeNotification';
import { useAuth } from '../contexts/AuthContext';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '../components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '../components/ui/avatar';

export default function DashboardLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const navItems = [
    { path: '/dashboard/camera', icon: Camera, label: 'Camera quan sát', exact: true },
    { path: '/dashboard/weather', icon: Cloud, label: 'Thời tiết' },
    { path: '/dashboard/voice', icon: Volume2, label: 'Thông báo bằng giọng nói' },
  ];

  const isActive = (path: string, exact?: boolean) => {
    if (exact) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getUserInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="min-h-screen bg-[#0A0E27] text-slate-100">
      <WelcomeNotification />
      
      {/* Animated background */}
      <div className="fixed inset-0 opacity-10 pointer-events-none">
        <div className="absolute inset-0" style={{ 
          backgroundImage: 'linear-gradient(#38BDF8 1px, transparent 1px), linear-gradient(90deg, #38BDF8 1px, transparent 1px)',
          backgroundSize: '50px 50px',
          opacity: 0.1
        }} />
      </div>

      {/* Header */}
      <header className="bg-[#0F172A]/80 border-b border-slate-800 sticky top-0 z-50 backdrop-blur-xl">
        <div className="px-4 md:px-8 py-4 flex justify-between items-center">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="relative">
              <div className="absolute inset-0 bg-sky-400 rounded-2xl blur-md opacity-50 group-hover:opacity-70 transition-opacity" />
              <div className="relative w-11 h-11 bg-gradient-to-br from-sky-400 to-cyan-400 rounded-2xl flex items-center justify-center shadow-lg">
                <BarChart3 className="w-6 h-6 text-navy-950" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-white">MYLONGAI</h1>
                <div className="flex items-center gap-1 px-2 py-0.5 bg-sky-400/20 border border-sky-400/30 rounded-lg">
                  <Sparkles className="w-3 h-3 text-sky-400" />
                  <span className="text-[10px] font-bold text-sky-400">AI</span>
                </div>
              </div>
              <p className="text-xs text-slate-400">BatchGuard System</p>
            </div>
          </Link>

          <div className="flex items-center gap-4">
            <SystemStatus />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-3 hover:bg-slate-800 border border-slate-700 rounded-xl px-3 py-2">
                  <Avatar className="w-8 h-8 border-2 border-sky-400">
                    <AvatarFallback className="bg-gradient-to-br from-sky-400 to-cyan-400 text-navy-950 font-bold text-sm">
                      {user ? getUserInitials(user.name) : 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium text-white hidden md:block">{user?.name}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-slate-800 border-slate-700 text-slate-100">
                <DropdownMenuLabel className="text-slate-300">Tài khoản</DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-slate-700" />
                <DropdownMenuItem className="focus:bg-slate-700 focus:text-white cursor-pointer">
                  <User className="mr-2 h-4 w-4" />
                  <span>Thông tin</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="focus:bg-slate-700 focus:text-white cursor-pointer">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Cài đặt</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-slate-700" />
                <DropdownMenuItem 
                  onClick={handleLogout}
                  className="focus:bg-red-900/50 focus:text-red-400 cursor-pointer text-red-400"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Đăng xuất</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Navigation */}
        <nav className="px-4 md:px-8 pb-3 flex gap-2 overflow-x-auto scrollbar-hide">
          {navItems.map((item) => {
            const active = isActive(item.path, item.exact);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`
                  flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm whitespace-nowrap transition-all
                  ${active 
                    ? 'bg-gradient-to-r from-sky-500 to-cyan-500 text-navy-950 shadow-lg shadow-sky-500/30' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-700'
                  }
                `}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </header>

      {/* Main Content */}
      <main className="relative z-10">
        <Outlet />
      </main>
    </div>
  );
}
