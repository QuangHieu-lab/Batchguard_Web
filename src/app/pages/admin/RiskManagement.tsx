import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip as RechartsTooltip,
  Legend
} from 'recharts';
import { 
  Search, 
  Filter, 
  AlertTriangle,
  ImageMinus,
  ShieldAlert,
  Bug,
  ThermometerSun,
  Eye,
  Trash2,
  Clock
} from 'lucide-react';
import { FarmSelector } from '../../components/admin/FarmSelector';

// ================= DỮ LIỆU MOCK CHO THƯ VIỆN LỖI AI =================
interface Defect {
  id: string;
  type: 'crack' | 'mold' | 'dirt' | 'overheat';
  batchId: string;
  location: string;
  timestamp: string;
  confidence: number;
  severity: 'high' | 'medium' | 'low';
  imageUrl: string;
}

const mockDefects: Defect[] = [
  { id: 'DEF-001', type: 'crack', batchId: '#TC-882', location: 'Sân A', timestamp: '10:30 - Hôm nay', confidence: 94, severity: 'high', imageUrl: 'https://placehold.co/600x400/1e293b/f43f5e?text=Banh+Nut+Rach' },
  { id: 'DEF-002', type: 'dirt', batchId: '#TS-112', location: 'Sân B', timestamp: '11:15 - Hôm nay', confidence: 88, severity: 'medium', imageUrl: 'https://placehold.co/600x400/1e293b/38bdf8?text=Dinh+Tap+Chat' },
  { id: 'DEF-003', type: 'mold', batchId: '#MD-045', location: 'Kho ủ', timestamp: '08:45 - Hôm nay', confidence: 98, severity: 'high', imageUrl: 'https://placehold.co/600x400/1e293b/10b981?text=Nam+Moc' },
  { id: 'DEF-004', type: 'crack', batchId: '#TC-883', location: 'Sân A', timestamp: '14:20 - Hôm qua', confidence: 85, severity: 'medium', imageUrl: 'https://placehold.co/600x400/1e293b/f43f5e?text=Me+Canh' },
  { id: 'DEF-005', type: 'overheat', batchId: '#TO-993', location: 'Lò sấy 1', timestamp: '16:00 - Hôm qua', confidence: 91, severity: 'high', imageUrl: 'https://placehold.co/600x400/1e293b/f97316?text=Chay+Xem' },
  { id: 'DEF-006', type: 'dirt', batchId: '#TD-221', location: 'Sân C', timestamp: '09:30 - Hôm qua', confidence: 82, severity: 'low', imageUrl: 'https://placehold.co/600x400/1e293b/38bdf8?text=Bui+Ban' },
];

const defectDistribution = [
  { name: 'Nứt rách', value: 45, color: '#f43f5e' },
  { name: 'Nấm mốc', value: 25, color: '#10b981' },
  { name: 'Tạp chất', value: 20, color: '#3b82f6' },
  { name: 'Cháy xém', value: 10, color: '#f97316' },
];

export default function DefectLogManagement() {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'crack' | 'mold' | 'dirt'>('all');

  // Lọc dữ liệu
  const filteredDefects = mockDefects.filter(defect => {
    const matchesSearch = defect.batchId.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          defect.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'all' || defect.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const highSeverityCount = mockDefects.filter(d => d.severity === 'high').length;

  // Helpers UI
  const getDefectInfo = (type: Defect['type']) => {
    switch (type) {
      case 'crack': return { label: 'Nứt rách', color: 'text-rose-400', bg: 'bg-rose-500/20', icon: <ImageMinus className="w-4 h-4 text-rose-400"/> };
      case 'mold': return { label: 'Nấm mốc', color: 'text-emerald-400', bg: 'bg-emerald-500/20', icon: <Bug className="w-4 h-4 text-emerald-400"/> };
      case 'dirt': return { label: 'Tạp chất', color: 'text-blue-400', bg: 'bg-blue-500/20', icon: <ShieldAlert className="w-4 h-4 text-blue-400"/> };
      case 'overheat': return { label: 'Cháy xém', color: 'text-orange-400', bg: 'bg-orange-500/20', icon: <ThermometerSun className="w-4 h-4 text-orange-400"/> };
    }
  };

  const getSeverityBadge = (severity: Defect['severity']) => {
    switch (severity) {
      case 'high': return <Badge className="bg-rose-500/10 text-rose-400 border-rose-500/30">Nghiêm trọng</Badge>;
      case 'medium': return <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/30">Cảnh báo</Badge>;
      case 'low': return <Badge className="bg-slate-700 text-slate-300 border-slate-600">Nhẹ</Badge>;
    }
  };

  return (
    <div className="p-8 space-y-6">
      {/* ================= HEADER ================= */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Thư viện Lỗi AI (Defect Log)</h1>
          <p className="text-slate-400 mt-1">Quản lý và xem xét các hình ảnh bánh hỏng do AI phát hiện</p>
        </div>
        <FarmSelector />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ================= THỐNG KÊ NHANH ================= */}
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="bg-slate-900 border-slate-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400 uppercase tracking-wider font-bold">Lỗi phát hiện hôm nay</p>
                  <p className="text-4xl font-bold text-white mt-2">{mockDefects.length}</p>
                </div>
                <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                  <ImageMinus className="w-7 h-7 text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-rose-950/20 border-rose-900/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-rose-400/80 uppercase tracking-wider font-bold">Lỗi nghiêm trọng (Cần xử lý)</p>
                  <p className="text-4xl font-bold text-rose-500 mt-2">{highSeverityCount}</p>
                </div>
                <div className="w-14 h-14 rounded-2xl bg-rose-500/20 flex items-center justify-center border border-rose-500/30">
                  <AlertTriangle className="w-7 h-7 text-rose-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ================= BIỂU ĐỒ PHÂN BỔ ================= */}
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader className="pb-0">
            <CardTitle className="text-white text-base">Phân bổ loại lỗi</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={120}>
              <PieChart>
                <Pie
                  data={defectDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={30}
                  outerRadius={50}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {defectDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '8px' }}
                  itemStyle={{ color: '#fff' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* ================= BỘ LỌC TÌM KIẾM ================= */}
      <Card className="bg-slate-900 border-slate-800">
        <CardContent className="p-5">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Tìm mã mẻ bánh hoặc khu vực..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-slate-800/50 border-slate-700 text-white rounded-xl"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                onClick={() => setTypeFilter('all')}
                className={`rounded-xl ${typeFilter === 'all' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'}`}
              >
                <Filter className="w-4 h-4 mr-2" /> Tất cả
              </Button>
              <Button
                variant="ghost"
                onClick={() => setTypeFilter('crack')}
                className={`rounded-xl ${typeFilter === 'crack' ? 'bg-rose-500/20 text-rose-400' : 'text-slate-400 hover:text-white'}`}
              >
                Nứt rách
              </Button>
              <Button
                variant="ghost"
                onClick={() => setTypeFilter('mold')}
                className={`rounded-xl ${typeFilter === 'mold' ? 'bg-emerald-500/20 text-emerald-400' : 'text-slate-400 hover:text-white'}`}
              >
                Nấm mốc
              </Button>
              <Button
                variant="ghost"
                onClick={() => setTypeFilter('dirt')}
                className={`rounded-xl ${typeFilter === 'dirt' ? 'bg-blue-500/20 text-blue-400' : 'text-slate-400 hover:text-white'}`}
              >
                Tạp chất
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ================= LƯỚI HÌNH ẢNH (IMAGE GRID) ================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredDefects.map((defect) => {
          const info = getDefectInfo(defect.type);
          
          return (
            <Card key={defect.id} className="bg-slate-900 border-slate-800 overflow-hidden hover:border-slate-600 transition-colors shadow-lg group">
              {/* Vùng hiển thị ảnh */}
              <div className="relative h-48 bg-slate-800">
                <img 
                  src={defect.imageUrl} 
                  alt={info.label} 
                  className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                />
                <div className="absolute top-3 right-3">
                  {getSeverityBadge(defect.severity)}
                </div>
                {/* Lớp phủ Bounding Box giả lập */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className={`border-2 ${info.color.replace('text-', 'border-')} w-24 h-24 rounded-lg bg-black/10`} />
                </div>
              </div>

              {/* Thông tin Chi tiết */}
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className={`flex items-center gap-2 px-2.5 py-1 rounded-md ${info.bg}`}>
                    {info.icon}
                    <span className={`text-xs font-bold ${info.color}`}>{info.label}</span>
                  </div>
                  <div className="flex items-center gap-1 bg-slate-800 px-2 py-1 rounded-md">
                    <span className="text-slate-400 text-[10px]">Độ tin cậy:</span>
                    <span className="text-white text-xs font-bold">{defect.confidence}%</span>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 text-sm">Mẻ bánh:</span>
                    <span className="text-white font-bold">{defect.batchId}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 text-sm">Vị trí:</span>
                    <span className="text-slate-200">{defect.location}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 text-sm">Thời gian:</span>
                    <span className="text-slate-400 text-xs flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {defect.timestamp}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2 pt-4 border-t border-slate-800">
                  <Button variant="outline" className="flex-1 bg-blue-600/10 border-blue-600/30 text-blue-400 hover:bg-blue-600 hover:text-white">
                    <Eye className="w-4 h-4 mr-2" /> Xem kỹ
                  </Button>
                  <Button variant="outline" className="px-3 border-slate-700 text-slate-400 hover:bg-rose-500/20 hover:text-rose-400 hover:border-rose-500/30">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {filteredDefects.length === 0 && (
        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="p-16 text-center flex flex-col items-center">
            <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mb-4">
              <ShieldAlert className="w-10 h-10 text-slate-600" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Không tìm thấy dữ liệu lỗi</h3>
            <p className="text-slate-400 max-w-md mx-auto">
              Không có hình ảnh bánh lỗi nào khớp với bộ lọc hiện tại của bạn. Tuyệt vời!
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}