import React from 'react';
import { Target, BrainCircuit, CheckCircle, AlertTriangle } from 'lucide-react';

export default function AiPerformance() {
  // Mock Data (Sau này fetch từ Backend)
  const aiConfidence = 96.8;
  const totalScans = "1,240";
  const falsePositives = 12;
  const falseNegatives = 8;

  return (
    <div className="p-4 md:p-8 space-y-6 text-slate-200">
      {/* HEADER */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">Hiệu suất & Độ tin cậy AI</h1>
        <p className="text-sm md:text-base text-slate-400">YOLO Vision Performance Tracking</p>
      </div>

      {/* TỔNG QUAN AI CONFIDENCE */}
      <div className="w-full max-w-3xl bg-[#1e293b] p-6 md:p-8 rounded-[32px] border border-slate-700/50 shadow-lg relative overflow-hidden">
        {/* Ánh sáng nền */}
        <div className="absolute -right-10 -top-10 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex justify-between items-center mb-6 relative z-10">
          <div className="bg-purple-500/20 p-3.5 rounded-2xl border border-purple-500/30">
            <Target className="w-7 h-7 text-purple-400" />
          </div>
          <BrainCircuit className="w-8 h-8 text-slate-500" />
        </div>

        <p className="text-slate-400 text-sm font-semibold mb-2 relative z-10">Độ tin cậy tổng thể</p>
        <div className="flex items-end gap-1 mb-5 relative z-10">
          <span className="text-white text-7xl font-extrabold tracking-tight">{aiConfidence}</span>
          <span className="text-purple-400 text-3xl font-bold mb-2">%</span>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden mb-3 border border-slate-700/50 relative z-10">
          <div 
            className="h-full bg-purple-500 rounded-full shadow-[0_0_10px_rgba(168,85,247,0.8)] transition-all duration-1000" 
            style={{ width: `${aiConfidence}%` }} 
          />
        </div>
        
        <p className="text-slate-400 text-sm relative z-10 mt-4">
          Đánh giá trên <strong className="font-bold text-slate-200">{totalScans}</strong> mẻ bánh trong 30 ngày qua
        </p>
      </div>

      {/* PHÂN TÍCH SAI SỐ */}
      <div className="max-w-3xl mt-8">
        <h2 className="text-slate-400 font-bold uppercase tracking-wider text-xs mb-4 ml-1">Phân tích sai số (False Rates)</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="bg-emerald-500/10 p-5 rounded-3xl border border-emerald-500/20">
            <CheckCircle className="w-7 h-7 text-emerald-400 mb-3" />
            <p className="text-emerald-400/80 text-xs font-bold uppercase mb-1">Nhận diện đúng</p>
            <p className="text-emerald-500 font-extrabold text-3xl">1,220</p>
          </div>
          <div className="bg-rose-500/10 p-5 rounded-3xl border border-rose-500/20">
            <AlertTriangle className="w-7 h-7 text-rose-400 mb-3" />
            <p className="text-rose-400/80 text-xs font-bold uppercase mb-1">Sai lệch (Cần Train lại)</p>
            <p className="text-rose-500 font-extrabold text-3xl">{falsePositives + falseNegatives}</p>
          </div>
        </div>
      </div>
    </div>
  );
}