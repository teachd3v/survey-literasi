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
  const [selectedValue, setSelectedValue] = useState(value ?? null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [hoveredValue, setHoveredValue] = useState(null);

  useEffect(() => {
    setSelectedValue(value ?? null);
  }, [value, question.kode]);

  const handleSelect = (val) => {
    if (question.tipe_skala === 'Multi-select') {
      const current = Array.isArray(selectedValue) ? selectedValue : [];
      const next = current.includes(val) 
        ? current.filter(v => v !== val) 
        : [...current, val];
      setSelectedValue(next);
      onChange(next);
    } else {
      setSelectedValue(val);
      onChange(val);
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 300);
    }
  };

  const options = (() => {
    if (!question?.skala_detail) return FALLBACK_OPTIONS;
    const lines = question.skala_detail.split('\n');
    const opts = [];
    lines.forEach(line => {
      const match = line.trim().match(/^(\d+)\s*[=:]/);
      if (match) {
        opts.push({ 
          value: parseInt(match[1]),
          label: line.split(/[=:]/)[1]?.trim() || `Opsi ${match[1]}`
        });
      }
    });
    opts.sort((a, b) => a.value - b.value);
    return opts.length > 0 ? opts : FALLBACK_OPTIONS;
  })();

  const handleNext = () => {
    if (selectedValue !== null && (!Array.isArray(selectedValue) || selectedValue.length > 0)) {
      onNext();
    }
  };

  const ekosistemLabel = question.kode?.startsWith('S')
    ? 'Sekolah'
    : question.kode?.startsWith('K')
    ? 'Keluarga'
    : question.kode?.startsWith('M')
    ? 'Masyarakat'
    : question.kode?.split('.')?.[0] || 'Survey';

  const dynamicDesc = (() => {
    if (question.tipe_skala === 'Multi-select') {
      const count = Array.isArray(selectedValue) ? selectedValue.length : 0;
      return count > 0 ? `${count} opsi terpilih` : 'Pilih satu atau lebih jawaban';
    }
    
    const target = hoveredValue !== null ? hoveredValue : (Array.isArray(selectedValue) ? null : selectedValue);
    if (target === null) return null;
    
    const opt = options.find(o => o.value === target);
    return opt ? opt.label : `Skala ${target}`;
  })();

  const isMultiSelect = question.tipe_skala === 'Multi-select';
  const isSelect = question.tipe_skala === 'Select';

  return (
    <div className="min-h-screen relative bg-slate-50 overflow-hidden">
      {/* Subtle background orbs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-sky-100 rounded-full blur-3xl opacity-60 animate-blob"></div>
        <div className="absolute top-1/2 -right-24 w-96 h-96 bg-indigo-50 rounded-full blur-3xl opacity-60 animate-blob animation-delay-2000"></div>
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center p-4 py-8">
        <div className="w-full max-w-3xl">

          {/* Progress Header */}
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-slate-700 font-black text-xs uppercase tracking-widest">
                {ekosistemLabel}
              </span>
              <span className="text-slate-700 font-black text-xs tabular-nums">
                {currentStep} / {totalSteps}
              </span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
              <div
                className="h-full rounded-full bg-sky-600 transition-all duration-500"
                style={{ width: `${(currentStep / totalSteps) * 100}%` }}
              />
            </div>
          </div>

          {/* Question Card */}
          <div className="bg-white rounded-[2rem] border border-slate-200 shadow-xl shadow-slate-200/40 p-6 md:p-8 mb-4">

            {/* Badge + Variabel */}
            <div className="flex items-center gap-2 mb-3">
              <div className="bg-sky-100 px-2.5 py-1 rounded-lg">
                <span className="text-sky-700 font-black text-xs tracking-widest">{question.kode}</span>
              </div>
              <span className="text-slate-400 font-bold text-xs uppercase tracking-widest">
                {question.variabel}
              </span>
            </div>

            {/* Indicator Title */}
            <h4 className="text-xl md:text-2xl font-black text-slate-900 leading-tight mb-4">
              {question.indikator}
            </h4>

            {/* Kondisi Ideal Box */}
            {question.deskripsi && (
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-4 h-4 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                    <svg className="w-2.5 h-2.5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-emerald-700 font-black text-xs uppercase tracking-widest">Keterangan:</span>
                </div>
                <p className="text-slate-600 text-sm leading-relaxed font-medium italic">
                  "{question.deskripsi}"
                </p>
              </div>
            )}

            {/* Answer Input Area */}
            <div className="flex flex-col items-center">
              {isMultiSelect ? (
                /* Multi-select Grid */
                <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
                  {options.map((option) => {
                    const isChecked = Array.isArray(selectedValue) && selectedValue.includes(option.value);
                    return (
                      <button
                        key={option.value}
                        onClick={() => handleSelect(option.value)}
                        className={`flex items-center gap-3 p-4 rounded-2xl border-2 transition-all text-left ${
                          isChecked 
                            ? 'bg-sky-50 border-sky-500 text-sky-900 shadow-sm' 
                            : 'bg-white border-slate-100 text-slate-600 hover:border-slate-200'
                        }`}
                      >
                        <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                          isChecked ? 'bg-sky-500 border-sky-500' : 'bg-white border-slate-200'
                        }`}>
                          {isChecked && (
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                        <span className="font-bold text-sm leading-tight">{option.label}</span>
                      </button>
                    );
                  })}
                </div>
              ) : isSelect ? (
                /* Single Select / Dropdown */
                <div className="w-full mb-6">
                  <select 
                    value={Array.isArray(selectedValue) ? (selectedValue[0] ?? '') : (selectedValue ?? '')} 
                    onChange={(e) => handleSelect(parseInt(e.target.value))}
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 text-slate-900 font-bold focus:outline-none focus:border-sky-500 focus:bg-white transition-all cursor-pointer"
                  >
                    <option value="" disabled>— Pilih Jawaban —</option>
                    {options.map((option) => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>
              ) : (
                /* Default Star Rating */
                <div className="flex flex-col items-center w-full">
                  <div className="flex justify-center items-center gap-4 md:gap-8 mb-5">
                    {options.map((option) => {
                      const isSelected = selectedValue === option.value;
                      const currentVal = hoveredValue !== null ? hoveredValue : (selectedValue !== null ? selectedValue : -1);
                      const isActive = currentVal >= option.value;

                      return (
                        <button
                          key={option.value}
                          onClick={() => handleSelect(option.value)}
                          onMouseEnter={() => setHoveredValue(option.value)}
                          onMouseLeave={() => setHoveredValue(null)}
                          className={`relative transition-all duration-300 transform active:scale-75 ${isSelected ? 'scale-110' : 'hover:scale-105'}`}
                        >
                          <div className={`absolute inset-0 blur-xl rounded-full transition-opacity duration-300 ${isActive ? 'bg-amber-400/20 opacity-100' : 'opacity-0'}`}></div>
                          <svg
                            className={`w-12 h-12 md:w-20 md:h-20 transition-all duration-300 relative z-10 ${isActive ? 'text-amber-400 fill-amber-400 drop-shadow-sm' : 'text-slate-300 fill-slate-50'}`}
                            viewBox="0 0 24 24"
                          >
                            <path
                              stroke="currentColor"
                              strokeWidth={isActive ? '0' : '1.2'}
                              d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                            />
                          </svg>
                        </button>
                      );
                    })}
                  </div>

                  {/* Scale Description (Rating only) */}
                  <div className="w-full rounded-xl bg-slate-50 border border-slate-100 px-5 py-4 text-center min-h-[56px] flex items-center justify-center">
                    <p className={`text-sm font-bold leading-snug transition-all duration-300 ${dynamicDesc ? 'text-slate-800 uppercase tracking-wide' : 'text-slate-400 italic normal-case'}`}>
                      {dynamicDesc || 'Pilih bintang untuk menilai'}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onPrev}
              className="flex-1 py-4 rounded-xl font-black uppercase tracking-widest text-xs transition-all bg-white border border-slate-200 text-slate-500 hover:border-slate-400 hover:text-slate-800 active:scale-95"
            >
              ← Kembali
            </button>
            <button
              onClick={handleNext}
              disabled={selectedValue === null || (Array.isArray(selectedValue) && selectedValue.length === 0)}
              className={`flex-1 py-4 rounded-xl font-black uppercase tracking-widest text-xs transition-all active:scale-95 ${
                (selectedValue === null || (Array.isArray(selectedValue) && selectedValue.length === 0))
                  ? 'bg-slate-100 text-slate-300 cursor-not-allowed'
                  : 'bg-slate-900 text-white shadow-lg hover:bg-black'
              }`}
            >
              {currentStep === totalSteps ? 'Selesai & Review' : 'Lanjut →'}
            </button>
          </div>

          {/* Watermark */}
          <div className="mt-4 text-center">
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.4em]">Sekolah Literasi Indonesia</p>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        .animate-blob { animation: blob 7s infinite; }
        .animation-delay-2000 { animation-delay: 2s; }
      `}} />
    </div>
  );
}
