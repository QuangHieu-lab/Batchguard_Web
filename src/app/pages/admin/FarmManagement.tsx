import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, Wifi, Camera, X, PlayCircle, User, MapPin, Plus, Trash2, Edit, StopCircle, Link2, WifiOff } from 'lucide-react';
import { cameraApi, userApi } from '../../../services/endpoints';
import { toast } from 'sonner';
import { Room, RoomEvent } from 'livekit-client';

// ============================================================================
// 🚀 COMPONENT: TRẠM THU PHÁT LIVEKIT CLOUD DÀNH CHO ADMIN
// ============================================================================
const LiveKitVideoPlayer = ({ cameraId, className }: { cameraId: string, className?: string }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const roomRef = useRef<Room | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'loading' | 'online' | 'offline'>('loading');
  const [statusMessage, setStatusText] = useState('Đang xin cấp Token...');

  useEffect(() => {
    let isMounted = true;

    const connectLiveKit = async () => {
      try {
        // Nếu cameraId (được truyền từ stream_url) mà rỗng, dừng luôn
        if (!cameraId || cameraId.trim() === '') {
          if (isMounted) {
            setConnectionStatus('offline');
            setStatusText('Chưa cấu hình Camera ID');
          }
          return;
        }

        const signalUrl = (import.meta as any).env?.VITE_WEBRTC_SIGNAL_URL || 'https://camera-relay-v5.onrender.com';
        const roomName = "mylongai"; 

        const response = await fetch(`${signalUrl}/api/cameras/${cameraId}/token`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            identity: `admin_viewer_${Math.random().toString(36).substring(7)}`,
            room_name: roomName,
            is_publisher: false
          })
        });

        if (!response.ok) throw new Error(`Lỗi cấp Token: ${response.status}`);
        const { token, server_url } = await response.json();

        if (!isMounted) return;
        setStatusText('Đang vào phòng LiveKit...');

        const room = new Room({ adaptiveStream: true, dynacast: true });
        roomRef.current = room;

        room.on(RoomEvent.TrackSubscribed, (track) => {
          if (track.kind === 'video' && videoRef.current) {
            track.attach(videoRef.current);
            if (isMounted) setConnectionStatus('online');
          }
        });

        room.on(RoomEvent.TrackUnsubscribed, (track) => {
          if (videoRef.current) track.detach(videoRef.current);
          if (isMounted) {
            setConnectionStatus('offline');
            setStatusText('Camera xưởng đã dừng phát');
          }
        });

        room.on(RoomEvent.Disconnected, () => {
          if (isMounted) {
            setConnectionStatus('offline');
            setStatusText('Mất kết nối tới máy chủ');
          }
        });

        await room.connect(server_url, token);
        setStatusText('Đang đợi hình ảnh...');

        setTimeout(() => {
          if (isMounted && room.state === 'connected' && videoRef.current?.readyState === 0) {
            setStatusText('Chưa có luồng từ xưởng (Kiểm tra Laptop)');
            setConnectionStatus('offline');
          }
        }, 12000);

      } catch (err: any) {
        if (isMounted) {
          setConnectionStatus('offline');
          setStatusText('Máy chủ bận / Sai Camera ID');
        }
      }
    };

    connectLiveKit();

    return () => {
      isMounted = false;
      if (roomRef.current) {
        roomRef.current.disconnect();
        roomRef.current = null;
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null;
        videoRef.current.removeAttribute('src');
      }
    };
  }, [cameraId]); 

  return (
    <div className={`relative w-full h-full bg-[#0B1121] overflow-hidden ${className || ''}`}>
      {connectionStatus === 'loading' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 p-4 text-center z-10 bg-black/80 backdrop-blur-sm">
          <div className="w-6 h-6 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mb-2" />
          <p className="text-[10px] font-mono text-cyan-400">{statusMessage}</p>
        </div>
      )}
      {connectionStatus === 'offline' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500 p-4 text-center z-10 bg-black/80 backdrop-blur-sm">
          <WifiOff className="w-8 h-8 text-rose-500/70 mb-2" />
          <p className="text-[10px] font-medium text-slate-400">{statusMessage}</p>
        </div>
      )}
      <video
        ref={videoRef}
        autoPlay muted playsInline
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 z-0 ${
          connectionStatus === 'online' ? 'opacity-100' : 'opacity-0'
        }`}
      />
    </div>
  );
};

// ============================================================================
// 🚀 COMPONENT CHÍNH: QUẢN LÝ HỘ KINH DOANH (FARM MANAGEMENT)
// ============================================================================
export default function FarmManagement() {
  const [households, setHouseholds] = useState<any[]>([]);
  const [rawUsers, setRawUsers] = useState<any[]>([]); // Lưu danh sách user để dùng trong Dropdown Add
  const [loading, setLoading] = useState(true);
  
  const [selectedHousehold, setSelectedHousehold] = useState<any | null>(null);
  const [activeStreamId, setActiveStreamId] = useState<string | null>(null);

  // State Quản lý Form Thêm/Sửa Camera
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    location: '',
    stream_url: '',
    user_id: ''
  });

  const fetchHouseholds = async (quiet = false) => {
    if (!quiet) setLoading(true);
    try {
      const [usersRes, camerasRes]: [any, any] = await Promise.all([
        userApi.getAll(),
        cameraApi.getAll()
      ]);
      
      const usersData = usersRes?.data || usersRes || [];
      const camerasData = camerasRes?.data || camerasRes || [];
      setRawUsers(usersData);

      const userCamerasMap = new Map();
      camerasData.forEach((cam: any) => {
        // Xử lý đồng bộ key từ Backend
        const uid = cam.user_id || cam.userId; 
        if (!uid) return; 
        
        if (!userCamerasMap.has(uid)) {
          userCamerasMap.set(uid, []);
        }
        userCamerasMap.get(uid).push(cam);
      });

      // Tạo thêm các User chưa có camera để Admin có thể thêm mới cho họ
      usersData.forEach((u: any) => {
        if (!userCamerasMap.has(u.id) && u.role !== 'admin') {
          userCamerasMap.set(u.id, []);
        }
      });

      const activeHouseholds: any[] = [];

      userCamerasMap.forEach((cams, uid) => {
        const userInfo = usersData.find((u: any) => u.id === uid);
        if (!userInfo || userInfo.role === 'admin') return; 

        activeHouseholds.push({
          id: uid,
          name: userInfo.full_name || userInfo.name || 'Khách hàng ẩn danh',
          email: userInfo.email || `ID: ${uid.substring(0, 8)}...`, 
          camerasCount: cams.length,
          sensors: cams.length > 0 ? 'Online' : 'Offline',
          status: (userInfo.role === 'disabled' || userInfo.status === 'inactive') ? 'inactive' : 'active',
          cameraList: cams.map((cam: any) => ({
            id: cam.id || cam._id,
            name: cam.camera_name || cam.name || 'Camera không tên', 
            location: cam.location || 'Chưa cập nhật vị trí',
            streamUrl: cam.stream_url || cam.streamUrl || '', // Không gen rác nữa, để trống nếu không có
            status: cam.status
          }))
        });
      });
      
      setHouseholds(activeHouseholds);
      
      // Xử lý React Stale Closure để Modal tự động cập nhật data mới
      setSelectedHousehold((prev: any) => {
        if (!prev) return null;
        return activeHouseholds.find(h => h.id === prev.id) || prev;
      });
      
    } catch (error) {
      console.error(error);
      toast.error('Lỗi tải danh sách tài khoản và camera');
    } finally {
      if (!quiet) setLoading(false);
    }
  };

  useEffect(() => {
    fetchHouseholds();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ==================== CÁC HÀM XỬ LÝ (CRUD CAMERA) ====================
  const openAddCameraModal = (userId = '') => {
    setIsEditing(false);
    setFormData({ id: '', name: '', location: '', stream_url: '', user_id: userId });
    setIsFormModalOpen(true);
  };

  const openEditCameraModal = (cam: any, userId: string) => {
    setIsEditing(true);
    setFormData({
      id: cam.id,
      name: cam.name,
      location: cam.location,
      stream_url: cam.streamUrl,
      user_id: userId
    });
    setIsFormModalOpen(true);
  };

  const handleDeleteCamera = async (camId: string) => {
    if (!window.confirm("Cảnh báo: Bạn có chắc chắn muốn xóa Camera này?")) return;
    try {
      await cameraApi.delete(camId);
      toast.success('Đã xóa Camera thành công!');
      if (activeStreamId === camId) setActiveStreamId(null);
      await fetchHouseholds(true); // Cập nhật ngầm
    } catch (err) {
      toast.error('Xóa Camera thất bại');
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.stream_url || !formData.user_id) {
      toast.error('Vui lòng điền đủ Tên, Link RTSP/ID và chọn Hộ kinh doanh!');
      return;
    }

    try {
      const payload = {
        name: formData.name,
        location: formData.location,
        stream_url: formData.stream_url, // Thực chất là lưu Camera ID (vd: workshop-laptop-cam)
        user_id: formData.user_id
      };

      if (isEditing) {
        await cameraApi.update(formData.id, payload);
        toast.success('Đã cập nhật cấu hình Camera!');
      } else {
        await cameraApi.create(payload);
        toast.success('Đã cấu hình Camera mới cho Hộ kinh doanh!');
      }

      setIsFormModalOpen(false);
      await fetchHouseholds(true); // Cập nhật giao diện ngầm
    } catch (err) {
      toast.error('Có lỗi xảy ra khi lưu Camera');
    }
  };

  return (
    <div className="min-h-screen bg-[#0B1121] p-6 md:p-10 text-white relative">
      
      {/* ================= HEADER ================= */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-10 pb-6 border-b border-slate-800">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => window.history.back()} 
            className="p-3 bg-slate-800/50 hover:bg-slate-700 rounded-full transition-colors border border-slate-700"
          >
            <ChevronLeft className="w-6 h-6 text-slate-300" />
          </button>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">Hộ Kinh Doanh Làng Nghề</h1>
            <p className="text-slate-400 mt-1">Giám sát & Quản lý AI Camera cho Khách hàng</p>
          </div>
        </div>

        <button 
          onClick={() => openAddCameraModal()}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold bg-cyan-600 hover:bg-cyan-500 text-white shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all"
        >
          <Plus className="w-5 h-5" /> Thêm Camera Mới
        </button>
      </div>

      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-end mb-6">
          <h2 className="text-slate-400 font-bold text-sm uppercase tracking-widest ml-1">
            Danh sách tài khoản khách hàng
          </h2>
          <div className="flex gap-3 items-center">
            <button 
              onClick={() => fetchHouseholds(false)}
              className="text-sm font-medium text-slate-300 hover:text-white bg-slate-800/50 px-3 py-1.5 rounded-lg border border-slate-700 transition-colors"
            >
              Làm mới dữ liệu
            </button>
            <span className="text-sm font-medium text-cyan-400 bg-cyan-500/10 px-3 py-1.5 rounded-lg border border-cyan-500/20">
              Tổng: {households.length} Hộ
            </span>
          </div>
        </div>

        {/* ================= GRID DANH SÁCH HỘ ================= */}
        {loading ? (
          <div className="flex justify-center items-center py-20 text-slate-400">
            <Wifi className="w-8 h-8 animate-pulse text-cyan-500 mb-2" />
            <span className="ml-3">Đang đồng bộ dữ liệu từ máy chủ...</span>
          </div>
        ) : households.length === 0 ? (
          <div className="text-center py-20 bg-[#151E2F] rounded-[24px] border border-slate-800 border-dashed">
            <User className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400 font-medium">Chưa có Khách hàng nào trên hệ thống</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {households.map(house => (
              <div 
                key={house.id} 
                onClick={() => setSelectedHousehold(house)}
                className="bg-[#151E2F] p-6 rounded-[24px] border border-slate-800 hover:border-cyan-500/40 transition-all duration-300 shadow-lg hover:shadow-[0_0_20px_rgba(6,182,212,0.15)] group relative cursor-pointer flex flex-col"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className={`p-4 rounded-[18px] ${house.status === 'active' ? 'bg-blue-500/10 border border-blue-500/20' : 'bg-rose-500/10 border border-rose-500/20'}`}>
                    <User className={`w-7 h-7 ${house.status === 'active' ? 'text-blue-400' : 'text-rose-400'}`} />
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-xl line-clamp-1">{house.name}</h3>
                    <div className="flex items-center gap-1.5 mt-1">
                      <div className={`w-2 h-2 rounded-full ${house.status === 'active' ? 'bg-emerald-400' : 'bg-rose-500'}`} />
                      <span className="text-slate-400 text-xs font-medium uppercase tracking-wider">
                        {house.status === 'active' ? 'Đang hoạt động' : 'Tài khoản bị khóa'}
                      </span>
                    </div>
                  </div>
                </div>
                
                <p className="text-sm text-slate-500 mb-6 flex-1 line-clamp-1 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-slate-600" /> {house.email}
                </p>

                <div className="mt-auto grid grid-cols-2 gap-4 bg-[#0f172a] p-4 rounded-2xl border border-slate-800/80 group-hover:border-cyan-500/30 transition-colors">
                  <div className="flex flex-col items-center justify-center border-r border-slate-700/50">
                    <Camera className="w-5 h-5 text-slate-400 mb-1.5 group-hover:text-cyan-400 transition-colors" />
                    <span className="text-white font-bold text-lg">{house.camerasCount}</span>
                    <span className="text-slate-500 text-xs">Camera</span>
                  </div>
                  
                  <div className="flex flex-col items-center justify-center">
                    <Wifi className={`w-5 h-5 mb-1.5 ${house.sensors === 'Online' ? 'text-emerald-400' : 'text-slate-600'}`} />
                    <span className={`font-bold text-lg ${house.sensors === 'Online' ? 'text-emerald-400' : 'text-slate-500'}`}>
                      {house.camerasCount > 0 ? house.sensors : '--'}
                    </span>
                    <span className="text-slate-500 text-xs">Cảm biến</span>
                  </div>        
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 🚀 MODAL XEM CHI TIẾT & QUẢN LÝ CAMERA CỦA TỪNG HỘ KINH DOANH               */}
      {/* ========================================================================= */}
      {selectedHousehold && (
        <div className="fixed inset-0 z-40 flex items-center justify-center p-4 md:p-8 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#0B1121] border border-slate-700 w-full max-w-6xl rounded-[32px] shadow-2xl flex flex-col max-h-[90vh]">
            
            <div className="flex flex-col md:flex-row md:items-center justify-between p-6 border-b border-slate-800 gap-4">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-cyan-500/10 rounded-xl border border-cyan-500/20">
                  <Camera className="w-6 h-6 text-cyan-400" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Camera của Hộ: {selectedHousehold.name}</h2>
                  <p className="text-cyan-400 text-sm mt-0.5">{selectedHousehold.email} • {selectedHousehold.cameraList.length} Camera</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => openAddCameraModal(selectedHousehold.id)}
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-semibold transition-colors text-sm"
                >
                  <Plus className="w-4 h-4" /> Thêm Camera Mới
                </button>
                <button 
                  onClick={() => { setSelectedHousehold(null); setActiveStreamId(null); }}
                  className="p-2 bg-slate-800 hover:bg-rose-500/20 hover:text-rose-400 text-slate-400 rounded-full transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto flex-1 bg-[#050810]/50 rounded-b-[32px]">
              {selectedHousehold.cameraList.length === 0 ? (
                <div className="text-center py-20 text-slate-400 border border-dashed border-slate-700 rounded-2xl">
                  <Camera className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                  <p>Hộ này chưa có Camera nào được thiết lập.</p>
                  <p className="text-sm mt-1 text-slate-500">Bấm nút "Thêm Camera" ở góc trên để cấu hình Camera ID.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {selectedHousehold.cameraList.map((cam: any) => (
                    <div key={cam.id} className={`bg-[#151E2F] rounded-2xl overflow-hidden border transition-all ${activeStreamId === cam.id ? 'border-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.2)]' : 'border-slate-700'}`}>
                      {/* Tiêu đề thẻ Camera & Nút thao tác */}
                      <div className="p-4 bg-slate-800/50 flex justify-between items-start">
                        <div>
                          <span className="text-white font-bold text-md block line-clamp-1">{cam.name}</span>
                          <span className="text-slate-400 text-xs flex items-center gap-1 mt-1">
                            <MapPin className="w-3 h-3" /> {cam.location}
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => openEditCameraModal(cam, selectedHousehold.id)} className="p-1.5 text-slate-400 hover:text-cyan-400 bg-slate-800 rounded hover:bg-slate-700 transition-colors" title="Sửa RTSP/ID">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDeleteCamera(cam.id)} className="p-1.5 text-slate-400 hover:text-rose-400 bg-slate-800 rounded hover:bg-slate-700 transition-colors" title="Xóa Camera">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      
                      {/* Khung phát LiveKit / Nút Play */}
                      <div className="aspect-video bg-black relative flex items-center justify-center border-t border-slate-800">
                        {activeStreamId === cam.id ? (
                          <>
                            {/* 🚀 ĐIỂM SỬA QUAN TRỌNG: TRUYỀN STREAM_URL CHỨA CAMERA ID XƯỞNG */}
                            <LiveKitVideoPlayer cameraId={cam.streamUrl} />
                            <button 
                              onClick={() => setActiveStreamId(null)}
                              className="absolute top-2 right-2 z-20 flex items-center gap-1 px-2 py-1 bg-rose-500/90 hover:bg-rose-500 text-white text-[10px] font-bold rounded shadow-lg backdrop-blur"
                            >
                              <StopCircle className="w-4 h-4" /> ĐÓNG
                            </button>
                          </>
                        ) : (
                          <>
                            <div 
                              className="absolute inset-0 flex items-center justify-center cursor-pointer group hover:bg-cyan-900/20 transition-colors"
                              onClick={() => setActiveStreamId(cam.id)}
                            >
                              <PlayCircle className="w-12 h-12 text-white/30 group-hover:text-cyan-400 group-hover:scale-110 transition-all duration-300" />
                            </div>
                            <div className="absolute top-2 right-2 flex items-center gap-1.5 px-2 py-1 rounded bg-black/60 border border-slate-700 pointer-events-none">
                              <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                              <span className="text-[10px] text-slate-300 font-bold uppercase tracking-wider">SẴN SÀNG</span>
                            </div>
                          </>
                        )}
                        <div className="absolute bottom-2 left-2 right-2 flex justify-between text-[10px] text-white/50 font-mono bg-black/60 px-2 py-1 rounded pointer-events-none z-10">
                          <span className="truncate pr-4">{cam.streamUrl || 'Chưa thiết lập ID'}</span>
                          <span className="flex-shrink-0 text-cyan-400">LiveKit ⚡</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 🚀 MODAL FORM: THÊM / SỬA CAMERA (ADMIN ONLY)                               */}
      {/* ========================================================================= */}
      {isFormModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm px-4">
          <div className="bg-[#0B1121] border border-slate-700 p-6 rounded-2xl w-full max-w-md shadow-2xl">
            <h2 className="text-xl font-bold text-white mb-5 flex items-center gap-2">
              <Link2 className="text-cyan-400" /> {isEditing ? 'Cập nhật Camera' : 'Khai báo Camera ID'}
            </h2>
            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label className="text-sm text-slate-400 block mb-1">Tên Camera</label>
                <input required type="text" className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white focus:border-cyan-500 outline-none" 
                       value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div>
                <label className="text-sm text-slate-400 block mb-1">Khu vực / Vị trí</label>
                <input type="text" className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white focus:border-cyan-500 outline-none" 
                       value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} />
              </div>
              <div>
                <label className="text-sm text-emerald-400 block mb-1 font-bold">Camera ID (Từ máy trạm Edge AI)</label>
                <input required type="text" placeholder="VD: workshop-laptop-camera" 
                       className="w-full bg-slate-900 border border-emerald-500/50 rounded-lg p-2.5 text-emerald-400 font-mono text-xs placeholder:text-slate-600 focus:border-emerald-500 outline-none" 
                       value={formData.stream_url} onChange={e => setFormData({...formData, stream_url: e.target.value})} />
                <p className="text-[10px] text-slate-500 mt-1">Hệ thống LiveKit sẽ tự động dò tìm luồng bằng ID này.</p>
              </div>
              
              <div>
                <label className="text-sm text-slate-400 block mb-1">Cấp quyền cho Hộ kinh doanh</label>
                <select required className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white focus:border-cyan-500 outline-none"
                        value={formData.user_id} onChange={e => setFormData({...formData, user_id: e.target.value})}
                        disabled={isEditing} // Đang sửa thì không đổi chủ, tránh vỡ dữ liệu
                >
                  <option value="" disabled>-- Chọn Hộ kinh doanh --</option>
                  {rawUsers.filter(u => u.role !== 'admin').map(u => (
                    <option key={u.id} value={u.id}>{u.full_name || u.name} - ({u.email})</option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3 justify-end mt-8 pt-4 border-t border-slate-800">
                <button type="button" onClick={() => setIsFormModalOpen(false)} className="px-4 py-2 rounded-lg text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">
                  Hủy
                </button>
                <button type="submit" className="px-4 py-2 rounded-lg text-sm font-bold bg-cyan-600 hover:bg-cyan-500 text-white transition-colors shadow-[0_0_15px_rgba(6,182,212,0.3)]">
                  {isEditing ? 'Lưu thay đổi' : 'Hoàn tất gán Camera'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}