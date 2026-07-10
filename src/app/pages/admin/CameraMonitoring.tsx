import { useEffect, useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Camera, Wifi, WifiOff, Activity, RefreshCcw, User, PlayCircle, Trash2, StopCircle } from 'lucide-react';
import { FarmSelector } from '../../components/admin/FarmSelector';
import { useFarm } from '../../contexts/FarmContext';
import { cameraApi, userApi } from '../../../services/endpoints';
import { toast } from 'sonner';

// ============================================================================
// 🚀 COMPONENT TRẠM THU PHÁT WEBRTC (Giống hệt bên MultiCameraView)
// ============================================================================
const WebRtcVideoPlayer = ({ cameraId, className }: { cameraId: string, className: string }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const pollTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'loading' | 'online' | 'offline'>('loading');
  const [statusMessage, setStatusText] = useState('Đang khởi tạo...');

  useEffect(() => {
    let isMounted = true;
    const signalUrl = (import.meta as any).env?.VITE_WEBRTC_SIGNAL_URL || 'https://camera-relay-v1.onrender.com';
    const fetchHeaders = { 'Content-Type': 'application/json' }; // Tạm bỏ JWT khớp V1

    const cleanUpWebrtc = () => {
      if (pollTimerRef.current) { clearInterval(pollTimerRef.current); pollTimerRef.current = null; }
      if (pcRef.current) { pcRef.current.close(); pcRef.current = null; }
      if (videoRef.current) { videoRef.current.srcObject = null; }
    };

    const establishWebRtc = async () => {
      cleanUpWebrtc();
      if (isMounted) {
        setConnectionStatus('loading');
        setStatusText('Đang kiểm tra trạm...');
      }

      try {
        const statusRes = await fetch(`${signalUrl}/api/status`);
        if (!statusRes.ok) throw new Error(`HTTP ${statusRes.status}`);
        const statusData = await statusRes.json();

        if (!statusData.camera_live) {
          if (isMounted) {
            setConnectionStatus('offline');
            setStatusText('Chưa có luồng từ xưởng...');
          }
          pollTimerRef.current = setInterval(async () => {
            try {
              const r = await fetch(`${signalUrl}/api/status`);
              const d = await r.json();
              if (d.camera_live && isMounted) {
                clearInterval(pollTimerRef.current!);
                establishWebRtc();
              }
            } catch (e) {}
          }, 3000);
          return;
        }

        if (isMounted) setStatusText('Đang kết nối P2P...');

        const pc = new RTCPeerConnection({
          iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' },
            {
                urls: (import.meta as any).env?.VITE_TURN_SERVER_URL || "",
                username: (import.meta as any).env?.VITE_TURN_SERVER_USER || "",
                credential: (import.meta as any).env?.VITE_TURN_SERVER_CRED || "",
            }
          ],
        });
        pcRef.current = pc;

        pc.ontrack = (event) => {
          if (event.track.kind === 'video' && videoRef.current && isMounted) {
            setConnectionStatus('online');
            videoRef.current.srcObject = event.streams[0] || new MediaStream([event.track]);
            videoRef.current.play().catch(() => {});
          }
        };

        pc.onconnectionstatechange = () => {
          if (!isMounted) return;
          if (['failed', 'disconnected', 'closed'].includes(pc.connectionState)) {
            establishWebRtc();
          }
        };

        pc.addTransceiver('video', { direction: 'recvonly' });

        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);

        await new Promise<void>((resolve) => {
            if (pc.iceGatheringState === 'complete') resolve();
            else pc.onicegatheringstatechange = () => { if (pc.iceGatheringState === 'complete') resolve(); };
        });

        const response = await fetch(`${signalUrl}/api/view/offer`, {
          method: 'POST',
          headers: fetchHeaders,
          body: JSON.stringify({
            sdp: pc.localDescription?.sdp,
            type: pc.localDescription?.type
          }),
        });

        if (!response.ok) throw new Error(`Server returned HTTP ${response.status}`);
        const answer = await response.json();

        if (pc.signalingState === 'closed') return;
        await pc.setRemoteDescription(new RTCSessionDescription(answer));

      } catch (err: any) {
        if (isMounted) {
          setConnectionStatus('offline');
          setStatusText('Máy chủ bận (Đợi 10s)...');
        }
        setTimeout(() => { if (isMounted) establishWebRtc(); }, 10000);
      }
    };

    establishWebRtc();
    return () => { isMounted = false; cleanUpWebrtc(); };
  }, [cameraId]); 

  return (
    <div className={`relative w-full h-full bg-[#0B1121] overflow-hidden ${className}`}>
      {connectionStatus === 'loading' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 p-4 text-center z-10 bg-black/80">
          <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-2" />
          <p className="text-[10px] font-mono">{statusMessage}</p>
        </div>
      )}
      {connectionStatus === 'offline' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500 p-4 text-center z-10 bg-black/80">
          <WifiOff className="w-8 h-8 text-slate-700 mb-2" />
          <p className="text-[10px] font-medium text-slate-400">{statusMessage}</p>
        </div>
      )}
      <video
        ref={videoRef}
        autoPlay muted playsInline crossOrigin="anonymous"
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 z-0 ${
          connectionStatus === 'online' ? 'opacity-100' : 'opacity-0'
        }`}
      />
    </div>
  );
};


// ============================================================================
// 🚀 GIAO DIỆN CHÍNH
// ============================================================================
export default function CameraMonitoring() {
  const { selectedFarmId } = useFarm();
  const [cameras, setCameras] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  
  // 🚀 STATE QUẢN LÝ CAMERA ĐANG ĐƯỢC PHÁT (TRÁNH QUÁ TẢI SERVER)
  const [activeStreamId, setActiveStreamId] = useState<string | null>(null);

  const fetchCameras = async () => {
    try {
      setLoading(true);
      const [cameraRes, userRes]: [any, any] = await Promise.all([
        cameraApi.getAll(),
        userApi.getAll().catch(() => ({ data: [] }))
      ]);
      
      const camerasData = cameraRes?.data || cameraRes || [];
      const usersData = userRes?.data || userRes || [];

      const formattedCameras = camerasData.map((c: any) => {
        const owner = usersData.find((u: any) => u.id === c.user_id);
        return {
          id: c.id,
          name: c.camera_name || c.name || 'Camera không tên',
          location: c.location || 'Chưa cập nhật vị trí',
          ownerName: owner ? (owner.full_name || owner.name) : 'Khách hàng ẩn danh',
          status: c.status === 'offline' ? 'offline' : 'online',
          farmId: c.user_id || 'FARM-01',
          imageUrl: '', 
          streamUrl: c.stream_url || `rtsp://camera-${String(c.id).substring(0,6)}.mylong.vn/live`,
          activeBatches: 0, 
          lastUpdate: c.created_at || new Date().toISOString()
        };
      });
      
      setCameras(formattedCameras);
    } catch (error) {
      console.error('Lỗi tải danh sách camera:', error);
      toast.error('Không thể tải danh sách camera');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCameras();
  }, []);

  const handleDeleteCamera = async (cameraId: string | number) => {
    const isConfirm = window.confirm("Bạn có chắc chắn muốn xóa Camera này ra khỏi hệ thống không?");
    if (!isConfirm) return;

    try {
      await cameraApi.delete(cameraId.toString()); 
      toast.success('Đã xóa Camera thành công!');
      setCameras(prevCameras => prevCameras.filter(c => c.id !== cameraId));
      if (activeStreamId === cameraId) setActiveStreamId(null);
    } catch (error) {
      console.error('Lỗi khi xóa camera:', error);
      toast.error('Xóa Camera thất bại. Vui lòng thử lại sau.');
    }
  };

  const handlePlayStream = (cameraId: string, cameraName: string) => {
    toast.success(`Đã kết nối WebRTC tới ${cameraName}`);
    setActiveStreamId(cameraId);
  };
  
  const handleStopStream = () => {
    setActiveStreamId(null);
  };

  const filteredCameras = selectedFarmId 
    ? cameras.filter(c => c.farmId === selectedFarmId)
    : cameras;

  const onlineCameras = filteredCameras.filter(c => c.status === 'online').length;
  const offlineCameras = filteredCameras.filter(c => c.status === 'offline').length;

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Camera Monitoring</h1>
          <p className="text-slate-400 mt-1">Giám sát hệ thống Camera AI toàn khu vực</p>
        </div>
        <div className="flex gap-3">
          <FarmSelector />
          <Button 
            className="bg-blue-600 hover:bg-blue-700 text-white" 
            onClick={fetchCameras}
            disabled={loading}
          >
            <RefreshCcw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Làm mới
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Tổng Camera</p>
                <p className="text-3xl font-bold text-white mt-2">{filteredCameras.length}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Camera className="w-6 h-6 text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Online</p>
                <p className="text-3xl font-bold text-green-400 mt-2">{onlineCameras}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-green-500/10 flex items-center justify-center">
                <Wifi className="w-6 h-6 text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Offline</p>
                <p className="text-3xl font-bold text-red-400 mt-2">{offlineCameras}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-red-500/10 flex items-center justify-center">
                <WifiOff className="w-6 h-6 text-red-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Camera Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCameras.map((camera) => (
          <Card key={camera.id} className={`bg-slate-900 border-slate-800 overflow-hidden transition-all ${activeStreamId === camera.id ? 'ring-2 ring-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.3)]' : ''}`}>
            <CardHeader className="pb-3 border-b border-slate-800/50">
              <div className="flex items-center justify-between mb-2">
                <CardTitle className="text-lg text-white truncate pr-2">{camera.name}</CardTitle>
                
                <div className="flex items-center gap-2">
                  <Badge 
                    className={
                      camera.status === 'online' 
                        ? 'bg-green-500/10 text-green-400 border-green-500/20 whitespace-nowrap' 
                        : 'bg-red-500/10 text-red-400 border-red-500/20 whitespace-nowrap'
                    }
                  >
                    {camera.status === 'online' ? (
                      <>
                        <span className="inline-block w-2 h-2 rounded-full bg-green-400 mr-2 animate-pulse"></span>
                        Online
                      </>
                    ) : (
                      <>
                        <WifiOff className="w-3 h-3 mr-1" />
                        Offline
                      </>
                    )}
                  </Badge>
                  
                  <button 
                    onClick={() => handleDeleteCamera(camera.id)}
                    className="p-1.5 rounded-md hover:bg-red-500/20 text-slate-500 hover:text-red-400 transition-colors"
                    title="Xóa Camera này"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <p className="text-sm text-slate-400 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5" />
                  <span className="truncate">{camera.ownerName}</span>
                </p>
                <p className="text-sm text-slate-500 line-clamp-1">{camera.location}</p>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {/* Camera Preview */}
              <div className="relative aspect-video bg-black flex items-center justify-center overflow-hidden">
                {camera.status === 'online' ? (
                  <>
                    {/* 🚀 LOGIC HIỂN THỊ: Nếu đang xem thì render WebRTC, nếu không thì render Nút Play */}
                    {activeStreamId === camera.id ? (
                      <>
                        <WebRtcVideoPlayer cameraId={camera.id} className="" />
                        <button 
                          onClick={handleStopStream}
                          className="absolute top-3 right-3 z-20 flex items-center gap-1 px-2 py-1 rounded-md bg-red-500/80 hover:bg-red-500 text-white backdrop-blur-sm border border-red-600 transition-all cursor-pointer"
                        >
                          <StopCircle className="w-4 h-4" />
                          <span className="text-[10px] font-bold">DỪNG XEM</span>
                        </button>
                      </>
                    ) : (
                      <>
                        <div 
                          className="absolute inset-0 flex items-center justify-center cursor-pointer group bg-slate-900/50 hover:bg-blue-900/20 transition-all"
                          onClick={() => handlePlayStream(camera.id, camera.name)}
                        >
                          <PlayCircle className="w-12 h-12 text-white/50 group-hover:text-blue-400 group-hover:scale-110 transition-all duration-300" />
                        </div>
                        <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 rounded-md bg-black/60 backdrop-blur-sm border border-slate-700 pointer-events-none">
                          <div className="w-2 h-2 rounded-full bg-slate-500"></div>
                          <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">SẴN SÀNG</span>
                        </div>
                      </>
                    )}

                    <div className="absolute bottom-2 left-2 right-2 flex justify-between text-[10px] text-white/50 font-mono bg-black/40 px-2 py-1 rounded pointer-events-none z-10">
                      <span className="truncate pr-4">{camera.streamUrl}</span>
                      <span className="flex-shrink-0">WebRTC</span>
                    </div>
                  </>
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                    <div className="text-center">
                      <WifiOff className="w-12 h-12 text-slate-600 mx-auto mb-2" />
                      <p className="text-sm text-slate-500">Mất kết nối Camera</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Camera Info */}
              <div className="p-4 space-y-3 bg-[#0B1121]">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-400">Lượt nhận diện (Batch)</span>
                  <span className="font-medium text-white">{camera.activeBatches}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-400">Cập nhật lần cuối</span>
                  <span className="font-medium text-slate-300">
                    {new Date(camera.lastUpdate).toLocaleString('vi-VN', {
                      day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit'
                    })}
                  </span>
                </div>

                {camera.status === 'online' && camera.activeBatches > 0 && (
                  <div className="pt-3 border-t border-slate-800">
                    <div className="flex items-center gap-2 text-xs text-green-400 font-medium">
                      <Activity className="w-4 h-4" />
                      <span>AI Model đang chạy nền...</span>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
        
        {/* NẾU KHÔNG CÓ CAMERA */}
        {filteredCameras.length === 0 && !loading && (
          <div className="col-span-full py-12 text-center border-2 border-dashed border-slate-800 rounded-xl bg-slate-900/50">
            <Camera className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400 font-medium">Không tìm thấy Camera nào</p>
            <p className="text-slate-500 text-sm mt-1">Vui lòng kiểm tra lại bộ lọc nông trại hoặc thêm camera mới.</p>
          </div>
        )}
      </div>

      {/* System Info */}
      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle className="text-white">Thông tin hệ thống AI Server</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-slate-300">Cấu hình AI Detection</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">Độ chính xác trung bình</span>
                  <span className="text-white font-medium">95.2%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Tần suất quét</span>
                  <span className="text-white font-medium">5 giây/lần</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Model AI</span>
                  <span className="text-cyan-400 font-medium">YOLOv8-custom</span>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-slate-300">Trạng thái kết nối</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">Độ trễ trung bình</span>
                  <span className="text-green-400 font-medium">45ms</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Băng thông sử dụng</span>
                  <span className="text-white font-medium">2.4 MB/s</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Uptime</span>
                  <span className="text-emerald-400 font-medium">99.8%</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}