import { useState } from 'react';
import { Link } from 'react-router';
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
  Search, 
  Filter, 
  Eye,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Clock
} from 'lucide-react';
import { allAdminBatches } from '../../data/adminMockData';
import { Batch } from '../../data/mockData';
import { FarmSelector } from '../../components/admin/FarmSelector';
import { useFarm } from '../../contexts/FarmContext';

export default function BatchManagement() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'completed' | 'failed'>('all');
  const { selectedFarmId } = useFarm();

  const filteredBatches = allAdminBatches.filter(batch => {
    const matchesSearch = batch.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          batch.location?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || batch.status === statusFilter;
    const matchesFarm = !selectedFarmId || batch.farmId === selectedFarmId;
    return matchesSearch && matchesStatus && matchesFarm;
  });

  const getStatusBadge = (status: Batch['status']) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20">Đang phơi</Badge>;
      case 'completed':
        return <Badge className="bg-green-500/10 text-green-400 border-green-500/20">Hoàn thành</Badge>;
      case 'failed':
        return <Badge className="bg-red-500/10 text-red-400 border-red-500/20">Thất bại</Badge>;
    }
  };

  const getRiskBadge = (risk: Batch['riskLevel']) => {
    switch (risk) {
      case 'low':
        return <Badge variant="outline" className="border-green-500/50 text-green-400">Thấp</Badge>;
      case 'medium':
        return <Badge variant="outline" className="border-yellow-500/50 text-yellow-400">Trung bình</Badge>;
      case 'high':
        return <Badge variant="outline" className="border-red-500/50 text-red-400">Cao</Badge>;
    }
  };

  // Calculate metrics based on filtered batches
  const batchesInScope = selectedFarmId 
    ? allAdminBatches.filter(b => b.farmId === selectedFarmId)
    : allAdminBatches;
    
  const activeBatches = batchesInScope.filter(b => b.status === 'active').length;
  const completedBatches = batchesInScope.filter(b => b.status === 'completed').length;
  const failedBatches = batchesInScope.filter(b => b.status === 'failed').length;

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Quản lý mẻ bánh</h1>
          <p className="text-slate-400 mt-1">Theo dõi và quản lý tất cả mẻ bánh tráng</p>
        </div>
        <FarmSelector />
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400">Tổng số mẻ</p>
                <p className="text-2xl font-bold text-white mt-1">{allAdminBatches.length}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400">Đang hoạt động</p>
                <p className="text-2xl font-bold text-blue-400 mt-1">{activeBatches}</p>
              </div>
              <Clock className="w-8 h-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400">Hoàn thành</p>
                <p className="text-2xl font-bold text-green-400 mt-1">{completedBatches}</p>
              </div>
              <CheckCircle2 className="w-8 h-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400">Thất bại</p>
                <p className="text-2xl font-bold text-red-400 mt-1">{failedBatches}</p>
              </div>
              <XCircle className="w-8 h-8 text-red-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="bg-slate-900 border-slate-800">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Tìm kiếm theo tên hoặc vị trí..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-slate-800 border-slate-700 text-white"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={statusFilter === 'all' ? 'default' : 'outline'}
                onClick={() => setStatusFilter('all')}
                className={statusFilter === 'all' ? 'bg-blue-600' : 'bg-slate-800 border-slate-700 text-slate-300'}
              >
                <Filter className="w-4 h-4 mr-2" />
                Tất cả
              </Button>
              <Button
                variant={statusFilter === 'active' ? 'default' : 'outline'}
                onClick={() => setStatusFilter('active')}
                className={statusFilter === 'active' ? 'bg-blue-600' : 'bg-slate-800 border-slate-700 text-slate-300'}
              >
                Đang phơi
              </Button>
              <Button
                variant={statusFilter === 'completed' ? 'default' : 'outline'}
                onClick={() => setStatusFilter('completed')}
                className={statusFilter === 'completed' ? 'bg-blue-600' : 'bg-slate-800 border-slate-700 text-slate-300'}
              >
                Hoàn thành
              </Button>
              <Button
                variant={statusFilter === 'failed' ? 'default' : 'outline'}
                onClick={() => setStatusFilter('failed')}
                className={statusFilter === 'failed' ? 'bg-blue-600' : 'bg-slate-800 border-slate-700 text-slate-300'}
              >
                Thất bại
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle className="text-white">Danh sách mẻ bánh ({filteredBatches.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-slate-800 hover:bg-slate-800/50">
                  <TableHead className="text-slate-400">Tên mẻ</TableHead>
                  <TableHead className="text-slate-400">Vị trí</TableHead>
                  <TableHead className="text-slate-400">Trạng thái</TableHead>
                  <TableHead className="text-slate-400">Tiến độ</TableHead>
                  <TableHead className="text-slate-400">Rủi ro</TableHead>
                  <TableHead className="text-slate-400">Nhiệt độ</TableHead>
                  <TableHead className="text-slate-400">Độ ẩm</TableHead>
                  <TableHead className="text-slate-400">Thời gian bắt đầu</TableHead>
                  <TableHead className="text-slate-400">Người tạo</TableHead>
                  <TableHead className="text-slate-400 text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBatches.map((batch) => (
                  <TableRow 
                    key={batch.id}
                    className="border-slate-800 hover:bg-slate-800/50"
                  >
                    <TableCell className="font-medium text-white">{batch.name}</TableCell>
                    <TableCell className="text-slate-300">{batch.location || '-'}</TableCell>
                    <TableCell>{getStatusBadge(batch.status)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-2 bg-slate-800 rounded-full overflow-hidden">
                          <div 
                            className={`h-full transition-all ${
                              batch.dryingProgress >= 80 ? 'bg-green-500' :
                              batch.dryingProgress >= 50 ? 'bg-blue-500' :
                              'bg-yellow-500'
                            }`}
                            style={{ width: `${batch.dryingProgress}%` }}
                          />
                        </div>
                        <span className="text-sm text-slate-300">{batch.dryingProgress}%</span>
                      </div>
                    </TableCell>
                    <TableCell>{getRiskBadge(batch.riskLevel)}</TableCell>
                    <TableCell className="text-slate-300">{batch.temperature}°C</TableCell>
                    <TableCell className="text-slate-300">{batch.humidity}%</TableCell>
                    <TableCell className="text-slate-300">
                      {new Date(batch.startTime).toLocaleString('vi-VN', {
                        day: '2-digit',
                        month: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </TableCell>
                    <TableCell className="text-slate-300 text-sm">{batch.createdBy}</TableCell>
                    <TableCell className="text-right">
                      <Link to={`/dashboard/batch/${batch.id}`}>
                        <Button variant="ghost" size="sm" className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10">
                          <Eye className="w-4 h-4 mr-1" />
                          Chi tiết
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}