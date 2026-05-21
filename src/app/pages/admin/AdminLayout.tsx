import { Outlet, Link, useLocation, useNavigate } from 'react-router';
import { useEffect } from 'react';
import {
  LayoutDashboard,
  PackageCheck,
  Camera,
  AlertTriangle,
  LineChart,
  Users,
  Settings,
  LogOut,
  Activity,
  DollarSign,
  Factory
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { useAuth } from '../../contexts/AuthContext';
import { FarmProvider } from '../../contexts/FarmContext';
import { toast } from 'sonner';

const adminMenuItems = [
  { path: '/admin', icon: LayoutDashboard, label: 'Tổng quan' },
  { path: '/admin/farms', icon: Factory, label: 'Quản lý Trang trại' },
  { path: '/admin/batches', icon: PackageCheck, label: 'Quản lý mẻ bánh' },
  { path: '/admin/cameras', icon: Camera, label: 'Camera Monitoring' },
  { path: '/admin/risks', icon: AlertTriangle, label: 'Cảnh báo & Rủi ro' },
  { path: '/admin/revenue', icon: DollarSign, label: 'Doanh thu' },
  { path: '/admin/analytics', icon: LineChart, label: 'Phân tích & Báo cáo' },
  { path: '/admin/users', icon: Users, label: 'Quản lý người dùng' },
  { path: '/admin/settings', icon: Settings, label: 'Cài đặt hệ thống' },
];

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();

  // Protect admin routes - only allow admin users
  useEffect(() => {
    if (!isAuthenticated) {
      toast.error('Vui lòng đăng nhập để truy cập');
      navigate('/login', { replace: true });
    } else if (user?.role !== 'admin') {
      toast.error('Bạn không có quyền truy cập trang quản trị');
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  // Don't render anything if not authenticated or not admin
  if (!isAuthenticated || user?.role !== 'admin') {
    return null;
  }

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-slate-950">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-semibold text-white">MYLONGAI</h1>
              <p className="text-xs text-slate-400">Admin Dashboard</p>
            </div>
          </div>
        </div>

        {/* Menu */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {adminMenuItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-lg transition-all
                  ${isActive 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/50' 
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }
                `}
              >
                <Icon className="w-5 h-5" />
                <span className="text-sm font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800">
          <Button
            onClick={handleLogout}
            variant="ghost"
            className="w-full justify-start text-slate-300 hover:text-white hover:bg-slate-800"
          >
            <LogOut className="w-5 h-5 mr-3" />
            Đăng xuất
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-slate-950">
        <FarmProvider>
          <Outlet />
        </FarmProvider>
      </main>
    </div>
  );
}