import { useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Upload, Scan, Tag, Crosshair, AlertTriangle } from 'lucide-react';

interface YoloUploadDemoProps {}

export function YoloUploadDemo({}: YoloUploadDemoProps) {
  const yoloFileInputRef = useRef<HTMLInputElement>(null);
  const [yoloPreviewUrl, setYoloPreviewUrl] = useState<string | null>(null);
  const [yoloLoading, setYoloLoading] = useState(false);
  const [yoloError, setYoloError] = useState<string | null>(null);
  const [yoloResult, setYoloResult] = useState<{
    count: number;
    detections: { label: string; confidence: number; bbox: number[] }[];
    imageUrl?: string;
  } | null>(null);

  const handleYoloUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setYoloPreviewUrl(URL.createObjectURL(file));
    setYoloError(null);
    setYoloResult(null);
    setYoloLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      let response: Response | null = null;
      for (let attempt = 0; attempt < 3; attempt++) {
        if (attempt > 0) {
          setYoloError(`Server đang khởi động... thử lại (${attempt}/2)`);
          await new Promise(r => setTimeout(r, 4000));
        }
        response = await fetch('https://mylongai-backend-v2.onrender.com/ai/detect', { method: 'POST', body: formData });
        const ct = response.headers.get('content-type') ?? '';
        if (ct.includes('application/json')) break;
        response = null;
      }
      if (!response) throw new Error('Server chưa sẵn sàng, vui lòng thử lại sau 30 giây');
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      setYoloError(null);
      const data = await response.json();
      const raw = data.objects ?? data.detections ?? data.predictions ?? data.results ?? [];
      const detections = raw.map((d: any) => ({
        label: d.label ?? ({ 0: 'Bánh tráng mè trắng', 1: 'Bánh tráng mè đen' }[d.class as 0 | 1] ?? `Class ${d.class}`),
        confidence: d.confidence,
        bbox: d.bbox ?? [],
      }));
      const imageUrl: string | undefined = data.image ? `data:image/jpeg;base64,${data.image}` : data.image_url ?? undefined;
      setYoloResult({ count: detections.length, detections, imageUrl });
    } catch (err: any) {
      setYoloError(err.message ?? 'Lỗi kết nối YOLO API');
    } finally {
      setYoloLoading(false);
    }
  };

  return (
    <Card className="border-slate-800 bg-[#151E2F] shadow-[0_4px_20px_rgba(0,0,0,0.3)]">
      <CardHeader className="border-b border-slate-800 bg-[#151E2F]">
        <CardTitle className="flex items-center gap-2 text-white">
          <Crosshair className="w-5 h-5 text-orange-400" />
          YOLO – Phát hiện đối tượng
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div
              onClick={() => yoloFileInputRef.current?.click()}
              className="flex flex-col items-center justify-center gap-3 border-2 border-dashed border-slate-700 hover:border-orange-500/50 rounded-xl p-8 cursor-pointer transition-colors bg-[#0B1121] hover:bg-orange-500/5"
            >
              <Upload className="w-10 h-10 text-slate-600" />
              <p className="text-sm text-slate-400">Click để upload ảnh</p>
              <p className="text-xs text-slate-600">JPG, PNG, WEBP</p>
              <input ref={yoloFileInputRef} type="file" accept="image/*" className="hidden" onChange={handleYoloUpload} />
            </div>
            {yoloPreviewUrl && !yoloResult?.imageUrl && (
              <img src={yoloPreviewUrl} alt="preview" className="w-full rounded-xl border border-slate-700 object-cover max-h-64" />
            )}
            {yoloResult?.imageUrl && (
              <img src={yoloResult.imageUrl} alt="yolo visualization" className="w-full rounded-xl border border-slate-700 object-cover" />
            )}
          </div>
          <div className="space-y-3">
            {yoloError && (
              <div className="flex items-center gap-2 text-red-400 text-sm p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                {yoloError}
              </div>
            )}
            {yoloLoading && (
              <div className="flex items-center gap-3 text-orange-400 py-4">
                <Scan className="w-5 h-5 animate-spin" />
                <span className="text-sm">Đang phân tích với YOLO...</span>
              </div>
            )}
            {yoloResult && (
              <>
                <div className="p-4 bg-[#0B1121] rounded-xl border border-slate-800">
                  <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-2">Kết quả phát hiện</p>
                  <div className="text-3xl font-bold text-orange-400">{yoloResult.count}</div>
                  <p className="text-sm text-slate-400 mt-1">đối tượng được phát hiện</p>
                </div>
                {yoloResult.detections.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Chi tiết nhãn</p>
                    {yoloResult.detections.slice(0, 8).map((d, i) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-[#0B1121] rounded-lg border border-slate-800">
                        <div className="flex items-center gap-2">
                          <Tag className="w-4 h-4 text-orange-400" />
                          <span className="text-sm text-slate-200">{d.label}</span>
                        </div>
                        <Badge className={`text-xs ${
                          d.confidence >= 0.9 ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                          : d.confidence >= 0.75 ? "bg-orange-500/10 text-orange-400 border-orange-500/30"
                          : "bg-slate-700 text-slate-400 border-slate-600"
                        }`}>
                          {d.confidence <= 1 ? Math.round(d.confidence * 100) : Math.round(d.confidence)}%
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
            {!yoloLoading && !yoloError && !yoloResult && (
              <div className="text-center py-8 text-slate-600">
                <Crosshair className="w-10 h-10 mx-auto mb-2" />
                <p className="text-sm">Upload ảnh để bắt đầu phân tích YOLO</p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
