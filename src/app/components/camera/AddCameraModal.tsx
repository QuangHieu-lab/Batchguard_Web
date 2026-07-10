import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { X, Camera, MapPin, Save } from 'lucide-react';

interface AddCameraModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (newCamera: any) => void;
}

export function AddCameraModal({ isOpen, onClose, onAdd }: AddCameraModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    location: '',
  });

  // Nếu modal không mở thì không render gì cả
  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Đóng gói dữ liệu gửi ra ngoài
    onAdd(formData);
    
    // Đóng modal và reset form
    onClose();
    setFormData({ name: '', location: '' });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      {/* Click ra ngoài form để đóng modal */}
      <div className="absolute inset-0" onClick={onClose} />
      
      <Card className="w-full max-w-md bg-[#0f172a] border-slate-700 shadow-2xl relative z-10">
        <CardHeader className="border-b border-slate-800 flex flex-row items-center justify-between pb-4">
          <CardTitle className="text-white flex items-center gap-2 text-lg">
            <Camera className="w-5 h-5 text-cyan-400" />
            Đăng ký Camera Mới
          </CardTitle>
          <button 
            onClick={onClose} 
            className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </CardHeader>
        
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Tên Camera */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Tên định danh <span className="text-red-400">*</span></label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Camera className="w-4 h-4 text-slate-500" />
                </div>
                <input 
                  type="text" 
                  required
                  placeholder="VD: Camera Sân Phơi A"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full pl-10 pr-4 py-2.5 bg-[#1e293b] border border-slate-700 rounded-lg text-white focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 placeholder:text-slate-600"
                />
              </div>
            </div>

            {/* Vị trí */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Vị trí lắp đặt <span className="text-red-400">*</span></label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MapPin className="w-4 h-4 text-slate-500" />
                </div>
                <input 
                  type="text" 
                  required
                  placeholder="VD: Sân chính (Góc Tây Bắc)"
                  value={formData.location}
                  onChange={e => setFormData({...formData, location: e.target.value})}
                  className="w-full pl-10 pr-4 py-2.5 bg-[#1e293b] border border-slate-700 rounded-lg text-white focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 placeholder:text-slate-600"
                />
              </div>
            </div>

            {/* Nút Hành Động */}
            <div className="pt-4 flex gap-3">
              <button 
                type="button" 
                onClick={onClose}
                className="flex-1 px-4 py-2.5 bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700 font-medium transition-colors"
              >
                Hủy bỏ
              </button>
              <button 
                type="submit"
                className="flex-1 px-4 py-2.5 bg-cyan-600 text-white rounded-lg hover:bg-cyan-500 font-medium flex items-center justify-center gap-2 transition-colors shadow-[0_0_15px_rgba(6,182,212,0.3)]"
              >
                <Save className="w-4 h-4" /> Lưu Camera
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}