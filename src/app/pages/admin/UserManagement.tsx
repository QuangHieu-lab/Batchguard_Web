import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
import { 
  Search, UserPlus, Shield, User, Activity, UserX, Edit, Trash2, Lock, Unlock, Loader2
} from 'lucide-react';
import { userApi } from '../../../services/endpoints';
import { toast } from 'sonner';

export default function UserManagement() {
  const [users, setUsers] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res: any = await userApi.getAll();
      const data = res?.data || res || [];
      
      // 🚀 DEBUG: In dữ liệu API ra Console để bắt lỗi Backend
      console.log("🔥 Dữ liệu Backend trả về từ API /users:", data);

      const formattedUsers = data.map((u: any) => {
        // 🚀 BẮT LƯỚI TẤT CẢ CÁC TRƯỜNG HỢP BACKEND CÓ THỂ TRẢ VỀ
        const isLocked = 
          u.role === 'disabled' || 
          u.status === 'disabled' || 
          u.status === 'inactive' || 
          u.is_active === false || 
          u.is_active === 'false' || 
          u.is_active === 0 ||
          u.disabled === true ||
          u.is_disabled === true;
        
        return {
          id: u.id,
          name: u.full_name || u.name || 'Người dùng ẩn danh',
          email: u.email || '',
          // Giữ nguyên role hiển thị nếu không phải admin
          role: u.role === 'admin' ? 'admin' : 'customer', 
          status: isLocked ? 'inactive' : 'active',
          lastLogin: u.last_login || u.created_at || new Date().toISOString()
        };
      });
      
      setUsers(formattedUsers);
    } catch (error) {
      toast.error('Lỗi tải danh sách người dùng');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleStatus = async (userId: string, currentStatus: string, role: string) => {
    if (role === 'admin') {
      toast.error('Không thể khóa tài khoản Quản trị viên!');
      return;
    }

    try {
      setProcessingId(userId);
      if (currentStatus === 'active') {
        await userApi.disableUser(userId);
        toast.success('Đã khóa tài khoản thành công');
      } else {
        await userApi.enableUser(userId);
        toast.success('Đã mở khóa tài khoản thành công');
      }
      
      // Đợi nửa giây để DB Backend kịp lưu rồi mới fetch lại
      setTimeout(async () => {
        await fetchUsers();
      }, 500);

    } catch (error: any) {
      console.error("LỖI KHÓA/MỞ KHÓA TÀI KHOẢN:", error);
      // Bắt chính xác câu lỗi từ Backend để hiển thị (400, 403, 500)
      const errorMessage = error?.message || error?.detail || error?.error || 'Có lỗi từ máy chủ';
      toast.error(`Thất bại: ${errorMessage}`);
    } finally {
      setProcessingId(null);
    }
  };

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeUsers = users.filter(u => u.status === 'active').length;
  const inactiveUsers = users.filter(u => u.status === 'inactive').length;
  const adminUsers = users.filter(u => u.role === 'admin').length;

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Quản lý người dùng</h1>
          <p className="text-slate-400 mt-1">Quản lý tài khoản, phân quyền và trạng thái đăng nhập</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <UserPlus className="w-4 h-4 mr-2" />
          Thêm người dùng
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Tổng người dùng</p>
                <p className="text-3xl font-bold text-white mt-2">{users.length}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <User className="w-6 h-6 text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Đang hoạt động</p>
                <p className="text-3xl font-bold text-green-400 mt-2">{activeUsers}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-green-500/10 flex items-center justify-center">
                <Activity className="w-6 h-6 text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Đã khóa</p>
                <p className="text-3xl font-bold text-red-400 mt-2">{inactiveUsers}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-red-500/10 flex items-center justify-center">
                <UserX className="w-6 h-6 text-red-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Quản trị viên</p>
                <p className="text-3xl font-bold text-purple-400 mt-2">{adminUsers}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-purple-500/10 flex items-center justify-center">
                <Shield className="w-6 h-6 text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card className="bg-slate-900 border-slate-800">
        <CardContent className="p-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Tìm kiếm theo tên hoặc email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-slate-800 border-slate-700 text-white"
            />
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle className="text-white">Danh sách người dùng ({filteredUsers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            {loading ? (
              <div className="text-center py-12 text-slate-400 flex flex-col items-center">
                <Activity className="w-8 h-8 animate-spin mb-3 text-blue-500" />
                Đang tải dữ liệu người dùng...
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-800 hover:bg-slate-800/50">
                    <TableHead className="text-slate-400">Họ tên</TableHead>
                    <TableHead className="text-slate-400">Email</TableHead>
                    <TableHead className="text-slate-400">Vai trò</TableHead>
                    <TableHead className="text-slate-400">Trạng thái</TableHead>
                    <TableHead className="text-slate-400">Đăng nhập lần cuối</TableHead>
                    <TableHead className="text-slate-400 text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id} className="border-slate-800 hover:bg-slate-800/50">
                      <TableCell className="font-medium text-white">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-semibold uppercase">
                            {user.name.charAt(0)}
                          </div>
                          {user.name}
                        </div>
                      </TableCell>
                      <TableCell className="text-slate-300">{user.email}</TableCell>
                      <TableCell>
                        <Badge className={user.role === 'admin' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' : 'bg-blue-500/10 text-blue-400 border-blue-500/20'}>
                          {user.role === 'admin' ? <><Shield className="w-3 h-3 mr-1" />Admin</> : <><User className="w-3 h-3 mr-1" />Khách hàng</>}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={user.status === 'active' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'}>
                          {user.status === 'active' ? <><span className="inline-block w-2 h-2 rounded-full bg-emerald-400 mr-2 animate-pulse"></span>Hoạt động</> : <><Lock className="w-3 h-3 mr-1" />Bị Khóa</>}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-slate-300">
                        {new Date(user.lastLogin).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="ghost" size="sm" 
                            disabled={user.role === 'admin' || processingId === user.id}
                            onClick={() => handleToggleStatus(user.id, user.status, user.role)}
                            className={user.status === 'active' ? "text-rose-400 hover:text-rose-300 hover:bg-rose-500/10" : "text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10"}
                            title={user.status === 'active' ? "Khóa tài khoản" : "Mở khóa tài khoản"}
                          >
                            {processingId === user.id ? <Loader2 className="w-4 h-4 animate-spin" /> : user.status === 'active' ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                          </Button>
                          <Button variant="ghost" size="sm" className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="text-red-400 hover:text-red-300 hover:bg-red-500/10">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}