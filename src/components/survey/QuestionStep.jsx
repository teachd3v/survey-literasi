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
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Background with Brand Colors */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#2a3e63] via-[#2e66a3] to-[#39a0c9]">
        {/* Animated Orbs */}
        <div className="absolute top-20 left-20 w-96 h-96 bg-[#7dcbe1] rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute top-40 right-20 w-96 h-96 bg-[#39a0c9] rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-20 left-40 w-96 h-96 bg-[#2e66a3] rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-5xl">
          {/* Progress Bar - Glassmorphism */}
          <div className="mb-4 md:mb-8 backdrop-blur-xl bg-white/10 rounded-2xl p-3 md:p-4 border border-white/20 shadow-xl">
            <div className="flex justify-between items-center mb-1 md:mb-2">
              <span className="text-xs md:text-sm font-black text-white uppercase tracking-widest">
                {question.kode?.startsWith('S') ? 'EKOSISTEM SEKOLAH' : question.kode?.startsWith('K') ? 'EKOSISTEM KELUARGA' : 'EKOSISTEM MASYARAKAT'}
              </span>
              <span className="text-xs md:text-sm font-medium text-white/90">
                Pertanyaan {currentStep} dari {totalSteps}
              </span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-3 backdrop-blur-sm overflow-hidden">
              <div 
                className="h-3 rounded-full bg-gradient-to-r from-[#39a0c9] to-[#7dcbe1] transition-all duration-500 shadow-lg shadow-cyan-500/50"
                style={{ width: `${(currentStep / totalSteps) * 100}%` }}
              />
            </div>
          </div>

          {/* Question Card - Glassmorphism */}
          <div className="backdrop-blur-2xl bg-white/10 rounded-2xl md:rounded-3xl border border-white/20 shadow-2xl p-5 md:p-10 mb-4 md:mb-6 transition-all duration-300">
            {/* Header Content */}
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8">
              <div className="flex-1">
                {/* Context & ID Badge */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="backdrop-blur-xl bg-brand-cyan/20 border border-brand-cyan/30 px-3 py-1 rounded-lg">
                    <span className="text-brand-cyan font-black text-[10px] tracking-widest">{question.kode}</span>
                  </div>
                  <div className="h-4 w-[1px] bg-white/10"></div>
                  <span className="text-white/40 font-black text-[10px] uppercase tracking-[0.2em]">
                    Variabel: {question.variabel}
                  </span>
                </div>
                
                {/* Indicator Title (The main question focus) */}
                <h4 className="text-2xl md:text-4xl font-extrabold text-white leading-tight mb-6">
                  {question.indikator}
                </h4>
                
                {/* Ideal Standard Box - Benchmark for Score 4 */}
                <div className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500/50 to-brand-cyan/50 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
                  <div className="relative p-5 md:p-6 rounded-2xl bg-white/5 border border-white/10 shadow-inner">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
                        <svg className="w-3 h-3 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <h5 className="text-emerald-400 font-black text-[10px] uppercase tracking-[0.2em]">Kondisi Ideal (Skor 4):</h5>
                    </div>
                    <p className="text-white/80 text-sm md:text-lg italic leading-relaxed font-medium">
                      "{question.deskripsi}"
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-3 shrink-0">
                {question.observasi && (
                  <button
                    type="button"
                    onClick={() => setShowObservation(!showObservation)}
                    className={`
                      flex items-center justify-center gap-2 px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border
                      ${showObservation 
                        ? 'bg-brand-cyan text-white border-brand-cyan shadow-[0_0_30px_rgba(57,160,201,0.4)]' 
                        : 'bg-white/5 text-brand-cyan border-white/10 hover:bg-white/10'}
                    `}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {showObservation ? 'Sembunyikan Tips' : 'Petunjuk Observasi'}
                  </button>
                )}
              </div>
            </div>

            {/* Observation Guide Panel */}
            {showObservation && question.observasi && (
              <div className="mb-10 p-5 md:p-8 rounded-2xl bg-white/5 border-l-4 border-[#39a0c9] animate-in fade-in slide-in-from-top-4 duration-300">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-2 h-2 bg-[#39a0c9] rounded-full animate-ping"></div>
                  <h5 className="text-[#7dcbe1] font-black text-xs uppercase tracking-[0.2em]">Panduan Penilaian</h5>
                </div>
                <p className="text-white/90 text-sm md:text-base leading-relaxed">
                  {question.observasi}
                </p>
              </div>
            )}

            {/* Scale Options - Horizontal Grid on Desktop */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {SCALE_OPTIONS.map((option) => {
                const isSelected = selectedValue === option.value;
                
                return (
                  <button
                    key={option.value}
                    onClick={() => handleSelect(option.value)}
                    className={`
                      group relative p-5 md:p-8 rounded-2xl md:rounded-[2rem] transition-all duration-500
                      backdrop-blur-xl border-2 flex flex-col items-center justify-center text-center gap-4
                      ${isSelected
                        ? `bg-gradient-to-br ${option.gradient} border-white/60 shadow-2xl ${option.glow} scale-[1.03]`
                        : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/30 hover:scale-[1.02]'
                      }
                      ${isAnimating && isSelected ? 'animate-pulse' : ''}
                    `}
                  >
                    {/* Visual Marker */}
                    <div className={`
                      w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-500
                      ${isSelected ? 'bg-white border-white' : 'bg-white/10 border-white/20'}
                    `}>
                      {isSelected && (
                        <svg className={`w-4 h-4 text-transparent bg-clip-text bg-gradient-to-br ${option.gradient}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>

                    <span className={`
                      text-sm md:text-sm font-black leading-snug uppercase tracking-wide
                      ${isSelected ? 'text-white' : 'text-white/60'}
                    `}>
                        {(() => {
                          if (question.skala_detail) {
                            const lines = question.skala_detail.split('\n');
                            const line = lines.find(l => {
                              const trimmed = l.trim();
                              return trimmed.startsWith(`${option.value} =`) || trimmed.startsWith(`${option.value} :`) || trimmed.startsWith(`${option.value}:`);
                            });
                            if (line) {
                              const parts = line.split(/[=:]/);
                              return parts[parts.length - 1].trim();
                            }
                          }
                          return option.label;
                        })()}
                      </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Navigation Buttons - Glassmorphism */}
          <div className="flex gap-4">
            <button
              onClick={onPrev}
              className="flex-1 py-4 md:py-6 rounded-2xl md:rounded-[1.5rem] font-black uppercase tracking-widest transition-all duration-300 backdrop-blur-xl border-2 bg-white/5 text-white/70 border-white/10 hover:bg-white/10 hover:text-white hover:border-white/30 hover:scale-[1.02]"
            >
              ← Kembali
            </button>

            <button
              onClick={handleNext}
              disabled={selectedValue === null}
              className={`
                flex-1 py-4 md:py-6 rounded-2xl md:rounded-[1.5rem] font-black uppercase tracking-widest transition-all duration-300
                backdrop-blur-xl border-2
                ${selectedValue === null
                  ? 'bg-white/5 text-white/20 border-white/10 cursor-not-allowed'
                  : 'bg-gradient-to-r from-[#39a0c9] to-[#7dcbe1] text-white border-white/30 hover:shadow-[0_0_40px_rgba(57,160,201,0.4)] hover:scale-[1.02]'
                }
              `}
            >
              {currentStep === totalSteps ? 'Review Jawaban →' : 'Lanjut →'}
            </button>
          </div>

          {/* Logo Watermark */}
          <div className="mt-8 text-center opacity-30">
            <p className="text-white text-[10px] md:text-xs font-black uppercase tracking-[0.4em]">Sekolah Literasi Indonesia</p>
          </div>
        </div>
      </div>

      {/* Custom Animations */}
      <style jsx>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(20px, -50px) scale(1.1); }
          50% { transform: translate(-20px, 20px) scale(0.9); }
          75% { transform: translate(50px, 50px) scale(1.05); }
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
      `}</style>
    </div>
  );
}
