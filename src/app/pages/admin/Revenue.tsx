import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
import { 
  TrendingUp, 
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Award,
  Calendar,
  ArrowUpRight
} from 'lucide-react';
import { 
  mockRevenueMetrics, 
  mockDailyRevenue,
  mockMonthlyRevenue,
  mockBatchRevenue,
  BatchRevenue,
  mockYearOverYearRevenue,
  yearOverYearSummary
} from '../../data/adminMockData';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, BarChart, Bar, ComposedChart } from 'recharts';
import { FarmSelector } from '../../components/admin/FarmSelector';
import { useFarm } from '../../contexts/FarmContext';

export default function Revenue() {
  const [period, setPeriod] = useState<'7days' | '30days'>('7days');
  const { selectedFarmId } = useFarm();
  
  // Filter batch revenue by selected farm
  const filteredBatchRevenue = selectedFarmId
    ? mockBatchRevenue.filter(b => b.farmId === selectedFarmId)
    : mockBatchRevenue;

  // Recalculate metrics based on filtered data
  const filteredTotalRevenue = filteredBatchRevenue
    .filter(b => b.status === 'sold')
    .reduce((sum, b) => sum + b.totalRevenue, 0);
  
  const metrics = selectedFarmId
    ? {
        ...mockRevenueMetrics,
        today: filteredTotalRevenue * 0.15,
        week: filteredTotalRevenue * 0.35,
        month: filteredTotalRevenue,
        avgPerBatch: filteredBatchRevenue.length > 0 
          ? filteredTotalRevenue / filteredBatchRevenue.filter(b => b.status === 'sold').length
          : 0,
      }
    : mockRevenueMetrics;
  
  const revenueData = period === '7days' ? mockDailyRevenue : mockMonthlyRevenue;
  
  // Find highest revenue batch and day from filtered data
  const soldBatches = filteredBatchRevenue.filter(b => b.status === 'sold');
  const highestBatch = soldBatches.length > 0
    ? soldBatches.sort((a, b) => b.totalRevenue - a.totalRevenue)[0]
    : null;
  
  const highestDay = [...mockMonthlyRevenue]
    .sort((a, b) => b.revenue - a.revenue)[0];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', { 
      style: 'currency', 
      currency: 'VND',
      minimumFractionDigits: 0 
    }).format(value);
  };

  const formatShortCurrency = (value: number) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    }
    return `${(value / 1000).toFixed(0)}K`;
  };

  const getQualityBadge = (grade: BatchRevenue['qualityGrade']) => {
    switch (grade) {
      case 'A':
        return <Badge className="bg-green-500/10 text-green-400 border-green-500/20">Loại A</Badge>;
      case 'B':
        return <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20">Loại B</Badge>;
      case 'C':
        return <Badge className="bg-yellow-500/10 text-yellow-400 border-yellow-500/20">Loại C</Badge>;
      case 'failed':
        return <Badge className="bg-red-500/10 text-red-400 border-red-500/20">Thất bại</Badge>;
    }
  };

  const getStatusBadge = (status: BatchRevenue['status']) => {
    switch (status) {
      case 'sold':
        return <Badge className="bg-cyan-500/10 text-cyan-400 border-cyan-500/20">Đã bán</Badge>;
      case 'in_stock':
        return <Badge className="bg-orange-500/10 text-orange-400 border-orange-500/20">Trong kho</Badge>;
      case 'failed':
        return <Badge className="bg-red-500/10 text-red-400 border-red-500/20">Hỏng</Badge>;
    }
  };

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Doanh thu</h1>
          <p className="text-slate-400 mt-1">Theo dõi hiệu quả kinh doanh và doanh thu</p>
        </div>
        <FarmSelector />
      </div>

      {/* Revenue Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-400">Doanh thu hôm nay</p>
                <h3 className="text-2xl font-bold text-white mt-2">
                  {formatShortCurrency(metrics.today)}
                </h3>
                <div className="flex items-center gap-1 mt-2 text-sm">
                  <TrendingUp className="w-4 h-4 text-green-400" />
                  <span className="text-green-400">+{metrics.growth.today.toFixed(1)}%</span>
                  <span className="text-slate-500">vs hôm qua</span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-lg bg-cyan-500/10 flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-cyan-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-400">Doanh thu tuần</p>
                <h3 className="text-2xl font-bold text-white mt-2">
                  {formatShortCurrency(metrics.week)}
                </h3>
                <div className="flex items-center gap-1 mt-2 text-sm">
                  <TrendingUp className="w-4 h-4 text-green-400" />
                  <span className="text-green-400">+{metrics.growth.week.toFixed(1)}%</span>
                  <span className="text-slate-500">vs tuần trước</span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <ShoppingCart className="w-6 h-6 text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-400">Doanh thu tháng</p>
                <h3 className="text-2xl font-bold text-white mt-2">
                  {formatShortCurrency(metrics.month)}
                </h3>
                <div className="flex items-center gap-1 mt-2 text-sm">
                  <TrendingUp className="w-4 h-4 text-green-400" />
                  <span className="text-green-400">+{metrics.growth.month.toFixed(1)}%</span>
                  <span className="text-slate-500">vs tháng trước</span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-lg bg-green-500/10 flex items-center justify-center">
                <Calendar className="w-6 h-6 text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-400">Giá trị TB/Mẻ</p>
                <h3 className="text-2xl font-bold text-white mt-2">
                  {formatShortCurrency(metrics.avgPerBatch)}
                </h3>
                <div className="flex items-center gap-1 mt-2 text-sm">
                  <Award className="w-4 h-4 text-purple-400" />
                  <span className="text-purple-400">{metrics.conversionRate}%</span>
                  <span className="text-slate-500">chuyển đổi</span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-lg bg-purple-500/10 flex items-center justify-center">
                <Award className="w-6 h-6 text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Chart */}
      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white">Biểu đồ doanh thu</CardTitle>
            <div className="flex gap-2">
              <Button
                variant={period === '7days' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setPeriod('7days')}
                className={period === '7days' ? 'bg-blue-600' : 'bg-slate-800 border-slate-700 text-slate-300'}
              >
                7 ngày
              </Button>
              <Button
                variant={period === '30days' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setPeriod('30days')}
                className={period === '30days' ? 'bg-blue-600' : 'bg-slate-800 border-slate-700 text-slate-300'}
              >
                30 ngày
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={revenueData}>
              <defs>
                <linearGradient id="revenueChartGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} key="stop1"/>
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} key="stop2"/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis 
                dataKey="date" 
                stroke="#94a3b8"
                tickFormatter={(value) => {
                  const date = new Date(value);
                  return `${date.getDate()}/${date.getMonth() + 1}`;
                }}
              />
              <YAxis 
                stroke="#94a3b8"
                tickFormatter={(value) => formatShortCurrency(value)}
              />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                labelStyle={{ color: '#f1f5f9' }}
                formatter={(value: number) => [formatCurrency(value), 'Doanh thu']}
                labelFormatter={(value) => new Date(value).toLocaleDateString('vi-VN')}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="revenue" 
                stroke="#06b6d4" 
                strokeWidth={3}
                dot={{ fill: '#06b6d4', r: 4 }}
                activeDot={{ r: 6 }}
                name="Doanh thu"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Highlights & Batch Revenue */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Highlights */}
        <div className="space-y-4">
          <Card className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border-cyan-500/20">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-cyan-500/20 flex items-center justify-center">
                  <Award className="w-5 h-5 text-cyan-400" />
                </div>
                <h3 className="text-white font-semibold">Mẻ bánh cao nhất</h3>
              </div>
              <div className="space-y-2">
                <p className="text-2xl font-bold text-cyan-400">
                  {highestBatch ? formatCurrency(highestBatch.totalRevenue) : '-'}
                </p>
                <p className="text-sm text-slate-300">
                  {highestBatch ? highestBatch.batchName : '-'}
                </p>
                <div className="flex items-center gap-2">
                  {highestBatch ? getQualityBadge(highestBatch.qualityGrade) : '-'}
                  <span className="text-xs text-slate-400">
                    {highestBatch ? `${highestBatch.quantity}kg` : '-'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/20">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-green-400" />
                </div>
                <h3 className="text-white font-semibold">Ngày cao nhất</h3>
              </div>
              <div className="space-y-2">
                <p className="text-2xl font-bold text-green-400">
                  {formatCurrency(highestDay.revenue)}
                </p>
                <p className="text-sm text-slate-300">
                  {new Date(highestDay.date).toLocaleDateString('vi-VN', { 
                    day: '2-digit', 
                    month: 'long', 
                    year: 'numeric' 
                  })}
                </p>
                <p className="text-xs text-slate-400">{highestDay.batches} mẻ bánh đã bán</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-800">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                  <ArrowUpRight className="w-5 h-5 text-purple-400" />
                </div>
                <h3 className="text-white font-semibold">Tỷ lệ chuyển đổi</h3>
              </div>
              <div className="space-y-3">
                <p className="text-3xl font-bold text-purple-400">{metrics.conversionRate}%</p>
                <p className="text-sm text-slate-400">Batch đạt chuẩn → Bán thành công</p>
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all"
                    style={{ width: `${metrics.conversionRate}%` }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Batch Revenue Table */}
        <Card className="lg:col-span-2 bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white">Doanh thu theo mẻ bánh</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-800 hover:bg-slate-800/50">
                    <TableHead className="text-slate-400">Mã mẻ</TableHead>
                    <TableHead className="text-slate-400">Chất lượng</TableHead>
                    <TableHead className="text-slate-400">Trạng thái</TableHead>
                    <TableHead className="text-slate-400">Số lượng</TableHead>
                    <TableHead className="text-slate-400">Giá/kg</TableHead>
                    <TableHead className="text-slate-400 text-right">Doanh thu</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBatchRevenue.slice(0, 8).map((batch) => (
                    <TableRow 
                      key={batch.id}
                      className="border-slate-800 hover:bg-slate-800/50"
                    >
                      <TableCell className="font-medium text-white">{batch.batchName}</TableCell>
                      <TableCell>{getQualityBadge(batch.qualityGrade)}</TableCell>
                      <TableCell>{getStatusBadge(batch.status)}</TableCell>
                      <TableCell className="text-slate-300">{batch.quantity}kg</TableCell>
                      <TableCell className="text-slate-300">
                        {batch.pricePerKg > 0 ? formatCurrency(batch.pricePerKg) : '-'}
                      </TableCell>
                      <TableCell className="text-right">
                        {batch.totalRevenue > 0 ? (
                          <span className="font-semibold text-cyan-400">
                            {formatCurrency(batch.totalRevenue)}
                          </span>
                        ) : (
                          <span className="text-slate-500">-</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Year-over-Year Comparison */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">So sánh doanh thu năm 2026 vs 2025</h2>
            <p className="text-slate-400 mt-1">Phân tích tăng trưởng và hiệu suất theo từng tháng</p>
          </div>
        </div>

        {/* YoY Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/20">
            <CardContent className="p-6">
              <p className="text-sm text-slate-400 mb-2">Tổng doanh thu YTD 2026</p>
              <p className="text-2xl font-bold text-blue-400">
                {formatShortCurrency(yearOverYearSummary.totalRevenue2026)}
              </p>
              <p className="text-xs text-slate-500 mt-1">Jan - Mar 2026 (3 tháng)</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-slate-700/10 to-slate-600/10 border-slate-600/20">
            <CardContent className="p-6">
              <p className="text-sm text-slate-400 mb-2">Tổng doanh thu YTD 2025</p>
              <p className="text-2xl font-bold text-slate-400">
                {formatShortCurrency(yearOverYearSummary.ytdRevenue2025)}
              </p>
              <p className="text-xs text-slate-500 mt-1">Jan - Mar 2025 (3 tháng)</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/20">
            <CardContent className="p-6">
              <p className="text-sm text-slate-400 mb-2">Tăng trưởng YTD</p>
              <div className="flex items-center gap-2">
                <p className="text-2xl font-bold text-green-400">
                  +{yearOverYearSummary.ytdGrowth.toFixed(1)}%
                </p>
                <TrendingUp className="w-5 h-5 text-green-400" />
              </div>
              <p className="text-xs text-slate-500 mt-1">
                +{formatShortCurrency(yearOverYearSummary.totalRevenue2026 - yearOverYearSummary.ytdRevenue2025)}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/20">
            <CardContent className="p-6">
              <p className="text-sm text-slate-400 mb-2">TB doanh thu/mẻ 2026</p>
              <p className="text-2xl font-bold text-purple-400">
                {formatShortCurrency(yearOverYearSummary.avgRevenue2026)}
              </p>
              <div className="flex items-center gap-1 mt-1">
                <TrendingUp className="w-3 h-3 text-green-400" />
                <p className="text-xs text-green-400">
                  +{((yearOverYearSummary.avgRevenue2026 / yearOverYearSummary.avgRevenue2025 - 1) * 100).toFixed(1)}%
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* YoY Comparison Chart */}
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white">Biểu đồ so sánh doanh thu theo tháng</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <ComposedChart data={mockYearOverYearRevenue}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis 
                  dataKey="month" 
                  stroke="#94a3b8"
                />
                <YAxis 
                  yAxisId="left"
                  stroke="#94a3b8"
                  tickFormatter={(value) => formatShortCurrency(value)}
                />
                <YAxis 
                  yAxisId="right"
                  orientation="right"
                  stroke="#94a3b8"
                  tickFormatter={(value) => `${value}%`}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                  labelStyle={{ color: '#f1f5f9' }}
                  formatter={(value: number, name: string) => {
                    if (name === 'Tăng trưởng') return [`${value.toFixed(1)}%`, name];
                    return [formatCurrency(value), name];
                  }}
                />
                <Legend />
                <Bar 
                  yAxisId="left"
                  dataKey="currentYear" 
                  fill="#3b82f6" 
                  name="Năm 2026"
                  radius={[8, 8, 0, 0]}
                />
                <Bar 
                  yAxisId="left"
                  dataKey="previousYear" 
                  fill="#64748b" 
                  name="Năm 2025"
                  radius={[8, 8, 0, 0]}
                />
                <Line 
                  yAxisId="right"
                  type="monotone" 
                  dataKey="growth" 
                  stroke="#10b981" 
                  strokeWidth={3}
                  name="Tăng trưởng"
                  dot={{ fill: '#10b981', r: 5 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* YoY Comparison Table */}
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white">Bảng so sánh chi tiết theo tháng</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-800 hover:bg-slate-800/50">
                    <TableHead className="text-slate-400">Tháng</TableHead>
                    <TableHead className="text-slate-400 text-right">Doanh thu 2026</TableHead>
                    <TableHead className="text-slate-400 text-right">Số mẻ 2026</TableHead>
                    <TableHead className="text-slate-400 text-right">Doanh thu 2025</TableHead>
                    <TableHead className="text-slate-400 text-right">Số mẻ 2025</TableHead>
                    <TableHead className="text-slate-400 text-right">Chênh lệch</TableHead>
                    <TableHead className="text-slate-400 text-right">% Tăng trưởng</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockYearOverYearRevenue.map((item) => {
                    const difference = item.currentYear - item.previousYear;
                    const isCompleted = item.currentYear > 0;
                    
                    return (
                      <TableRow 
                        key={item.monthNumber}
                        className={`border-slate-800 hover:bg-slate-800/50 ${!isCompleted ? 'opacity-40' : ''}`}
                      >
                        <TableCell className="font-medium text-white">{item.month}</TableCell>
                        <TableCell className="text-right">
                          {isCompleted ? (
                            <span className="text-blue-400 font-semibold">
                              {formatCurrency(item.currentYear)}
                            </span>
                          ) : (
                            <span className="text-slate-600">Chưa có dữ liệu</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right text-slate-300">
                          {isCompleted ? item.batches2026 : '-'}
                        </TableCell>
                        <TableCell className="text-right text-slate-400">
                          {formatCurrency(item.previousYear)}
                        </TableCell>
                        <TableCell className="text-right text-slate-400">
                          {item.batches2025}
                        </TableCell>
                        <TableCell className="text-right">
                          {isCompleted ? (
                            <span className={difference >= 0 ? 'text-green-400' : 'text-red-400'}>
                              {difference >= 0 ? '+' : ''}{formatCurrency(difference)}
                            </span>
                          ) : (
                            <span className="text-slate-600">-</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          {isCompleted && item.growth > 0 ? (
                            <div className="flex items-center justify-end gap-1">
                              {item.growth >= 0 ? (
                                <>
                                  <TrendingUp className="w-4 h-4 text-green-400" />
                                  <span className="font-semibold text-green-400">+{item.growth.toFixed(1)}%</span>
                                </>
                              ) : (
                                <>
                                  <TrendingDown className="w-4 h-4 text-red-400" />
                                  <span className="font-semibold text-red-400">{item.growth.toFixed(1)}%</span>
                                </>
                              )}
                            </div>
                          ) : (
                            <span className="text-slate-600">-</span>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  
                  {/* Summary Row */}
                  <TableRow className="border-slate-800 bg-slate-800/30 font-bold">
                    <TableCell className="text-white">Tổng cộng (YTD)</TableCell>
                    <TableCell className="text-right text-blue-400">
                      {formatCurrency(yearOverYearSummary.totalRevenue2026)}
                    </TableCell>
                    <TableCell className="text-right text-slate-300">
                      {yearOverYearSummary.totalBatches2026}
                    </TableCell>
                    <TableCell className="text-right text-slate-400">
                      {formatCurrency(yearOverYearSummary.ytdRevenue2025)}
                    </TableCell>
                    <TableCell className="text-right text-slate-400">
                      {yearOverYearSummary.ytdBatches2025}
                    </TableCell>
                    <TableCell className="text-right text-green-400">
                      +{formatCurrency(yearOverYearSummary.totalRevenue2026 - yearOverYearSummary.ytdRevenue2025)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <TrendingUp className="w-4 h-4 text-green-400" />
                        <span className="text-green-400">+{yearOverYearSummary.ytdGrowth.toFixed(1)}%</span>
                      </div>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Insights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-slate-900 border-slate-800">
            <CardContent className="p-6">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <h4 className="text-white font-semibold mb-2">Tháng tăng trưởng mạnh nhất</h4>
                  <p className="text-2xl font-bold text-green-400">Tháng 2</p>
                  <p className="text-sm text-slate-400 mt-1">+24.9% so với cùng kỳ năm trước</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-800">
            <CardContent className="p-6">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                  <ShoppingCart className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <h4 className="text-white font-semibold mb-2">Tăng số lượng mẻ bánh</h4>
                  <p className="text-2xl font-bold text-blue-400">+{yearOverYearSummary.totalBatches2026 - yearOverYearSummary.ytdBatches2025}</p>
                  <p className="text-sm text-slate-400 mt-1">
                    +{(((yearOverYearSummary.totalBatches2026 - yearOverYearSummary.ytdBatches2025) / yearOverYearSummary.ytdBatches2025) * 100).toFixed(1)}% mẻ bánh trong Q1
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-800">
            <CardContent className="p-6">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center flex-shrink-0">
                  <Award className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <h4 className="text-white font-semibold mb-2">Cải thiện chất lượng</h4>
                  <p className="text-2xl font-bold text-purple-400">
                    +{formatShortCurrency(yearOverYearSummary.avgRevenue2026 - yearOverYearSummary.avgRevenue2025)}
                  </p>
                  <p className="text-sm text-slate-400 mt-1">Tăng giá trị trung bình mỗi mẻ</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}