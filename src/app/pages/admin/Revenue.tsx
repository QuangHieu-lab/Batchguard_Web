import { useState, useEffect } from 'react';
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
  Activity,
  XCircle,
  Clock
} from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, Legend, Bar, ComposedChart 
} from 'recharts';
import { adminApi } from '../../../services/endpoints';
import { toast } from 'sonner';

const PREMIUM_PRICE = 10000; // Giá trị dự phòng nếu Backend không trả về field amount

export default function Revenue() {
  const [period, setPeriod] = useState<'7days' | '30days'>('7days');
  const [loading, setLoading] = useState(true);
  
  // State dữ liệu thật 100%
  const [transactions, setTransactions] = useState<any[]>([]);
  const [metrics, setMetrics] = useState({
    today: 0,
    week: 0,
    month: 0,
    totalSubscribers: 0,
    growth: { today: 0, week: 0, month: 0 }
  });

  // State rỗng chờ API đổ dữ liệu vào
  const [dailyRevenue, setDailyRevenue] = useState<any[]>([]);
  const [monthlyRevenue, setMonthlyRevenue] = useState<any[]>([]);
  const [yoyRevenue, setYoyRevenue] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // 🚀 1. LẤY DỮ LIỆU ĐƠN HÀNG
        const subsRes: any = await adminApi.getSubscriptions();
        const subsData = subsRes?.data || subsRes;
        
        if (subsData && Array.isArray(subsData)) {
          const sortedData = subsData.sort((a, b) => {
            const dateA = new Date(a.created_at || a.paid_at || 0).getTime();
            const dateB = new Date(b.created_at || b.paid_at || 0).getTime();
            return dateB - dateA;
          });

          const mappedTxs = sortedData.map((s: any) => ({
            id: s.id || s.order_code || Math.random().toString(),
            user: s.user?.name || s.account_name || s.user_name || 'Khách hàng',
            email: s.user?.email || s.email || 'N/A', 
            amount: s.amount || PREMIUM_PRICE,
            date: new Date(s.paid_at || s.created_at || new Date()).toLocaleString('vi-VN'),
            status: s.status || s.payment_status || 'pending'
          }));

          setTransactions(mappedTxs);

          const successfulTxs = mappedTxs.filter(tx => tx.status === 'paid' || tx.status === 'success');
          
          setMetrics(prev => ({
            ...prev,
            totalSubscribers: successfulTxs.length, 
          }));
        }

        // 🚀 2. LẤY THỐNG KÊ DOANH THU VÀ BIỂU ĐỒ
        try {
          const statsRes: any = await adminApi.getRevenueStatistics();
          const statsData = statsRes?.data || statsRes;
          
          if (statsData) {
            // Cập nhật card chỉ số
            setMetrics(prev => ({
              ...prev,
              today: statsData.today ?? prev.today,
              week: statsData.week ?? prev.week,
              month: statsData.month ?? prev.month,
              growth: statsData.growth ?? prev.growth
            }));

            // Cập nhật dữ liệu biểu đồ (Backend cần trả về các mảng tương ứng)
            if (statsData.daily) setDailyRevenue(statsData.daily);
            if (statsData.monthly) setMonthlyRevenue(statsData.monthly);
            if (statsData.yoy) setYoyRevenue(statsData.yoy);
          }
        } catch(e) {
          console.warn("Không lấy được dữ liệu thống kê doanh thu", e);
        }

      } catch (error) {
        toast.error("Lỗi khi tải dữ liệu người dùng Premium.");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const revenueDataChart = period === '7days' ? dailyRevenue : monthlyRevenue;

  // Tính toán an toàn, tránh lỗi NaN khi mảng rỗng
  const yearOverYearSummary = {
    totalRevenue2026: yoyRevenue.reduce((acc, curr) => acc + (curr.currentYear || 0), 0),
    ytdRevenue2025: yoyRevenue.reduce((acc, curr) => acc + (curr.previousYear || 0), 0),
    totalSubs2026: yoyRevenue.reduce((acc, curr) => acc + (curr.subs2026 || 0), 0),
    ytdSubs2025: yoyRevenue.reduce((acc, curr) => acc + (curr.subs2025 || 0), 0),
    get ytdGrowth() { 
      if (this.ytdRevenue2025 === 0) return 0; // Bảo vệ chia cho 0
      return ((this.totalRevenue2026 / this.ytdRevenue2025) - 1) * 100;
    }
  };

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

  const renderStatus = (status: string) => {
    if (status === 'paid' || status === 'success') {
      return (
        <div className="flex items-center gap-1.5 text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded w-fit">
          <CheckCircle2 className="w-4 h-4" />
          <span className="text-sm font-medium">Đã thanh toán</span>
        </div>
      );
    }
    if (status === 'pending') {
      return (
        <div className="flex items-center gap-1.5 text-amber-400 bg-amber-400/10 px-2 py-1 rounded w-fit">
          <Clock className="w-4 h-4 animate-pulse" />
          <span className="text-sm font-medium">Chờ thanh toán</span>
        </div>
      );
    }
    return (
      <div className="flex items-center gap-1.5 text-red-400 bg-red-400/10 px-2 py-1 rounded w-fit">
        <XCircle className="w-4 h-4" />
        <span className="text-sm font-medium">Đã hủy</span>
      </div>
    );
  };

  if (loading) {
     return <div className="p-8 text-slate-400 flex flex-col items-center justify-center h-64">
        <Activity className="w-8 h-8 animate-spin mb-4 text-cyan-500" />
        Đang đồng bộ dữ liệu giao dịch thật...
     </div>;
  }

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Quản lý Doanh Thu</h1>
          <p className="text-cyan-400 font-medium mt-1">Lịch sử người dùng mua tài khoản Premium</p>
        </div>
      </div>

      {/* Revenue Summary (4 Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-[#0B1121] border-slate-800 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-400">Doanh thu hôm nay</p>
                <h3 className="text-2xl font-bold text-white mt-2">
                  {formatShortCurrency(metrics.today)}
                </h3>
                <div className="flex items-center gap-1 mt-2 text-sm">
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-400">+{metrics.growth.today}%</span>
                  <span className="text-slate-500">vs hôm qua</span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-lg bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                <DollarSign className="w-6 h-6 text-emerald-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#0B1121] border-slate-800 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-400">Doanh thu tuần này</p>
                <h3 className="text-2xl font-bold text-white mt-2">
                  {formatShortCurrency(metrics.week)}
                </h3>
                <div className="flex items-center gap-1 mt-2 text-sm">
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-400">+{metrics.growth.week}%</span>
                  <span className="text-slate-500">vs tuần trước</span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-lg bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20">
                <Calendar className="w-6 h-6 text-cyan-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#0B1121] border-slate-800 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-400">Doanh thu tháng này</p>
                <h3 className="text-2xl font-bold text-white mt-2">
                  {formatShortCurrency(metrics.month)}
                </h3>
                <div className="flex items-center gap-1 mt-2 text-sm">
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-400">+{metrics.growth.month}%</span>
                  <span className="text-slate-500">vs tháng trước</span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-lg bg-purple-500/10 flex items-center justify-center border border-purple-500/20">
                <TrendingUp className="w-6 h-6 text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#0B1121] border-slate-800 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-400">Tổng KH Premium</p>
                <h3 className="text-2xl font-bold text-white mt-2">
                  {metrics.totalSubscribers}
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

      {/* Transactions Table - DATA THẬT */}
      <Card className="bg-[#0B1121] border-slate-800 shadow-lg">
        <CardHeader>
          <CardTitle className="text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-cyan-400" />
              <span>Danh sách người mua gói (Real-time)</span>
            </div>
            <span className="text-sm font-normal text-slate-400">Đã cập nhật mới nhất</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-lg border border-slate-800">
            <Table>
              <TableHeader className="bg-slate-900/50">
                <TableRow className="border-slate-800 hover:bg-transparent">
                  <TableHead className="text-slate-400 font-semibold">Khách hàng</TableHead>
                  <TableHead className="text-slate-400 font-semibold">Email</TableHead>
                  <TableHead className="text-slate-400 font-semibold">Gói đăng ký</TableHead>
                  <TableHead className="text-slate-400 font-semibold">Trạng thái</TableHead>
                  <TableHead className="text-slate-400 font-semibold">Thời gian</TableHead>
                  <TableHead className="text-slate-400 font-semibold text-right">Số tiền</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.length > 0 ? (
                  transactions.map((tx) => (
                    <TableRow key={tx.id} className="border-slate-800 hover:bg-slate-800/40 transition-colors">
                      <TableCell className="font-medium text-white">{tx.user}</TableCell>
                      <TableCell className="text-slate-400">{tx.email}</TableCell>
                      <TableCell>
                        <Badge className="bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-400 border border-amber-500/30 flex w-fit items-center gap-1.5">
                          <Crown className="w-3 h-3" />
                          Premium
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {renderStatus(tx.status)}
                      </TableCell>
                      <TableCell className="text-slate-400 text-sm font-mono">{tx.date}</TableCell>
                      <TableCell className="text-right">
                        <span className="font-bold text-emerald-400 text-base">
                          +{formatCurrency(tx.amount)}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-10 text-slate-500">
                      Chưa có dữ liệu giao dịch nào.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Main Revenue Chart */}
      <Card className="bg-[#0B1121] border-slate-800 shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white">Tăng trưởng doanh thu</CardTitle>
            <div className="flex gap-2 bg-slate-800 p-1 rounded-lg">
              <Button
                variant={period === '7days' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setPeriod('7days')}
                className={period === '7days' ? 'bg-cyan-500 text-white hover:bg-cyan-600' : 'text-slate-400 hover:text-white'}
              >
                7 ngày
              </Button>
              <Button
                variant={period === '30days' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setPeriod('30days')}
                className={period === '30days' ? 'bg-cyan-500 text-white hover:bg-cyan-600' : 'text-slate-400 hover:text-white'}
              >
                30 ngày
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {revenueDataChart.length > 0 ? (
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={revenueDataChart}>
                <defs>
                  <linearGradient id="revenueChartGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} key="stop1"/>
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} key="stop2"/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis 
                  dataKey="date" 
                  stroke="#64748b"
                  tickFormatter={(value) => {
                    const date = new Date(value);
                    return period === '7days' 
                      ? `${date.getDate()}/${date.getMonth() + 1}`
                      : `Tháng ${date.getMonth() + 1}`;
                  }}
                />
                <YAxis 
                  stroke="#64748b"
                  tickFormatter={(value) => formatShortCurrency(value)}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }}
                  labelStyle={{ color: '#f8fafc' }}
                  formatter={(value: number) => [formatCurrency(value), 'Doanh thu']}
                  labelFormatter={(value) => new Date(value).toLocaleDateString('vi-VN')}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#06b6d4" 
                  strokeWidth={4}
                  dot={{ fill: '#06b6d4', strokeWidth: 2, r: 4, stroke: '#0f172a' }}
                  activeDot={{ r: 6, strokeWidth: 0 }}
                  name="Doanh thu"
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[350px] text-slate-500">
              Chưa có đủ dữ liệu để vẽ biểu đồ
            </div>
          )}
        </CardContent>
      </Card>

      {/* Year-over-Year Comparison */}
      <div className="space-y-6 pt-4">
        <div>
          <h2 className="text-2xl font-bold text-white">So sánh tăng trưởng YoY (Năm hiện tại vs Năm trước)</h2>
          <p className="text-slate-400 mt-1">Phân tích lượng người dùng đăng ký mới theo từng tháng</p>
        </div>

        {/* YoY Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/20 shadow-lg">
            <CardContent className="p-6">
              <p className="text-sm text-slate-400 mb-2">Doanh thu YTD Năm nay</p>
              <p className="text-3xl font-bold text-blue-400">
                {formatShortCurrency(yearOverYearSummary.totalRevenue2026)}
              </p>
              <p className="text-xs text-slate-500 mt-1">Lũy kế từ đầu năm</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-slate-700/10 to-slate-600/10 border-slate-600/20 shadow-lg">
            <CardContent className="p-6">
              <p className="text-sm text-slate-400 mb-2">Doanh thu YTD Năm trước</p>
              <p className="text-3xl font-bold text-slate-400">
                {formatShortCurrency(yearOverYearSummary.ytdRevenue2025)}
              </p>
              <p className="text-xs text-slate-500 mt-1">Lũy kế từ đầu năm</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-emerald-500/10 to-green-500/10 border-emerald-500/20 shadow-lg">
            <CardContent className="p-6">
              <p className="text-sm text-slate-400 mb-2">Tăng trưởng doanh thu</p>
              <div className="flex items-center gap-2">
                <p className="text-3xl font-bold text-emerald-400">
                  {yearOverYearSummary.ytdGrowth >= 0 ? '+' : ''}{yearOverYearSummary.ytdGrowth.toFixed(1)}%
                </p>
                {yearOverYearSummary.ytdGrowth >= 0 ? (
                  <TrendingUp className="w-6 h-6 text-emerald-400" />
                ) : (
                  <TrendingDown className="w-6 h-6 text-red-400" />
                )}
              </div>
              <p className="text-sm text-emerald-400/80 mt-1 font-medium">
                {yearOverYearSummary.totalRevenue2026 - yearOverYearSummary.ytdRevenue2025 >= 0 ? '+' : ''}
                {formatShortCurrency(yearOverYearSummary.totalRevenue2026 - yearOverYearSummary.ytdRevenue2025)} so với năm trước
              </p>
            </CardContent>
          </Card>
        </div>

        {/* YoY Comparison Chart */}
        <Card className="bg-[#0B1121] border-slate-800 shadow-lg">
          <CardHeader>
            <CardTitle className="text-white">Biểu đồ so sánh doanh thu theo tháng</CardTitle>
          </CardHeader>
          <CardContent>
            {yoyRevenue.length > 0 ? (
              <ResponsiveContainer width="100%" height={400}>
                <ComposedChart data={yoyRevenue}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis 
                    dataKey="month" 
                    stroke="#64748b"
                  />
                  <YAxis 
                    yAxisId="left"
                    stroke="#64748b"
                    tickFormatter={(value) => formatShortCurrency(value)}
                  />
                  <YAxis 
                    yAxisId="right"
                    orientation="right"
                    stroke="#64748b"
                    tickFormatter={(value) => `${value}%`}
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }}
                    labelStyle={{ color: '#f8fafc' }}
                    formatter={(value: number, name: string) => {
                      if (name === 'Tăng trưởng') return [`${value.toFixed(1)}%`, name];
                      return [formatCurrency(value), name];
                    }}
                  />
                  <Legend />
                  <Bar 
                    yAxisId="left"
                    dataKey="currentYear" 
                    fill="#0ea5e9" 
                    name="Năm nay"
                    radius={[6, 6, 0, 0]}
                    barSize={40}
                  />
                  <Bar 
                    yAxisId="left"
                    dataKey="previousYear" 
                    fill="#475569" 
                    name="Năm trước"
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
            ) : (
              <div className="flex items-center justify-center h-[400px] text-slate-500">
                Chưa có dữ liệu so sánh YoY
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}