import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Clock, CheckCircle2, AlertTriangle, Info } from 'lucide-react';

interface LogEntry {
  time: string;
  message: string;
  type: "info" | "warning" | "success" | "alert";
}

interface MonitoringLogProps {
  logs: LogEntry[];
}

export function MonitoringLog({ logs }: MonitoringLogProps) {
  const getLogIcon = (type: string) => {
    switch (type) {
      case "success":
        return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
      case "warning":
        return <AlertTriangle className="w-4 h-4 text-amber-400" />;
      case "alert":
        return <AlertTriangle className="w-4 h-4 text-red-400" />;
      default:
        return <Info className="w-4 h-4 text-cyan-400" />;
    }
  };

  const getLogStyle = (type: string) => {
    switch (type) {
      case "success":
        return "border-emerald-500/30 bg-emerald-500/10 shadow-[0_0_10px_rgba(16,185,129,0.05)]";
      case "warning":
        return "border-amber-500/30 bg-amber-500/10 shadow-[0_0_10px_rgba(245,158,11,0.05)]";
      case "alert":
        return "border-red-500/30 bg-red-500/10 shadow-[0_0_10px_rgba(239,68,68,0.05)]";
      default:
        return "border-cyan-500/30 bg-cyan-500/10 shadow-[0_0_10px_rgba(6,182,212,0.05)]";
    }
  };

  return (
    <Card className="border-slate-800 bg-[#151E2F] shadow-md">
      <CardHeader className="border-b border-slate-800 bg-[#151E2F]">
        <CardTitle className="flex items-center gap-2 text-base md:text-lg text-white">
          <Clock className="w-5 h-5 text-cyan-400" />
          Lịch sử theo dõi mẻ bánh
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 md:p-6">
        <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
          {logs.length > 0 ? (
            logs.map((log, index) => (
              <div
                key={index}
                className={`flex items-start gap-3 p-3 rounded-lg border transition-all ${getLogStyle(log.type)}`}
              >
                <div className="mt-0.5 flex-shrink-0">
                  {getLogIcon(log.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-xs font-semibold text-slate-400 bg-[#0B1121] px-2 py-0.5 rounded border border-slate-800">
                      {log.time}
                    </span>
                  </div>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    {log.message}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-slate-500">
              <Clock className="w-12 h-12 mx-auto mb-2 text-slate-700" />
              <p>Chưa có log nào</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
