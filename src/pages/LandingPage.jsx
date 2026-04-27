import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function LandingPage() {
  const navigate = useNavigate();

  const startSurvey = (l) => {
    navigate(`/literasi/${l.toLowerCase()}`);
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-white flex items-center justify-center p-4">
      {/* Clean Light BG Orbs */}
      <div className="absolute inset-0 bg-slate-50">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-sky-100 rounded-full blur-3xl opacity-60 animate-blob"></div>
        <div className="absolute top-1/2 -right-24 w-96 h-96 bg-indigo-50 rounded-full blur-3xl opacity-60 animate-blob animation-delay-2000"></div>
      </div>

      <div className="relative z-10 w-full max-w-4xl text-center">
        <h1 className="text-4xl md:text-7xl font-black text-slate-900 mb-4 md:mb-8 tracking-tighter px-4">
          Survey Ekosistem <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-600 to-blue-800">
            Literasi Indonesia
          </span>
        </h1>
        <p className="text-slate-500 text-sm md:text-xl mb-8 md:mb-16 max-w-2xl mx-auto px-6 font-medium leading-relaxed">
          Bantu kami memetakan indeks literasi untuk menciptakan ekosistem belajar yang lebih baik dan berkelanjutan.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8 px-4">
          {['SEKOLAH', 'KELUARGA', 'MASYARAKAT'].map((l) => (
            <button
              key={l}
              onClick={() => startSurvey(l)}
              className="group relative bg-white rounded-3xl border-2 border-slate-100 p-6 md:p-10 transition-all hover:border-sky-500 hover:shadow-2xl hover:shadow-sky-200 hover:-translate-y-2 active:scale-95"
            >
              <div className="text-4xl md:text-5xl mb-4 md:mb-6">{l === 'SEKOLAH' ? '🏫' : l === 'KELUARGA' ? '🏠' : '🌍'}</div>
              <h3 className="text-lg md:text-2xl font-black text-slate-800 mb-2">{l}</h3>
              <div className="w-8 h-1 bg-sky-500 mx-auto rounded-full group-hover:w-16 transition-all duration-500"></div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
