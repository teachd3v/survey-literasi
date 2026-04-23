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
    email: '', 
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
      <div className="min-h-screen relative overflow-hidden bg-brand-navy flex items-center justify-center p-4">
        {/* BG Orbs */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#2a3e63] via-[#2e66a3] to-[#39a0c9]">
          <div className="absolute top-20 left-20 w-96 h-96 bg-[#7dcbe1] rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
          <div className="absolute top-40 right-20 w-96 h-96 bg-[#39a0c9] rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-20 left-40 w-96 h-96 bg-[#2e66a3] rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
        </div>

        <div className="relative z-10 w-full max-w-4xl text-center">
          <h1 className="text-3xl md:text-7xl font-bold text-white mb-2 md:mb-6 tracking-tight px-4">
            Survey Ekosistem <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-cyan to-brand-light">
              Literasi Indonesia
            </span>
          </h1>
          <p className="text-white/70 text-sm md:text-xl mb-6 md:mb-12 max-w-2xl mx-auto px-6">
            Bantu kami memetakan indeks literasi untuk menciptakan ekosistem belajar yang lebih baik.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-6 px-4">
            {['SEKOLAH', 'KELUARGA', 'MASYARAKAT'].map((l) => (
              <button
                key={l}
                onClick={() => startSurvey(l)}
                className="group relative backdrop-blur-2xl bg-white/10 rounded-2xl md:rounded-3xl border border-white/20 p-4 md:p-8 transition-all hover:bg-white/20 hover:scale-[1.02] md:hover:scale-105"
              >
                <div className="text-2xl md:text-4xl mb-2 md:mb-4">{l === 'SEKOLAH' ? '🏫' : l === 'KELUARGA' ? '🏠' : '🌍'}</div>
                <h3 className="text-base md:text-xl font-bold text-white">{l}</h3>
                <p className="text-white/50 text-[10px] md:text-sm mt-1 md:mt-2 uppercase tracking-widest">Mulai Survey</p>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (step === 'IDENTITY') {
    return (
      <div className="min-h-screen relative overflow-hidden bg-brand-navy flex items-center justify-center p-4">
        {/* Same BG logic */}
        <div className="relative z-10 w-full max-w-md backdrop-blur-2xl bg-white/10 rounded-3xl border border-white/20 p-8 shadow-2xl">
          <h2 className="text-3xl font-bold text-white mb-6">Data Diri</h2>
          <form onSubmit={handleIdentitySubmit} className="space-y-6">
            <div>
              <label className="block text-white/70 text-sm mb-2">Nama Lengkap</label>
              <input
                required
                type="text"
                className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-cyan"
                value={identity.responden_nama}
                onChange={e => setIdentity({...identity, responden_nama: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-white/70 text-sm mb-2">Email (Opsional)</label>
              <input
                type="email"
                className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-cyan"
                value={identity.email}
                onChange={e => setIdentity({...identity, email: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-white/70 text-sm mb-2">Wilayah / Kota</label>
              <input
                required
                type="text"
                className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-cyan"
                value={identity.wilayah}
                onChange={e => setIdentity({...identity, wilayah: e.target.value})}
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
      <div className="min-h-screen relative overflow-hidden bg-brand-navy flex items-center justify-center p-4">
        <div className="relative z-10 w-full max-w-2xl backdrop-blur-2xl bg-white/10 rounded-3xl border border-white/20 p-8 shadow-2xl">
          <h2 className="text-3xl font-bold text-white mb-6">Review Jawaban</h2>
          <div className="space-y-4 mb-8 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
            {questions.map((q) => (
              <div key={q.kode} className="bg-white/5 p-4 rounded-xl border border-white/10">
                <p className="text-white/60 text-xs uppercase mb-1">{q.kode} - {q.variabel}</p>
                <div className="flex justify-between items-center">
                  <p className="text-white text-sm pr-4">{q.indikator}</p>
                  <span className="text-brand-light font-bold text-xl">{answers[q.kode]}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="flex gap-4">
            <button
              onClick={() => setStep('QUESTIONS')}
              className="flex-1 py-4 rounded-xl font-bold border border-white/30 text-white hover:bg-white/10"
            >
              ← Edit
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex-1 py-4 rounded-xl font-bold bg-gradient-to-r from-brand-cyan to-brand-light text-white shadow-lg disabled:opacity-50"
            >
              {isSubmitting ? 'Mengirim...' : 'Kirim Survey →'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'SUCCESS') {
    return (
      <div className="min-h-screen relative overflow-hidden bg-brand-navy flex items-center justify-center p-4">
        <div className="relative z-10 text-center">
          <div className="text-7xl mb-6">🎉</div>
          <h2 className="text-5xl font-bold text-white mb-4">Terima Kasih!</h2>
          <p className="text-white/70 text-xl mb-12">
            Kontribusi Anda sangat berharga bagi kemajuan literasi di Indonesia.
          </p>
          <button
            onClick={() => window.location.href = '/dashboard'}
            className="px-8 py-4 rounded-xl font-bold bg-gradient-to-r from-brand-cyan to-brand-light text-white shadow-lg"
          >
            Lihat Dashboard →
          </button>
        </div>
      </div>
    );
  }

  return null;
}
