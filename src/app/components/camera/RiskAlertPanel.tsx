import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { AlertTriangle, Cloud, CloudRain, CheckCircle2, Clock } from 'lucide-react';

interface RiskInfo {
  level: "low" | "medium" | "high";
  message: string;
  timeRange: string;
  description: string;
}

interface RiskAlertPanelProps {
  riskInfo: RiskInfo | null;
}

export function RiskAlertPanel({ riskInfo }: RiskAlertPanelProps) {
  if (!riskInfo) return null;

  return (
    <Card
      className={`border shadow-[0_4px_20px_rgba(0,0,0,0.2)] bg-[#151E2F] ${
        riskInfo.level === "high"
          ? "border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.1)]"
          : riskInfo.level === "medium"
            ? "border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.1)]"
            : "border-emerald-500/30"
      }`}
    >
      <CardHeader className="border-b border-slate-800 pb-3 bg-[#0B1121]/50">
        <CardTitle className="text-base flex items-center gap-2">
          {riskInfo.level === "high" ? (
            <CloudRain className="w-5 h-5 text-red-400" />
          ) : riskInfo.level === "medium" ? (
            <Cloud className="w-5 h-5 text-amber-400" />
          ) : (
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          )}
          <span className="text-white">Risk Alert</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 space-y-3">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span
              className={`text-lg font-bold ${
                riskInfo.level === "high"
                  ? "text-red-400"
                  : riskInfo.level === "medium"
                    ? "text-amber-400"
                    : "text-emerald-400"
              }`}
            >
              {riskInfo.message}
            </span>
            <Badge
              className={
                riskInfo.level === "high"
                  ? "bg-red-500/10 text-red-400 border-red-500/30"
                  : riskInfo.level === "medium"
                    ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                    : "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
              }
            >
              {riskInfo.level === "high"
                ? "Cao"
                : riskInfo.level === "medium"
                  ? "Trung bình"
                  : "Thấp"}
            </Badge>
          </div>
          <p className="text-sm leading-relaxed text-slate-400">
            {riskInfo.description}
          </p>
        </div>

        <div className="p-3 rounded-lg border border-slate-800 bg-[#0B1121]">
          <div className="flex items-center gap-2 mb-1">
            <Clock
              className={`w-4 h-4 ${
                riskInfo.level === "high"
                  ? "text-red-400"
                  : riskInfo.level === "medium"
                    ? "text-amber-400"
                    : "text-emerald-400"
              }`}
            />
            <span className="text-xs font-semibold text-slate-400">
              Khung giờ
            </span>
          </div>
          <p className="text-sm font-bold text-white">
            {riskInfo.timeRange}
          </p>
        </div>

        {riskInfo.level !== "low" && (
          <div
            className={`flex items-start gap-2 p-3 rounded-lg border ${
              riskInfo.level === "high"
                ? "bg-red-500/10 border-red-500/20"
                : "bg-amber-500/10 border-amber-500/20"
            }`}
          >
            <AlertTriangle
              className={`w-4 h-4 mt-0.5 ${
                riskInfo.level === "high"
                  ? "text-red-400"
                  : "text-amber-400"
              }`}
            />
            <p
              className={`text-xs ${
                riskInfo.level === "high"
                  ? "text-red-200"
                  : "text-amber-200"
              }`}
            >
              {riskInfo.level === "high"
                ? "Khuyến nghị: Chuẩn bị thu bánh nếu tình hình xấu đi"
                : "Khuyến nghị: Theo dõi sát và chuẩn bị phương án dự phòng"}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
