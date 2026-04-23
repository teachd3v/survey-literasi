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

      <div className="relative z-10 p-4 md:p-8 max-w-7xl mx-auto">
        {/* Header & Navigation */}
        <div className="mb-8 md:mb-12 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <button 
              onClick={() => window.location.href = '/survey'}
              className="text-brand-light flex items-center gap-2 mb-4 hover:underline text-sm font-bold"
            >
              ← Kembali ke Survey
            </button>
            <h1 className="text-3xl md:text-5xl font-bold text-white mb-2 md:mb-3 bg-gradient-to-r from-white via-brand-cyan to-brand-light bg-clip-text text-transparent leading-tight">
              Dashboard Ekosistem Literasi
            </h1>
            <p className="text-white/70 text-base md:text-lg">Analisis data literasi secara real-time</p>
          </div>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8 md:mb-12">
          <StatCard 
            title="Total Responden" 
            value={stats?.totalResponses || 0} 
            icon={
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            }
          />
          <StatCard 
            title="Rata-rata Skor" 
            value={stats?.avgScore?.toFixed(2) || '0.00'} 
            subtitle="Dari skala 1-4"
            icon={
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            }
          />
          <StatCard 
            title="Update Terakhir" 
            value={new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })} 
            subtitle={new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
            icon={
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
          <StatCard 
            title="Target Responden" 
            value="240" 
            subtitle="Capaian saat ini"
            icon={
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 md:gap-8 mb-12">
          <LingkupComparison data={stats?.lingkupStats || []} />
          
          <div className="space-y-6">
            {/* Lingkup Selector for Radar (Scrollable on mobile) */}
            <div className="overflow-x-auto pb-2 custom-scrollbar">
              <div className="backdrop-blur-xl bg-white/10 rounded-2xl p-1.5 border border-white/20 flex gap-2 min-w-[320px]">
                {['SEKOLAH', 'KELUARGA', 'MASYARAKAT'].map((l) => (
                  <button
                    key={l}
                    onClick={() => setSelectedLingkup(l)}
                    className={`
                      flex-1 py-2 px-4 rounded-xl text-xs md:text-sm font-bold transition-all whitespace-nowrap
                      ${selectedLingkup === l 
                        ? 'bg-gradient-to-r from-brand-cyan to-brand-light text-white shadow-lg' 
                        : 'text-white/60 hover:bg-white/5 hover:text-white'}
                    `}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>
            
            <IndicatorRadar data={indicatorData} lingkup={selectedLingkup} />
          </div>
        </div>
      </div>
    </div>
  );
}
