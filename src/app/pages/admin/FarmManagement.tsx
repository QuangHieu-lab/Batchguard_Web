import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { 
  Map, 
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
  CheckCircle,
  XCircle,
  AlertTriangle,
  TrendingDown,
  Wifi,
  ShieldCheck
} from 'lucide-react';

// ================= DỮ LIỆU MOCK (Thay thế cho adminMockData cũ) =================
interface Zone {
  id: string;
  name: string;
  manager: string;
  location: string;
  status: 'active' | 'warning' | 'maintenance';
  camerasOnline: number;
  camerasTotal: number;
  activeBatches: number;
  successRate: number;
  defectCost: number; // Thay cho monthlyRevenue
  qcStaff: string[];
}

const mockZones: Zone[] = [
  { id: '1', name: 'Sân phơi Khu A', manager: 'Nguyễn Văn A', location: 'Cụm Bắc', status: 'active', camerasOnline: 4, camerasTotal: 4, activeBatches: 8, successRate: 92.5, defectCost: 1250000, qcStaff: ['QC_Binh', 'QC_An'] },
  { id: '2', name: 'Sân phơi Khu B', manager: 'Trần Thị B', location: 'Cụm Nam', status: 'warning', camerasOnline: 2, camerasTotal: 3, activeBatches: 5, successRate: 85.0, defectCost: 3400000, qcStaff: ['QC_Chau'] },
  { id: '3', name: 'Lò sấy Công nghiệp 1', manager: 'Lê Văn C', location: 'Xưởng chính', status: 'maintenance', camerasOnline: 0, camerasTotal: 2, activeBatches: 0, successRate: 0, defectCost: 0, qcStaff: [] },
  { id: '4', name: 'Sân phơi Khu C', manager: 'Phạm D', location: 'Cụm Đông', status: 'active', camerasOnline: 5, camerasTotal: 5, activeBatches: 12, successRate: 96.2, defectCost: 450000, qcStaff: ['QC_Dung', 'QC_Hoa'] },
];

export default function ZoneManagement() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'warning' | 'maintenance'>('all');
  const [selectedZone, setSelectedZone] = useState<Zone | null>(null);

  // Lọc dữ liệu
  const filteredZones = mockZones.filter(zone => {
    const matchesSearch = zone.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          zone.manager.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          zone.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || zone.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Tính toán chỉ số tổng quan
  const totalZones = mockZones.length;
  const activeZones = mockZones.filter(z => z.status === 'active').length;
  const totalActiveBatches = mockZones.reduce((sum, z) => sum + z.activeBatches, 0);
  const totalDefectCost = mockZones.reduce((sum, z) => sum + z.defectCost, 0);
  const activeZonesCount = mockZones.filter(z => z.activeBatches > 0).length;
  const avgSuccessRate = activeZonesCount > 0 
    ? (mockZones.reduce((sum, z) => sum + (z.activeBatches > 0 ? z.successRate : 0), 0) / activeZonesCount).toFixed(1)
    : '0.0';

  // Helper cho màu sắc UI
  const getStatusColor = (status: Zone['status']) => {
    switch (status) {
      case 'active': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'warning': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'maintenance': return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  };

  const getStatusIcon = (status: Zone['status']) => {
    switch (status) {
      case 'active': return <CheckCircle className="w-4 h-4" />;
      case 'warning': return <AlertTriangle className="w-4 h-4" />;
      case 'maintenance': return <XCircle className="w-4 h-4" />;
    }
  };

  return (
    <div className="p-8 space-y-6">
      {/* ================= HEADER ================= */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Quản lý Sân phơi & Hạ tầng</h1>
          <p className="text-slate-400 mt-1">Kiểm soát các khu vực phơi bánh và thiết bị AI</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-900/20">
          <Plus className="w-4 h-4 mr-2" />
          Thêm Khu vực
        </Button>
      </div>

      {/* ================= 4 THẺ CHỈ SỐ (KEY METRICS) ================= */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Tổng Khu vực */}
        <Card className="bg-[#1e293b] border-slate-700/50 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Tổng Khu vực</p>
                <p className="text-3xl font-bold text-white mt-2">{totalZones}</p>
                <div className="flex items-center gap-1 mt-2">
                  <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                    {activeZones} đang vận hành
                  </Badge>
                </div>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-blue-500/20 flex items-center justify-center border border-blue-500/30">
                <Map className="w-6 h-6 text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Mẻ đang phơi */}
        <Card className="bg-[#1e293b] border-slate-700/50 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Mẻ đang phơi</p>
                <p className="text-3xl font-bold text-white mt-2">{totalActiveBatches}</p>
                <div className="flex items-center gap-1 mt-2 text-sm">
                  <TrendingUp className="w-4 h-4 text-cyan-400" />
                  <span className="text-cyan-400 font-medium">Giám sát liên tục</span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 flex items-center justify-center border border-cyan-500/30">
                <Camera className="w-6 h-6 text-cyan-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tỷ lệ đạt chuẩn */}
        <Card className="bg-[#1e293b] border-slate-700/50 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Tỷ lệ Đạt chuẩn</p>
                <p className="text-3xl font-bold text-emerald-400 mt-2">{avgSuccessRate}%</p>
                <div className="flex items-center gap-1 mt-2 text-sm">
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-400 font-medium">+1.2% tuần này</span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
                <ShieldCheck className="w-6 h-6 text-emerald-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Hao hụt */}
        <Card className="bg-[#1e293b] border-slate-700/50 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Hao hụt (Bánh lỗi)</p>
                <p className="text-3xl font-bold text-rose-500 mt-2">
                  {(totalDefectCost / 1000000).toFixed(1)}M
                </p>
                <div className="flex items-center gap-1 mt-2 text-sm">
                  <TrendingDown className="w-4 h-4 text-rose-400" />
                  <span className="text-rose-400 font-medium">-15% so với tháng trước</span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-rose-500/20 flex items-center justify-center border border-rose-500/30">
                <AlertTriangle className="w-6 h-6 text-rose-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ================= BỘ LỌC & TÌM KIẾM ================= */}
      <Card className="bg-[#1e293b] border-slate-700/50">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Tìm kiếm khu vực, người quản lý..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-slate-800/50 border-slate-700 text-white rounded-xl"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={statusFilter === 'all' ? 'default' : 'outline'}
                onClick={() => setStatusFilter('all')}
                className={`rounded-xl ${statusFilter === 'all' ? 'bg-blue-600 hover:bg-blue-700' : 'border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white'}`}
              >
                <Filter className="w-4 h-4 mr-2" /> Tất cả
              </Button>
              <Button
                variant={statusFilter === 'active' ? 'default' : 'outline'}
                onClick={() => setStatusFilter('active')}
                className={`rounded-xl ${statusFilter === 'active' ? 'bg-emerald-600 hover:bg-emerald-700' : 'border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white'}`}
              >
                Hoạt động
              </Button>
              <Button
                variant={statusFilter === 'warning' ? 'default' : 'outline'}
                onClick={() => setStatusFilter('warning')}
                className={`rounded-xl ${statusFilter === 'warning' ? 'bg-amber-600 hover:bg-amber-700 text-white' : 'border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white'}`}
              >
                Cảnh báo
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ================= LƯỚI DANH SÁCH (GRID) ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredZones.map((zone) => (
          <Card key={zone.id} className="bg-[#1e293b] border-slate-700/50 hover:border-blue-500/50 transition-colors shadow-lg">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 border ${
                    zone.status === 'active' ? 'bg-blue-500/10 border-blue-500/30' : 
                    zone.status === 'warning' ? 'bg-amber-500/10 border-amber-500/30' : 
                    'bg-slate-800 border-slate-700'
                  }`}>
                    <Map className={`w-6 h-6 ${zone.status === 'active' ? 'text-blue-400' : zone.status === 'warning' ? 'text-amber-400' : 'text-slate-500'}`} />
                  </div>
                  <div>
                    <CardTitle className="text-white text-lg">{zone.name}</CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge className={getStatusColor(zone.status)}>
                        {getStatusIcon(zone.status)}
                        <span className="ml-1 capitalize">
                          {zone.status === 'active' ? 'Ổn định' : zone.status === 'warning' ? 'Lỗi mạng / Thiết bị' : 'Bảo trì'}
                        </span>
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
              {/* Thông tin cơ bản */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Users className="w-4 h-4 text-slate-400" />
                  <span className="text-slate-300 font-medium">Quản lý: {zone.manager}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="w-4 h-4 text-slate-400" />
                  <span className="text-slate-300">{zone.location}</span>
                </div>
              </div>

              {/* Grid 3 Chỉ số */}
              <div className="grid grid-cols-3 gap-3 pt-3 border-t border-slate-700/50">
                <div>
                  <p className="text-xs text-slate-400 mb-1">Camera AI</p>
                  <div className="flex items-center gap-1.5">
                    <Wifi className={`w-3 h-3 ${zone.camerasOnline === zone.camerasTotal ? 'text-emerald-400' : 'text-rose-400'}`} />
                    <p className="text-lg font-semibold text-white">
                      <span className={zone.camerasOnline === zone.camerasTotal ? 'text-emerald-400' : 'text-rose-400'}>
                        {zone.camerasOnline}
                      </span>
                      <span className="text-slate-500">/{zone.camerasTotal}</span>
                    </p>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-1">Mẻ đang phơi</p>
                  <p className="text-lg font-semibold text-cyan-400">{zone.activeBatches}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-1">Tỷ lệ Đạt</p>
                  <p className="text-lg font-semibold text-emerald-400">{zone.successRate}%</p>
                </div>
              </div>

              {/* Hao hụt */}
              <div className="pt-3 border-t border-slate-700/50">
                <div className="flex items-center justify-between bg-rose-500/5 p-3 rounded-xl border border-rose-500/10">
                  <span className="text-sm font-semibold text-rose-400/80">Chi phí hao hụt (Tháng)</span>
                  <span className="text-base font-bold text-rose-500">
                    {(zone.defectCost / 1000).toLocaleString('vi-VN')}k VND
                  </span>
                </div>
              </div>

              {/* Phân công QC */}
              <div className="pt-3 border-t border-slate-700/50">
                <p className="text-xs text-slate-400 mb-2 font-semibold">Nhân sự QC ({zone.qcStaff.length})</p>
                <div className="flex flex-wrap gap-2">
                  {zone.qcStaff.length > 0 ? zone.qcStaff.map((staff, idx) => (
                    <Badge key={idx} className="bg-purple-500/10 text-purple-300 border-purple-500/20 text-xs">
                      {staff}
                    </Badge>
                  )) : (
                    <span className="text-xs text-slate-500 italic">Chưa phân công</span>
                  )}
                </div>
              </div>

              {/* Nút hành động */}
              <div className="flex gap-3 pt-3">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1 rounded-xl border-slate-600 text-slate-300 hover:bg-blue-600 hover:text-white hover:border-blue-600"
                  onClick={() => setSelectedZone(zone)}
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Chi tiết
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1 rounded-xl border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Chỉnh sửa
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Trạng thái trống */}
      {filteredZones.length === 0 && (
        <Card className="bg-[#1e293b] border-slate-700/50">
          <CardContent className="p-12 text-center">
            <Map className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Không tìm thấy khu vực</h3>
            <p className="text-slate-400">Thử thay đổi bộ lọc hoặc tìm kiếm với từ khóa khác</p>
          </CardContent>
        </Card>
      )}

      {/* ================= MODAL CHI TIẾT (Được làm đẹp lại) ================= */}
      {selectedZone && (
        <div 
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedZone(null)}
        >
          <Card 
            className="bg-[#1e293b] border-slate-700 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl rounded-3xl"
            onClick={(e) => e.stopPropagation()}
          >
            <CardHeader className="border-b border-slate-800 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-white text-2xl font-bold">{selectedZone.name}</CardTitle>
                  <p className="text-slate-400 text-sm mt-1">{selectedZone.location}</p>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => setSelectedZone(null)}
                  className="text-slate-400 hover:text-white hover:bg-slate-800 rounded-full"
                >
                  ✕
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              
              <div className="flex items-center gap-4">
                <Badge className={getStatusColor(selectedZone.status) + " px-3 py-1 text-sm"}>
                  {getStatusIcon(selectedZone.status)}
                  <span className="ml-1.5 capitalize">
                    {selectedZone.status === 'active' ? 'Hoạt động ổn định' : selectedZone.status === 'warning' ? 'Cần kiểm tra thiết bị' : 'Đang bảo trì'}
                  </span>
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-800">
                  <p className="text-sm font-semibold text-slate-400 mb-1">Quản lý khu vực</p>
                  <p className="text-lg text-white font-bold">{selectedZone.manager}</p>
                </div>
                <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-800">
                  <p className="text-sm font-semibold text-slate-400 mb-1">Camera kết nối</p>
                  <p className="text-lg text-white font-bold">
                    <span className={selectedZone.camerasOnline === selectedZone.camerasTotal ? 'text-emerald-400' : 'text-rose-400'}>{selectedZone.camerasOnline}</span>
                    <span className="text-slate-500"> / {selectedZone.camerasTotal} Online</span>
                  </p>
                </div>
                <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-800">
                  <p className="text-sm font-semibold text-slate-400 mb-1">Tổng số mẻ đang phơi</p>
                  <p className="text-lg text-cyan-400 font-bold">{selectedZone.activeBatches} mẻ</p>
                </div>
                <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-800">
                  <p className="text-sm font-semibold text-slate-400 mb-1">Tỷ lệ đạt chuẩn (Loại 1)</p>
                  <p className="text-lg text-emerald-400 font-bold">{selectedZone.successRate}%</p>
                </div>
              </div>

              <div className="bg-rose-500/10 p-5 rounded-2xl border border-rose-500/20 flex flex-row items-center justify-between">
                 <div>
                   <p className="text-sm font-bold text-rose-400 mb-1 uppercase tracking-wider">Hao hụt tài chính</p>
                   <p className="text-xs text-rose-300/70">Thiệt hại do bánh nứt, ẩm mốc (Tháng này)</p>
                 </div>
                 <p className="text-2xl text-rose-500 font-black">{(selectedZone.defectCost / 1000).toLocaleString('vi-VN')}k</p>
              </div>

            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}