import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { 
  Activity, 
  Camera,
  BrainCircuit,
  Users,
  LineChart as ChartIcon
} from 'lucide-react';
import { 
  LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, 
  CartesianGrid, Tooltip, ResponsiveContainer, Legend, ComposedChart 
} from 'recharts';
import { adminApi } from '../../../services/endpoints';
import { toast } from 'sonner';

export default function AdminOverview() {
  const [loading, setLoading] = useState(true);
  
  // 🚀 Khởi tạo State chuẩn khớp 100% với cấu trúc API 
  const [overviewStats, setOverviewStats] = useState({
    total_users: 0,
    total_cameras: 0,
    total_detections: 0,
    total_predictions: 0
  });

  const [aiConfidenceData, setAiConfidenceData] = useState<any[]>([]);
  const [aiDrynessPredictionData, setAiDrynessPredictionData] = useState<any[]>([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // 1. Fetch dữ liệu tổng quan 
        try {
          const overviewRes: any = await adminApi.getOverview();
          const data = overviewRes?.data || overviewRes;
          if (data) {
            setOverviewStats({
              total_users: data.total_users || 0,
              total_cameras: data.total_cameras || 0,
              total_detections: data.total_detections || 0,
              total_predictions: data.total_predictions || 0
            });
          }
        } catch(e) {
          console.error("Lỗi fetch overview:", e);
        }

        // 2. Fetch biểu đồ confidence (100% data thật, không mock)
        try {
          const confRes: any = await adminApi.getConfidenceChart();
          const confData = confRes?.data || confRes;
          if (confData && Array.isArray(confData)) {
            setAiConfidenceData(confData);
          }
        } catch(e) {
          console.error("Lỗi fetch biểu đồ confidence:", e);
          setAiConfidenceData([]);
        }

        // 3. Fetch biểu đồ dryness (100% data thật, không mock)
        try {
          const dryRes: any = await adminApi.getDrynessChart();
          const dryData = dryRes?.data || dryRes;
          if (dryData && Array.isArray(dryData)) {
            setAiDrynessPredictionData(dryData);
          }
        } catch(e) {
          console.error("Lỗi fetch biểu đồ dryness:", e);
          setAiDrynessPredictionData([]);
        }

      } catch (error) {
        toast.error("Lỗi kết nối máy chủ");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Tổng quan hệ thống</h1>
          <p className="text-slate-400 mt-1">Trạng thái vận hành thực tế của MyLongAI</p>
        </div>
        <div className="flex items-center gap-2 text-sm">
          {loading && <Activity className="w-4 h-4 text-slate-400 animate-spin" />}
          <div className="px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 mr-2 animate-pulse"></span>
            Hệ thống đang chạy
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300">
            {new Date().toLocaleDateString('vi-VN', { 
              weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
            })}
          </div>
        </div>
      </div>

      {/* ========================================== */}
      {/* 4 THẺ THỐNG KÊ (MAP CHUẨN API)             */}
      {/* ========================================== */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-400">Tổng Số Người Dùng</p>
                <h3 className="text-3xl font-bold text-white mt-2">
                  {overviewStats.total_users.toLocaleString()}
                </h3>
              </div>
              <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-400">Tổng Số Camera</p>
                <h3 className="text-3xl font-bold text-white mt-2">
                  {overviewStats.total_cameras.toLocaleString()}
                </h3>
              </div>
              <div className="w-12 h-12 rounded-lg bg-purple-500/10 flex items-center justify-center">
                <Camera className="w-6 h-6 text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-400">Lượt Nhận Diện AI</p>
                <h3 className="text-3xl font-bold text-white mt-2">
                  {overviewStats.total_detections.toLocaleString()}
                </h3>
              </div>
              <div className="w-12 h-12 rounded-lg bg-cyan-500/10 flex items-center justify-center">
                <BrainCircuit className="w-6 h-6 text-cyan-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-400">Lượt Dự Đoán Thời Gian</p>
                <h3 className="text-3xl font-bold text-white mt-2">
                  {overviewStats.total_predictions.toLocaleString()}
                </h3>
              </div>
              <div className="w-12 h-12 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <ChartIcon className="w-6 h-6 text-emerald-400" />
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
            <p className="text-sm text-slate-400 font-normal">Sự biến thiên độ chính xác của model YOLOv8 theo ngày</p>
          </CardHeader>
          <CardContent>
            {aiConfidenceData.length > 0 ? (
              <ResponsiveContainer width="100%" height={320}>
                <AreaChart data={aiConfidenceData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorConfidence" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis dataKey="date" stroke="#64748b" tick={{ fill: '#64748b' }} axisLine={false} tickLine={false} />
                  
                  {/* Format yAxis trả về dạng % do data backend trả 0.xx */}
                  <YAxis domain={[0, 1]} stroke="#64748b" tick={{ fill: '#64748b' }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v * 100).toFixed(0)}%`} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }}
                    itemStyle={{ color: '#fff' }}
                    formatter={(value: number) => [`${(value * 100).toFixed(1)}%`, 'Độ tin cậy']}
                  />
                  <Legend />
                  <Area 
                    type="monotone" 
                    dataKey="avg_confidence" 
                    stroke="#8b5cf6" 
                    strokeWidth={3}
                    fill="url(#colorConfidence)" 
                    name="Độ tin cậy Trung bình"
                    activeDot={{ r: 6, fill: '#8b5cf6', stroke: '#0f172a', strokeWidth: 2 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full height-[320px] flex items-center justify-center min-h-[320px] text-slate-500">
                Chưa có dữ liệu thống kê độ tin cậy AI
              </div>
            )}
          </CardContent>
        </Card>

        {/* Biểu đồ 2: Dự đoán Độ khô theo Nhiệt độ & Độ ẩm */}
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white font-bold text-lg">AI Dryness Predict vs Môi trường</CardTitle>
            <p className="text-sm text-slate-400 font-normal">Tương quan giữa Thời gian phơi dự đoán với Nhiệt độ & Độ ẩm</p>
          </CardHeader>
          <CardContent>
            {aiDrynessPredictionData.length > 0 ? (
              <ResponsiveContainer width="100%" height={320}>
                <ComposedChart data={aiDrynessPredictionData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis dataKey="date" stroke="#64748b" tick={{ fill: '#64748b' }} axisLine={false} tickLine={false} />
                  
                  {/* Trục Y trái cho Phút dự đoán */}
                  <YAxis yAxisId="left" stroke="#3b82f6" tick={{ fill: '#3b82f6' }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}p`} />
                  
                  {/* Trục Y phải cho Nhiệt độ / Độ ẩm */}
                  <YAxis yAxisId="right" orientation="right" domain={[0, 100]} stroke="#10b981" tick={{ fill: '#10b981' }} axisLine={false} tickLine={false} />
                  
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }}
                  />
                  <Legend />
                  
                  <Bar yAxisId="left" dataKey="avg_minutes" barSize={30} fill="#3b82f6" name="TG Dự đoán (Phút)" radius={[4, 4, 0, 0]} />
                  <Line yAxisId="right" type="monotone" dataKey="avg_temperature" stroke="#f97316" strokeWidth={3} name="Nhiệt độ (°C)" dot={{ r: 4 }} />
                  <Line yAxisId="right" type="monotone" dataKey="avg_humidity" stroke="#10b981" strokeWidth={3} name="Độ ẩm (%)" dot={{ r: 4 }} />
                </ComposedChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full flex items-center justify-center min-h-[320px] text-slate-500">
                Chưa có dữ liệu thống kê dự đoán thời gian
              </div>
            )}
          </CardContent>
        </Card>
      </div>

    </div>
  );
}