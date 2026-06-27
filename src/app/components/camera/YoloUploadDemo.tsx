import { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Upload, Scan, Tag, Crosshair, AlertTriangle, Crown, Zap, Percent } from 'lucide-react';
import { toast } from 'sonner';

import { useAuth } from '../../contexts/AuthContext'; 
import apiClient from '../../../services/api';
import { detectionApi } from '../../../services/endpoints'; 

interface YoloUploadDemoProps {}

// ==========================================
// 1. TỪ ĐIỂN NHÃN (CLASS MAPPING)
// ==========================================
const CLASS_NAMES: Record<number, string> = {
  0: "Bánh tráng mè đen",
  1: "Bánh tráng sữa",
  2: "Bánh tráng rách (Lỗi)",
};

const MAX_FREE_LIMIT = 10; 

// ==========================================
// 2. HÀM NÉN ẢNH TRƯỚC KHI UPLOAD
// ==========================================
const compressImage = (file: File): Promise<File> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 640; 
        const MAX_HEIGHT = 640;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);

        canvas.toBlob((blob) => {
          if (blob) {
            const newFileName = file.name.replace(/\.[^/.]+$/, "") + ".jpg";
            resolve(new File([blob], newFileName, { type: 'image/jpeg' }));
          } else {
            resolve(file); 
          }
        }, 'image/jpeg', 0.8);
      };
    };
  });
};

export function YoloUploadDemo({}: YoloUploadDemoProps) {
  const navigate = useNavigate();
  const { user } = useAuth(); 
  const isPremium = user?.role === 'premium' || user?.role === 'admin'; 

  const yoloFileInputRef = useRef<HTMLInputElement>(null);
  const [yoloPreviewUrl, setYoloPreviewUrl] = useState<string | null>(null);
  const [yoloLoading, setYoloLoading] = useState(false);
  const [yoloError, setYoloError] = useState<string | null>(null);
  const [usageCount, setUsageCount] = useState(0); 
  
  // 🚀 State lưu ID của Camera đầu tiên (Mặc định)
  const [selectedDbCamera, setSelectedDbCamera] = useState<string>('');

  const [yoloResult, setYoloResult] = useState<{
    count: number;
    avgConfidence: number; 
    detections: { label: string; confidence: number; bbox: number[] }[];
    imageUrl?: string;
  } | null>(null);

  // Khởi tạo đếm lượt dùng (Free) và Tự động lấy Camera ID mặc định
  useEffect(() => {
    if (!isPremium) {
      const today = new Date().toISOString().split('T')[0];
      const storedCount = localStorage.getItem(`yolo_usage_${today}`);
      if (storedCount) {
        setUsageCount(parseInt(storedCount, 10));
      } else {
        setUsageCount(0);
      }
    }

    // 🚀 Tự động tải danh sách Camera và chốt ID của Camera đầu tiên
    const getDatabaseCameras = async () => {
      try {
        const res: any = await apiClient.get('/camera');
        const data = res?.data || res || [];
        // Nếu có ít nhất 1 camera trong DB, tự động lấy ID của camera số 0
        if (Array.isArray(data) && data.length > 0) {
          setSelectedDbCamera(data[0].id);
        }
      } catch (err) {
        console.warn("Không thể tải danh sách Camera", err);
      }
    };
    getDatabaseCameras();
  }, [isPremium]);

  // ==========================================
  // 3. XỬ LÝ UPLOAD VÀ GỌI API YOLO
  // ==========================================
  const handleYoloUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const originalFile = e.target.files?.[0];
    if (!originalFile) return;

    if (!isPremium && usageCount >= MAX_FREE_LIMIT) {
      toast.error("Bạn đã dùng hết lượt quét miễn phí hôm nay!");
      if (yoloFileInputRef.current) yoloFileInputRef.current.value = '';
      return;
    }

    setYoloLoading(true);
    setYoloError(null);
    setYoloResult(null);
    
    try {
      const compressedFile = await compressImage(originalFile);
      const previewUrl = URL.createObjectURL(compressedFile);
      setYoloPreviewUrl(previewUrl);

      const base64String = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const rawDataUrl = reader.result as string;
          const b64 = rawDataUrl.includes(",") ? rawDataUrl.split(",")[1] : rawDataUrl;
          resolve(b64);
        };
        reader.readAsDataURL(compressedFile);
      });
      
      const API_BASE_URL = (import.meta as any).env?.VITE_AI_URL || 'https://huntrot-mylongai-backed-modelai.hf.space';
      let response: Response | null = null;
      
      for (let attempt = 0; attempt < 3; attempt++) {
        if (attempt > 0) {
          setYoloError(`Server AI báo bận... thử lại (${attempt}/2)`);
          await new Promise(r => setTimeout(r, 4000)); 
        }
        
        response = await fetch(`${API_BASE_URL}/ai/detect-realtime`, { 
          method: 'POST', 
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ image: base64String }) 
        });
        
        if (response.status === 403) {
           setUsageCount(MAX_FREE_LIMIT); 
           throw new Error("Bạn đã hết lượt quét miễn phí. Vui lòng nâng cấp Premium!");
        }

        if (response.status === 429) {
          response = null;
          continue; 
        }
        
        const ct = response?.headers.get('content-type') ?? '';
        if (ct.includes('application/json')) break;
        response = null;
      }
      
      if (!response) throw new Error('Server AI đang quá tải, vui lòng thử lại sau.');
      if (!response.ok) throw new Error(`Lỗi kết nối AI (HTTP ${response.status})`);
      
      setYoloError(null);
      const data = await response.json();
      const raw = data.objects ?? [];
      
      const detections = raw.map((d: any) => ({
        label: d.label ?? (CLASS_NAMES[d.class] ?? `Nhãn lạ (ID: ${d.class})`),
        confidence: d.confidence,
        bbox: d.bbox ?? [],
      })).filter((d: any) => d.confidence >= 0.4); 
      
      const detectedCount = detections.length;
      const totalConf = detections.reduce((sum: number, d: any) => sum + d.confidence, 0);
      const avgConf = detectedCount > 0 ? totalConf / detectedCount : 0;

      setYoloResult({ 
        count: detectedCount, 
        avgConfidence: avgConf,
        detections, 
        imageUrl: previewUrl 
      });
      
      if (!isPremium) {
        const today = new Date().toISOString().split('T')[0];
        const newCount = usageCount + 1;
        setUsageCount(newCount);
        localStorage.setItem(`yolo_usage_${today}`, newCount.toString());
      }

      // 🚀 TỰ ĐỘNG BẮN API LƯU VÀO DATABASE NẾU TỒN TẠI CAMERA ĐẦU TIÊN
      if (selectedDbCamera) {
        try {
          console.log("⏳ Đang tự động lưu kết quả Upload vào Database...");
          await detectionApi.create({
            camera_id: selectedDbCamera,
            detected_count: detectedCount,
            confidence: avgConf
          });
          console.log("✅ Đã lưu Database thành công vào Camera ID:", selectedDbCamera);
        } catch (dbErr) {
          console.error("❌ Lỗi lưu Database:", dbErr);
        }
      }

      if (detectedCount > 0) {
        toast.success(`Phân tích xong! Phát hiện ${detectedCount} đối tượng.`);
      } else {
        toast.info("Không phát hiện đối tượng nào trong ảnh.");
      }
      
    } catch (err: any) {
      setYoloError(err.message ?? 'Lỗi kết nối API');
    } finally {
      setYoloLoading(false);
      if (yoloFileInputRef.current) {
        yoloFileInputRef.current.value = '';
      }
    }
  };

  return (
    <Card className="border-slate-800 bg-[#151E2F] shadow-[0_4px_20px_rgba(0,0,0,0.3)]">
      <CardHeader className="border-b border-slate-800 bg-[#151E2F]">
        <CardTitle className="flex flex-col md:flex-row items-start md:items-center justify-between text-white gap-4">
          <div className="flex items-center gap-2">
            <Crosshair className="w-5 h-5 text-orange-400" />
            YOLO – Upload & Phân tích
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            {/* Đã xóa Dropdown chọn Camera màu xanh lá ở đây */}

            {/* HIỂN THỊ TRẠNG THÁI GÓI VÀ SỐ LƯỢT */}
            {isPremium ? (
               <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 shadow-[0_0_10px_rgba(245,158,11,0.3)] flex items-center gap-1.5 py-1.5">
                 <Crown className="w-3.5 h-3.5" /> Premium (Không giới hạn)
               </Badge>
            ) : (
               <Badge className="bg-slate-800 text-slate-300 border border-slate-600 py-1.5">
                 Free: {usageCount}/{MAX_FREE_LIMIT} lượt hôm nay
               </Badge>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            
            {/* GIAO DIỆN UPLOAD HOẶC KHÓA UPLOAD */}
            {!isPremium && usageCount >= MAX_FREE_LIMIT ? (
              <div className="flex flex-col items-center justify-center gap-4 border-2 border-dashed border-amber-500/50 rounded-xl p-8 bg-amber-500/5 text-center">
                <Crown className="w-12 h-12 text-amber-400 mb-2" />
                <div>
                  <h3 className="text-lg font-bold text-amber-400">Đã hết lượt quét miễn phí!</h3>
                  <p className="text-sm text-slate-400 mt-1">Bạn đã dùng hết {MAX_FREE_LIMIT}/{MAX_FREE_LIMIT} lượt của ngày hôm nay.</p>
                </div>
                <Button 
                  onClick={() => navigate('/dashboard/payment')} 
                  className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold w-full md:w-auto shadow-lg shadow-amber-500/20"
                >
                  <Zap className="w-4 h-4 mr-2" /> Nâng Cấp Premium Ngay
                </Button>
              </div>
            ) : (
              <div
                onClick={() => yoloFileInputRef.current?.click()}
                className={`flex flex-col items-center justify-center gap-3 border-2 border-dashed border-slate-700 hover:border-orange-500/50 rounded-xl p-8 cursor-pointer transition-all bg-[#0B1121] hover:bg-orange-500/5 ${yoloLoading ? 'opacity-50 pointer-events-none' : ''}`}
              >
                <Upload className="w-10 h-10 text-slate-600" />
                <p className="text-sm text-slate-400">Click để upload ảnh thủ công</p>
                <p className="text-xs text-slate-600">Hỗ trợ: JPG, PNG, WEBP</p>
                <input ref={yoloFileInputRef} type="file" accept="image/*" className="hidden" onChange={handleYoloUpload} disabled={yoloLoading} />
              </div>
            )}
            
            {yoloPreviewUrl && (
              <div className="relative rounded-xl overflow-hidden border border-slate-700">
                <img 
                  src={yoloPreviewUrl} 
                  alt="Bánh tráng upload" 
                  className={`w-full object-cover max-h-80 transition-opacity duration-300 ${yoloLoading ? "opacity-40 blur-sm" : "opacity-100"}`} 
                />
                {yoloLoading && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <Scan className="w-10 h-10 text-orange-400 animate-spin mb-2" />
                    <span className="text-orange-400 font-medium text-sm drop-shadow-md">AI Đang quét...</span>
                  </div>
                )}
              </div>
            )}
          </div>
          
          <div className="space-y-3">
            {yoloError && (
              <div className="flex items-start gap-2 text-red-400 text-sm p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                {yoloError}
              </div>
            )}
            
            {yoloResult && (
              <>
                <div className="p-4 bg-[#0B1121] rounded-xl border border-slate-800 flex flex-col justify-between">
                  <div>
                    <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-2">Kết quả phân tích</p>
                    <div className="text-3xl font-bold text-orange-400">{yoloResult.count}</div>
                    <p className="text-sm text-slate-400 mt-1">đối tượng được tìm thấy trên hình ảnh</p>
                  </div>

                  <div className="mt-4 pt-4 border-t border-slate-800/50 flex justify-between items-center">
                    <div className="flex items-center gap-2 text-slate-400 text-sm">
                      <Percent className="w-4 h-4 text-emerald-400" />
                      Độ tin cậy AI:
                    </div>
                    <div className={`font-bold text-lg ${yoloResult.avgConfidence >= 0.8 ? 'text-emerald-400' : yoloResult.avgConfidence >= 0.5 ? 'text-amber-400' : 'text-red-400'}`}>
                      {yoloResult.count > 0 ? `${(yoloResult.avgConfidence * 100).toFixed(1)}%` : "0%"}
                    </div>
                  </div>
                </div>

                {yoloResult.detections.length > 0 && (
                  <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                    <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider sticky top-0 bg-[#151E2F] py-1 z-10">
                      Chi tiết danh sách ({yoloResult.detections.length})
                    </p>
                    {yoloResult.detections.map((d, i) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-[#0B1121] rounded-lg border border-slate-800 hover:border-slate-600 transition-colors">
                        <div className="flex items-center gap-2">
                          <Tag className="w-4 h-4 text-orange-400" />
                          <span className="text-sm text-slate-200">{d.label}</span>
                        </div>
                        <Badge className={`text-xs ${
                          d.confidence >= 0.9 ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                          : d.confidence >= 0.75 ? "bg-orange-500/10 text-orange-400 border-orange-500/30"
                          : "bg-slate-700 text-slate-400 border-slate-600"
                        }`}>
                          {Math.round(d.confidence * 100)}%
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {!yoloLoading && !yoloError && !yoloResult && (
              <div className="text-center py-12 text-slate-600 border border-dashed border-slate-800 rounded-xl bg-[#0B1121]/50 h-[300px] flex flex-col items-center justify-center">
                <Crosshair className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm font-medium">Tải ảnh lên để xem kết quả phân tích</p>
                <p className="text-xs mt-2 opacity-70 max-w-[200px]">Kết quả sẽ được tự động lưu vào Database hệ thống</p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}