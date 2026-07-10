import { useRef, useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Camera, Trash2, WifiOff } from 'lucide-react';

export interface CameraData {
  id: string;
  name: string;
  zone: string;
  status: 'active' | 'offline' | 'inactive'; 
  hasDetection: boolean;
  streamUrl?: string; 
}

interface MultiCameraViewProps {
  cameras: CameraData[];
  selectedCamera: string;
  onSelectCamera: (id: string) => void;
  onDeleteCamera: (id: string) => void;
}

// 🚀 COMPONENT TRẠM THU PHÁT WEBRTC CHUYÊN DỤNG TRÊN WEB
const WebRtcVideoPlayer = ({ cameraId, className }: { cameraId: string, className: string }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const pollTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'loading' | 'online' | 'offline'>('loading');
  const [statusMessage, setStatusText] = useState('Đang khởi tạo...');

  useEffect(() => {
    let isMounted = true;
    
    // 🚀 LẤY URL TRẠM WEBRTC TỪ ENV
    const signalUrl = (import.meta as any).env?.VITE_WEBRTC_SIGNAL_URL || 'https://camera-relay-v1.onrender.com';
    
    // Tạm thời bỏ JWT Headers để khớp với file HTML test chạy thành công (V1 Server)
    const fetchHeaders = {
      'Content-Type': 'application/json'
    };

    console.log(`🔗 Khởi tạo WebRTC (Phiên bản khớp HTML Test) cho Camera [${cameraId}] qua trạm:`, signalUrl);

    const cleanUpWebrtc = () => {
      if (pollTimerRef.current) {
        clearInterval(pollTimerRef.current);
        pollTimerRef.current = null;
      }
      if (pcRef.current) {
        pcRef.current.close();
        pcRef.current = null;
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    };

    const establishWebRtc = async () => {
      cleanUpWebrtc();
      if (isMounted) {
        setConnectionStatus('loading');
        setStatusText('Đang kiểm tra kết nối trạm...');
      }

      try {
        // 1. Kiểm tra trạng thái camera (Giống file HTML)
        const statusRes = await fetch(`${signalUrl}/api/status`);
        if (!statusRes.ok) throw new Error(`HTTP ${statusRes.status}`);
        
        const statusData = await statusRes.json();

        // Nếu camera chưa live, vào chế độ chờ (polling 3s)
        if (!statusData.camera_live) {
          if (isMounted) {
            setConnectionStatus('offline');
            setStatusText('Camera tại xưởng chưa đẩy luồng. Đang chờ...');
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

        if (isMounted) setStatusText('Đang thiết lập kết nối ngang hàng (Peer-to-Peer)...');

        // 2. Tạo đối tượng WebRTC (Bảo mật TURN Server bằng biến môi trường)
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

        // 3. Đăng ký nhận luồng video và Ép Phát (Giống file HTML)
        pc.ontrack = (event) => {
          if (event.track.kind === 'video' && videoRef.current && isMounted) {
            console.log("✅ Đã nhận được luồng Video từ Xưởng!");
            setConnectionStatus('online');
            const stream = event.streams[0] || new MediaStream([event.track]);
            videoRef.current.srcObject = stream;
            
            // Ép video phát để vượt qua chính sách Autoplay của trình duyệt
            videoRef.current.play().catch(err => {
                console.warn(`Autoplay warning: ${err.message}.`);
            });
          }
        };

        // 4. Theo dõi vòng đời kết nối
        pc.onconnectionstatechange = () => {
          if (!isMounted) return;
          const state = pc.connectionState;
          console.log(`⚡ Trạng thái ICE WebRTC: ${state}`);
          
          if (['failed', 'disconnected', 'closed'].includes(state)) {
            console.warn(`⚠️ WebRTC [${cameraId}] bị ngắt, đang thiết lập lại...`);
            establishWebRtc();
          }
        };

        // 5. Thêm cấu hình chỉ nhận video
        pc.addTransceiver('video', { direction: 'recvonly' });

        // 6. Tạo lời mời (Offer SDP)
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);

        // Đợi ICE Gathering hoàn tất (Cách của HTML test)
        await new Promise<void>((resolve) => {
            if (pc.iceGatheringState === 'complete') {
                resolve();
            } else {
                pc.onicegatheringstatechange = () => {
                    console.log(`ICE Gathering state: ${pc.iceGatheringState}`);
                    if (pc.iceGatheringState === 'complete') resolve();
                };
            }
        });

        // 7. Gửi Offer lên Server (Bỏ camera_id để khớp với cấu trúc Server V1 hiện tại)
        const response = await fetch(`${signalUrl}/api/view/offer`, {
          method: 'POST',
          headers: fetchHeaders,
          body: JSON.stringify({
            sdp: pc.localDescription?.sdp,
            type: pc.localDescription?.type
          }),
        });

        if (!response.ok) {
            throw new Error(`Server returned HTTP ${response.status}`);
        }

        const answer = await response.json();

        // Chặn lỗi Race Condition (Đường ống bị đóng trước khi set data)
        if (pc.signalingState === 'closed') {
            console.warn(`⚠️ Đường ống WebRTC đã đóng trước khi nhận Answer SDP. Bỏ qua.`);
            return;
        }

        await pc.setRemoteDescription(new RTCSessionDescription(answer));

      } catch (err: any) {
        console.error(`❌ Lỗi kết nối WebRTC [${cameraId}]:`, err.message);
        if (isMounted) {
          setConnectionStatus('offline');
          setStatusText('Máy chủ đang khởi động hoặc từ chối truy cập (Đợi 30s)...');
        }
        setTimeout(() => { if (isMounted) establishWebRtc(); }, 10000);
      }
    };

    establishWebRtc();

    return () => {
      isMounted = false;
      cleanUpWebrtc();
    };
  }, [cameraId]); 

  return (
    <div className="relative w-full h-full bg-[#0B1121] rounded-lg overflow-hidden border border-slate-800">
      
      {/* Giao diện Loading */}
      {connectionStatus === 'loading' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 p-4 text-center z-10">
          <div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-xs font-mono">{statusMessage}</p>
        </div>
      )}

      {/* Giao diện Lỗi / Offline */}
      {connectionStatus === 'offline' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500 p-4 text-center z-10">
          <WifiOff className="w-10 h-10 text-slate-700 mb-2" />
          <p className="text-xs font-medium text-slate-400">{statusMessage}</p>
        </div>
      )}

      {/* THẺ VIDEO LUÔN TỒN TẠI */}
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        crossOrigin="anonymous"
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 z-0 ${
          connectionStatus === 'online' ? 'opacity-100' : 'opacity-0'
        }`}
      />
    </div>
  );
};


// 🚀 COMPONENT GIAO DIỆN CHÍNH MULTI CAMERA
export function MultiCameraView({ cameras, selectedCamera, onSelectCamera, onDeleteCamera }: MultiCameraViewProps) {
  const selectedCam = cameras.find(c => c.id === selectedCamera) || cameras[0];

  if (!selectedCam) return null; 

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {cameras.map((camera) => (
          <Card
            key={camera.id}
            onClick={() => onSelectCamera(camera.id)}
            className={`cursor-pointer transition-all duration-300 relative group ${
              selectedCamera === camera.id
                ? 'border-cyan-500 bg-cyan-500/5 shadow-[0_0_20px_rgba(6,182,212,0.2)]'
                : 'border-slate-800 bg-[#151E2F] hover:border-slate-700'
            }`}
          >
            <button
              onClick={(e) => {
                e.stopPropagation(); 
                onDeleteCamera(camera.id);
              }}
              className="absolute top-2 right-2 p-1.5 bg-red-500/80 hover:bg-red-500 text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity z-20"
              title="Ngắt kết nối"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>

            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-slate-800">
                    <Camera className="w-4 h-4 text-cyan-400" />
                  </div>
                  <div>
                    <CardTitle className="text-sm text-white truncate max-w-[120px]" title={camera.name}>
                      {camera.name}
                    </CardTitle>
                  </div>
                </div>
                {camera.status === 'active' && (
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse mr-6 group-hover:hidden" />
                )}
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-0 space-y-3">
              <div className="relative aspect-video">
                
                {/* Gọi Component Video */}
                <WebRtcVideoPlayer cameraId={camera.id} className="" />

                <div className="absolute top-1 right-1 flex items-center gap-1 bg-red-500/20 border border-red-500/30 px-1.5 py-0.5 rounded z-20">
                  <div className="w-1 h-1 bg-red-500 rounded-full animate-pulse" />
                  <span className="text-[10px] font-semibold text-red-400">REC</span>
                </div>
              </div>
              <Badge className="text-[10px] w-full justify-center bg-slate-700 text-slate-300 border-slate-600">
                WebRTC Real-time
              </Badge>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-slate-800 bg-[#151E2F] shadow-[0_4px_20px_rgba(0,0,0,0.3)]">
        <CardHeader className="border-b border-slate-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-sky-500 rounded-xl flex items-center justify-center shadow-lg">
                <Camera className="w-5 h-5 text-slate-900" />
              </div>
              <div>
                <CardTitle className="text-white">{selectedCam.name}</CardTitle>
                <p className="text-sm text-slate-400 mt-1">{selectedCam.zone}</p>
              </div>
            </div>
            <Badge className="bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 animate-pulse">
              ĐỒNG BỘ THỜI GIAN THỰC
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="relative aspect-video">
            
            {/* Gọi Component Video Màn Lớn */}
            <WebRtcVideoPlayer cameraId={selectedCam.id} className="" />

            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#0B1121]/80 z-10 pointer-events-none" />
            <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 z-10 pointer-events-none">
              {Array.from({ length: 9 }).map((_, i) => (
                <div key={i} className="border border-cyan-500/10" />
              ))}
            </div>

            <div className="absolute top-4 left-4 bg-[#0B1121]/80 backdrop-blur-md px-3 py-2 rounded-lg z-20 font-mono text-xs text-slate-300 space-y-1 border border-slate-800">
              <div>UUID: {selectedCam.id}</div>
              <div className="text-cyan-400">{new Date().toLocaleTimeString('vi-VN')}</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}