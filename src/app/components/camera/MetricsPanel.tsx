import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Thermometer, Droplets, TrendingUp, Clock, Activity } from 'lucide-react';
import type { Batch } from '../../contexts/SystemContext';

interface MetricsPanelProps {
  activeBatch: Batch | null;
  currentWeather: {
    temperature: number;
    humidity: number;
  };
}

export function MetricsPanel({ activeBatch, currentWeather }: MetricsPanelProps) {
  return (
    <Card className="border-slate-800 bg-[#151E2F] shadow-md">
      <CardHeader className="border-b border-slate-800 bg-[#151E2F]">
        <CardTitle className="text-base md:text-lg text-white">
          Chỉ số hiện tại
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 md:p-5 space-y-4 pt-5">
        {activeBatch ? (
          <>
            {/* Temperature */}
            <div className="p-4 bg-[#0B1121] rounded-xl border border-slate-800 shadow-inner">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-orange-500/10 rounded-lg flex items-center justify-center">
                    <Thermometer className="w-5 h-5 text-orange-400" />
                  </div>
                  <span className="text-sm font-medium text-slate-400">
                    Nhiệt độ
                  </span>
                </div>
              </div>
              <div className="text-3xl font-bold text-white">
                {currentWeather.temperature.toFixed(1)}°C
              </div>
            </div>

            {/* Humidity */}
            <div className="p-4 bg-[#0B1121] rounded-xl border border-slate-800 shadow-inner">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-cyan-500/10 rounded-lg flex items-center justify-center">
                    <Droplets className="w-5 h-5 text-cyan-400" />
                  </div>
                  <span className="text-sm font-medium text-slate-400">
                    Độ ẩm
                  </span>
                </div>
              </div>
              <div className="text-3xl font-bold text-white">
                {currentWeather.humidity}%
              </div>
            </div>

            {/* Estimated Completion Time */}
            <div className="p-4 bg-[#0B1121] rounded-xl border border-slate-800 shadow-inner">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-violet-500/10 rounded-lg flex items-center justify-center">
                    <Clock className="w-5 h-5 text-violet-400" />
                  </div>
                  <span className="text-sm font-medium text-slate-400">
                    Dự kiến hoàn thành
                  </span>
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-bold text-white">
                  {activeBatch.estimatedCompletion.toLocaleTimeString('vi-VN', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
                <div className="text-xs text-slate-400 font-medium">
                  Còn {Math.floor(activeBatch.timeRemaining / 60)}h {activeBatch.timeRemaining % 60}p
                </div>
              </div>
            </div>

            {/* Dryness Progress */}
            <div className="p-4 bg-[#0B1121] rounded-xl border border-slate-800 shadow-inner">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-emerald-500/10 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-emerald-400" />
                  </div>
                  <span className="text-sm font-medium text-slate-400">
                    Độ khô
                  </span>
                </div>
                <span className="text-2xl font-bold text-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]">
                  {Math.round(activeBatch.dryness)}%
                </span>
              </div>
              <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)] transition-all duration-500"
                  style={{ width: `${activeBatch.dryness}%` }}
                />
              </div>
              <div className="mt-2 text-xs text-slate-400 font-medium">
                {activeBatch.dryness < 50
                  ? "Giai đoạn đầu"
                  : activeBatch.dryness < 80
                    ? "Đang khô nhanh"
                    : "Sắp hoàn thành"}
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <Activity className="w-12 h-12 text-slate-700 mx-auto mb-3" />
            <p className="text-sm text-slate-500">
              Chưa có batch đang hoạt động
            </p>
            <p className="text-xs text-slate-600 mt-1">
              Camera đang standby...
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
