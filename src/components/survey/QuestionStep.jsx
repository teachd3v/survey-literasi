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
        <div className="w-full max-w-2xl">
          {/* Progress Bar - Glassmorphism */}
          <div className="mb-4 md:mb-8 backdrop-blur-xl bg-white/10 rounded-2xl p-3 md:p-4 border border-white/20 shadow-xl">
            <div className="flex justify-between items-center mb-1 md:mb-2">
              <span className="text-xs md:text-sm font-medium text-white/90">
                Pertanyaan {currentStep} dari {totalSteps}
              </span>
              <span className="text-sm font-bold text-[#7dcbe1]">
                {Math.round((currentStep / totalSteps) * 100)}%
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
          <div className="backdrop-blur-2xl bg-white/10 rounded-2xl md:rounded-3xl border border-white/20 shadow-2xl p-5 md:p-8 mb-4 md:mb-6 transition-all duration-300 hover:shadow-cyan-500/20 hover:border-white/30">
            {/* Question Kode Badge */}
            <div className="inline-flex items-center backdrop-blur-xl bg-gradient-to-r from-[#39a0c9]/30 to-[#7dcbe1]/30 border border-white/30 px-3 py-1 md:px-4 md:py-2 rounded-full mb-3 md:mb-4 shadow-lg">
              <span className="text-white font-bold text-xs md:text-sm tracking-wider">{question.kode}</span>
            </div>

            {/* Variabel Name */}
            <h2 className="text-xl md:text-3xl font-bold text-white mb-2 md:mb-4 leading-tight">
              {question.variabel}
            </h2>

            {/* Question Text */}
            <p className="text-white/90 text-sm md:text-lg mb-4 md:mb-8 leading-relaxed">
              {question.indikator}
            </p>



            {/* Scale Options - Glassmorphism */}
            <div className="space-y-2 md:space-y-3">
              {SCALE_OPTIONS.map((option) => {
                const isSelected = selectedValue === option.value;
                
                return (
                  <button
                    key={option.value}
                    onClick={() => handleSelect(option.value)}
                    className={`
                      group w-full p-3 md:p-5 rounded-xl md:rounded-2xl transition-all duration-300
                      backdrop-blur-xl border-2
                      ${isSelected
                        ? `bg-gradient-to-r ${option.gradient} border-white/50 shadow-2xl ${option.glow} scale-[1.02]`
                        : 'bg-white/5 border-white/20 hover:bg-white/10 hover:border-white/30 hover:scale-[1.01]'
                      }
                      ${isAnimating && isSelected ? 'animate-pulse' : ''}
                    `}
                  >
                    <div className="flex items-center">
                      {/* Radio Indicator */}
                      <div className={`
                        relative w-5 h-5 md:w-7 md:h-7 rounded-full transition-all duration-300
                        ${isSelected
                          ? 'bg-white shadow-lg'
                          : 'bg-white/20 border-2 border-white/40'
                        }
                      `}>
                        {isSelected && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className={`w-2 h-2 md:w-3 md:h-3 rounded-full bg-gradient-to-br ${option.gradient}`}></div>
                          </div>
                        )}
                      </div>

                      {/* Label */}
                      <div className="ml-3 md:ml-4 flex-1 text-left">
                        <span className={`
                          text-sm md:text-lg leading-tight block
                          ${isSelected ? 'text-white' : 'text-white/80'}
                        `}>
                            {(() => {
                              if (question.skala_detail) {
                                const lines = question.skala_detail.split('\n');
                                const line = lines.find(l => l.trim().startsWith(`${option.value}:`));
                                if (line) return line.split(':')[1].trim();
                              }
                              return option.label;
                            })()}
                          </span>
                        </div>

                      {/* Glow Indicator */}
                      {isSelected && (
                        <div className={`w-4 h-4 rounded-full bg-gradient-to-br ${option.gradient} shadow-lg ${option.glow} animate-pulse`}></div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

          </div>

          {/* Navigation Buttons - Glassmorphism */}
          <div className="flex gap-3 md:gap-4">
            <button
              onClick={onPrev}
              className="flex-1 py-3 md:py-4 rounded-xl md:rounded-2xl font-bold transition-all duration-300 backdrop-blur-xl border-2 bg-white/10 text-white border-white/30 hover:bg-white/20 hover:border-white/50 hover:shadow-lg hover:scale-[1.02]"
            >
              ← Kembali
            </button>

            <button
              onClick={handleNext}
              disabled={selectedValue === null}
              className={`
                flex-1 py-3 md:py-4 rounded-xl md:rounded-2xl font-bold transition-all duration-300
                backdrop-blur-xl border-2
                ${selectedValue === null
                  ? 'bg-white/5 text-white/30 border-white/10 cursor-not-allowed'
                  : 'bg-gradient-to-r from-[#39a0c9] to-[#7dcbe1] text-white border-white/30 hover:shadow-2xl hover:shadow-cyan-500/50 hover:scale-[1.02]'
                }
              `}
            >
              {currentStep === totalSteps ? 'Review →' : 'Lanjut →'}
            </button>
          </div>

          {/* Logo Watermark */}
          <div className="mt-4 md:mt-8 text-center">
            <p className="text-white/50 text-[10px] md:text-sm">Sekolah Literasi Indonesia</p>
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
