import { useState, useEffect } from "react";
import { Activity } from "lucide-react";
import { useSystem } from "../contexts/SystemContext";
import { useWeather } from "../hooks/useWeather";
import { MultiCameraView } from "../components/MultiCameraView";
import { MonitoringLog } from "../components/camera/MonitoringLog";
import { MetricsPanel } from "../components/camera/MetricsPanel";
import { RiskAlertPanel } from "../components/camera/RiskAlertPanel";
import { YoloUploadDemo } from "../components/camera/YoloUploadDemo";
import { RealtimeCameraYolo } from "../components/camera/RealtimeCameraYolo";

interface LogEntry {
  time: string;
  message: string;
  type: "info" | "warning" | "success" | "alert";
}

export default function CameraMonitoring() {
  const { activeBatch } = useSystem();
  // 🚀 Lấy thêm trạng thái loading từ useWeather để xử lý mượt mà
  const { currentWeather, loading: weatherLoading } = useWeather();
  const [logs, setLogs] = useState<LogEntry[]>([
    {
      time: "13:00",
      message: "Mẻ bánh bắt đầu - AI Vision phát hiện bánh tráng",
      type: "success",
    },
    {
      time: "14:15",
      message: "Độ khô đạt 45% - Tiến độ tốt",
      type: "info",
    },
    {
      time: "15:00",
      message: "Độ ẩm tăng nhẹ",
      type: "warning",
    },
  ]);

  // Add logs when batch progresses
  useEffect(() => {
    if (!activeBatch) return;

    const logInterval = setInterval(() => {
      const dryness = Math.round(activeBatch.dryness);
      const humidity = Math.round(activeBatch.humidity);

      if (dryness > 0 && dryness % 20 === 0 && Math.random() > 0.7) {
        const now = new Date();
        const timeStr = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;

        let message = "";
        let type: "info" | "warning" | "success" | "alert" = "info";

        if (dryness >= 80) {
          message = `Độ khô đạt ${dryness}% - Sắp hoàn thành`;
          type = "success";
        } else if (humidity > 60) {
          message = `Độ ẩm cao ${humidity}% - Giám sát chặt`;
          type = "warning";
        } else {
          message = `Độ khô đạt ${dryness}% - Tiến độ tốt`;
          type = "info";
        }

        setLogs((prev) => [{ time: timeStr, message, type }, ...prev.slice(0, 9)]);
      }
    }, 5000);

    return () => clearInterval(logInterval);
  }, [activeBatch]);

  // 🚀 Cập nhật AI Risk Assessment dựa trên dữ liệu thật của Backend
  const getRiskLevel = () => {
    // Thêm check an toàn: Nếu chưa có batch hoặc thời tiết đang load thì trả về null
    if (!activeBatch || !currentWeather) return null; 
    
    const now = new Date();
    const hour = now.getHours();
    const nextHour = `${hour.toString().padStart(2, '0')}:00 - ${(hour + 2).toString().padStart(2, '0')}:00`;

    // 🚀 Tận dụng trường isRaining (đang mưa) và maxPrecip12h của Backend mới
    if (currentWeather.isRaining || currentWeather.rainChance > 60) {
      return {
        level: "high" as const,
        message: currentWeather.isRaining ? "Trời đang mưa!" : "Cảnh báo mưa cao",
        timeRange: nextHour,
        description: `Khả năng mưa ${currentWeather.rainChance}% (Đỉnh điểm: ${currentWeather.maxPrecip12h}%) - Yêu cầu thu bánh ngay!`,
      };
    } else if (currentWeather.rainChance > 30 || currentWeather.humidity > 70) {
      return {
        level: "medium" as const,
        message: "Môi trường rủi ro",
        timeRange: nextHour,
        description: `Độ ẩm ${currentWeather.humidity}%, mưa ${currentWeather.rainChance}% - Giám sát chặt chẽ`,
      };
    }
    return {
      level: "low" as const,
      message: "Điều kiện tốt",
      timeRange: nextHour,
      description: `Nhiệt độ ${currentWeather.temperature.toFixed(1)}°C, độ ẩm ${currentWeather.humidity}% - Phơi thuận lợi`,
    };
  };

  const riskInfo = getRiskLevel();

  return (
    <div className="p-4 md:p-8 space-y-6 text-slate-200">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
            Camera Quan Sát
          </h1>
          <p className="text-sm md:text-base text-slate-400">
            Theo dõi tất cả vị trí phơi bánh real-time
          </p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/30 rounded-lg shadow-[0_0_15px_rgba(16,185,129,0.15)]">
          <Activity className="w-4 h-4 text-emerald-400 animate-pulse" />
          <span className="text-sm font-semibold text-emerald-400">
            LIVE
          </span>
        </div>
      </div>

      {/* Multi Camera View */}
      <MultiCameraView />

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column - Logs */}
        <div className="lg:col-span-2 space-y-6">
          <MonitoringLog logs={logs} />
        </div>

        {/* Metrics & Risk Panel */}
        <div className="space-y-6">
          {/* 🚀 Truyền fallback an toàn nếu weather đang load */}
          {/* Provide a safe fallback object so MetricsPanel always receives the expected shape */}
          <MetricsPanel activeBatch={activeBatch} currentWeather={currentWeather ?? { temperature: 0, humidity: 0 }} />
          {riskInfo && <RiskAlertPanel riskInfo={riskInfo} />}
        </div>
      </div>

      {/* AI Detection Demos */}
      <RealtimeCameraYolo />
      <YoloUploadDemo />
    </div>
  );
}