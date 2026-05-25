

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { useSystem } from '../contexts/SystemContext';
import { useWeather } from '../hooks/useWeather';
import { Activity, TrendingUp, AlertCircle, Clock, Camera, Brain, Thermometer, Droplets, Shield, Zap, Eye, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';
import { DashboardLoadingState } from '../components/LoadingState';
import { toast } from 'sonner';
import { Progress } from '../components/ui/progress';

export default function Overview() {
  const [isLoading, setIsLoading] = useState(true);
  const { activeBatch, batchHistory, cameraStatus, isDetecting } = useSystem();
  const { currentWeather } = useWeather();

  useEffect(() => {
    // Simulate initial data load
    const loadData = async () => {
      await new Promise(resolve => setTimeout(resolve, 800));
      setIsLoading(false);
    };

    loadData();
  }, []);

  // Show notifications when batch is auto-created
  useEffect(() => {
    if (!activeBatch) return;
    
    const prevBatchId = localStorage.getItem('lastBatchId');
    if (activeBatch.id !== prevBatchId) {
      localStorage.setItem('lastBatchId', activeBatch.id);
      toast.success(`🎯 Batch mới được phát hiện!`, {
        description: `${activeBatch.id} - ${activeBatch.location}`,
      });
    }
  }, [activeBatch]);

  if (isLoading) {
    return <DashboardLoadingState />;
  }

  const getRiskColor = (level: 'low' | 'medium' | 'high') => {
    switch (level) {
      case 'low': return 'text-emerald-400 border-emerald-500/50 bg-emerald-500/10';
      case 'medium': return 'text-amber-400 border-amber-500/50 bg-amber-500/10';
      case 'high': return 'text-red-400 border-red-500/50 bg-red-500/10';
      default: return 'text-slate-400 border-slate-500/50 bg-slate-500/10';
    }
  };

  const getStatusColor = (status: 'active' | 'completed' | 'warning') => {
    switch (status) {
      case 'active': return 'text-sky-400 border-sky-500/50 bg-sky-500/10';
      case 'completed': return 'text-emerald-400 border-emerald-500/50 bg-emerald-500/10';
      case 'warning': return 'text-amber-400 border-amber-500/50 bg-amber-500/10';
      default: return 'text-slate-400 border-slate-500/50 bg-slate-500/10';
    }
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const formatRisk = (risk: 'low' | 'medium' | 'high') => {
    switch (risk) {
      case 'low': return 'Thấp';
      case 'medium': return 'Trung bình';
      case 'high': return 'Cao';
      default: return risk;
    }
  };

  const formatStatus = (status: 'active' | 'completed' | 'warning') => {
    switch (status) {
      case 'active': return 'Đang phơi';
      case 'completed': return 'Hoàn thành';
      case 'warning': return 'Cảnh báo';
      default: return status;
    }
  };

  return (
    <div className="p-4 md:p-8 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Dashboard Overview</h1>
          <p className="text-slate-400">Giám sát quá trình phơi bánh tráng thời gian thực</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-xl">
          <div className={`w-2 h-2 rounded-full ${cameraStatus === 'Active' ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
          <span className="text-sm text-slate-300 font-medium">
            {cameraStatus === 'Active' ? 'AI Active' : 'Offline'}
          </span>
        </div>
      </div>

      {/* Asymmetric Grid Layout */}
      <div className="grid grid-cols-12 gap-6">
        {/* Large Active Batch Card - Spans 8 columns */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="col-span-12 lg:col-span-8"
        >
          {activeBatch ? (
            <Card className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 border-2 border-slate-700 hover:border-sky-400/50 transition-all duration-500 shadow-2xl shadow-sky-400/10 rounded-3xl overflow-hidden backdrop-blur-sm">
              <CardHeader className="pb-4 border-b border-slate-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-sky-400 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg shadow-sky-400/30">
                      <Eye className="w-6 h-6 text-navy-950" />
                    </div>
                    <div>
                      <CardTitle className="text-white text-xl">Mẻ bánh đang hoạt động</CardTitle>
                      <p className="text-sm text-slate-400 mt-1">{activeBatch.id}</p>
                    </div>
                  </div>
                  <Badge className={`${getStatusColor(activeBatch.status)} font-bold px-4 py-1 rounded-xl border-2`}>
                    {formatStatus(activeBatch.status)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                {/* Progress Section with Glow */}
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-semibold text-slate-300">Tiến độ phơi</span>
                    <span className="text-2xl font-bold text-sky-400">{Math.round(activeBatch.dryness)}%</span>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-0 bg-sky-400/20 rounded-full blur-md" style={{ width: `${activeBatch.dryness}%` }} />
                    <Progress 
                      value={activeBatch.dryness} 
                      className="h-4 bg-slate-900 border border-slate-700 rounded-full overflow-hidden"
                    />
                  </div>
                </div>

                {/* Stats Grid - Asymmetric */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-slate-900/50 border border-slate-700 rounded-2xl p-4 hover:border-sky-400/30 transition-all">
                    <div className="flex items-center gap-2 mb-2">
                      <Thermometer className="w-4 h-4 text-orange-400" />
                      <span className="text-xs text-slate-400">Nhiệt độ</span>
                    </div>
                    <div className="text-2xl font-bold text-white">{currentWeather.temperature.toFixed(1)}°C</div>
                  </div>
                  <div className="bg-slate-900/50 border border-slate-700 rounded-2xl p-4 hover:border-cyan-400/30 transition-all">
                    <div className="flex items-center gap-2 mb-2">
                      <Droplets className="w-4 h-4 text-cyan-400" />
                      <span className="text-xs text-slate-400">Độ ẩm</span>
                    </div>
                    <div className="text-2xl font-bold text-white">{currentWeather.humidity}%</div>
                  </div>
                  <div className="bg-slate-900/50 border border-slate-700 rounded-2xl p-4 hover:border-sky-400/30 transition-all">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="w-4 h-4 text-sky-400" />
                      <span className="text-xs text-slate-400">Còn lại</span>
                    </div>
                    <div className="text-2xl font-bold text-white">{formatDuration(activeBatch.timeRemaining)}</div>
                  </div>
                  <div className="bg-slate-900/50 border border-slate-700 rounded-2xl p-4 hover:border-emerald-400/30 transition-all">
                    <div className="flex items-center gap-2 mb-2">
                      <Brain className="w-4 h-4 text-emerald-400" />
                      <span className="text-xs text-slate-400">Thời gian dự kiến hoàn thành</span>
                    </div>
                    <div className="text-2xl font-bold text-white">
                      {activeBatch.estimatedCompletion instanceof Date 
                        ? activeBatch.estimatedCompletion.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
                        : activeBatch.estimatedCompletion}
                    </div>
                  </div>
                </div>

                {/* Location & Risk */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-900/50 border border-slate-700 rounded-2xl p-4">
                    <div className="text-xs text-slate-400 mb-1">Vị trí</div>
                    <div className="text-lg font-bold text-white">{activeBatch.location}</div>
                  </div>
                  <div className="bg-slate-900/50 border border-slate-700 rounded-2xl p-4">
                    <div className="text-xs text-slate-400 mb-1">Mức độ rủi ro</div>
                    <Badge className={`${getRiskColor(activeBatch.risk)} font-bold text-base px-3 py-1 rounded-lg border-2`}>
                      {formatRisk(activeBatch.risk)}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 border-2 border-slate-700 rounded-3xl shadow-xl backdrop-blur-sm">
              <CardContent className="p-12 text-center">
                <div className="w-20 h-20 bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Eye className="w-10 h-10 text-slate-500" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Đang chờ phát hiện</h3>
                <p className="text-slate-400">Camera AI đang quét để phát hiện batch mới...</p>
              </CardContent>
            </Card>
          )}
        </motion.div>

        {/* Right Column - Two Stacked Cards */}
        <div className="col-span-12 lg:col-span-4 space-y-6">
          {/* AI Status Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 border-2 border-slate-700 hover:border-cyan-400/50 transition-all duration-500 shadow-xl hover:shadow-cyan-400/10 rounded-3xl backdrop-blur-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-sky-500 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-400/30">
                    <Camera className="w-5 h-5 text-navy-950" />
                  </div>
                  <CardTitle className="text-white text-lg">Tình trạng camera theo dõi</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-slate-900/50 border border-slate-700 rounded-xl">
                    <span className="text-sm text-slate-300">Nhận diện bánh</span>
                    <div className="flex items-center gap-2">
                      {isDetecting && <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />}
                      <span className="text-sm font-bold text-emerald-400">
                        {isDetecting ? 'Đang hoạt động' : 'Đang chờ'}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-slate-900/50 border border-slate-700 rounded-xl">
                    <span className="text-sm text-slate-300">Hình ảnh camera</span>
                    <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/50 font-semibold px-3 py-1 rounded-lg border">
                      Đang trực tiếp
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-slate-900/50 border border-slate-700 rounded-xl">
                    <span className="text-sm text-slate-300">AI Model</span>
                    <span className="text-sm font-bold text-sky-400">v2.1</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Quick Stats Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 border-2 border-slate-700 hover:border-sky-400/50 transition-all duration-500 shadow-xl hover:shadow-sky-400/10 rounded-3xl backdrop-blur-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-sky-400 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg shadow-sky-400/30">
                    <TrendingUp className="w-5 h-5 text-navy-950" />
                  </div>
                  <CardTitle className="text-white text-lg">Thống kê hôm nay</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-slate-900/50 border border-slate-700 rounded-xl">
                    <span className="text-sm text-slate-300">Số mẻ bánh phát hiện</span>
                    <span className="text-2xl font-bold text-sky-400">{batchHistory.length}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-slate-900/50 border border-slate-700 rounded-xl">
                    <span className="text-sm text-slate-300">Mẻ bánh đã hoàn thành</span>
                    <span className="text-2xl font-bold text-emerald-400">
                      {batchHistory.filter(b => b.status === 'completed').length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-slate-900/50 border border-slate-700 rounded-xl">
                    <span className="text-sm text-slate-300">Tỷ lệ thành công</span>
                    <span className="text-2xl font-bold text-cyan-400">
                      {batchHistory.length > 0 
                        ? Math.round((batchHistory.filter(b => b.status === 'completed').length / batchHistory.length) * 100)
                        : 0}%
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Recent Batches - Full Width */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="col-span-12"
        >
          <Card className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 border-2 border-slate-700 rounded-3xl shadow-xl backdrop-blur-sm">
            <CardHeader className="border-b border-slate-700">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-sky-400 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg shadow-sky-400/30">
                  <Activity className="w-5 h-5 text-navy-950" />
                </div>
                <CardTitle className="text-white text-xl">Recent Batches</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              {batchHistory.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {batchHistory.slice(0, 6).map((batch, idx) => (
                    <motion.div
                      key={batch.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3, delay: idx * 0.05 }}
                      className="bg-slate-900/50 border border-slate-700 hover:border-sky-400/50 rounded-2xl p-4 transition-all hover:shadow-lg hover:shadow-sky-400/10"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-bold text-white">{batch.id}</span>
                        <Badge className={`${getStatusColor(batch.status)} text-xs font-semibold px-2 py-0.5 rounded-lg border`}>
                          {formatStatus(batch.status)}
                        </Badge>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center justify-between text-slate-400">
                          <span>Độ khô</span>
                          <span className="font-semibold text-white">{Math.round(batch.dryness)}%</span>
                        </div>
                        <div className="flex items-center justify-between text-slate-400">
                          <span>Vị trí</span>
                          <span className="font-semibold text-slate-300">{batch.location}</span>
                        </div>
                        <div className="flex items-center justify-between text-slate-400">
                          <span>Rủi ro</span>
                          <Badge className={`${getRiskColor(batch.risk)} text-xs px-2 py-0.5 rounded-lg border`}>
                            {formatRisk(batch.risk)}
                          </Badge>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Activity className="w-8 h-8 text-slate-500" />
                  </div>
                  <p className="text-slate-400">Chưa có batch nào được phát hiện</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
