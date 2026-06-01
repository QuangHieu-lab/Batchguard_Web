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
  CheckCircle2,
  XCircle,
  Clock,
  ShieldCheck,
  AlertTriangle,
  ThumbsUp
} from 'lucide-react';

// ================= DỮ LIỆU MOCK ĐÃ ĐƯỢC TINH GỌN LẠI =================
// Trạng thái QC giờ chỉ còn: Chờ duyệt (pending) | Đã duyệt (approved) | Đã hủy (rejected)
interface QCBatch {
  id: string;
  name: string;
  code: string;
  location: string;
  dryness: number;
  aiAssessment: 'pass' | 'defect_crack' | 'defect_mold' | 'processing';
  qcStatus: 'pending' | 'approved' | 'rejected'; 
  completedAt: string;
}

const mockQCBatches: QCBatch[] = [
  { id: 'b1', name: 'Bánh tráng Tôm cay', code: '#TC-882', location: 'Sân A', dryness: 98, aiAssessment: 'pass', qcStatus: 'pending', completedAt: '14:30 - Hôm nay' },
  { id: 'b2', name: 'Bánh tráng Sữa', code: '#TS-112', location: 'Sân B', dryness: 96, aiAssessment: 'defect_crack', qcStatus: 'pending', completedAt: '15:45 - Hôm nay' },
  { id: 'b3', name: 'Bánh tráng Mè đen', code: '#MD-045', location: 'Sân A', dryness: 95, aiAssessment: 'pass', qcStatus: 'approved', completedAt: '09:15 - Hôm nay' },
  { id: 'b4', name: 'Bánh tráng Ớt', code: '#TO-993', location: 'Sân C', dryness: 92, aiAssessment: 'defect_mold', qcStatus: 'rejected', completedAt: '16:20 - Hôm qua' },
  { id: 'b5', name: 'Bánh tráng Dừa', code: '#TD-221', location: 'Sân B', dryness: 85, aiAssessment: 'processing', qcStatus: 'pending', completedAt: 'Đang phơi' },
];

export default function QCApproval() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');

  // Logic Lọc dữ liệu
  const filteredBatches = mockQCBatches.filter(batch => {
    const matchesSearch = batch.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          batch.code.toLowerCase().includes(searchQuery.toLowerCase());
    
    let matchesStatus = true;
    if (statusFilter === 'pending') matchesStatus = batch.qcStatus === 'pending';
    if (statusFilter === 'approved') matchesStatus = batch.qcStatus === 'approved';
    if (statusFilter === 'rejected') matchesStatus = batch.qcStatus === 'rejected';

    return matchesSearch && matchesStatus;
  });

  // Tính toán số liệu thống kê
  const pendingCount = mockQCBatches.filter(b => b.qcStatus === 'pending').length;
  const approvedCount = mockQCBatches.filter(b => b.qcStatus === 'approved').length;
  const rejectedCount = mockQCBatches.filter(b => b.qcStatus === 'rejected').length;
  const aiPassCount = mockQCBatches.filter(b => b.aiAssessment === 'pass').length;

  // Render Badge đánh giá của AI
  const getAIBadge = (assessment: QCBatch['aiAssessment']) => {
    switch (assessment) {
      case 'pass':
        return <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20"><CheckCircle2 className="w-3 h-3 mr-1"/> Đạt chuẩn</Badge>;
      case 'defect_crack':
        return <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/20"><AlertTriangle className="w-3 h-3 mr-1"/> Nứt rách</Badge>;
      case 'defect_mold':
        return <Badge className="bg-rose-500/10 text-rose-400 border-rose-500/20"><AlertTriangle className="w-3 h-3 mr-1"/> Nấm mốc</Badge>;
      case 'processing':
        return <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20"><Clock className="w-3 h-3 mr-1"/> Đang quét</Badge>;
    }
  };

  // Render Badge trạng thái QC
  const getQCStatusBadge = (status: QCBatch['qcStatus']) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/40">Chờ duyệt</Badge>;
      case 'approved':
        return <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/40">Đã Duyệt</Badge>;
      case 'rejected':
        return <Badge className="bg-rose-500/20 text-rose-400 border-rose-500/40">Đã Hủy</Badge>;
    }
  };

  return (
    <div className="p-8 space-y-6">
      {/* ================= HEADER ================= */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Phê duyệt QC (Quality Control)</h1>
          <p className="text-slate-400 mt-1">Nghiệm thu và chốt chất lượng mẻ bánh (Chỉ có Đạt hoặc Hủy)</p>
        </div>
      </div>

      {/* ================= 4 THẺ CHỈ SỐ ================= */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-[#1e293b] border-slate-700/50 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-wider font-bold">Chờ duyệt</p>
                <p className="text-2xl font-bold text-blue-400 mt-1">{pendingCount} mẻ</p>
              </div>
              <div className="bg-blue-500/20 p-2 rounded-xl"><Clock className="w-6 h-6 text-blue-400" /></div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#1e293b] border-slate-700/50 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-wider font-bold">AI đánh giá Tốt</p>
                <p className="text-2xl font-bold text-cyan-400 mt-1">{aiPassCount} mẻ</p>
              </div>
              <div className="bg-cyan-500/20 p-2 rounded-xl"><ShieldCheck className="w-6 h-6 text-cyan-400" /></div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#1e293b] border-slate-700/50 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-wider font-bold">Đã duyệt (Đạt)</p>
                <p className="text-2xl font-bold text-emerald-400 mt-1">{approvedCount} mẻ</p>
              </div>
              <div className="bg-emerald-500/20 p-2 rounded-xl"><ThumbsUp className="w-6 h-6 text-emerald-400" /></div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#1e293b] border-slate-700/50 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-wider font-bold">Đã Hủy (Lỗi)</p>
                <p className="text-2xl font-bold text-rose-400 mt-1">{rejectedCount} mẻ</p>
              </div>
              <div className="bg-rose-500/20 p-2 rounded-xl"><XCircle className="w-6 h-6 text-rose-400" /></div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ================= BỘ LỌC ================= */}
      <Card className="bg-[#1e293b] border-slate-700/50 shadow-lg">
        <CardContent className="p-5">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Tìm mã mẻ bánh (VD: TC-882)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-slate-800/50 border-slate-700 text-white rounded-xl"
              />
            </div>
            <div className="flex gap-2 bg-slate-800/50 p-1 rounded-xl border border-slate-700">
              <Button
                variant="ghost"
                onClick={() => setStatusFilter('all')}
                className={`rounded-lg ${statusFilter === 'all' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'}`}
              >
                Tất cả
              </Button>
              <Button
                variant="ghost"
                onClick={() => setStatusFilter('pending')}
                className={`rounded-lg ${statusFilter === 'pending' ? 'bg-blue-600/20 text-blue-400' : 'text-slate-400 hover:text-white'}`}
              >
                <Filter className="w-4 h-4 mr-2" /> Chờ duyệt
              </Button>
              <Button
                variant="ghost"
                onClick={() => setStatusFilter('approved')}
                className={`rounded-lg ${statusFilter === 'approved' ? 'bg-emerald-600/20 text-emerald-400' : 'text-slate-400 hover:text-white'}`}
              >
                Đã Duyệt
              </Button>
              <Button
                variant="ghost"
                onClick={() => setStatusFilter('rejected')}
                className={`rounded-lg ${statusFilter === 'rejected' ? 'bg-rose-600/20 text-rose-400' : 'text-slate-400 hover:text-white'}`}
              >
                Đã Hủy
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ================= BẢNG DANH SÁCH ================= */}
      <Card className="bg-[#1e293b] border-slate-700/50 shadow-lg">
        <CardHeader className="border-b border-slate-800 pb-4">
          <CardTitle className="text-white text-lg">Danh sách phê duyệt ({filteredBatches.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-slate-800 bg-[#0B1121]/50">
                  <TableHead className="text-slate-400 font-semibold py-4">Mã Mẻ</TableHead>
                  <TableHead className="text-slate-400 font-semibold">Khu vực</TableHead>
                  <TableHead className="text-slate-400 font-semibold">Độ khô</TableHead>
                  <TableHead className="text-slate-400 font-semibold">AI Đánh giá</TableHead>
                  <TableHead className="text-slate-400 font-semibold">Trạng thái QC</TableHead>
                  <TableHead className="text-slate-400 font-semibold">Thời gian</TableHead>
                  <TableHead className="text-slate-400 font-semibold text-right">Hành động</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBatches.map((batch) => (
                  <TableRow 
                    key={batch.id}
                    className="border-slate-800/50 hover:bg-slate-800/30 transition-colors"
                  >
                    <TableCell>
                      <p className="font-bold text-white">{batch.code}</p>
                      <p className="text-xs text-slate-400">{batch.name}</p>
                    </TableCell>
                    <TableCell className="text-slate-300 font-medium">{batch.location}</TableCell>
                    
                    {/* Tiến độ Độ khô */}
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                          <div className={`h-full transition-all ${batch.dryness >= 95 ? 'bg-emerald-500' : 'bg-blue-500'}`} style={{ width: `${batch.dryness}%` }} />
                        </div>
                        <span className={`text-sm font-bold ${batch.dryness >= 95 ? 'text-emerald-400' : 'text-blue-400'}`}>{batch.dryness}%</span>
                      </div>
                    </TableCell>
                    
                    <TableCell>{getAIBadge(batch.aiAssessment)}</TableCell>
                    <TableCell>{getQCStatusBadge(batch.qcStatus)}</TableCell>
                    <TableCell className="text-slate-400 text-sm">{batch.completedAt}</TableCell>
                    
                    {/* CỘT HÀNH ĐỘNG: CHỈ CÒN DUYỆT VÀ HỦY */}
                    <TableCell className="text-right">
                      {batch.qcStatus === 'pending' ? (
                        <div className="flex justify-end gap-2">
                          <Button size="sm" className="bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500 hover:text-white border border-emerald-500/30 transition-all">
                            <CheckCircle2 className="w-4 h-4 mr-1.5" /> Duyệt
                          </Button>
                          <Button size="sm" className="bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white border border-rose-500/30 transition-all">
                            <XCircle className="w-4 h-4 mr-1.5" /> Hủy
                          </Button>
                        </div>
                      ) : (
                        <Link to={`/dashboard/batch/${batch.id}`}>
                          <Button variant="ghost" size="sm" className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10">
                            <Eye className="w-4 h-4 mr-1" /> Xem kết quả
                          </Button>
                        </Link>
                      )}
                    </TableCell>

                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          {filteredBatches.length === 0 && (
            <div className="p-12 text-center">
              <ShieldCheck className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-300 font-medium">Không có dữ liệu mẻ bánh</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}