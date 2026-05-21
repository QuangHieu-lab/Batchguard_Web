import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { 
  LineChart, 
  Line, 
  AreaChart,
  Area,
  BarChart, 
  Bar, 
  PieChart,
  Pie,
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  ResponsiveContainer 
} from 'recharts';
import { TrendingUp, TrendingDown, Activity, Clock } from 'lucide-react';
import { mockDailyStats, allAdminBatches } from '../../data/adminMockData';
import { FarmSelector } from '../../components/admin/FarmSelector';
import { useFarm } from '../../contexts/FarmContext';

const performanceData = [
  { month: 'T1', batches: 245, success: 220, failed: 25, avgTime: 290 },
  { month: 'T2', batches: 280, success: 252, failed: 28, avgTime: 285 },
  { month: 'T3', batches: 310, success: 285, failed: 25, avgTime: 280 },
];

const dryingProgressData = [
  { time: '06:00', batch1: 0, batch2: 0, batch3: 0 },
  { time: '08:00', batch1: 25, batch2: 15, batch3: 10 },
  { time: '10:00', batch1: 48, batch2: 35, batch3: 28 },
  { time: '12:00', batch1: 68, batch2: 52, batch3: 45 },
  { time: '14:00', batch1: 85, batch2: 70, batch3: 60 },
  { time: '16:00', batch1: 100, batch2: 88, batch3: 75 },
];

export default function Analytics() {
  const { selectedFarmId } = useFarm();

  // Filter batches by selected farm
  const filteredBatches = selectedFarmId
    ? allAdminBatches.filter(b => b.farmId === selectedFarmId)
    : allAdminBatches;

  const statusDistribution = [
    { name: 'Hoàn thành', value: filteredBatches.filter(b => b.status === 'completed').length, color: '#10b981' },
    { name: 'Đang phơi', value: filteredBatches.filter(b => b.status === 'active').length, color: '#3b82f6' },
    { name: 'Thất bại', value: filteredBatches.filter(b => b.status === 'failed').length, color: '#ef4444' },
  ];

  const totalBatches = filteredBatches.length;
  const completedBatches = filteredBatches.filter(b => b.status === 'completed').length;
  const failedBatches = filteredBatches.filter(b => b.status === 'failed').length;
  const successRate = ((completedBatches / (completedBatches + failedBatches)) * 100).toFixed(1);
  const avgDryingTime = 285; // minutes

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Phân tích & Báo cáo</h1>
          <p className="text-slate-400 mt-1">Phân tích dữ liệu và hiệu suất hệ thống</p>
        </div>
        <FarmSelector />
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Tổng mẻ bánh</p>
                <p className="text-3xl font-bold text-white mt-2">{totalBatches}</p>
                <div className="flex items-center gap-1 mt-2 text-sm">
                  <TrendingUp className="w-4 h-4 text-green-400" />
                  <span className="text-green-400">+12.5%</span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Activity className="w-6 h-6 text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Tỷ lệ thành công</p>
                <p className="text-3xl font-bold text-green-400 mt-2">{successRate}%</p>
                <div className="flex items-center gap-1 mt-2 text-sm">
                  <TrendingDown className="w-4 h-4 text-red-400" />
                  <span className="text-red-400">-1.2%</span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-lg bg-green-500/10 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Thời gian TB</p>
                <p className="text-3xl font-bold text-white mt-2">{avgDryingTime}m</p>
                <div className="flex items-center gap-1 mt-2 text-sm">
                  <TrendingDown className="w-4 h-4 text-green-400" />
                  <span className="text-green-400">-8 phút</span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-lg bg-cyan-500/10 flex items-center justify-center">
                <Clock className="w-6 h-6 text-cyan-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Batch thất bại</p>
                <p className="text-3xl font-bold text-red-400 mt-2">{failedBatches}</p>
                <div className="flex items-center gap-1 mt-2 text-sm">
                  <TrendingUp className="w-4 h-4 text-red-400" />
                  <span className="text-red-400">+2 batch</span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-lg bg-red-500/10 flex items-center justify-center">
                <TrendingDown className="w-6 h-6 text-red-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="bg-slate-900 border border-slate-800">
          <TabsTrigger value="overview" className="data-[state=active]:bg-blue-600">Tổng quan</TabsTrigger>
          <TabsTrigger value="progress" className="data-[state=active]:bg-blue-600">So sánh tiến độ</TabsTrigger>
          <TabsTrigger value="performance" className="data-[state=active]:bg-blue-600">Hiệu suất</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Success Rate Trend */}
            <Card className="lg:col-span-2 bg-slate-900 border-slate-800">
              <CardHeader>
                <CardTitle className="text-white">Tỷ lệ thành công theo ngày</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={mockDailyStats.slice().reverse()}>
                    <defs>
                      <linearGradient id="analyticsSuccessGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} key="stop1-success"/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} key="stop2-success"/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis 
                      dataKey="date" 
                      stroke="#94a3b8"
                      tickFormatter={(value) => new Date(value).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })}
                    />
                    <YAxis stroke="#94a3b8" domain={[0, 100]} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                      labelStyle={{ color: '#f1f5f9' }}
                      formatter={(value: number) => [`${value}%`, 'Tỷ lệ thành công']}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="successRate" 
                      stroke="#10b981" 
                      fill="url(#analyticsSuccessGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Status Distribution */}
            <Card className="bg-slate-900 border-slate-800">
              <CardHeader>
                <CardTitle className="text-white">Phân bố trạng thái</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={statusDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {statusDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                      labelStyle={{ color: '#f1f5f9' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-2 mt-4">
                  {statusDistribution.map((item, index) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                        <span className="text-slate-300">{item.name}</span>
                      </div>
                      <span className="font-medium text-white">{item.value}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Daily Batches */}
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white">Số lượng batch theo ngày</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={mockDailyStats.slice().reverse()}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis 
                    dataKey="date" 
                    stroke="#94a3b8"
                    tickFormatter={(value) => new Date(value).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })}
                  />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                    labelStyle={{ color: '#f1f5f9' }}
                  />
                  <Legend />
                  <Bar dataKey="completed" fill="#10b981" name="Hoàn thành" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="failed" fill="#ef4444" name="Thất bại" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="progress" className="space-y-6">
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white">So sánh tiến độ khô giữa các batch</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={dryingProgressData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="time" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" domain={[0, 100]} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                    labelStyle={{ color: '#f1f5f9' }}
                    formatter={(value: number) => `${value}%`}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="batch1" stroke="#3b82f6" strokeWidth={2} name="Batch #2024-001" />
                  <Line type="monotone" dataKey="batch2" stroke="#10b981" strokeWidth={2} name="Batch #2024-002" />
                  <Line type="monotone" dataKey="batch3" stroke="#f59e0b" strokeWidth={2} name="Batch #2024-003" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-slate-900 border-slate-800">
              <CardContent className="p-6">
                <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20 mb-3">Batch #2024-001</Badge>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Tiến độ hiện tại</span>
                    <span className="text-white font-medium">85%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Thời gian phơi</span>
                    <span className="text-white font-medium">8h 30m</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Tốc độ khô TB</span>
                    <span className="text-white font-medium">10%/h</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-900 border-slate-800">
              <CardContent className="p-6">
                <Badge className="bg-green-500/10 text-green-400 border-green-500/20 mb-3">Batch #2024-002</Badge>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Tiến độ hiện tại</span>
                    <span className="text-white font-medium">65%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Thời gian phơi</span>
                    <span className="text-white font-medium">7h 00m</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Tốc độ khô TB</span>
                    <span className="text-white font-medium">9.3%/h</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-900 border-slate-800">
              <CardContent className="p-6">
                <Badge className="bg-yellow-500/10 text-yellow-400 border-yellow-500/20 mb-3">Batch #2024-003</Badge>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Tiến độ hiện tại</span>
                    <span className="text-white font-medium">45%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Thời gian phơi</span>
                    <span className="text-white font-medium">6h 30m</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Tốc độ khô TB</span>
                    <span className="text-white font-medium">6.9%/h</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white">Hiệu suất theo tháng (Q1 2026)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="month" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                    labelStyle={{ color: '#f1f5f9' }}
                  />
                  <Legend />
                  <Bar dataKey="batches" fill="#3b82f6" name="Tổng batch" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="success" fill="#10b981" name="Thành công" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="failed" fill="#ef4444" name="Thất bại" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white">Thời gian phơi trung bình theo tháng</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="month" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" domain={[260, 300]} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                    labelStyle={{ color: '#f1f5f9' }}
                    formatter={(value: number) => `${value} phút`}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="avgTime" 
                    stroke="#06b6d4" 
                    strokeWidth={3}
                    name="Thời gian TB"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}