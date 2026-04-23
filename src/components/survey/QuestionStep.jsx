// src/components/survey/QuestionStep_Glassmorphism.jsx
import { useState, useEffect } from 'react';

const SCALE_OPTIONS = [
  {
    value: 1,
    label: 'Tidak Ada / Tidak Pernah',
    gradient: 'from-red-400 to-red-500',
    glow: 'shadow-red-500/50'
  },
  {
    value: 2,
    label: 'Ada tapi belum optimal / Kadang',
    gradient: 'from-orange-400 to-amber-500',
    glow: 'shadow-orange-500/50'
  },
  {
    value: 3,
    label: 'Ada dan cukup baik / Sering',
    gradient: 'from-cyan-400 to-blue-500',
    glow: 'shadow-cyan-500/50'
  },
  {
    value: 4,
    label: 'Ada dan sangat baik / Sangat Sering',
    gradient: 'from-emerald-400 to-teal-500',
    glow: 'shadow-emerald-500/50'
  }
];

export default function QuestionStep({
  question,
  currentStep,
  totalSteps,
  value,
  onChange,
  onNext,
  onPrev
}) {
  const [selectedValue, setSelectedValue] = useState(value || null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showObservation, setShowObservation] = useState(false);
  const [hoveredValue, setHoveredValue] = useState(null);

  // Reset showObservation when question changes
  useEffect(() => {
    setShowObservation(false);
  }, [question.kode]);

  // Sync state with props when question or value changes
  useEffect(() => {
    setSelectedValue(value || null);
  }, [value, question.kode]);

  const handleSelect = (val) => {
    setSelectedValue(val);
    onChange(val);
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 300);
  };

  const handleNext = () => {
    if (selectedValue !== null) {
      onNext();
    }
  };

  return (
    <div className="min-h-screen relative bg-slate-50 overflow-hidden">
      {/* Clean Light BG Orbs */}
      <div className="absolute inset-0">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-sky-100 rounded-full blur-3xl opacity-60 animate-blob"></div>
        <div className="absolute top-1/2 -right-24 w-96 h-96 bg-indigo-50 rounded-full blur-3xl opacity-60 animate-blob animation-delay-2000"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-5xl">
          {/* Progress Header - Compact */}
          <div className="mb-4 md:mb-6">
            <div className="flex justify-between items-end mb-2">
              <span className="text-slate-900 font-black text-xs md:text-sm uppercase tracking-widest">
                Ekosistem {question.kode?.startsWith('S') ? 'Sekolah' : question.kode?.startsWith('K') ? 'Keluarga' : 'Masyarakat'}
              </span>
              <span className="text-slate-400 font-bold text-[10px] md:text-xs">
                {currentStep} / {totalSteps}
              </span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
              <div 
                className="h-full rounded-full bg-sky-500 transition-all duration-500"
                style={{ width: `${(currentStep / totalSteps) * 100}%` }}
              />
            </div>
          </div>

          {/* Question Card - Clean White */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50 p-4 md:p-8 mb-4 md:mb-6">
            {/* Header Content */}
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6">
              <div className="flex-1">
                {/* Context & ID Badge */}
                <div className="flex items-center gap-2 mb-3">
                  <div className="bg-sky-100 border border-sky-200 px-2 py-0.5 rounded-md">
                    <span className="text-sky-700 font-black text-[10px] tracking-widest">{question.kode}</span>
                  </div>
                  <span className="text-slate-400 font-black text-[10px] uppercase tracking-widest">
                    {question.variabel}
                  </span>
                </div>
                
                {/* Indicator Title */}
                <h4 className="text-xl md:text-3xl font-black text-slate-900 leading-tight mb-4">
                  {question.indikator}
                </h4>
                
                {/* Ideal Standard Box - Contrast Improved */}
                <div className="p-4 md:p-5 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-emerald-100 flex items-center justify-center">
                      <svg className="w-2.5 h-2.5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <h5 className="text-emerald-700 font-black text-[9px] uppercase tracking-widest">Kondisi Ideal:</h5>
                  </div>
                  <p className="text-slate-600 text-xs md:text-base italic leading-relaxed font-semibold">
                    "{question.deskripsi}"
                  </p>
                </div>
              </div>

              {/* Observation Button - Compact */}
              {question.observasi && (
                <button
                  type="button"
                  onClick={() => setShowObservation(!showObservation)}
                  className={`
                    shrink-0 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border-2
                    ${showObservation 
                      ? 'bg-sky-600 text-white border-sky-600 shadow-lg shadow-sky-200' 
                      : 'bg-white text-sky-600 border-slate-100 hover:border-sky-300'}
                  `}
                >
                  {showObservation ? 'Tutup Tips' : '💡 Tips Observasi'}
                </button>
              )}
            </div>

            {/* Observation Content - High Contrast */}
            {showObservation && (
              <div className="mb-6 p-4 rounded-2xl bg-sky-50 border border-sky-100 animate-in fade-in slide-in-from-top-2 duration-300">
                <p className="text-sky-900 text-[11px] md:text-sm font-bold leading-relaxed">
                  {question.observasi}
                </p>
              </div>
            )}

            {/* Interactive Star Rating Selection */}
            <div className="flex flex-col items-center py-2 md:py-4">
              <div className="flex justify-center items-center gap-4 md:gap-8 mb-6">
                {SCALE_OPTIONS.map((option) => {
                  const isSelected = selectedValue === option.value;
                  const isActive = (hoveredValue || selectedValue) >= option.value;
                  
                  return (
                    <div 
                      key={option.value}
                      className="flex flex-col items-center"
                      onMouseEnter={() => setHoveredValue(option.value)}
                      onMouseLeave={() => setHoveredValue(null)}
                    >
                      <button
                        onClick={() => handleSelect(option.value)}
                        className={`
                          relative transition-all duration-300 transform active:scale-90
                          ${isSelected ? 'scale-110' : 'hover:scale-105'}
                        `}
                      >
                        {/* Glow Layer (Light Mode) */}
                        <div className={`
                          absolute inset-0 transition-all duration-500 blur-2xl rounded-full
                          ${isActive ? 'bg-amber-400/30 opacity-100' : 'opacity-0'}
                        `}></div>
                        
                        {/* Star Body */}
                        <svg 
                          className={`
                            w-12 h-12 md:w-24 md:h-24 transition-all duration-300 relative z-10
                            ${isActive 
                              ? 'text-amber-400 fill-amber-400 drop-shadow-md' 
                              : 'text-slate-100 fill-slate-50'}
                          `} 
                          viewBox="0 0 24 24"
                        >
                          <path 
                            stroke="currentColor" 
                            strokeWidth={isActive ? "0" : "1.5"}
                            d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" 
                          />
                        </svg>
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Dynamic Description - High Contrast */}
              <div className="w-full max-w-lg">
                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 md:p-6 text-center min-h-[80px] flex items-center justify-center">
                   <p className={`
                     text-[11px] md:text-sm font-black uppercase tracking-widest leading-relaxed transition-all duration-300
                     ${(hoveredValue || selectedValue) ? 'text-slate-800' : 'text-slate-300 italic'}
                   `}>
                      {(() => {
                        const target = hoveredValue || selectedValue || 0;
                        const questionDesc = question.skala_detail;
                        
                        if (target > 0) {
                          if (questionDesc) {
                            const lines = questionDesc.split('\n');
                            const line = lines.find(l => {
                              const trimmed = l.trim();
                              return trimmed.startsWith(`${target} =`) || trimmed.startsWith(`${target} :`) || trimmed.startsWith(`${target}:`);
                            });
                            if (line) {
                              const parts = line.split(/[=:]/);
                              return parts[parts.length - 1].trim();
                            }
                          }
                          return SCALE_OPTIONS.find(o => o.value === target)?.label;
                        }
                        return "Pilih bintang untuk menilai";
                      })()}
                   </p>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Buttons - Clean */}
          <div className="flex gap-3">
            <button
              onClick={onPrev}
              className="flex-1 py-4 md:py-5 rounded-2xl font-black uppercase tracking-widest text-[10px] md:text-xs transition-all bg-white border-2 border-slate-100 text-slate-400 hover:border-slate-300 hover:text-slate-700 active:scale-95"
            >
              ← Kembali
            </button>

            <button
              onClick={handleNext}
              disabled={selectedValue === null}
              className={`
                flex-1 py-4 md:py-5 rounded-2xl font-black uppercase tracking-widest text-[10px] md:text-xs transition-all active:scale-95 shadow-lg
                ${selectedValue === null
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  : 'bg-sky-600 text-white shadow-sky-200 hover:bg-sky-700'
                }
              `}
            >
              {currentStep === totalSteps ? 'Selesai & Review →' : 'Lanjut →'}
            </button>
          </div>

          {/* Watermark - Refined */}
          <div className="mt-4 text-center opacity-40">
            <p className="text-slate-500 text-[9px] font-black uppercase tracking-[0.3em]">Sekolah Literasi Indonesia</p>
          </div>
        </div>
      </div>

      {/* Custom Blob Animations */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}} />
    </div>
  );
}
