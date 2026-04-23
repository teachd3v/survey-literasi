// src/pages/DashboardPage.jsx
import React, { useEffect, useState } from 'react';
import StatCard from '../components/dashboard/StatCard';
import LingkupComparison from '../components/dashboard/LingkupComparison';
import IndicatorRadar from '../components/dashboard/IndicatorRadar';
import { fetchDashboardStats, fetchIndicatorBreakdown } from '../services/googleSheets';

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedLingkup, setSelectedLingkup] = useState('SEKOLAH');
  const [indicatorData, setIndicatorData] = useState([]);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await fetchDashboardStats();
        setStats(data);
        const breakdown = await fetchIndicatorBreakdown(selectedLingkup);
        setIndicatorData(breakdown);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [selectedLingkup]);

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-navy flex items-center justify-center">
        <div className="text-white text-2xl animate-pulse">Loading data...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-brand-navy">
      {/* Animated Background Orbs */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#2a3e63] via-[#2e66a3] to-[#39a0c9]">
        <div className="absolute top-20 left-20 w-96 h-96 bg-[#7dcbe1] rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-40 right-20 w-96 h-96 bg-[#39a0c9] rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-20 left-40 w-96 h-96 bg-[#2e66a3] rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10 p-4 md:p-6 lg:p-8 max-w-[1600px] mx-auto h-screen flex flex-col">
        {/* Header - Compact Version */}
        <div className="mb-4 md:mb-6 flex flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <button 
              onClick={() => window.location.href = '/survey'}
              className="group flex items-center gap-2 text-brand-light hover:text-white transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center border border-white/10 group-hover:bg-brand-cyan/20">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </div>
              <span className="text-xs font-black uppercase tracking-widest hidden md:block">Back to Survey</span>
            </button>
            
            <div className="h-10 w-[1px] bg-white/10 hidden md:block"></div>

            <div>
              <h1 className="text-xl md:text-3xl font-black text-white bg-gradient-to-r from-white via-brand-cyan to-brand-light bg-clip-text text-transparent leading-none">
                INSTRUMEN EKOSISTEM LITERASI
              </h1>
              <p className="text-white/50 text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] mt-1">Real-time Performance Analytics</p>
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-4 text-white/40 text-[10px] font-black uppercase tracking-widest">
            <span>Status: <span className="text-emerald-400">Live</span></span>
            <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></div>
          </div>
        </div>

        {/* Overview Stats - More Compact */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4 md:mb-6">
          <StatCard 
            title="Total Responden" 
            value={stats?.totalResponses || 0} 
            compact
            icon={<path d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />}
          />
          <StatCard 
            title="Indeks Nasional" 
            value={stats?.avgScore?.toFixed(2) || '0.00'} 
            subtitle="Skala 4.0"
            compact
            icon={<path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />}
          />
          <StatCard 
            title="Sync Status" 
            value="Active" 
            subtitle={new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
            compact
            icon={<path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />}
          />
          <StatCard 
            title="Target Capaian" 
            value="18.7%" 
            subtitle="240 Sample"
            compact
            icon={<path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />}
          />
        </div>

        {/* Charts Grid - Expanded to fill remaining space */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 md:gap-6 flex-1 min-h-0">
          <div className="xl:col-span-12 lg:col-span-5 h-full overflow-hidden">
             <LingkupComparison data={stats?.lingkupStats || []} horizontal />
          </div>
          
          <div className="xl:col-span-12 lg:col-span-7 flex flex-col gap-4 min-h-0">
            {/* Lingkup Selector for Radar */}
            <div className="overflow-x-auto custom-scrollbar shrink-0">
              <div className="backdrop-blur-xl bg-white/5 rounded-2xl p-1 border border-white/10 flex gap-1">
                {['SEKOLAH', 'KELUARGA', 'MASYARAKAT'].map((l) => (
                  <button
                    key={l}
                    onClick={() => setSelectedLingkup(l)}
                    className={`
                      flex-1 py-1.5 px-3 rounded-xl text-[10px] md:text-xs font-black transition-all uppercase tracking-widest
                      ${selectedLingkup === l 
                        ? 'bg-white text-brand-navy shadow-lg' 
                        : 'text-white/40 hover:bg-white/5 hover:text-white/80'}
                    `}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="flex-1 min-h-0">
              <IndicatorRadar data={indicatorData} lingkup={selectedLingkup} compact />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
