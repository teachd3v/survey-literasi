// src/pages/DashboardPage.jsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import StatCard from '../components/dashboard/StatCard';
import LingkupComparison from '../components/dashboard/LingkupComparison';
import IndicatorRadar from '../components/dashboard/IndicatorRadar';
import { fetchDashboardStats } from '../services/googleSheets';

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [activeLingkup, setActiveLingkup] = useState('SEKOLAH');
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const dashboardData = await fetchDashboardStats();
      setStats(dashboardData);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-sky-200 border-t-sky-600 rounded-full animate-spin"></div>
          <p className="text-slate-400 font-black uppercase tracking-widest text-[10px]">Memuat Analisis...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
      {/* Floating Back Button */}
      <div className="fixed bottom-8 right-8 z-50">
        <Link 
          to="/survey"
          className="flex items-center gap-3 bg-slate-900 text-white px-6 py-4 rounded-2xl font-black uppercase tracking-widest text-xs shadow-2xl hover:scale-105 active:scale-95 transition-all"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Kembali ke Survey
        </Link>
      </div>

      <div className="max-w-7xl mx-auto px-6 pt-12">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-sky-100 rounded-lg mb-4">
              <div className="w-2 h-2 bg-sky-600 rounded-full animate-pulse"></div>
              <span className="text-sky-700 font-black text-[10px] uppercase tracking-widest">Real-time Analytics</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-slate-900 mb-2">
              Dashboard Literasi
            </h1>
            <p className="text-slate-500 font-medium text-lg">
              Visualisasi pemetaan ekosistem literasi nasional 2026.
            </p>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-slate-400 font-black text-[10px] uppercase tracking-widest mb-1">Terakhir Update</span>
            <span className="text-slate-900 font-bold">{new Date().toLocaleString('id-ID')}</span>
          </div>
        </div>

        {/* Big Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <StatCard 
            title="Total Responden" 
            value={stats?.totalResponses || 0}
            icon="users"
            subtitle="Sampel data masuk"
          />
          <StatCard 
            title="Indeks Nasional" 
            value={stats?.avgScore?.toFixed(2) || '0.00'}
            icon="chart"
            subtitle="Skala 4.00"
            color="sky"
          />
          <StatCard 
            title="Kategori Dominan" 
            value={stats?.categoryDistribution ? Object.entries(stats.categoryDistribution).sort((a,b) => b[1]-a[1])[0][0] : '-'}
            icon="award"
            subtitle="Berdasarkan sebaran"
            color="emerald"
          />
          <StatCard 
            title="Status Sistem" 
            value="Sinkron"
            icon="check"
            subtitle="Cloud Connected"
            color="slate"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Main Chart Section - Top Row Left */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-[2.5rem] border border-slate-200 p-8 shadow-2xl shadow-slate-200/50 h-full">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Capaian per Lingkup</h3>
                  <p className="text-slate-400 text-sm font-medium">Bandingkan performa antar ekosistem</p>
                </div>
              </div>
              <LingkupComparison data={stats?.lingkupStats || []} />
            </div>
          </div>

          {/* Sidebar Section - Top Row Right */}
          <div className="space-y-6">
            <div className="bg-slate-900 text-white rounded-[2.5rem] p-8 shadow-2xl h-[calc(50%-12px)] overflow-hidden">
              <h4 className="text-xl font-black mb-6 uppercase tracking-widest text-[#7dcbe1]">Interpretasi</h4>
              <div className="space-y-4">
                {stats?.categoryDistribution && Object.entries(stats.categoryDistribution).map(([cat, count]) => (
                  <div key={cat} className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${
                        cat === 'Sangat Baik' ? 'bg-emerald-400' :
                        cat === 'Baik' ? 'bg-sky-400' :
                        cat === 'Berkembang' ? 'bg-amber-400' : 'bg-red-400'
                      }`}></div>
                      <span className="text-slate-200 font-bold text-sm">{cat}</span>
                    </div>
                    <span className="font-black text-lg">{count}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-sky-600 text-white rounded-[2.5rem] p-8 shadow-2xl h-[calc(50%-12px)] relative overflow-hidden group">
              <div className="relative z-10">
                <h4 className="text-xl font-black mb-1 uppercase tracking-widest">Target</h4>
                <div className="text-5xl font-black mb-2">18.7%</div>
                <div className="w-full bg-sky-800/50 rounded-full h-3 mb-2 overflow-hidden">
                   <div className="bg-white h-full rounded-full transition-all duration-1000" style={{ width: '18.7%' }}></div>
                </div>
                <p className="text-sky-100 font-bold text-[10px] uppercase tracking-widest">240 dari 1,280 Sampel</p>
              </div>
            </div>
          </div>
        </div>

        {/* Detail Indikator - Full Width Bottom Row */}
        <div className="bg-white rounded-[2.5rem] border border-slate-200 p-8 shadow-2xl shadow-slate-200/50">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-10">
            <div>
              <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Analisis Detail Indikator</h3>
              <p className="text-slate-400 text-sm font-medium">Breakdown skor per butir indikator strategis (15 Poin)</p>
            </div>
            {/* Custom Tabs */}
            <div className="flex bg-slate-50 p-1.5 rounded-2xl border border-slate-100">
              {['SEKOLAH', 'KELUARGA', 'MASYARAKAT'].map(l => (
                <button
                  key={l}
                  onClick={() => setActiveLingkup(l)}
                  className={`
                    px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all
                    ${activeLingkup === l 
                      ? 'bg-white text-sky-600 shadow-lg shadow-slate-200 scale-105 z-10' 
                      : 'text-slate-400 hover:text-slate-600'}
                  `}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>
          <IndicatorRadar lingkup={activeLingkup} />
        </div>
      </div>
    </div>
  );
}
