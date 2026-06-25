import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { CheckCircle2, QrCode, AlertTriangle, Loader2, Zap, CreditCard, Copy, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';

// 🚀 Sử dụng apiClient đã cấu hình sẵn
import apiClient from '../../services/api'; 

export default function UpgradePremium() {
  const [order, setOrder] = useState<any>(null);
  const [isPaid, setIsPaid] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ==============================================
  // 1. GỌI API TẠO ĐƠN HÀNG LẤY QR 
  // ==============================================
  const handleUpgrade = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await apiClient.post('/payment/create-order');
      setOrder(data);
      startPolling();
    } catch (err: any) {
      if (err.response?.status === 400) {
        toast.info('Tài khoản của bạn đã là Premium rồi!');
        setIsPaid(true);
      } else {
        setError(err.response?.data?.detail || err.message || "Lỗi hệ thống, không thể tạo đơn hàng.");
      }
    } finally {
      setLoading(false);
    }
  };

  // ==============================================
  // 2. POLLING: KIỂM TRA PROFILE 
  // ==============================================
  const startPolling = () => {
    pollIntervalRef.current = setInterval(async () => {
      try {
        const profile: any = await apiClient.get('/auth/profile');
        if (profile.role === 'premium') {
          stopPolling();
          setIsPaid(true);
          toast.success("Thanh toán thành công! Chào mừng đến với gói Premium 🎉");
        }
      } catch (err) {
        console.error("Lỗi khi poll profile:", err);
      }
    }, 5000);

    timeoutRef.current = setTimeout(() => {
      stopPolling();
      setError("Mã QR đã hết hạn (quá 15 phút). Vui lòng tải lại trang để tạo đơn mới.");
      setOrder(null);
    }, 15 * 60 * 1000);
  };

  const stopPolling = () => {
    if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  };

  useEffect(() => {
    return () => stopPolling();
  }, []);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Đã copy vào khay nhớ tạm!");
  };

  // ==============================================
  // GIAO DIỆN 3: THÀNH CÔNG
  // ==============================================
  if (isPaid) {
    return (
      <div className="h-full min-h-[calc(100vh-8rem)] flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl border-emerald-500/30 bg-[#151E2F] shadow-[0_0_50px_rgba(16,185,129,0.15)] text-center py-16 rounded-2xl">
          <CardContent className="space-y-6">
            <div className="w-24 h-24 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-16 h-16 text-emerald-400 animate-bounce" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-white">Nâng Cấp Thành Công!</h2>
              <p className="text-slate-400 max-w-md mx-auto mt-4 text-lg">
                Tài khoản của bạn đã được kích hoạt gói Premium. Bây giờ bạn có thể trải nghiệm tất cả các tính năng cao cấp không giới hạn.
              </p>
            </div>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-8 px-8 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold text-lg transition-colors shadow-lg shadow-emerald-500/25"
            >
              Trải nghiệm ngay
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ==============================================
  // GIAO DIỆN 2: CHỜ THANH TOÁN (HIỂN THỊ QR)
  // ==============================================
  if (order) {
    return (
      <div className="h-full min-h-[calc(100vh-8rem)] flex items-center justify-center p-4">
        <Card className="w-full max-w-4xl border-slate-800 bg-[#0B1121] shadow-2xl flex flex-col overflow-hidden rounded-2xl">
          <CardHeader className="border-b border-slate-800 bg-[#151E2F] text-center py-6">
            <CardTitle className="text-white text-2xl flex items-center justify-center gap-3">
              <QrCode className="w-8 h-8 text-cyan-400" />
              Thanh toán gói Premium
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8 flex-grow flex flex-col justify-center">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              
              {/* Cột trái: QR Code */}
              <div className="flex flex-col items-center space-y-6">
                <div className="bg-white p-6 rounded-2xl shadow-[0_0_30px_rgba(255,255,255,0.1)] relative">
                  <img src={order.qr_url} alt="QR thanh toán VietQR" className="w-64 h-64 object-contain" />
                </div>
                <div className="flex items-center gap-3 text-orange-400 animate-pulse bg-orange-500/10 px-6 py-3 rounded-full border border-orange-500/20">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span className="text-base font-semibold">Hệ thống đang chờ thanh toán...</span>
                </div>
              </div>

              {/* Cột phải: Thông tin */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
                    <ShieldCheck className="w-5 h-5 text-emerald-400" />
                    Thông tin chuyển khoản
                  </h3>
                  
                  <div className="bg-[#151E2F] rounded-xl p-5 border border-slate-700/50 space-y-4 text-base">
                    <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                      <span className="text-slate-400">Ngân hàng:</span>
                      <span className="font-bold text-slate-100">{order.bank_name}</span>
                    </div>
                    
                    <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                      <span className="text-slate-400">Chủ tài khoản:</span>
                      <span className="font-bold text-slate-100">{order.account_name}</span>
                    </div>

                    <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                      <span className="text-slate-400">Số tài khoản:</span>
                      <div className="flex items-center gap-3 text-cyan-400 font-bold text-lg">
                        {order.bank_account}
                        <button onClick={() => copyToClipboard(order.bank_account)} className="text-slate-500 hover:text-white transition-colors bg-slate-800 p-1.5 rounded-md">
                          <Copy className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                      <span className="text-slate-400">Số tiền:</span>
                      <span className="font-black text-emerald-400 text-2xl">{order.amount.toLocaleString('vi-VN')} đ</span>
                    </div>

                    <div className="flex justify-between items-center pt-1">
                      <span className="text-slate-400">Nội dung:</span>
                      <div className="flex items-center gap-3 text-orange-400 font-bold bg-orange-500/10 px-3 py-1.5 rounded-lg border border-orange-500/20">
                        <span className="text-lg tracking-wider">{order.content}</span>
                        <button onClick={() => copyToClipboard(order.content)} className="text-orange-500 hover:text-orange-300 transition-colors">
                          <Copy className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3 text-amber-400 text-sm p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl">
                  <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <p className="leading-relaxed">Nếu bạn chuyển khoản thủ công, vui lòng ghi chính xác <strong>Nội dung chuyển khoản</strong> để hệ thống tự động kích hoạt (thường mất 5-30 giây).</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ==============================================
  // GIAO DIỆN 1: TRƯỚC KHI TẠO ĐƠN (LANDING MỞ RỘNG)
  // ==============================================
  return (
    <div className="h-full min-h-[calc(100vh-8rem)] flex items-center justify-center p-4">
      <Card className="w-full max-w-3xl flex flex-col border-slate-800 bg-[#0B1121] shadow-2xl overflow-hidden rounded-2xl min-h-[600px]">
        {/* Header với dải màu theo chuẩn UI cũ */}
        <CardHeader className="bg-gradient-to-b from-[#1E293B] to-[#0B1121] border-b border-slate-800/50 py-8">
          <CardTitle className="text-white text-2xl md:text-3xl flex items-center justify-center gap-3 font-bold">
            <Zap className="w-8 h-8 text-purple-400" />
            Mở Khóa Toàn Bản Quyền
          </CardTitle>
          <p className="text-center text-slate-400 mt-3 text-base">
            Nâng cấp hệ thống giám sát nông nghiệp thông minh của bạn lên mức tối đa
          </p>
        </CardHeader>
        
        <CardContent className="p-8 flex-grow flex flex-col justify-between">
          
          {error && (
            <div className="flex items-center justify-center gap-2 text-red-400 text-base p-4 bg-red-500/10 border border-red-500/20 rounded-xl mb-6">
              <AlertTriangle className="w-5 h-5 flex-shrink-0" />
              {error}
            </div>
          )}

          {/* Phần hiển thị mức giá khổng lồ */}
          <div className="flex flex-col items-center justify-center my-6">
            <span className="text-slate-500 uppercase tracking-widest text-sm font-semibold mb-3">Gói Premium Ưu Đãi</span>
            <div className="flex items-baseline gap-1">
              <span className="text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">
                10.000
              </span>
              <span className="text-3xl font-bold text-slate-300">đ</span>
            </div>
            <span className="text-emerald-400 font-medium mt-3 bg-emerald-500/10 px-4 py-1.5 rounded-full border border-emerald-500/20">
              Thanh toán một lần - Mở khóa mãi mãi
            </span>
          </div>

          {/* Danh sách đặc quyền căn giữa, chữ to, icon rõ ràng */}
          <div className="flex justify-center my-8">
            <div className="space-y-4">
              <h3 className="font-semibold text-slate-200 text-lg mb-4 text-center">Đặc quyền tài khoản Premium:</h3>
              <ul className="space-y-4 text-base text-slate-300">
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="w-6 h-6 text-[#10b981]" /> 
                  <span>Xem lịch sử cảm biến <strong>Không giới hạn</strong></span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="w-6 h-6 text-[#10b981]" /> 
                  <span>AI Nhận diện bánh <strong>Không giới hạn</strong></span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="w-6 h-6 text-[#10b981]" /> 
                  <span>Quản lý Camera <strong>Không giới hạn</strong></span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="w-6 h-6 text-[#10b981]" /> 
                  <span>Nhận Khuyến nghị thời tiết <strong>thông minh</strong></span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="w-6 h-6 text-[#10b981]" /> 
                  <span>AI <strong>dự đoán chính xác</strong> thời gian phơi</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Nút bấm dải màu chuẩn thiết kế */}
          <div className="mt-auto pt-6">
            <button
              onClick={handleUpgrade}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-[#a855f7] to-[#06b6d4] hover:opacity-90 text-white font-bold py-4 px-6 rounded-xl transition-all shadow-[0_0_20px_rgba(168,85,247,0.3)] disabled:opacity-50 text-lg"
            >
              {loading ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <CreditCard className="w-6 h-6" />
              )}
              {loading ? "Đang khởi tạo mã thanh toán..." : "Nâng Cấp Premium Ngay - 10.000đ"}
            </button>
            <p className="text-center text-slate-500 text-sm mt-4">
              Giao dịch được mã hóa và bảo mật an toàn 100%
            </p>
          </div>

        </CardContent>
      </Card>
    </div>
  );
}