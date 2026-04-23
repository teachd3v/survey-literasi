// src/pages/SurveyPage.jsx
import React, { useState, useEffect } from 'react';
import QuestionStep from '../components/survey/QuestionStep';
import { SURVEY_QUESTIONS } from '../utils/constants';
import { submitSurvey } from '../services/googleSheets';

export default function SurveyPage() {
  const [step, setStep] = useState('WELCOME'); // WELCOME, IDENTITY, QUESTIONS, REVIEW, SUCCESS
  const [lingkup, setLingkup] = useState(null);
  const [identity, setIdentity] = useState({ 
    responden_nama: '', 
    wilayah: '' 
  });
  const [answers, setAnswers] = useState({});
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- Effects ---
  
  // Confetti effect on success
  useEffect(() => {
    if (step === 'SUCCESS' && window.confetti) {
      const duration = 5 * 1000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 100 };

      const randomInRange = (min, max) => Math.random() * (max - min) + min;

      const interval = setInterval(function() {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);
        // Confetti from left
        window.confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
        // Confetti from right
        window.confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
      }, 250);
      
      return () => clearInterval(interval);
    }
  }, [step]);

  // --- Step Handlers ---

  const startSurvey = (l) => {
    setLingkup(l);
    setStep('IDENTITY');
  };

  const handleIdentitySubmit = (e) => {
    e.preventDefault();
    setStep('QUESTIONS');
  };

  const handleAnswer = (val) => {
    const q = SURVEY_QUESTIONS[lingkup][currentQuestionIdx];
    setAnswers(prev => ({ ...prev, [q.kode]: val }));
  };

  const nextQuestion = () => {
    if (currentQuestionIdx < SURVEY_QUESTIONS[lingkup].length - 1) {
      setCurrentQuestionIdx(prev => prev + 1);
    } else {
      setStep('REVIEW');
    }
  };

  const prevQuestion = () => {
    if (currentQuestionIdx > 0) {
      setCurrentQuestionIdx(prev => prev - 1);
    } else {
      setStep('IDENTITY');
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const payload = {
        lingkup,
        ...identity,
        ...answers
      };
      await submitSurvey(payload);
      setStep('SUCCESS');
    } catch (error) {
      alert(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Renderers ---

  if (step === 'WELCOME') {
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

  if (step === 'IDENTITY') {
    return (
      <div className="min-h-screen relative overflow-hidden bg-slate-50 flex items-center justify-center p-4">
        <div className="relative z-10 w-full max-w-md bg-white rounded-[2.5rem] border border-slate-200 p-8 md:p-12 shadow-2xl shadow-slate-200">
          <div className="mb-10">
            <h2 className="text-3xl font-black text-slate-900 mb-2">Data Diri</h2>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Identitas Responden</p>
          </div>
          <form onSubmit={handleIdentitySubmit} className="space-y-8">
            <div className="space-y-2">
              <label className="block text-slate-500 font-black uppercase tracking-widest text-[10px] ml-1">Nama Lengkap</label>
              <input
                required
                type="text"
                placeholder="CONTOH: BUDI SANTOSO"
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 text-slate-900 font-bold focus:outline-none focus:border-sky-500 focus:bg-white transition-all uppercase placeholder:text-slate-300"
                value={identity.responden_nama}
                onChange={e => setIdentity({...identity, responden_nama: e.target.value.toUpperCase()})}
              />
            </div>
            <div className="space-y-2">
              <label className="block text-slate-500 font-black uppercase tracking-widest text-[10px] ml-1">Wilayah / Kota</label>
              <input
                required
                type="text"
                placeholder="CONTOH: JAKARTA SELATAN"
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 text-slate-900 font-bold focus:outline-none focus:border-sky-500 focus:bg-white transition-all uppercase placeholder:text-slate-300"
                value={identity.wilayah}
                onChange={e => setIdentity({...identity, wilayah: e.target.value.toUpperCase()})}
              />
            </div>
            <button
              type="submit"
              className="w-full py-4 rounded-xl font-bold bg-gradient-to-r from-brand-cyan to-brand-light text-white shadow-lg hover:shadow-cyan-500/50"
            >
              Lanjut Ke Pertanyaan →
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (step === 'QUESTIONS') {
    const questions = SURVEY_QUESTIONS[lingkup];
    const q = questions[currentQuestionIdx];
    return (
      <QuestionStep
        question={q}
        currentStep={currentQuestionIdx + 1}
        totalSteps={questions.length}
        value={answers[q.kode]}
        onChange={handleAnswer}
        onNext={nextQuestion}
        onPrev={prevQuestion}
      />
    );
  }

  if (step === 'REVIEW') {
    const questions = SURVEY_QUESTIONS[lingkup];
    return (
      <div className="min-h-screen relative overflow-hidden bg-slate-50 flex items-center justify-center p-4">
        <div className="relative z-10 w-full max-w-2xl bg-white rounded-[2.5rem] border border-slate-200 p-8 shadow-2xl shadow-slate-200">
          <div className="mb-8">
            <h2 className="text-3xl font-black text-slate-900 mb-2">Review Jawaban</h2>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Periksa kembali data Anda sebelum mengirim</p>
          </div>
          
          <div className="space-y-3 mb-8 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
            {questions.map((q) => (
              <div key={q.kode} className="bg-slate-50 p-4 rounded-2xl border border-slate-100 hover:border-sky-200 transition-all">
                <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">{q.kode} - {q.variabel}</p>
                <div className="flex justify-between items-center gap-4">
                  <p className="text-slate-700 text-sm font-bold line-clamp-2">{q.indikator}</p>
                  <div className="shrink-0 w-10 h-10 rounded-xl bg-sky-600 flex items-center justify-center shadow-lg">
                    <span className="text-white font-black text-lg">{answers[q.kode]}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="flex gap-4">
            <button
              onClick={() => setStep('QUESTIONS')}
              className="flex-1 py-5 rounded-2xl font-black uppercase tracking-widest text-xs border-2 border-slate-100 text-slate-400 hover:bg-slate-50 transition-all"
            >
              ← Edit
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex-1 py-5 rounded-2xl font-black uppercase tracking-widest text-xs bg-sky-600 text-white shadow-xl shadow-sky-200 disabled:opacity-50 transition-all hover:bg-sky-700 active:scale-95"
            >
              {isSubmitting ? 'Mengirim...' : 'Kirim Sekarang →'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'SUCCESS') {
    return (
      <div className="min-h-screen relative overflow-hidden bg-white flex items-center justify-center p-4">
        {/* Glow Effect */}
        <div className="absolute inset-0 bg-slate-50">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-sky-100 rounded-full blur-[120px] opacity-50"></div>
        </div>

        <div className="relative z-10 text-center max-w-lg px-6">
          <div className="w-24 h-24 bg-emerald-500 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-emerald-200 animate-bounce">
            <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-4 tracking-tighter">Terima Kasih!</h2>
          <p className="text-slate-500 text-sm md:text-lg mb-12 font-medium leading-relaxed">
            Data Anda telah berhasil direkam. Kontribusi Anda sangat berharga bagi pemetaan literasi di Indonesia.
          </p>
          <button
            onClick={() => window.location.href = '/dashboard'}
            className="w-full py-5 rounded-2xl font-black uppercase tracking-widest text-xs bg-slate-900 text-white shadow-2xl shadow-slate-300 transition-all hover:bg-slate-800 active:scale-95"
          >
            Lihat Analisis Dashboard →
          </button>
        </div>
      </div>
    );
  }

  return null;
}
