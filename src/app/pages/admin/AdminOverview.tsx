import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { 
  TrendingUp, 
  Activity, 
  Clock,
  Camera,
  DollarSign,
  BrainCircuit,
  Server
} from 'lucide-react';
import { 
  LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, 
  CartesianGrid, Tooltip, ResponsiveContainer, Legend, ComposedChart 
} from 'recharts';
import { Link } from 'react-router'; 
import { adminApi } from '../../../services/endpoints';
import { toast } from 'sonner';

// Dữ liệu Mock dự phòng
const mockAiMetrics = {
  activeCameras: 42,
  totalCameras: 45,
  avgConfidence: 94.5,
  avgPredictionTime: 285,
  totalInferencesToday: 1250000,
  serverUptime: 99.9,
};

const mockRevenueData = {
  total: 350500000,
  subscriptions: 265000000,
  hardwareRental: 85500000,
  today: 8500000,
  growthToday: 12.5,
};

const mockAiConfidenceData = [
  { hour: '06:00', confidence: 85, threshold: 80 },
  { hour: '08:00', confidence: 92, threshold: 80 },
  { hour: '10:00', confidence: 96, threshold: 80 },
  { hour: '12:00', confidence: 95, threshold: 80 },
  { hour: '14:00', confidence: 91, threshold: 80 },
  { hour: '16:00', confidence: 94, threshold: 80 },
  { hour: '18:00', confidence: 88, threshold: 80 },
];

const mockAiDrynessPredictionData = [
  { time: '08:00', temp: 28, humidity: 75, predictedMinutes: 420 },
  { time: '10:00', temp: 32, humidity: 65, predictedMinutes: 300 },
  { time: '12:00', temp: 36, humidity: 55, predictedMinutes: 180 },
  { time: '14:00', temp: 38, humidity: 50, predictedMinutes: 120 },
  { time: '16:00', temp: 34, humidity: 60, predictedMinutes: 240 },
  { time: '18:00', temp: 29, humidity: 70, predictedMinutes: 360 },
];

export default function AdminOverview() {
  const [loading, setLoading] = useState(true);
  const [aiMetrics, setAiMetrics] = useState(mockAiMetrics);
  const [revenueData, setRevenueData] = useState(mockRevenueData);
  const [aiConfidenceData, setAiConfidenceData] = useState(mockAiConfidenceData);
  const [aiDrynessPredictionData, setAiDrynessPredictionData] = useState(mockAiDrynessPredictionData);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch dữ liệu tổng quan
        try {
          const overviewRes: any = await adminApi.getOverview();
          const data = overviewRes?.data || overviewRes;
          if (data) {
            if (data.ai_metrics) setAiMetrics({ ...mockAiMetrics, ...data.ai_metrics });
            if (data.revenue) setRevenueData({ ...mockRevenueData, ...data.revenue });
          }
        } catch(e) {
          console.log("Dùng mock data cho overview");
        }

        // Fetch biểu đồ confidence
        try {
          const confRes: any = await adminApi.getConfidenceChart();
          const confData = confRes?.data || confRes;
          if (confData && Array.isArray(confData) && confData.length > 0) {
            setAiConfidenceData(confData);
          }
        } catch(e) {
          console.log("Dùng mock data cho biểu đồ confidence");
        }

        // Fetch biểu đồ dryness
        try {
          const dryRes: any = await adminApi.getDrynessChart();
          const dryData = dryRes?.data || dryRes;
          if (dryData && Array.isArray(dryData) && dryData.length > 0) {
            setAiDrynessPredictionData(dryData);
          }
        } catch(e) {
          console.log("Dùng mock data cho biểu đồ dryness");
        }

      } catch (error) {
        toast.error("Lỗi tải một số dữ liệu, đang dùng dữ liệu dự phòng");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const formatCurrency = (value: number) => {
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
    return `${(value / 1000).toFixed(0)}K`;
  };

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Tổng quan hệ thống</h1>
          <p className="text-slate-400 mt-1">Dashboard quản trị AI Models & Kinh doanh</p>
        </div>
        <div className="flex items-center gap-2 text-sm">
          {loading && <Activity className="w-4 h-4 text-slate-400 animate-spin" />}
          <div className="px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 mr-2 animate-pulse"></span>
            AI Server Online
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300">
            {new Date().toLocaleDateString('vi-VN', { 
              weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
            })}
          </div>
        </div>
      </div>

      {/* ========================================== */}
      {/* 4 THẺ THỐNG KÊ (KEY METRICS)               */}
      {/* ========================================== */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Doanh thu tổng (SaaS + Hardware) */}
        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-400">Tổng Doanh thu Dịch vụ</p>
                <h3 className="text-3xl font-bold text-white mt-2">{formatCurrency(revenueData.total)}</h3>
                <div className="flex items-center gap-1 mt-2 text-sm">
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-400">+{revenueData.growthToday}%</span>
                  <span className="text-slate-500">vs tháng trước</span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-amber-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Độ tin cậy của AI Model */}
        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-400">Độ tin cậy AI (Confidence)</p>
                <h3 className="text-3xl font-bold text-white mt-2">{aiMetrics.avgConfidence}%</h3>
                <div className="flex items-center gap-1 mt-2 text-sm">
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-400">+1.2%</span>
                  <span className="text-slate-500">sau lần train gần nhất</span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-lg bg-purple-500/10 flex items-center justify-center">
                <BrainCircuit className="w-6 h-6 text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Thời gian dự đoán khô */}
        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-400">Dự đoán TG phơi TB</p>
                <h3 className="text-3xl font-bold text-white mt-2">{aiMetrics.avgPredictionTime} <span className="text-lg text-slate-500 font-normal">phút</span></h3>
                <div className="flex items-center gap-1 mt-2 text-sm">
                  <Clock className="w-4 h-4 text-cyan-400" />
                  <span className="text-slate-400">Tính toán real-time</span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-lg bg-cyan-500/10 flex items-center justify-center">
                <Activity className="w-6 h-6 text-cyan-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Camera hoạt động */}
        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-400">Hạ tầng Camera Edge</p>
                <h3 className="text-3xl font-bold text-white mt-2">
                  {aiMetrics.activeCameras}<span className="text-xl text-slate-500 font-medium">/{aiMetrics.totalCameras}</span>
                </h3>
                <div className="flex items-center gap-1 mt-2 text-sm">
                  {aiMetrics.activeCameras === aiMetrics.totalCameras ? (
                    <span className="text-emerald-400">Hệ thống hoàn hảo</span>
                  ) : (
                    <span className="text-rose-400">{aiMetrics.totalCameras - aiMetrics.activeCameras} thiết bị mất kết nối</span>
                  )}
                </div>
              </div>
              <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Camera className="w-6 h-6 text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ========================================== */}
      {/* 2 BIỂU ĐỒ AI CỐT LÕI                       */}
      {/* ========================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Biểu đồ 1: AI Confidence Score */}
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white font-bold text-lg">Độ tin cậy AI Detect (Confidence Score)</CardTitle>
            <p className="text-sm text-slate-400 font-normal">Sự biến thiên độ chính xác của model YOLOv8 theo điều kiện ánh sáng trong ngày</p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={320}>
              <AreaChart data={aiConfidenceData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorConfidence" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="hour" stroke="#64748b" tick={{ fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} stroke="#64748b" tick={{ fill: '#64748b' }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}%`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Legend />
                <Area 
                  type="monotone" 
                  dataKey="confidence" 
                  stroke="#8b5cf6" 
                  strokeWidth={3}
                  fill="url(#colorConfidence)" 
                  name="Độ tin cậy (%)"
                  activeDot={{ r: 6, fill: '#8b5cf6', stroke: '#0f172a', strokeWidth: 2 }}
                />
                <Line 
                  type="step" 
                  dataKey="threshold" 
                  stroke="#ef4444" 
                  strokeDasharray="5 5" 
                  name="Ngưỡng cảnh báo (80%)" 
                  dot={false}
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Biểu đồ 2: Dự đoán Độ khô theo Nhiệt độ & Độ ẩm */}
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white font-bold text-lg">AI Dryness Predict vs Môi trường</CardTitle>
            <p className="text-sm text-slate-400 font-normal">Tương quan giữa Thời gian phơi dự đoán với Nhiệt độ & Độ ẩm thực tế</p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={320}>
              <ComposedChart data={aiDrynessPredictionData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="time" stroke="#64748b" tick={{ fill: '#64748b' }} axisLine={false} tickLine={false} />
                
                {/* Trục Y trái cho Phút dự đoán */}
                <YAxis yAxisId="left" stroke="#3b82f6" tick={{ fill: '#3b82f6' }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}p`} />
                
                {/* Trục Y phải cho Nhiệt độ / Độ ẩm */}
                <YAxis yAxisId="right" orientation="right" domain={[0, 100]} stroke="#10b981" tick={{ fill: '#10b981' }} axisLine={false} tickLine={false} />
                
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }}
                />
                <Legend />
                
                <Bar yAxisId="left" dataKey="predictedMinutes" barSize={30} fill="#3b82f6" name="Dự đoán hoàn thành (Phút)" radius={[4, 4, 0, 0]} />
                <Line yAxisId="right" type="monotone" dataKey="temp" stroke="#f97316" strokeWidth={3} name="Nhiệt độ (°C)" dot={{ r: 4 }} />
                <Line yAxisId="right" type="monotone" dataKey="humidity" stroke="#10b981" strokeWidth={3} name="Độ ẩm (%)" dot={{ r: 4 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* ========================================== */}
      {/* TỔNG QUAN DOANH THU                        */}
      {/* ========================================== */}
      <div className="w-full">
        <Card className="bg-gradient-to-br from-amber-500/5 to-orange-500/5 border-amber-500/20">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-amber-400" />
                </div>
                <div>
                  <CardTitle className="text-white">Cơ cấu Doanh thu (Mô hình SaaS)</CardTitle>
                  <p className="text-sm text-slate-400 mt-1">Phân bổ nguồn thu từ phần mềm và phần cứng</p>
                </div>
              </div>
              <Link to="/admin/revenue">
                <button className="px-4 py-2 rounded-lg bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 transition-colors text-sm font-medium">
                  Xem chi tiết →
                </button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 rounded-xl bg-slate-900/60 border border-slate-800">
                <div className="flex items-center gap-2 mb-2">
                  <Server className="w-4 h-4 text-cyan-400" />
                  <p className="text-sm text-slate-400">Gói Dịch vụ (Subscriptions)</p>
                </div>
                <p className="text-4xl font-bold text-cyan-400 mb-2">{formatCurrency(revenueData.subscriptions)}</p>
                <div className="flex items-center justify-between mt-4 text-sm border-t border-slate-800 pt-3">
                  <span className="text-slate-500">Tỷ trọng doanh thu</span>
                  <span className="text-slate-300 font-medium">75.6%</span>
                </div>
              </div>
              
              <div className="p-6 rounded-xl bg-slate-900/60 border border-slate-800">
                <div className="flex items-center gap-2 mb-2">
                  <Camera className="w-4 h-4 text-purple-400" />
                  <p className="text-sm text-slate-400">Thuê phần cứng (Cameras)</p>
                </div>
                <p className="text-4xl font-bold text-purple-400 mb-2">{formatCurrency(revenueData.hardwareRental)}</p>
                <div className="flex items-center justify-between mt-4 text-sm border-t border-slate-800 pt-3">
                  <span className="text-slate-500">Tỷ trọng doanh thu</span>
                  <span className="text-slate-300 font-medium">24.4%</span>
                </div>
              </div>

              <div className="p-6 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col justify-center items-center text-center">
                <p className="text-sm text-slate-400 mb-2">Giao dịch mới hôm nay</p>
                <p className="text-4xl font-bold text-emerald-400">+{formatCurrency(revenueData.today)}</p>
                <Badge variant="outline" className="mt-3 px-3 py-1 bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-sm">
                  Tăng {revenueData.growthToday}% so với T7
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

    </div>
  );
}