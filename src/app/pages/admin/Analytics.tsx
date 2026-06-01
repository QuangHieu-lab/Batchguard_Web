import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { 
  LineChart, Line, 
  AreaChart, Area,
  BarChart, Bar, 
  PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer 
} from 'recharts';
import { 
  TrendingUp, TrendingDown, 
  Activity, Clock, 
  CheckCircle2, XCircle, DollarSign
} from 'lucide-react';
import { mockDailyStats, allAdminBatches } from '../../data/adminMockData';
import { FarmSelector } from '../../components/admin/FarmSelector';
import { useFarm } from '../../contexts/FarmContext';

// ================= DỮ LIỆU MOCK KẾT HỢP =================

// Tiến độ phơi (Giữ nguyên của bạn)
const dryingProgressData = [
  { time: '06:00', batch1: 0, batch2: 0, batch3: 0 },
  { time: '08:00', batch1: 25, batch2: 15, batch3: 10 },
  { time: '10:00', batch1: 48, batch2: 35, batch3: 28 },
  { time: '12:00', batch1: 68, batch2: 52, batch3: 45 },
  { time: '14:00', batch1: 85, batch2: 70, batch3: 60 },
  { time: '16:00', batch1: 100, batch2: 88, batch3: 75 },
];

// Dữ liệu hao hụt tài chính (QC Focus)
const defectCostData = [
  { month: 'T1', costCrack: 1.2, costMold: 0.8, costDirt: 0.5 },
  { month: 'T2', costCrack: 1.5, costMold: 1.0, costDirt: 0.4 },
  { month: 'T3', costCrack: 0.9, costMold: 1.2, costDirt: 0.6 },
  { month: 'T4', costCrack: 1.1, costMold: 0.5, costDirt: 0.3 },
  { month: 'T5 (Hiện tại)', costCrack: 0.6, costMold: 0.4, costDirt: 0.2 },
];

export default function Analytics() {
  const { selectedFarmId } = useFarm();

  // 1. Lọc mẻ bánh theo khu vực
  const filteredBatches = selectedFarmId
    ? allAdminBatches.filter(b => b.farmId === selectedFarmId)
    : allAdminBatches;

  // 2. Phân loại Nhị phân (Chỉ có Đạt hoặc Hủy, không có Loại 2)
  const totalBatches = filteredBatches.length;
  const activeBatches = filteredBatches.filter(b => b.status === 'active').length;
  const approvedBatches = filteredBatches.filter(b => b.status === 'completed').length; // Đạt chuẩn
  const rejectedBatches = filteredBatches.filter(b => b.status === 'failed').length;    // Hủy bỏ

  const successRate = totalBatches > 0 
    ? ((approvedBatches / (approvedBatches + rejectedBatches)) * 100).toFixed(1) 
    : '0.0';
  
  const avgDryingTime = 285; // phút
  const totalDefectCost = 12500000; // 12.5 Triệu

  // Dữ liệu Biểu đồ Tròn
  const statusDistribution = [
    { name: 'Đạt chuẩn', value: approvedBatches, color: '#10b981' }, // Emerald
    { name: 'Đang phơi', value: activeBatches, color: '#3b82f6' },   // Blue
    { name: 'Hủy bỏ', value: rejectedBatches, color: '#f43f5e' },    // Rose
  ];

  // Custom Tooltip giao diện Dark Neon
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#1e293b] border border-slate-700 p-4 rounded-xl shadow-xl">
          <p className="text-white font-bold mb-2 border-b border-slate-700 pb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-2 mb-1">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
              <span className="text-slate-300 text-sm">{entry.name}:</span>
              <span className="text-white font-bold">{entry.value} {entry.dataKey?.includes('cost') ? 'Tr' : ''}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="p-8 space-y-6">
      {/* ================= HEADER ================= */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Báo cáo Chất lượng & Hiệu suất</h1>
          <p className="text-slate-400 mt-1">Đo lường tiến độ phơi và kiểm soát hao hụt (QC)</p>
        </div>
        <FarmSelector />
      </div>

      {/* ================= 4 THẺ KPI CHÍNH ================= */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Tổng mẻ */}
        <Card className="bg-slate-900 border-slate-800 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Tổng Mẻ</p>
                <p className="text-3xl font-bold text-white mt-2">{totalBatches}</p>
                <div className="flex items-center gap-1 mt-2 text-sm">
                  <TrendingUp className="w-4 h-4 text-blue-400" />
                  <span className="text-blue-400 font-medium">{activeBatches} đang phơi</span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                <Activity className="w-6 h-6 text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tỷ lệ Đạt */}
        <Card className="bg-slate-900 border-slate-800 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Tỷ lệ Đạt chuẩn</p>
                <p className="text-3xl font-bold text-emerald-400 mt-2">{successRate}%</p>
                <div className="flex items-center gap-1 mt-2 text-sm">
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-400 font-medium">+2.5%</span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                <CheckCircle2 className="w-6 h-6 text-emerald-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Mẻ bị Hủy */}
        <Card className="bg-slate-900 border-slate-800 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Mẻ Hủy (Lỗi)</p>
                <p className="text-3xl font-bold text-rose-500 mt-2">{rejectedBatches}</p>
                <div className="flex items-center gap-1 mt-2 text-sm">
                  <TrendingDown className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-400 font-medium">Giảm 2 mẻ</span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-rose-500/10 flex items-center justify-center border border-rose-500/20">
                <XCircle className="w-6 h-6 text-rose-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Hao hụt tài chính */}
        <Card className="bg-rose-950/20 border-rose-900/50 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-rose-400/80 uppercase tracking-wider">Chi phí Hao hụt</p>
                <p className="text-3xl font-bold text-rose-500 mt-2">{(totalDefectCost / 1000000).toFixed(1)}Tr</p>
                <div className="flex items-center gap-1 mt-2 text-sm">
                  <TrendingDown className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-400 font-medium">Tiết kiệm 3Tr (AI)</span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-rose-500/20 flex items-center justify-center border border-rose-500/30">
                <DollarSign className="w-6 h-6 text-rose-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ================= TABS CHỨC NĂNG ================= */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="bg-slate-900 border border-slate-800 p-1 rounded-xl">
          <TabsTrigger value="overview" className="rounded-lg data-[state=active]:bg-blue-600 data-[state=active]:text-white text-slate-400">
            Tổng quan QC
          </TabsTrigger>
          <TabsTrigger value="progress" className="rounded-lg data-[state=active]:bg-blue-600 data-[state=active]:text-white text-slate-400">
            Tiến độ Phơi
          </TabsTrigger>
          <TabsTrigger value="cost" className="rounded-lg data-[state=active]:bg-rose-600 data-[state=active]:text-white text-slate-400">
            Phân tích Hao hụt
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: TỔNG QUAN QC */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Xu hướng Đạt chuẩn */}
            <Card className="lg:col-span-2 bg-slate-900 border-slate-800 shadow-lg">
              <CardHeader>
                <CardTitle className="text-white">Xu hướng Đạt chuẩn theo ngày</CardTitle>
                <CardDescription className="text-slate-400">Tỷ lệ mẻ bánh được duyệt (Loại 1)</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={mockDailyStats.slice().reverse()}>
                    <defs>
                      <linearGradient id="analyticsSuccessGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                    <XAxis 
                      dataKey="date" stroke="#94a3b8" axisLine={false} tickLine={false}
                      tickFormatter={(value) => new Date(value).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })}
                    />
                    <YAxis stroke="#94a3b8" domain={[0, 100]} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="successRate" stroke="#10b981" strokeWidth={3} fill="url(#analyticsSuccessGradient)" name="Tỷ lệ Đạt" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Phân bố Trạng thái */}
            <Card className="bg-slate-900 border-slate-800 shadow-lg">
              <CardHeader>
                <CardTitle className="text-white">Phân bố Trạng thái</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={statusDistribution}
                      cx="50%" cy="50%"
                      innerRadius={50} outerRadius={80}
                      paddingAngle={5}
                      dataKey="value" stroke="none"
                    >
                      {statusDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-3 mt-4">
                  {statusDistribution.map((item, index) => (
                    <div key={index} className="flex items-center justify-between text-sm bg-slate-800/50 p-2.5 rounded-lg border border-slate-700/50">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                        <span className="text-slate-300 font-medium">{item.name}</span>
                      </div>
                      <span className="font-bold text-white">{item.value} mẻ</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Bar Chart: Số lượng Đạt / Hủy */}
          <Card className="bg-slate-900 border-slate-800 shadow-lg">
            <CardHeader>
              <CardTitle className="text-white">Số lượng mẻ Đạt vs Hủy theo ngày</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={mockDailyStats.slice().reverse()}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                  <XAxis 
                    dataKey="date" stroke="#94a3b8" axisLine={false} tickLine={false}
                    tickFormatter={(value) => new Date(value).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })}
                  />
                  <YAxis stroke="#94a3b8" axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ paddingTop: '20px' }} />
                  <Bar dataKey="completed" fill="#10b981" name="Duyệt Đạt" radius={[4, 4, 0, 0]} barSize={30} />
                  <Bar dataKey="failed" fill="#f43f5e" name="Hủy Bỏ" radius={[4, 4, 0, 0]} barSize={30} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 2: TIẾN ĐỘ PHƠI (Giữ nguyên component xịn của bạn) */}
        <TabsContent value="progress" className="space-y-6">
          <Card className="bg-slate-900 border-slate-800 shadow-lg">
            <CardHeader>
              <CardTitle className="text-white">So sánh tiến độ khô giữa các mẻ</CardTitle>
              <CardDescription className="text-slate-400">Giúp phát hiện mẻ nào phơi quá nhanh gây nứt bánh</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={dryingProgressData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                  <XAxis dataKey="time" stroke="#94a3b8" axisLine={false} tickLine={false} />
                  <YAxis stroke="#94a3b8" domain={[0, 100]} axisLine={false} tickLine={false} tickFormatter={(val) => `${val}%`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ paddingTop: '20px' }} />
                  <Line type="monotone" dataKey="batch1" stroke="#3b82f6" strokeWidth={3} name="Mẻ #2024-001" dot={false} activeDot={{ r: 6 }} />
                  <Line type="monotone" dataKey="batch2" stroke="#10b981" strokeWidth={3} name="Mẻ #2024-002" dot={false} activeDot={{ r: 6 }} />
                  <Line type="monotone" dataKey="batch3" stroke="#f59e0b" strokeWidth={3} name="Mẻ #2024-003" dot={false} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Các thẻ chi tiết mẻ */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-slate-900 border-slate-800">
              <CardContent className="p-6">
                <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20 mb-3">Mẻ #2024-001</Badge>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-slate-400">Độ khô hiện tại</span><span className="text-white font-medium">85%</span></div>
                  <div className="flex justify-between"><span className="text-slate-400">Tốc độ khô TB</span><span className="text-white font-medium">10%/h</span></div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-slate-900 border-slate-800">
              <CardContent className="p-6">
                <Badge className="bg-green-500/10 text-green-400 border-green-500/20 mb-3">Mẻ #2024-002</Badge>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-slate-400">Độ khô hiện tại</span><span className="text-white font-medium">65%</span></div>
                  <div className="flex justify-between"><span className="text-slate-400">Tốc độ khô TB</span><span className="text-white font-medium">9.3%/h</span></div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-slate-900 border-slate-800">
              <CardContent className="p-6">
                <Badge className="bg-yellow-500/10 text-yellow-400 border-yellow-500/20 mb-3">Mẻ #2024-003</Badge>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-slate-400">Độ khô hiện tại</span><span className="text-white font-medium">45%</span></div>
                  <div className="flex justify-between"><span className="text-slate-400">Tốc độ khô TB</span><span className="text-white font-medium">6.9%/h</span></div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* TAB 3: PHÂN TÍCH HAO HỤT (CHI PHÍ) */}
        <TabsContent value="cost" className="space-y-6">
          <Card className="bg-slate-900 border-slate-800 shadow-lg">
            <CardHeader>
              <CardTitle className="text-white text-lg">Thiệt hại tài chính theo Loại Lỗi (Triệu VNĐ)</CardTitle>
              <CardDescription className="text-slate-400">Phân rã hao hụt để tìm nguyên nhân gốc rễ</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={defectCostData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                  <XAxis dataKey="month" stroke="#94a3b8" axisLine={false} tickLine={false} />
                  <YAxis stroke="#94a3b8" axisLine={false} tickLine={false} tickFormatter={(val) => `${val}Tr`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ paddingTop: '20px' }} />
                  <Bar dataKey="costCrack" stackId="a" fill="#f43f5e" name="Do Nứt Rách" radius={[0, 0, 4, 4]} maxBarSize={60} />
                  <Bar dataKey="costMold" stackId="a" fill="#f59e0b" name="Do Nấm Mốc" maxBarSize={60} />
                  <Bar dataKey="costDirt" stackId="a" fill="#38bdf8" name="Do Bụi bẩn" radius={[4, 4, 0, 0]} maxBarSize={60} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

      </Tabs>
    </div>
  );
}