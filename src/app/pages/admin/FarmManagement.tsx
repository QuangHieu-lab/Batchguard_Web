import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { 
  Factory, 
  MapPin, 
  Camera, 
  TrendingUp, 
  Users,
  MoreVertical,
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Power,
  CheckCircle,
  XCircle,
  AlertCircle,
  DollarSign
} from 'lucide-react';
import { mockFarms, Farm } from '../../data/adminMockData';

export default function FarmManagement() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive' | 'maintenance'>('all');
  const [selectedFarm, setSelectedFarm] = useState<Farm | null>(null);

  const filteredFarms = mockFarms.filter(farm => {
    const matchesSearch = farm.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         farm.owner.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         farm.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || farm.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalFarms = mockFarms.length;
  const activeFarms = mockFarms.filter(f => f.status === 'active').length;
  const totalActiveBatches = mockFarms.reduce((sum, f) => sum + f.activeBatches, 0);
  const totalRevenue = mockFarms.reduce((sum, f) => sum + f.monthlyRevenue, 0);
  const avgSuccessRate = (mockFarms.reduce((sum, f) => sum + f.successRate, 0) / mockFarms.length).toFixed(1);

  const getStatusColor = (status: Farm['status']) => {
    switch (status) {
      case 'active': return 'bg-green-500/10 text-green-400 border-green-500/20';
      case 'inactive': return 'bg-red-500/10 text-red-400 border-red-500/20';
      case 'maintenance': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
      default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  };

  const getStatusIcon = (status: Farm['status']) => {
    switch (status) {
      case 'active': return <CheckCircle className="w-4 h-4" />;
      case 'inactive': return <XCircle className="w-4 h-4" />;
      case 'maintenance': return <AlertCircle className="w-4 h-4" />;
    }
  };

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Quản lý Hộ</h1>
          <p className="text-slate-400 mt-1">Quản lý và theo dõi các hộ sản xuất bánh tráng</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white">
          <Plus className="w-4 h-4 mr-2" />
          Thêm Hộ
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Tổng Hộ</p>
                <p className="text-3xl font-bold text-white mt-2">{totalFarms}</p>
                <div className="flex items-center gap-1 mt-2">
                  <Badge className="bg-green-500/10 text-green-400 border-green-500/20">
                    {activeFarms} hoạt động
                  </Badge>
                </div>
              </div>
              <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Factory className="w-6 h-6 text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Batch Đang phơi</p>
                <p className="text-3xl font-bold text-white mt-2">{totalActiveBatches}</p>
                <div className="flex items-center gap-1 mt-2 text-sm">
                  <TrendingUp className="w-4 h-4 text-green-400" />
                  <span className="text-green-400">+5 batch</span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-lg bg-cyan-500/10 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-cyan-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Tỷ lệ TB Thành công</p>
                <p className="text-3xl font-bold text-green-400 mt-2">{avgSuccessRate}%</p>
                <div className="flex items-center gap-1 mt-2 text-sm">
                  <TrendingUp className="w-4 h-4 text-green-400" />
                  <span className="text-green-400">+2.3%</span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-lg bg-green-500/10 flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Doanh thu Tháng</p>
                <p className="text-3xl font-bold text-white mt-2">
                  {(totalRevenue / 1000000).toFixed(0)}M
                </p>
                <div className="flex items-center gap-1 mt-2 text-sm">
                  <TrendingUp className="w-4 h-4 text-green-400" />
                  <span className="text-green-400">+8.2%</span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-emerald-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="bg-slate-900 border-slate-800">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Tìm kiếm hộ..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-slate-800 border-slate-700 text-white"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={statusFilter === 'all' ? 'default' : 'outline'}
                onClick={() => setStatusFilter('all')}
                className={statusFilter === 'all' ? 'bg-blue-600' : 'border-slate-700'}
              >
                <Filter className="w-4 h-4 mr-2" />
                Tất cả
              </Button>
              <Button
                variant={statusFilter === 'active' ? 'default' : 'outline'}
                onClick={() => setStatusFilter('active')}
                className={statusFilter === 'active' ? 'bg-green-600' : 'border-slate-700'}
              >
                Hoạt động
              </Button>
              <Button
                variant={statusFilter === 'inactive' ? 'default' : 'outline'}
                onClick={() => setStatusFilter('inactive')}
                className={statusFilter === 'inactive' ? 'bg-red-600' : 'border-slate-700'}
              >
                Ngưng hoạt động
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Farms Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredFarms.map((farm) => (
          <Card key={farm.id} className="bg-slate-900 border-slate-800 hover:border-blue-500/50 transition-colors">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                    <Factory className="w-6 h-6 text-blue-400" />
                  </div>
                  <div>
                    <CardTitle className="text-white text-lg">{farm.name}</CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge className={getStatusColor(farm.status)}>
                        {getStatusIcon(farm.status)}
                        <span className="ml-1 capitalize">{farm.status === 'active' ? 'Hoạt động' : farm.status === 'inactive' ? 'Ngưng' : 'Bảo trì'}</span>
                      </Badge>
                    </div>
                  </div>
                </div>
                <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Owner & Location */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Users className="w-4 h-4 text-slate-400" />
                  <span className="text-slate-300">{farm.owner}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="w-4 h-4 text-slate-400" />
                  <span className="text-slate-300">{farm.address}</span>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-800">
            
                <div>
                  <p className="text-xs text-slate-400">Camera</p>
                  <p className="text-lg font-semibold text-white">
                    <span className="text-green-400">{farm.camerasOnline}</span>/{farm.cameras}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Batch Hoạt động</p>
                  <p className="text-lg font-semibold text-cyan-400">{farm.activeBatches}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Tỷ lệ TC</p>
                  <p className="text-lg font-semibold text-green-400">{farm.successRate}%</p>
                </div>
              </div>

              {/* Revenue */}
              <div className="pt-3 border-t border-slate-800">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">Doanh thu tháng</span>
                  <span className="text-lg font-semibold text-emerald-400">
                    {(farm.monthlyRevenue / 1000000).toFixed(1)}M VND
                  </span>
                </div>
              </div>

              {/* Operators */}
              <div className="pt-3 border-t border-slate-800">
                <p className="text-xs text-slate-400 mb-2">Nhân viên ({farm.operators.length})</p>
                <div className="flex flex-wrap gap-1">
                  {farm.operators.map((op, idx) => (
                    <Badge key={idx} className="bg-slate-800 text-slate-300 border-slate-700 text-xs">
                      {op.split('@')[0]}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-3">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1 border-slate-700 hover:bg-blue-600 hover:border-blue-600"
                  onClick={() => setSelectedFarm(farm)}
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Chi tiết
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1 border-slate-700 hover:bg-slate-700"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Chỉnh sửa
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredFarms.length === 0 && (
        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="p-12 text-center">
            <Factory className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Không tìm thấy hộ</h3>
            <p className="text-slate-400">Thử thay đổi bộ lọc hoặc tìm kiếm với từ khóa khác</p>
          </CardContent>
        </Card>
      )}

      {/* Farm Detail Modal - Simple placeholder */}
      {selectedFarm && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedFarm(null)}
        >
          <Card 
            className="bg-slate-900 border-slate-800 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white text-2xl">{selectedFarm.name}</CardTitle>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setSelectedFarm(null)}
                  className="text-slate-400 hover:text-white"
                >
                  ✕
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-400">Chủ hộ</p>
                  <p className="text-lg text-white font-medium">{selectedFarm.owner}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-400">Trạng thái</p>
                  <Badge className={getStatusColor(selectedFarm.status)}>
                    {selectedFarm.status === 'active' ? 'Hoạt động' : selectedFarm.status === 'inactive' ? 'Ngưng' : 'Bảo trì'}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-slate-400">Địa chỉ</p>
                  <p className="text-lg text-white">{selectedFarm.address}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-400">Tổng batch</p>
                  <p className="text-lg text-white">{selectedFarm.totalBatches}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-400">Hoàn thành</p>
                  <p className="text-lg text-green-400">{selectedFarm.completedBatches}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-400">Thất bại</p>
                  <p className="text-lg text-red-400">{selectedFarm.failedBatches}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-400">Tỷ lệ thành công</p>
                  <p className="text-lg text-green-400">{selectedFarm.successRate}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}