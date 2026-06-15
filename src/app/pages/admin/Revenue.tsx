import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
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
  Users,
  Calendar,
  Crown,
  CheckCircle2,
  CreditCard
} from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, Legend, Bar, ComposedChart 
} from 'recharts';

// =========================================================================
// 🚀 DỮ LIỆU MOCK ĐỘC QUYỀN CHO GÓI PREMIUM 6 THÁNG (Đồng bộ với Mobile)
// =========================================================================
const PREMIUM_PRICE = 1200000;

const mockPremiumMetrics = {
  today: PREMIUM_PRICE * 3,     
  week: PREMIUM_PRICE * 25,     
  month: PREMIUM_PRICE * 115,   
  totalSubscribers: 342,
  growth: { today: 12.5, week: 5.2, month: 18.4 }
};

const mockPremiumTransactions = [
  { id: 'tx1', user: 'Nguyễn Văn A', email: 'a.nguyen@farm.com', amount: PREMIUM_PRICE, date: '14/06/2026 09:30', status: 'success' },
  { id: 'tx2', user: 'Trần Thị B', email: 'b.tran@agri.com', amount: PREMIUM_PRICE, date: '14/06/2026 08:15', status: 'success' },
  { id: 'tx3', user: 'Lê Văn C', email: 'c.le@vietfarm.vn', amount: PREMIUM_PRICE, date: '13/06/2026 16:45', status: 'success' },
  { id: 'tx4', user: 'Phạm Thị D', email: 'd.pham@fresh.com', amount: PREMIUM_PRICE, date: '13/06/2026 10:20', status: 'success' },
  { id: 'tx5', user: 'Hoàng Văn E', email: 'e.hoang@eco.vn', amount: PREMIUM_PRICE, date: '12/06/2026 14:00', status: 'success' },
  { id: 'tx6', user: 'Lý Thị F', email: 'f.ly@gmail.com', amount: PREMIUM_PRICE, date: '12/06/2026 09:15', status: 'success' },
  { id: 'tx7', user: 'Vũ Văn G', email: 'g.vu@nongnghiep.vn', amount: PREMIUM_PRICE, date: '11/06/2026 15:30', status: 'success' },
];

const mockDailyRevenue = [
  { date: '2026-06-08', revenue: PREMIUM_PRICE * 2 },
  { date: '2026-06-09', revenue: PREMIUM_PRICE * 3 },
  { date: '2026-06-10', revenue: PREMIUM_PRICE * 1 },
  { date: '2026-06-11', revenue: PREMIUM_PRICE * 5 },
  { date: '2026-06-12', revenue: PREMIUM_PRICE * 4 },
  { date: '2026-06-13', revenue: PREMIUM_PRICE * 8 },
  { date: '2026-06-14', revenue: PREMIUM_PRICE * 3 },
];

const mockMonthlyRevenue = [
  { date: '2026-01-01', revenue: PREMIUM_PRICE * 45 },
  { date: '2026-02-01', revenue: PREMIUM_PRICE * 52 },
  { date: '2026-03-01', revenue: PREMIUM_PRICE * 68 },
  { date: '2026-04-01', revenue: PREMIUM_PRICE * 85 },
  { date: '2026-05-01', revenue: PREMIUM_PRICE * 95 },
  { date: '2026-06-01', revenue: PREMIUM_PRICE * 115 },
];

const mockYearOverYearRevenue = [
  { month: 'Jan', monthNumber: 1, currentYear: PREMIUM_PRICE * 45, previousYear: PREMIUM_PRICE * 20, subs2026: 45, subs2025: 20, growth: 125.0 },
  { month: 'Feb', monthNumber: 2, currentYear: PREMIUM_PRICE * 52, previousYear: PREMIUM_PRICE * 25, subs2026: 52, subs2025: 25, growth: 108.0 },
  { month: 'Mar', monthNumber: 3, currentYear: PREMIUM_PRICE * 68, previousYear: PREMIUM_PRICE * 30, subs2026: 68, subs2025: 30, growth: 126.7 },
  { month: 'Apr', monthNumber: 4, currentYear: PREMIUM_PRICE * 85, previousYear: PREMIUM_PRICE * 40, subs2026: 85, subs2025: 40, growth: 112.5 },
  { month: 'May', monthNumber: 5, currentYear: PREMIUM_PRICE * 95, previousYear: PREMIUM_PRICE * 55, subs2026: 95, subs2025: 55, growth: 72.7 },
  { month: 'Jun', monthNumber: 6, currentYear: PREMIUM_PRICE * 115, previousYear: PREMIUM_PRICE * 60, subs2026: 115, subs2025: 60, growth: 91.7 },
];

const yearOverYearSummary = {
  totalRevenue2026: mockYearOverYearRevenue.reduce((acc, curr) => acc + curr.currentYear, 0),
  ytdRevenue2025: mockYearOverYearRevenue.reduce((acc, curr) => acc + curr.previousYear, 0),
  totalSubs2026: mockYearOverYearRevenue.reduce((acc, curr) => acc + curr.subs2026, 0),
  ytdSubs2025: mockYearOverYearRevenue.reduce((acc, curr) => acc + curr.subs2025, 0),
  get ytdGrowth() { return ((this.totalRevenue2026 / this.ytdRevenue2025) - 1) * 100 }
};

export default function Revenue() {
  const [period, setPeriod] = useState<'7days' | '30days'>('7days');
  const revenueData = period === '7days' ? mockDailyRevenue : mockMonthlyRevenue;

  // Format Helpers
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', { 
      style: 'currency', 
      currency: 'VND',
      minimumFractionDigits: 0 
    }).format(value);
  };

  const formatShortCurrency = (value: number) => {
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
    return `${(value / 1000).toFixed(0)}K`;
  };

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Doanh thu Premium</h1>
          <p className="text-amber-400 font-medium mt-1">Quản lý giao dịch và tăng trưởng Subscriptions (Gói 6 tháng)</p>
        </div>
      </div>

      {/* Revenue Summary (4 Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-400">Doanh thu hôm nay</p>
                <h3 className="text-2xl font-bold text-white mt-2">
                  {formatShortCurrency(mockPremiumMetrics.today)}
                </h3>
                <div className="flex items-center gap-1 mt-2 text-sm">
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-400">+{mockPremiumMetrics.growth.today}%</span>
                  <span className="text-slate-500">vs hôm qua</span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-lg bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
                <DollarSign className="w-6 h-6 text-amber-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-400">Doanh thu tuần này</p>
                <h3 className="text-2xl font-bold text-white mt-2">
                  {formatShortCurrency(mockPremiumMetrics.week)}
                </h3>
                <div className="flex items-center gap-1 mt-2 text-sm">
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-400">+{mockPremiumMetrics.growth.week}%</span>
                  <span className="text-slate-500">vs tuần trước</span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-lg bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
                <Calendar className="w-6 h-6 text-amber-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-400">Doanh thu tháng này</p>
                <h3 className="text-2xl font-bold text-white mt-2">
                  {formatShortCurrency(mockPremiumMetrics.month)}
                </h3>
                <div className="flex items-center gap-1 mt-2 text-sm">
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-400">+{mockPremiumMetrics.growth.month}%</span>
                  <span className="text-slate-500">vs tháng trước</span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-lg bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
                <TrendingUp className="w-6 h-6 text-amber-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-400">Tổng KH Premium</p>
                <h3 className="text-2xl font-bold text-white mt-2">
                  {mockPremiumMetrics.totalSubscribers}
                </h3>
                <div className="flex items-center gap-1 mt-2 text-sm">
                  <span className="text-amber-400 font-medium">Người dùng đang Active</span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-lg bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
                <Users className="w-6 h-6 text-amber-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Revenue Chart */}
      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white">Tăng trưởng doanh thu</CardTitle>
            <div className="flex gap-2 bg-slate-800 p-1 rounded-lg">
              <Button
                variant={period === '7days' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setPeriod('7days')}
                className={period === '7days' ? 'bg-amber-500 text-slate-900 hover:bg-amber-400' : 'text-slate-400 hover:text-white'}
              >
                7 ngày
              </Button>
              <Button
                variant={period === '30days' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setPeriod('30days')}
                className={period === '30days' ? 'bg-amber-500 text-slate-900 hover:bg-amber-400' : 'text-slate-400 hover:text-white'}
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
                  <stop offset="5%" stopColor="#fbbf24" stopOpacity={0.3} key="stop1"/>
                  <stop offset="95%" stopColor="#fbbf24" stopOpacity={0} key="stop2"/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
              <XAxis 
                dataKey="date" 
                stroke="#94a3b8"
                tickFormatter={(value) => {
                  const date = new Date(value);
                  return period === '7days' 
                    ? `${date.getDate()}/${date.getMonth() + 1}`
                    : `Tháng ${date.getMonth() + 1}`;
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
                stroke="#fbbf24" 
                strokeWidth={4}
                dot={{ fill: '#fbbf24', strokeWidth: 2, r: 4, stroke: '#1e293b' }}
                activeDot={{ r: 6, strokeWidth: 0 }}
                name="Doanh thu"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Transactions Table */}
      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center justify-between">
            <span>Lịch sử giao dịch mua gói</span>
            <span className="text-sm font-normal text-slate-400">Chỉ gói Premium 6 Tháng</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-slate-800 hover:bg-slate-800/50">
                  <TableHead className="text-slate-400">Khách hàng</TableHead>
                  <TableHead className="text-slate-400">Email</TableHead>
                  <TableHead className="text-slate-400">Gói đăng ký</TableHead>
                  <TableHead className="text-slate-400">Trạng thái</TableHead>
                  <TableHead className="text-slate-400">Thời gian</TableHead>
                  <TableHead className="text-slate-400 text-right">Số tiền</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockPremiumTransactions.map((tx) => (
                  <TableRow key={tx.id} className="border-slate-800 hover:bg-slate-800/50">
                    <TableCell className="font-medium text-white">{tx.user}</TableCell>
                    <TableCell className="text-slate-400">{tx.email}</TableCell>
                    <TableCell>
                      <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/20 flex w-fit items-center gap-1.5">
                        <Crown className="w-3 h-3" />
                        Premium (6T)
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 text-emerald-400">
                        <CheckCircle2 className="w-4 h-4" />
                        <span className="text-sm">Thành công</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-slate-400 text-sm">{tx.date}</TableCell>
                    <TableCell className="text-right">
                      <span className="font-bold text-amber-400 text-base">
                        +{formatCurrency(tx.amount)}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Year-over-Year Comparison */}
      <div className="space-y-6 pt-4">
        <div>
          <h2 className="text-2xl font-bold text-white">So sánh tăng trưởng YoY (2026 vs 2025)</h2>
          <p className="text-slate-400 mt-1">Phân tích lượng người dùng đăng ký mới theo từng tháng</p>
        </div>

        {/* YoY Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/20">
            <CardContent className="p-6">
              <p className="text-sm text-slate-400 mb-2">Doanh thu YTD 2026</p>
              <p className="text-3xl font-bold text-blue-400">
                {formatShortCurrency(yearOverYearSummary.totalRevenue2026)}
              </p>
              <p className="text-xs text-slate-500 mt-1">Lũy kế 6 tháng đầu năm</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-slate-700/10 to-slate-600/10 border-slate-600/20">
            <CardContent className="p-6">
              <p className="text-sm text-slate-400 mb-2">Doanh thu YTD 2025</p>
              <p className="text-3xl font-bold text-slate-400">
                {formatShortCurrency(yearOverYearSummary.ytdRevenue2025)}
              </p>
              <p className="text-xs text-slate-500 mt-1">Lũy kế 6 tháng đầu năm</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/20">
            <CardContent className="p-6">
              <p className="text-sm text-slate-400 mb-2">Tăng trưởng doanh thu</p>
              <div className="flex items-center gap-2">
                <p className="text-3xl font-bold text-green-400">
                  +{yearOverYearSummary.ytdGrowth.toFixed(1)}%
                </p>
                <TrendingUp className="w-6 h-6 text-green-400" />
              </div>
              <p className="text-sm text-green-400/80 mt-1 font-medium">
                +{formatShortCurrency(yearOverYearSummary.totalRevenue2026 - yearOverYearSummary.ytdRevenue2025)} so với năm trước
              </p>
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
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
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
                  fill="#fbbf24" 
                  name="Năm 2026"
                  radius={[6, 6, 0, 0]}
                  barSize={40}
                />
                <Bar 
                  yAxisId="left"
                  dataKey="previousYear" 
                  fill="#64748b" 
                  name="Năm 2025"
                  radius={[6, 6, 0, 0]}
                  barSize={40}
                />
                <Line 
                  yAxisId="right"
                  type="monotone" 
                  dataKey="growth" 
                  stroke="#10b981" 
                  strokeWidth={3}
                  name="Tăng trưởng"
                  dot={{ fill: '#10b981', r: 5, strokeWidth: 0 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* YoY Comparison Table */}
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white">Chi tiết đăng ký Premium theo tháng</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-800 hover:bg-slate-800/50">
                    <TableHead className="text-slate-400">Tháng</TableHead>
                    <TableHead className="text-slate-400 text-right">Doanh thu 2026</TableHead>
                    <TableHead className="text-slate-400 text-center">User Đăng ký (2026)</TableHead>
                    <TableHead className="text-slate-400 text-right">Doanh thu 2025</TableHead>
                    <TableHead className="text-slate-400 text-center">User Đăng ký (2025)</TableHead>
                    <TableHead className="text-slate-400 text-right">Chênh lệch</TableHead>
                    <TableHead className="text-slate-400 text-right">% Tăng trưởng</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockYearOverYearRevenue.map((item) => {
                    const difference = item.currentYear - item.previousYear;
                    
                    return (
                      <TableRow 
                        key={item.monthNumber}
                        className="border-slate-800 hover:bg-slate-800/50"
                      >
                        <TableCell className="font-medium text-white">{item.month}</TableCell>
                        <TableCell className="text-right text-amber-400 font-semibold">
                          {formatCurrency(item.currentYear)}
                        </TableCell>
                        <TableCell className="text-center text-slate-300">
                          <Badge variant="outline" className="border-slate-600 bg-slate-800/50 text-slate-300">
                            <Users className="w-3 h-3 mr-1" /> {item.subs2026}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right text-slate-400">
                          {formatCurrency(item.previousYear)}
                        </TableCell>
                        <TableCell className="text-center text-slate-400">
                          <Badge variant="outline" className="border-slate-700 bg-transparent text-slate-500">
                            <Users className="w-3 h-3 mr-1" /> {item.subs2025}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <span className={difference >= 0 ? 'text-emerald-400' : 'text-red-400'}>
                            {difference >= 0 ? '+' : ''}{formatCurrency(difference)}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            {item.growth >= 0 ? (
                              <>
                                <TrendingUp className="w-4 h-4 text-emerald-400" />
                                <span className="font-semibold text-emerald-400">+{item.growth.toFixed(1)}%</span>
                              </>
                            ) : (
                              <>
                                <TrendingDown className="w-4 h-4 text-red-400" />
                                <span className="font-semibold text-red-400">{item.growth.toFixed(1)}%</span>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  
                  {/* Summary Row */}
                  <TableRow className="border-slate-800 bg-slate-800/30 font-bold">
                    <TableCell className="text-white">Tổng cộng (6 Tháng)</TableCell>
                    <TableCell className="text-right text-amber-400">
                      {formatCurrency(yearOverYearSummary.totalRevenue2026)}
                    </TableCell>
                    <TableCell className="text-center text-slate-300">
                      {yearOverYearSummary.totalSubs2026} Users
                    </TableCell>
                    <TableCell className="text-right text-slate-400">
                      {formatCurrency(yearOverYearSummary.ytdRevenue2025)}
                    </TableCell>
                    <TableCell className="text-center text-slate-400">
                      {yearOverYearSummary.ytdSubs2025} Users
                    </TableCell>
                    <TableCell className="text-right text-emerald-400">
                      +{formatCurrency(yearOverYearSummary.totalRevenue2026 - yearOverYearSummary.ytdRevenue2025)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <TrendingUp className="w-4 h-4 text-emerald-400" />
                        <span className="text-emerald-400">+{yearOverYearSummary.ytdGrowth.toFixed(1)}%</span>
                      </div>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}