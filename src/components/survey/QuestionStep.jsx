// src/components/survey/QuestionStep_Glassmorphism.jsx
import { useState, useEffect } from 'react';

const FALLBACK_OPTIONS = [
  { value: 1 },
  { value: 2 },
  { value: 3 },
  { value: 4 }
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
  const [hoveredValue, setHoveredValue] = useState(null);

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

  const options = (() => {
    if (!question?.skala_detail) return FALLBACK_OPTIONS;
    const lines = question.skala_detail.split('\n');
    const opts = [];
    lines.forEach(line => {
      const match = line.trim().match(/^(\d+)\s*[=:]/);
      if (match) {
        opts.push({ value: parseInt(match[1]) });
      }
    });
    opts.sort((a, b) => a.value - b.value);
    return opts.length > 0 ? opts : FALLBACK_OPTIONS;
  })();

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
          {/* Progress Header - Ultra Compact */}
          <div className="mb-3 md:mb-5">
            <div className="flex justify-between items-end mb-1.5">
              <span className="text-slate-900 font-black text-[10px] md:text-xs uppercase tracking-widest">
                Ekosistem {question.kode?.startsWith('S') ? 'Sekolah' : question.kode?.startsWith('K') ? 'Keluarga' : 'Masyarakat'}
              </span>
              <span className="text-slate-900 font-black text-[10px] md:text-xs">
                {currentStep}/{totalSteps}
              </span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-1 overflow-hidden">
              <div 
                className="h-full rounded-full bg-sky-600 transition-all duration-500"
                style={{ width: `${(currentStep / totalSteps) * 100}%` }}
              />
            </div>
          </div>

          {/* Question Card - Tightened */}
          <div className="bg-white rounded-[2rem] border border-slate-200 shadow-xl shadow-slate-200/40 p-4 md:p-6 mb-3 md:mb-5">
            {/* Header Content */}
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-3 mb-4">
              <div className="flex-1">
                {/* Context & ID Badge */}
                <div className="flex items-center gap-2 mb-2">
                  <div className="bg-sky-100 px-2 py-0.5 rounded-md">
                    <span className="text-sky-700 font-black text-[9px] tracking-widest">{question.kode}</span>
                  </div>
                  <span className="text-slate-500 font-bold text-[9px] uppercase tracking-widest">
                    {question.variabel}
                  </span>
                </div>
                
                {/* Indicator Title */}
                <h4 className="text-lg md:text-2xl font-black text-slate-900 leading-tight mb-3">
                  {question.indikator}
                </h4>
                
                {/* Ideal Standard Box - Ultra Compact */}
                <div className="p-3 md:p-4 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-3.5 h-3.5 rounded-full bg-emerald-100 flex items-center justify-center">
                      <svg className="w-2 h-2 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={5} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <h5 className="text-emerald-700 font-black text-[8px] uppercase tracking-widest">Kondisi Ideal:</h5>
                  </div>
                  <p className="text-slate-600 text-[11px] md:text-sm italic leading-snug font-semibold">
                    "{question.deskripsi}"
                  </p>
                </div>
              </div>
            </div>

            {/* Interactive Star Rating Selection - Compacted Gap */}
            <div className="flex flex-col items-center py-1 md:py-2">
              <div className="flex justify-center items-center gap-3 md:gap-8 mb-4">
                {options.map((option) => {
                  const isSelected = selectedValue === option.value;
                  const currentVal = hoveredValue !== null ? hoveredValue : (selectedValue !== null ? selectedValue : -1);
                  const isActive = currentVal >= option.value;
                  
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
                          relative transition-all duration-300 transform active:scale-75
                          ${isSelected ? 'scale-110' : 'hover:scale-105'}
                        `}
                      >
                        {/* Glow Layer */}
                        <div className={`
                          absolute inset-0 transition-opacity duration-300 blur-xl rounded-full
                          ${isActive ? 'bg-amber-400/20 opacity-100' : 'opacity-0'}
                        `}></div>
                        
                        {/* Star Body - Border added for visibility */}
                        <svg 
                          className={`
                            w-10 h-10 md:w-20 md:h-20 transition-all duration-300 relative z-10
                            ${isActive 
                              ? 'text-amber-400 fill-amber-400 drop-shadow-sm' 
                              : 'text-slate-300 fill-slate-50'}
                          `} 
                          viewBox="0 0 24 24"
                        >
                          <path 
                            stroke="currentColor" 
                            strokeWidth={isActive ? "0" : "1.2"}
                            d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" 
                          />
                        </svg>
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Dynamic Description - High Contrast Pill */}
              <div className="w-full max-w-3xl">
                <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 md:p-4 text-center min-h-[60px] flex items-center justify-center">
                   <p className={`
                     text-[10px] md:text-xs font-black uppercase tracking-widest leading-relaxed transition-all duration-300
                     ${(hoveredValue !== null || selectedValue !== null) ? 'text-slate-800' : 'text-slate-500 italic'}
                   `}>
                      {(() => {
                        const target = hoveredValue !== null ? hoveredValue : (selectedValue !== null ? selectedValue : null);
                        const questionDesc = question.skala_detail;
                        
                        if (target !== null) {
                          if (questionDesc) {
                            const lines = questionDesc.split('\n');
                            const line = lines.find(l => {
                              const trimmed = l.trim();
                              return trimmed.startsWith(`${target} =`) || trimmed.startsWith(`${target} :`) || trimmed.startsWith(`${target}:`);
                            });
                            if (line) {
                              const parts = line.split(/[=:]/);
                              return parts.slice(1).join('=').trim();
                            }
                          }
                          return `Skala ${target}`;
                        }
                        return "Pilih bintang untuk menilai";
                      })()}
                   </p>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Buttons - Compact Pill */}
          <div className="flex gap-3">
            <button
              onClick={onPrev}
              className="flex-1 py-3 md:py-4 rounded-xl font-black uppercase tracking-widest text-[9px] md:text-xs transition-all bg-white border border-slate-200 text-slate-400 hover:border-slate-400 hover:text-slate-700 active:scale-95"
            >
              ← Kembali
            </button>

            <button
              onClick={handleNext}
              disabled={selectedValue === null}
              className={`
                flex-1 py-3 md:py-4 rounded-xl font-black uppercase tracking-widest text-[9px] md:text-xs transition-all active:scale-95
                ${selectedValue === null
                  ? 'bg-slate-100 text-slate-300 cursor-not-allowed'
                  : 'bg-slate-900 text-white shadow-lg shadow-slate-200 hover:bg-black'
                }
              `}
            >
              {currentStep === totalSteps ? 'Selesai & Review' : 'Lanjut →'}
            </button>
          </div>

          {/* Watermark - High Contrast */}
          <div className="mt-3 text-center">
            <p className="text-slate-900 text-[9px] font-black uppercase tracking-[0.4em]">Sekolah Literasi Indonesia</p>
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
