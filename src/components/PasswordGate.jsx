import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Lock, Unlock, Eye, EyeOff, AlertCircle, ArrowLeft } from 'lucide-react';

const SESSION_KEY = 'sli_session_auth';
const CORRECT_PASSWORD = 'IndeksSLI';

export default function PasswordGate() {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(() => {
    return sessionStorage.getItem(SESSION_KEY) === CORRECT_PASSWORD;
  });
  const [error, setError] = useState('');
  const [isShaking, setIsShaking] = useState(false);
  const [success, setSuccess] = useState(false);

  // Focus input on mount
  useEffect(() => {
    const input = document.getElementById('password-input');
    if (input) input.focus();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (password === CORRECT_PASSWORD) {
      setSuccess(true);
      sessionStorage.setItem(SESSION_KEY, CORRECT_PASSWORD);
      // Short delay to show success state before transitioning
      setTimeout(() => setIsAuthorized(true), 400);
    } else {
      setError('Password salah! Silakan coba lagi.');
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 300);
    }
  };

  if (isAuthorized) {
    return <Outlet />;
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-slate-900 flex items-center justify-center p-4">
      {/* Dynamic Background Orbs */}
      <div className="absolute inset-0">
        <div className="absolute -top-32 -left-32 w-[500px] h-[500px] bg-sky-600 rounded-full blur-[120px] opacity-25 animate-blob"></div>
        <div className="absolute -bottom-32 -right-32 w-[500px] h-[500px] bg-brand-cyan rounded-full blur-[120px] opacity-20 animate-blob animation-delay-2000"></div>
      </div>

      {/* Floating Back Button */}
      <button
        onClick={() => navigate('/')}
        className="absolute top-6 left-6 z-50 flex items-center gap-2 bg-slate-800/80 hover:bg-slate-800 border border-slate-700/50 text-slate-300 px-4 py-2.5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl transition-all hover:scale-105 active:scale-95"
      >
        <ArrowLeft className="w-4 h-4 text-brand-cyan" />
        Kembali ke Beranda
      </button>

      {/* Main Glassmorphic Card */}
      <div 
        className={`relative z-10 w-full max-w-md bg-slate-900/40 backdrop-blur-xl border border-slate-700/50 rounded-[2.5rem] p-8 md:p-10 shadow-2xl transition-all duration-300 ${
          isShaking ? 'animate-shake border-red-500/50 shadow-red-500/10' : ''
        }`}
      >
        <div className="flex flex-col items-center text-center">
          {/* Animated Gembok Icon Wrapper */}
          <div className={`w-20 h-20 rounded-2xl flex items-center justify-center mb-6 transition-all duration-500 ${
            success 
              ? 'bg-emerald-500/20 text-emerald-400 shadow-glow-cyan' 
              : error 
                ? 'bg-red-500/20 text-red-400' 
                : 'bg-slate-800/80 text-brand-cyan shadow-lg border border-slate-700/50'
          }`}>
            {success ? (
              <Unlock className="w-10 h-10 animate-bounce" />
            ) : (
              <Lock className={`w-10 h-10 ${error ? 'animate-pulse' : 'animate-pulse-slow'}`} />
            )}
          </div>

          <div className="px-2">
            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight mb-2">
              Akses Terproteksi
            </h1>
            <p className="text-slate-400 text-sm font-medium leading-relaxed mb-8">
              Masukkan kata sandi untuk mengakses halaman formulir survei dan dashboard analisis.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="w-full space-y-5">
            <div className="relative">
              <input
                id="password-input"
                type={showPassword ? 'text' : 'password'}
                placeholder="Masukkan Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full px-5 py-4 bg-slate-800/50 border rounded-2xl text-white font-bold placeholder-slate-500 focus:outline-none focus:ring-2 transition-all ${
                  error 
                    ? 'border-red-500 focus:ring-red-500/20' 
                    : 'border-slate-700/80 focus:border-brand-cyan focus:ring-brand-cyan/20'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                tabIndex="-1"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-center gap-2.5 px-4 py-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-xs font-bold text-left animate-pulse">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={success}
              className={`w-full py-4 rounded-2xl font-black text-xs uppercase tracking-widest text-white shadow-xl transition-all hover:scale-[1.02] active:scale-95 cursor-pointer flex items-center justify-center gap-2 ${
                success
                  ? 'bg-emerald-600'
                  : 'bg-gradient-to-r from-brand-blue to-brand-cyan hover:shadow-glow-blue'
              }`}
            >
              {success ? 'Membuka Akses...' : 'Verifikasi & Masuk'}
            </button>
          </form>

          {/* Small Brand Label */}
          <div className="mt-8 flex items-center gap-2 opacity-50">
            <img src="/logo.png" alt="SLI" className="h-5 w-auto object-contain brightness-0 invert" />
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Sekolah Literasi Indonesia</span>
          </div>
        </div>
      </div>
    </div>
  );
}
