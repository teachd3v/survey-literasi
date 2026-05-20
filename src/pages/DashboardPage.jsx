import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import StatCard from '../components/dashboard/StatCard';
import LingkupComparison from '../components/dashboard/LingkupComparison';
import IndicatorRadar from '../components/dashboard/IndicatorRadar';
import CategoricalInsight from '../components/dashboard/CategoricalInsight';
import ComparisonChart from '../components/dashboard/ComparisonChart';
import QualitativeAdvice from '../components/dashboard/QualitativeAdvice';
import { fetchNeonStats } from '../services/neon';

const MONTHS = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

function periodToDateRange(month, year) {
  const m = parseInt(month);
  const y = parseInt(year);
  if (!month || !year || isNaN(m) || isNaN(y) || String(year).length !== 4) {
    return { dateFrom: undefined, dateTo: undefined };
  }
  const from = new Date(y, m - 1, 1);
  const to = new Date(y, m, 1);
  return { dateFrom: from.toISOString(), dateTo: to.toISOString() };
}

function periodLabel(month, year) {
  if (!month || !year || String(year).length !== 4) return 'Semua Data';
  return `${MONTHS[parseInt(month) - 1]} ${year}`;
}

export default function DashboardPage() {
  const [surveyType, setSurveyType] = useState('literasi');
  const [stats, setStats] = useState(null);
  const [compareStats, setCompareStats] = useState(null);
  const [activeLingkup, setActiveLingkup] = useState('SEKOLAH');
  const [loading, setLoading] = useState(true);
  const [radarClusters, setRadarClusters] = useState([]);
  const [categoricalData, setCategoricalData] = useState([]);

  const [period, setPeriod] = useState({ month: '', year: '' });
  const [comparePeriod, setComparePeriod] = useState({ month: '', year: '', active: false });

  const loadData = async (type, per, cmpPer) => {
    setLoading(true);
    try {
      const { dateFrom, dateTo } = periodToDateRange(per.month, per.year);
      const promises = [fetchNeonStats(type, { dateFrom, dateTo })];

      if (cmpPer.active) {
        const { dateFrom: cFrom, dateTo: cTo } = periodToDateRange(cmpPer.month, cmpPer.year);
        promises.push(cFrom ? fetchNeonStats(type, { dateFrom: cFrom, dateTo: cTo }) : Promise.resolve(null));
      }

      const [statsData, compareData] = await Promise.all(promises);
      setStats(statsData);
      setCompareStats(compareData ?? null);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(surveyType, period, comparePeriod);
  }, [surveyType, period.month, period.year, comparePeriod.month, comparePeriod.year, comparePeriod.active]);

  const handleTypeChange = (type) => {
    setSurveyType(type);
    setActiveLingkup(type === 'minatbaca' ? 'SD KELAS 1-3' : 'SEKOLAH');
    setRadarClusters([]);
    setCategoricalData([]);
  };

  const isPeriodActive = period.month && period.year && String(period.year).length === 4;
  const isCompareActive = comparePeriod.active && comparePeriod.month && comparePeriod.year && String(comparePeriod.year).length === 4;
  const { dateFrom: activeDateFrom, dateTo: activeDateTo } = periodToDateRange(period.month, period.year);

  const dominantCategory = (catDist) => {
    const e = Object.entries(catDist || {});
    return e.length ? e.sort((a, b) => b[1] - a[1])[0][0] : '-';
  };

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
          to="/"
          className="flex items-center gap-3 bg-slate-900 text-white px-6 py-4 rounded-2xl font-black uppercase tracking-widest text-xs shadow-2xl hover:scale-105 active:scale-95 transition-all"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Kembali ke Beranda
        </Link>
      </div>

      <div className="max-w-7xl mx-auto px-6 pt-12">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div>
            <div className="flex flex-wrap items-center gap-3 mb-6">
              <button
                onClick={() => handleTypeChange('literasi')}
                className={`px-4 py-2 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] transition-all border-2 ${
                  surveyType === 'literasi' ? 'bg-sky-600 border-sky-600 text-white shadow-lg' : 'bg-white border-slate-200 text-slate-400 hover:border-sky-200'
                }`}
              >
                Ekosistem Literasi
              </button>
              <button
                onClick={() => handleTypeChange('minatbaca')}
                className={`px-4 py-2 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] transition-all border-2 ${
                  surveyType === 'minatbaca' ? 'bg-emerald-600 border-emerald-600 text-white shadow-lg' : 'bg-white border-slate-200 text-slate-400 hover:border-emerald-200'
                }`}
              >
                Minat Baca
              </button>
            </div>

            <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-100 rounded-lg mb-4">
              <div className={`w-2 h-2 rounded-full animate-pulse ${surveyType === 'minatbaca' ? 'bg-emerald-600' : 'bg-sky-600'}`}></div>
              <span className="text-slate-600 font-black text-[10px] uppercase tracking-widest">Pemantauan Data Terkini</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-slate-900 mb-2">
              Dasbor {surveyType === 'minatbaca' ? 'Indeks Aktivitas Membaca' : 'Indeks Ekosistem Literasi'}
            </h1>
            <p className="text-slate-500 font-medium text-lg">
              Visualisasi Pemetaan {surveyType === 'minatbaca' ? 'Aktivitas Membaca Masyarakat' : 'Ekosistem Literasi Indonesia'} 2026.
            </p>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-slate-400 font-black text-[10px] uppercase tracking-widest mb-1">Terakhir Update</span>
            <span className="text-slate-900 font-bold">{new Date().toLocaleString('id-ID')}</span>
          </div>
        </div>

        {/* Period Filter Section */}
        <div className="bg-white rounded-[2.5rem] border border-slate-200 p-6 shadow-lg shadow-slate-200/50 mb-8">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center flex-wrap">
            {/* Label */}
            <div className="shrink-0">
              <span className="font-black text-[10px] uppercase tracking-widest text-slate-400 block mb-0.5">Filter Periode</span>
              <span className="font-bold text-slate-600 text-sm">
                {isPeriodActive ? periodLabel(period.month, period.year) : 'Semua Data'}
              </span>
            </div>

            <div className="hidden lg:block h-10 w-px bg-slate-100 shrink-0" />

            {/* Period A Picker */}
            <div className="flex items-center gap-2 flex-wrap">
              <select
                value={period.month}
                onChange={e => { setPeriod(p => ({ ...p, month: e.target.value })); setRadarClusters([]); }}
                className="px-4 py-2.5 rounded-xl border border-slate-200 font-bold text-sm text-slate-700 bg-slate-50 focus:outline-none focus:border-sky-300 focus:ring-2 focus:ring-sky-100 transition-all cursor-pointer"
              >
                <option value="">Semua Bulan</option>
                {MONTHS.map((m, i) => (
                  <option key={i + 1} value={i + 1}>{m}</option>
                ))}
              </select>

              <input
                type="number"
                placeholder="Tahun"
                value={period.year}
                onChange={e => { setPeriod(p => ({ ...p, year: e.target.value })); setRadarClusters([]); }}
                min="2020"
                max="2030"
                className="w-28 px-4 py-2.5 rounded-xl border border-slate-200 font-bold text-sm text-slate-700 bg-slate-50 focus:outline-none focus:border-sky-300 focus:ring-2 focus:ring-sky-100 transition-all"
              />

              {(period.month || period.year) && (
                <button
                  onClick={() => { setPeriod({ month: '', year: '' }); setRadarClusters([]); }}
                  className="px-3 py-2.5 rounded-xl border border-slate-200 text-slate-400 text-xs font-black hover:bg-slate-50 hover:text-slate-600 transition-all"
                >
                  ✕ Hapus
                </button>
              )}
            </div>

            <div className="hidden lg:block h-10 w-px bg-slate-100 shrink-0" />

            {/* Compare Toggle */}
            <button
              onClick={() => setComparePeriod(p => ({ ...p, active: !p.active }))}
              className={`px-5 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all border-2 shrink-0 ${
                comparePeriod.active
                  ? 'bg-violet-600 border-violet-600 text-white shadow-lg'
                  : 'bg-white border-slate-200 text-slate-400 hover:border-violet-300 hover:text-violet-500'
              }`}
            >
              {comparePeriod.active ? '✓ Bandingkan Periode' : '＋ Bandingkan Periode'}
            </button>

            {/* Period B Picker */}
            {comparePeriod.active && (
              <>
                <div className="flex items-center gap-2 text-slate-400 font-black text-xs uppercase tracking-widest">
                  <div className="h-px w-4 bg-slate-300" />
                  <span>VS</span>
                  <div className="h-px w-4 bg-slate-300" />
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <select
                    value={comparePeriod.month}
                    onChange={e => setComparePeriod(p => ({ ...p, month: e.target.value }))}
                    className="px-4 py-2.5 rounded-xl border-2 border-violet-200 font-bold text-sm text-slate-700 bg-violet-50 focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition-all cursor-pointer"
                  >
                    <option value="">Semua Bulan</option>
                    {MONTHS.map((m, i) => (
                      <option key={i + 1} value={i + 1}>{m}</option>
                    ))}
                  </select>

                  <input
                    type="number"
                    placeholder="Tahun"
                    value={comparePeriod.year}
                    onChange={e => setComparePeriod(p => ({ ...p, year: e.target.value }))}
                    min="2020"
                    max="2030"
                    className="w-28 px-4 py-2.5 rounded-xl border-2 border-violet-200 font-bold text-sm text-slate-700 bg-violet-50 focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition-all"
                  />

                  {(comparePeriod.month || comparePeriod.year) && (
                    <button
                      onClick={() => setComparePeriod(p => ({ ...p, month: '', year: '' }))}
                      className="px-3 py-2.5 rounded-xl border-2 border-violet-200 text-violet-400 text-xs font-black hover:bg-violet-50 transition-all"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Active filter badges */}
          {(isPeriodActive || isCompareActive) && (
            <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-100 flex-wrap">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Menampilkan:</span>
              {isPeriodActive && (
                <span className="px-3 py-1 rounded-full bg-sky-100 text-sky-700 font-black text-xs">
                  {periodLabel(period.month, period.year)}
                </span>
              )}
              {isCompareActive && (
                <>
                  <span className="text-slate-400 font-black text-xs">vs</span>
                  <span className="px-3 py-1 rounded-full bg-violet-100 text-violet-700 font-black text-xs">
                    {periodLabel(comparePeriod.month, comparePeriod.year)}
                  </span>
                </>
              )}
            </div>
          )}
        </div>

        {/* Big Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <StatCard
            title="Total Responden"
            value={stats?.totalResponses || 0}
            icon="users"
            subtitle="Sampel data masuk"
            compareValue={isCompareActive ? (compareStats?.totalResponses ?? null) : null}
            compareLabel={isCompareActive ? periodLabel(comparePeriod.month, comparePeriod.year) : null}
          />
          <StatCard
            title="Indeks Nasional"
            value={stats?.avgScore?.toFixed(2) || '0.00'}
            icon="chart"
            subtitle={surveyType === 'minatbaca' ? 'Skala 5.00' : 'Skala 4.00'}
            color="sky"
            compareValue={isCompareActive ? (compareStats?.avgScore != null ? parseFloat(compareStats.avgScore.toFixed(2)) : null) : null}
            compareLabel={isCompareActive ? periodLabel(comparePeriod.month, comparePeriod.year) : null}
            numericValue={stats?.avgScore || 0}
          />
          <StatCard
            title="Kategori Dominan"
            value={dominantCategory(stats?.categoryDistribution)}
            icon="award"
            subtitle="Berdasarkan sebaran"
            color="emerald"
            compareValue={isCompareActive && compareStats ? dominantCategory(compareStats.categoryDistribution) : null}
            compareLabel={isCompareActive ? periodLabel(comparePeriod.month, comparePeriod.year) : null}
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
                {isCompareActive && (
                  <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest">
                    <span className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded-full bg-sky-500 inline-block"></span>
                      <span className="text-slate-500">{periodLabel(period.month, period.year)}</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded-full bg-violet-400 inline-block"></span>
                      <span className="text-slate-500">{periodLabel(comparePeriod.month, comparePeriod.year)}</span>
                    </span>
                  </div>
                )}
              </div>
              <LingkupComparison
                data={stats?.lingkupStats || []}
                compareData={isCompareActive ? (compareStats?.lingkupStats || []) : null}
                compareLabel={isCompareActive ? periodLabel(comparePeriod.month, comparePeriod.year) : null}
              />
            </div>
          </div>

          {/* Sidebar Section - Top Row Right */}
          <div className="flex flex-col gap-6 h-full">
            <div className="bg-slate-900 text-white rounded-[2.5rem] p-8 shadow-2xl flex-1 overflow-hidden">
              <h4 className="text-xl font-black mb-6 uppercase tracking-widest text-[#7dcbe1]">Interpretasi</h4>
              <div className="space-y-4">
                {stats?.categoryDistribution && Object.entries(stats.categoryDistribution).length > 0
                  ? Object.entries(stats.categoryDistribution).map(([cat, count]) => (
                    <div key={cat} className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${
                          cat === 'Membudaya' || cat === 'Sangat Tinggi' ? 'bg-emerald-400' :
                          cat === 'Berkembang' || cat === 'Tinggi' ? 'bg-sky-400' :
                          cat === 'Mulai Berkembang' || cat === 'Sedang' ? 'bg-blue-400' :
                          cat === 'Mulai Tumbuh' || cat === 'Rendah' ? 'bg-amber-400' : 'bg-red-400'
                        }`}></div>
                        <span className="text-slate-200 font-bold text-sm">{cat}</span>
                      </div>
                      <span className="font-black text-lg">{count}</span>
                    </div>
                  ))
                  : <p className="text-slate-500 font-bold text-sm">Belum ada data</p>
                }
              </div>
            </div>

            <div className="bg-sky-600 text-white rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden">
              <div className="relative z-10">
                <h4 className="text-xl font-black mb-1 uppercase tracking-widest">Target</h4>
                {(() => {
                  const target = 500;
                  const actual = stats?.totalResponses || 0;
                  const pct = (actual / target) * 100;
                  const barWidth = Math.min(pct, 100);
                  return (
                    <>
                      <div className="text-5xl font-black mb-2">{pct.toFixed(1)}%</div>
                      <div className="w-full bg-sky-800/50 rounded-full h-3 mb-2 overflow-hidden">
                         <div className="bg-white h-full rounded-full transition-all duration-1000" style={{ width: `${barWidth}%` }}></div>
                      </div>
                      <p className="text-sky-100 font-bold text-[10px] uppercase tracking-widest">{actual.toLocaleString()} dari {target.toLocaleString()} Sampel</p>
                    </>
                  );
                })()}
              </div>
            </div>
          </div>
        </div>

        {/* Perbandingan Identitas - Full Width */}
        <div className="bg-white rounded-[2.5rem] border border-slate-200 p-8 shadow-2xl shadow-slate-200/50 mb-8">
          <div className="mb-8">
            <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Perbandingan Lokasi</h3>
            <p className="text-slate-400 text-sm font-medium">Bandingkan capaian antar kabupaten, sekolah, TBM, dan RT/RW</p>
          </div>
          <ComparisonChart surveyType={surveyType} dateFrom={activeDateFrom} dateTo={activeDateTo} />
        </div>

        {/* Detail Indikator - Full Width Bottom Row */}
        <div className="bg-white rounded-[2.5rem] border border-slate-200 p-8 shadow-2xl shadow-slate-200/50">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-10">
            <div>
              <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Analisis Detail Indikator</h3>
              <p className="text-slate-400 text-sm font-medium">Rincian skor per butir indikator strategis</p>
            </div>
            {/* Custom Tabs */}
            <div className="flex flex-wrap gap-2 bg-slate-50 p-1.5 rounded-2xl border border-slate-100">
              {(surveyType === 'minatbaca'
                ? ['SD KELAS 1-3', 'SD KELAS 4-6', 'SMP-SMA', 'DEWASA']
                : ['SEKOLAH', 'KELUARGA', 'MASYARAKAT']
              ).map(l => (
                <button
                  key={l}
                  onClick={() => { setActiveLingkup(l); setRadarClusters([]); }}
                  className={`
                    px-5 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all
                    ${activeLingkup === l
                      ? `bg-white ${surveyType === 'minatbaca' ? 'text-emerald-600' : 'text-sky-600'} shadow-lg shadow-slate-200 scale-105 z-10`
                      : 'text-slate-400 hover:text-slate-600'}
                  `}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>
          <IndicatorRadar
            lingkup={activeLingkup}
            surveyType={surveyType}
            dateFrom={activeDateFrom}
            dateTo={activeDateTo}
            onDataLoaded={setRadarClusters}
          />

          {/* New Categorical Insights Section */}
          <div className="mt-12 pt-12 border-t border-slate-100">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-2xl bg-amber-100 flex items-center justify-center">
                <span className="text-xl">💡</span>
              </div>
              <div>
                <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Wawasan Preferensi & Hambatan</h3>
                <p className="text-slate-400 text-sm font-medium">Analisis kualitatif berdasarkan pilihan responden di lingkup {activeLingkup}</p>
              </div>
            </div>
            <CategoricalInsight 
              lingkup={activeLingkup} 
              surveyType={surveyType}
              dateFrom={activeDateFrom}
              dateTo={activeDateTo}
              onDataLoaded={setCategoricalData}
            />
          </div>

          <QualitativeAdvice 
            surveyType={surveyType} 
            lingkup={activeLingkup} 
            clusters={radarClusters} 
            categoricalData={categoricalData}
          />
        </div>
      </div>
    </div>
  );
}
