import { useState, useEffect, useMemo } from 'react';
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
  DollarSign,
  Users,
  Calendar,
  Crown,
  CheckCircle2,
  Activity,
  XCircle,
  Clock,
  Hash
} from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, Legend
} from 'recharts';
import { paymentApi } from '../../../services/endpoints';
import { toast } from 'sonner';

export default function Revenue() {
  const [period, setPeriod] = useState<'7days' | '30days'>('7days');
  const [loading, setLoading] = useState(true);
  
  // State dữ liệu thật
  const [transactions, setTransactions] = useState<any[]>([]);
  const [metrics, setMetrics] = useState({
    today: 0,
    week: 0,
    month: 0,
    totalSubscribers: 0
  });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // 🚀 LẤY DANH SÁCH NGƯỜI MUA TỪ API
        const buyersRes: any = await paymentApi.getBuyers();
        
        let buyersList = [];
        if (buyersRes?.data?.data && Array.isArray(buyersRes.data.data)) {
            buyersList = buyersRes.data.data;
        } else if (buyersRes?.data && Array.isArray(buyersRes.data)) {
            buyersList = buyersRes.data;
        } else if (Array.isArray(buyersRes)) {
            buyersList = buyersRes;
        }

        if (buyersList.length > 0) {
          const sortedData = buyersList.sort((a: any, b: any) => {
            const dateA = new Date(a.paid_at || a.created_at || 0).getTime();
            const dateB = new Date(b.paid_at || b.created_at || 0).getTime();
            return dateB - dateA;
          });

          // Map dữ liệu
          const mappedTxs = sortedData.map((s: any) => {
            const rawDate = new Date(s.paid_at || s.created_at || new Date());
            return {
              id: s.order_code || Math.random().toString(),
              orderCode: s.order_code || 'N/A',
              user: s.full_name || 'Khách hàng ẩn danh', 
              email: s.email || 'Chưa cập nhật',         
              amount: Number(s.amount) || 0,
              rawDate: rawDate, // Giữ lại ngày gốc để tính toán Frontend
              date: rawDate.toLocaleString('vi-VN'),
              status: s.status || 'pending'
            }
          });

          setTransactions(mappedTxs);

          const successfulTxs = mappedTxs.filter((tx: any) => tx.status === 'paid' || tx.status === 'success');
          
          // 🚀 TỰ ĐỘNG TÍNH TOÁN DOANH THU TRÊN FRONTEND TỪ ĐƠN HÀNG THỰC TẾ
          const now = new Date();
          const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
          const startOfWeek = startOfToday - (7 * 24 * 60 * 60 * 1000); 
          const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();

          let calcToday = 0;
          let calcWeek = 0;
          let calcMonth = 0;

          successfulTxs.forEach((tx: any) => {
            const txTime = tx.rawDate.getTime();
            if (txTime >= startOfToday) calcToday += tx.amount;
            if (txTime >= startOfWeek) calcWeek += tx.amount;
            if (txTime >= startOfMonth) calcMonth += tx.amount;
          });

          setMetrics({
            today: calcToday,
            week: calcWeek,
            month: calcMonth,
            totalSubscribers: successfulTxs.length, 
          });
        }
      } catch (error) {
        toast.error("Lỗi khi tải dữ liệu đơn hàng.");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // 🚀 TỰ ĐỘNG VẼ BIỂU ĐỒ TỪ DỮ LIỆU THỰC TẾ (Không cần chờ Backend)
  const chartData = useMemo(() => {
    const daysToLookBack = period === '7days' ? 7 : 30;
    const data: any[] = [];
    const now = new Date();
    now.setHours(0, 0, 0, 0); // Đưa về đầu ngày hôm nay

    // Tạo mảng N ngày gần nhất (bao gồm hôm nay) với doanh thu ban đầu là 0
    for (let i = daysToLookBack - 1; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      data.push({
        timestamp: d.getTime(), // Dùng timestamp để dễ so sánh
        revenue: 0,
      });
    }

    // Quét các giao dịch thành công và cộng tiền vào đúng ngày
    transactions.forEach((tx) => {
      if (tx.status !== 'paid' && tx.status !== 'success') return;
      
      const txDate = new Date(tx.rawDate);
      txDate.setHours(0, 0, 0, 0); // Lấy phần ngày của giao dịch
      
      // Tìm xem giao dịch này thuộc cột ngày nào trên biểu đồ
      const match = data.find(item => item.timestamp === txDate.getTime());
      if (match) {
        match.revenue += tx.amount;
      }
    });

    return data;
  }, [transactions, period]);

  // Format Helpers
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', { 
      style: 'currency', 
      currency: 'VND',
      minimumFractionDigits: 0 
    }).format(value);
  };

  const formatShortCurrency = (value: number) => {
    if (value === 0) return "0đ";
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
    return `${(value / 1000).toFixed(0)}K`;
  };

  const renderStatus = (status: string) => {
    if (status === 'paid' || status === 'success') {
      return (
        <div className="flex items-center gap-1.5 text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded w-fit">
          <CheckCircle2 className="w-4 h-4" />
          <span className="text-xs font-medium uppercase">Đã thanh toán</span>
        </div>
      );
    }
    if (status === 'pending') {
      return (
        <div className="flex items-center gap-1.5 text-amber-400 bg-amber-400/10 px-2 py-1 rounded w-fit">
          <Clock className="w-4 h-4 animate-pulse" />
          <span className="text-xs font-medium uppercase">Chờ thanh toán</span>
        </div>
      );
    }
    return (
      <div className="flex items-center gap-1.5 text-red-400 bg-red-400/10 px-2 py-1 rounded w-fit">
        <XCircle className="w-4 h-4" />
        <span className="text-xs font-medium uppercase">Đã hủy</span>
      </div>
    );
  };

  const renderPackageBadge = (amount: number) => {
    if (amount >= 99000) {
      return (
        <Badge className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-400 border border-purple-500/30 flex w-fit items-center gap-1.5">
          <Crown className="w-3 h-3" />
          Gói 1 Năm
        </Badge>
      );
    }
    return (
      <Badge className="bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-400 border border-amber-500/30 flex w-fit items-center gap-1.5">
        <Activity className="w-3 h-3" />
        Gói 1 Tháng
      </Badge>
    );
  };

  if (loading) {
     return <div className="p-8 text-slate-400 flex flex-col items-center justify-center h-64">
        <Activity className="w-8 h-8 animate-spin mb-4 text-cyan-500" />
        Đang đồng bộ dữ liệu giao dịch mới nhất...
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

      {/* Transactions Table */}
      <Card className="bg-[#0B1121] border-slate-800 shadow-lg">
        <CardHeader>
          <CardTitle className="text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-cyan-400" />
              <span>Danh sách Đơn Hàng (Real-time)</span>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-lg border border-slate-800">
            <Table>
              <TableHeader className="bg-slate-900/50">
                <TableRow className="border-slate-800 hover:bg-transparent">
                  <TableHead className="text-slate-400 font-semibold w-[150px]">Mã Đơn</TableHead>
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
                      <TableCell className="font-mono text-cyan-400/80 text-sm">
                        <div className="flex items-center gap-1">
                          <Hash className="w-3 h-3" />
                          {tx.orderCode}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium text-white">{tx.user}</TableCell>
                      <TableCell className="text-slate-400 text-sm">{tx.email}</TableCell>
                      <TableCell>
                        {renderPackageBadge(tx.amount)}
                      </TableCell>
                      <TableCell>
                        {renderStatus(tx.status)}
                      </TableCell>
                      <TableCell className="text-slate-400 text-xs font-mono">{tx.date}</TableCell>
                      <TableCell className="text-right">
                        <span className={`font-bold text-base ${tx.status === 'paid' ? 'text-emerald-400' : 'text-slate-500'}`}>
                          {formatCurrency(tx.amount)}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-10 text-slate-500">
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
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={chartData}>
                <defs>
                  <linearGradient id="revenueChartGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} key="stop1"/>
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} key="stop2"/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis 
                  dataKey="timestamp" 
                  stroke="#64748b"
                  tickFormatter={(value) => {
                    const date = new Date(value);
                    return `${date.getDate()}/${date.getMonth() + 1}`;
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
    </div>
  );
}