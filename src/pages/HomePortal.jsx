import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function HomePortal() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen relative overflow-hidden bg-slate-50 flex items-center justify-center p-4">
      {/* Background Orbs */}
      <div className="absolute inset-0">
        <div className="absolute -top-32 -left-32 w-[500px] h-[500px] bg-sky-200 rounded-full blur-[100px] opacity-40 animate-blob"></div>
        <div className="absolute top-1/2 -right-32 w-[500px] h-[500px] bg-emerald-200 rounded-full blur-[100px] opacity-40 animate-blob animation-delay-2000"></div>
      </div>

      <div className="relative z-10 w-full max-w-5xl text-center">
        {/* Header */}
        <div className="mb-12 md:mb-20">
          <div className="inline-block px-4 py-1.5 rounded-full bg-white shadow-sm border border-slate-100 mb-6">
            <span className="text-slate-600 font-black text-[10px] tracking-widest uppercase">Portal Assessment</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-slate-900 mb-6 tracking-tighter">
            Indeks <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-600 to-emerald-500">Literasi Indonesia</span>
          </h1>
          <p className="text-slate-500 text-base md:text-xl max-w-2xl mx-auto font-medium leading-relaxed">
            Pilih instrumen survey yang ingin Anda isi. Kontribusi Anda sangat berharga untuk pemetaan dan pengembangan ekosistem literasi.
          </p>
        </div>

        {/* Portal Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10 max-w-4xl mx-auto px-4">
          
          {/* Card Literasi */}
          <button
            onClick={() => navigate('/literasi')}
            className="group text-left bg-white rounded-[2.5rem] p-8 md:p-12 border border-slate-100 shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:shadow-sky-200 hover:-translate-y-2 transition-all duration-300"
          >
            <div className="w-20 h-20 rounded-2xl bg-sky-50 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-300">
              <span className="text-4xl">🌍</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-black text-slate-900 mb-4">
              Ekosistem <br/>Literasi
            </h2>
            <p className="text-slate-500 text-sm md:text-base font-medium leading-relaxed mb-8 h-16">
              Mengukur dukungan ekosistem (Sekolah, Keluarga, Masyarakat) terhadap pembudayaan literasi.
            </p>
            <div className="flex items-center gap-3 text-sky-600 font-bold uppercase tracking-widest text-xs">
              Mulai Survey 
              <span className="group-hover:translate-x-2 transition-transform">→</span>
            </div>
          </button>

          {/* Card Minat Baca */}
          <button
            onClick={() => navigate('/minatbaca')}
            className="group text-left bg-white rounded-[2.5rem] p-8 md:p-12 border border-slate-100 shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:shadow-emerald-200 hover:-translate-y-2 transition-all duration-300"
          >
            <div className="w-20 h-20 rounded-2xl bg-emerald-50 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-300">
              <span className="text-4xl">📖</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-black text-slate-900 mb-4">
              Perilaku <br/>Minat Baca
            </h2>
            <p className="text-slate-500 text-sm md:text-base font-medium leading-relaxed mb-8 h-16">
              Mengukur kebiasaan, preferensi, dan frekuensi membaca berdasarkan kategori usia.
            </p>
            <div className="flex items-center gap-3 text-emerald-600 font-bold uppercase tracking-widest text-xs">
              Mulai Survey 
              <span className="group-hover:translate-x-2 transition-transform">→</span>
            </div>
          </button>

        </div>
        
        {/* Footer */}
        <div className="mt-16 text-center">
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em]">
            Dashboard Admin
          </p>
          <button 
            onClick={() => navigate('/dashboard')}
            className="mt-4 px-6 py-2 rounded-full border border-slate-200 text-slate-500 text-xs font-bold hover:bg-slate-50 transition-colors"
          >
            Lihat Hasil Analisis Data
          </button>
        </div>

      </div>
    </div>
  );
}
