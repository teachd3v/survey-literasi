import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, ChevronRight, LayoutDashboard, Database, Info, Filter, ArrowLeft, MapPin, School, Home, RefreshCw, Search, Users } from 'lucide-react';
import StatCard from '../components/dashboard/StatCard';
import LingkupComparison from '../components/dashboard/LingkupComparison';
import IndicatorRadar from '../components/dashboard/IndicatorRadar';
import CategoricalInsight from '../components/dashboard/CategoricalInsight';
import ComparisonChart from '../components/dashboard/ComparisonChart';
import QualitativeAdvice from '../components/dashboard/QualitativeAdvice';
import { fetchNeonStats, fetchNeonComparison, fetchNeonRespondents, deleteRespondent, fetchSurveySettings, updateSurveySetting } from '../services/neon';
import { fetchIdentityValidation } from '../services/googleSheets';

export default function DashboardPage() {
  const [surveyType, setSurveyType] = useState('literasi');
  const [stats, setStats] = useState(null);
  const [activeLingkup, setActiveLingkup] = useState('SEKOLAH');
  const [loading, setLoading] = useState(true);
  const [radarClusters, setRadarClusters] = useState([]);
  const [categoricalData, setCategoricalData] = useState([]);
  const [locationBreakdown, setLocationBreakdown] = useState([]);
  const [respondentsList, setRespondentsList] = useState([]);
  const [expandedRows, setExpandedRows] = useState(new Set());
  const [error, setError] = useState(null);
  const [surveySettings, setSurveySettings] = useState({
    survey_literasi_open: 'true',
    survey_minatbaca_open: 'true'
  });

  const [tbmVisitFilter, setTbmVisitFilter] = useState('Semua');

  // Filters
  const [filterLingkup, setFilterLingkup] = useState('all');
  const [filterKabupaten, setFilterKabupaten] = useState('');
  const [filterDesa, setFilterDesa] = useState('');
  const [filterSekolah, setFilterSekolah] = useState('');
  const [filterTbm, setFilterTbm] = useState('');
  const [validationData, setValidationData] = useState({});
  const [selectedRespondents, setSelectedRespondents] = useState(new Set());

  useEffect(() => {
    fetchIdentityValidation().then(setValidationData).catch(console.error);
    fetchSurveySettings().then(setSurveySettings).catch(console.error);
  }, []);

  const loadData = async (type, tbmVisit, fLingkup, fKab, fDesa, fSek, fTbm) => {
    setLoading(true);
    setError(null);
    try {
      const params = { 
        tbmVisit: tbmVisit?.trim() || '', 
        lingkup: fLingkup?.trim() || 'all', 
        kabupaten: fKab?.trim() || '', 
        desa: fDesa?.trim() || '', 
        sekolah: fSek?.trim() || '',
        tbm: fTbm?.trim() || ''
      };
      
      const promises = [fetchNeonStats(type, params)];

      if (fLingkup !== 'all') {
        let group = 'kabupaten';
        if (fKab) {
          if (type === 'minatbaca') group = fLingkup === 'DEWASA' ? 'tbm_desa' : 'tbm_sekolah';
          else group = fLingkup === 'sekolah' ? 'sekolah' : 'desa_sekolah';
        }
        promises.push(fetchNeonComparison(type, group, params));

        if (fKab) {
          promises.push(fetchNeonRespondents(type, params));
        } else {
          promises.push(Promise.resolve([]));
        }
      } else {
        promises.push(Promise.resolve([]));
        promises.push(Promise.resolve([]));
      }

      promises.push(fetchSurveySettings());

      const results = await Promise.all(promises);
      setStats(results[0]);
      setLocationBreakdown(Array.isArray(results[1]) ? results[1] : []);
      setRespondentsList(Array.isArray(results[2]) ? results[2] : []);
      if (results[3]) setSurveySettings(results[3]);
      setSelectedRespondents(new Set());
    } catch (err) {
      console.error('LoadData Error:', err);
      setError(err.response?.data?.error || err.message);
      setLocationBreakdown([]);
      setStats(null);
      setRespondentsList([]);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleSurvey = async (key, isOpen) => {
    try {
      const valStr = isOpen ? 'true' : 'false';
      setSurveySettings(prev => ({ ...prev, [key]: valStr }));
      await updateSurveySetting(key, valStr);
    } catch (err) {
      console.error(err);
      alert('Gagal memperbarui status survey: ' + err.message);
      fetchSurveySettings().then(setSurveySettings).catch(console.error);
    }
  };



  useEffect(() => {
    loadData(surveyType, tbmVisitFilter, filterLingkup, filterKabupaten, filterDesa, filterSekolah, filterTbm);
  }, [surveyType, tbmVisitFilter, filterLingkup, filterKabupaten, filterDesa, filterSekolah, filterTbm]);

  // Unified Sync for Detail Tabs
  useEffect(() => {
    if (surveyType === 'literasi') {
      if (filterLingkup !== 'all') {
        setActiveLingkup(filterLingkup.toUpperCase());
      } else if (!['SEKOLAH', 'KELUARGA', 'MASYARAKAT'].includes(activeLingkup)) {
        setActiveLingkup('SEKOLAH');
      }
    } else {
      const mbScopes = ['SD KELAS 1-3', 'SD KELAS 4-6', 'SMP-SMA', 'DEWASA'];
      if (filterLingkup !== 'all') {
        setActiveLingkup(filterLingkup);
      } else if (!mbScopes.includes(activeLingkup)) {
        setActiveLingkup('SD KELAS 1-3');
      }
    }
  }, [filterLingkup, surveyType]);

  const handleTypeChange = (type) => {
    setSurveyType(type);
    const defaultLingkup = type === 'minatbaca' ? 'SD KELAS 1-3' : 'SEKOLAH';
    setActiveLingkup(defaultLingkup);
    setTbmVisitFilter('Semua');
    setFilterLingkup('all');
    setFilterKabupaten('');
    setFilterDesa('');
    setFilterSekolah('');
    setFilterTbm('');
    setRadarClusters([]);
    setCategoricalData([]);
    setExpandedRows(new Set());
    setSelectedRespondents(new Set());
  };

  const kabupatenList = Object.keys(validationData).sort();
  const tbmList = useMemo(() => {
    if (!filterKabupaten) return [];
    const kData = validationData[filterKabupaten] || {};
    const tbms = new Set();
    Object.values(kData).forEach(d => { if (d.tbm) tbms.add(d.tbm); });
    return Array.from(tbms).sort();
  }, [validationData, filterKabupaten]);

  const desaList = filterKabupaten ? Object.keys(validationData[filterKabupaten] || {}).sort() : [];
  const sekolahList = (() => {
    if (!filterKabupaten) return [];
    const kData = validationData[filterKabupaten] || {};
    if (filterDesa && kData[filterDesa]) return kData[filterDesa].sekolah;
    return Array.from(new Set(Object.values(kData).flatMap(d => d.sekolah))).sort();
  })();

  const dominantCategory = (catDist) => {
    const e = Object.entries(catDist || {});
    return e.length ? e.sort((a, b) => b[1] - a[1])[0][0] : '-';
  };

  const getTarget = (lingkup, kabupaten, type) => {
    if (type === 'minatbaca') {
      if (lingkup === 'all' && !kabupaten) return 1000;
      if (lingkup !== 'all' && !kabupaten) return 250;
      if (lingkup === 'all' && kabupaten) return 200;
      return 50;
    }
    if (lingkup === 'all' && !kabupaten) return 750;
    if (lingkup !== 'all' && !kabupaten) return 250;
    if (lingkup === 'all' && kabupaten) return 150;
    return 50; 
  };

  const toggleRow = (id) => {
    setExpandedRows(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleDeleteRespondent = async (id, nama) => {
    if (!window.confirm(`Apakah Anda yakin ingin menghapus responden "${nama}"?`)) {
      return;
    }
    try {
      setLoading(true);
      const res = await deleteRespondent(id);
      if (res.success) {
        alert('Responden berhasil dihapus');
        await loadData(surveyType, tbmVisitFilter, filterLingkup, filterKabupaten, filterDesa, filterSekolah, filterTbm);
      } else {
        alert(res.error || 'Gagal menghapus responden');
        setLoading(false);
      }
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || err.message || 'Terjadi kesalahan saat menghapus responden');
      setLoading(false);
    }
  };


  const groupedBreakdown = useMemo(() => {
    if (!locationBreakdown || locationBreakdown.length === 0) return [];
    
    // MINAT BACA: TBM > Detail
    if (surveyType === 'minatbaca' && filterKabupaten) {
       const groups = {};
       locationBreakdown.forEach(item => {
         const tName = item.tbm || 'Tanpa TBM';
         if (!groups[tName]) groups[tName] = { label: tName, children: [], totalCount: 0, sumScore: 0 };
         groups[tName].children.push(item);
         groups[tName].totalCount += item.count;
         groups[tName].sumScore += (item.avg_score * item.count);
       });
       return Object.values(groups).map(g => ({
         label: g.label,
         avg_score: g.totalCount > 0 ? (g.sumScore / g.totalCount) : 0,
         count: g.totalCount,
         children: g.children
       })).sort((a, b) => b.avg_score - a.avg_score);
    }

    // LITERASI: Desa > Detail
    if (surveyType === 'literasi' && (filterLingkup === 'masyarakat' || filterLingkup === 'keluarga') && filterKabupaten) {
      const groups = {};
      locationBreakdown.forEach(item => {
        const dName = item.desa || 'Tanpa Nama Desa';
        if (!groups[dName]) groups[dName] = { label: dName, children: [], totalCount: 0, sumScore: 0 };
        groups[dName].children.push(item);
        groups[dName].totalCount += item.count;
        groups[dName].sumScore += (item.avg_score * item.count);
      });
      return Object.values(groups).map(g => ({
        label: g.label,
        avg_score: g.totalCount > 0 ? (g.sumScore / g.totalCount) : 0,
        count: g.totalCount,
        children: g.children
      })).sort((a, b) => b.avg_score - a.avg_score);
    }
    
    return locationBreakdown.map(item => ({
      label: item.label || item.sekolah || item.desa || item.tbm || 'Unknown',
      avg_score: item.avg_score,
      count: item.count
    }));
  }, [locationBreakdown, filterLingkup, filterKabupaten, surveyType]);

  const visibleRespondents = useMemo(() => {
    const showDeleteAction = filterLingkup !== 'all' && filterKabupaten !== '';
    if (!showDeleteAction) return [];
    
    let visible = [];
    groupedBreakdown.forEach(row => {
      const rowRespondents = respondentsList.filter(resp => {
        if (surveyType === 'minatbaca') {
          return (resp.tbm || 'Tanpa TBM') === row.label;
        } else {
          if (filterLingkup === 'sekolah') {
            return (resp.sekolah || 'Tanpa Nama sekolah') === row.label;
          } else {
            return (resp.desa || 'Tanpa Nama Desa') === row.label;
          }
        }
      });
      visible = visible.concat(rowRespondents);
    });
    return visible;
  }, [groupedBreakdown, respondentsList, filterLingkup, filterKabupaten, surveyType]);

  const toggleRespondentSelection = (id) => {
    setSelectedRespondents(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAllRespondents = () => {
    if (selectedRespondents.size === visibleRespondents.length && visibleRespondents.length > 0) {
      setSelectedRespondents(new Set());
    } else {
      setSelectedRespondents(new Set(visibleRespondents.map(r => r.id)));
    }
  };

  const handleDeleteSelectedRespondents = async () => {
    if (selectedRespondents.size === 0) return;
    if (!window.confirm(`Apakah Anda yakin ingin menghapus ${selectedRespondents.size} responden terpilih?`)) {
      return;
    }
    try {
      setLoading(true);
      const idsToDelete = Array.from(selectedRespondents);
      let successCount = 0;
      let failCount = 0;
      
      for (const id of idsToDelete) {
        try {
          const res = await deleteRespondent(id);
          if (res.success) successCount++;
          else failCount++;
        } catch (e) {
          failCount++;
        }
      }
      
      alert(`Berhasil menghapus ${successCount} responden.` + (failCount > 0 ? ` Gagal: ${failCount}` : ''));
      setSelectedRespondents(new Set());
      await loadData(surveyType, tbmVisitFilter, filterLingkup, filterKabupaten, filterDesa, filterSekolah, filterTbm);
    } catch (err) {
      console.error(err);
      alert('Terjadi kesalahan saat menghapus responden secara massal');
      setLoading(false);
    }
  };

  const getCategoryBadge = (score) => {
    const pct = score * 25;
    if (pct >= 86) return { label: 'Membudaya', color: 'bg-emerald-500' };
    if (pct >= 71) return { label: 'Berkembang', color: 'bg-sky-500' };
    if (pct >= 56) return { label: 'Mulai Berkembang', color: 'bg-blue-500' };
    if (pct >= 40) return { label: 'Mulai Tumbuh', color: 'bg-amber-500' };
    return { label: 'Perlu Intervensi', color: 'bg-red-500' };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <RefreshCw className="w-12 h-12 text-sky-600 animate-spin" />
          <p className="text-slate-400 font-black uppercase tracking-widest text-[10px]">Menyinkronkan Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
      <div className="fixed bottom-8 right-8 z-50 flex flex-col gap-3">
        <button onClick={() => loadData(surveyType, tbmVisitFilter, filterLingkup, filterKabupaten, filterDesa, filterSekolah, filterTbm)} className="flex items-center justify-center w-12 h-12 bg-white text-slate-600 rounded-2xl shadow-xl hover:bg-slate-50 transition-all duration-500" title="Refresh Data"><RefreshCw className="w-5 h-5" /></button>
        <Link to="/" className="flex items-center gap-3 bg-slate-900 text-white px-6 py-4 rounded-2xl font-black uppercase tracking-widest text-xs shadow-2xl hover:scale-105 transition-all"><ArrowLeft className="w-4 h-4" strokeWidth={3} /> Beranda</Link>
      </div>

      <div className="max-w-7xl mx-auto px-6 pt-12">
        {stats?.totalResponses === 0 && !error && (
          <div className="mb-8 p-6 bg-amber-50 border-2 border-amber-200 rounded-[2rem] flex flex-col gap-4 shadow-xl">
             <div className="flex items-center justify-between text-amber-700 font-black uppercase tracking-widest text-xs">
                <div className="flex items-center gap-3"><Search className="w-5 h-5" /><span>Diagnostic: No Data Found</span></div>
                <div className="bg-amber-200 px-3 py-1 rounded-lg">Baseline: {stats?.debug?.baselineCount || 0}</div>
             </div>
             <p className="text-amber-600 text-xs font-medium">Sistem tidak menemukan data untuk filter terpilih. Baseline (Data Jenjang) menunjukkan {stats?.debug?.baselineCount} data tersedia.</p>
          </div>
        )}

        {error && <div className="mb-8 p-4 bg-red-50 border-2 border-red-200 rounded-2xl flex items-center gap-3 text-red-600 font-bold text-sm"><Info className="w-5 h-5" /><span>Terjadi Kesalahan: {error}</span></div>}

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div>
            <div className="flex flex-wrap items-center gap-3 mb-6">
              <button onClick={() => handleTypeChange('literasi')} className={`px-4 py-2 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] transition-all border-2 ${surveyType === 'literasi' ? 'bg-sky-600 border-sky-600 text-white shadow-lg' : 'bg-white border-slate-200 text-slate-400 hover:border-sky-200'}`}>Ekosistem Literasi</button>
              <button onClick={() => handleTypeChange('minatbaca')} className={`px-4 py-2 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] transition-all border-2 ${surveyType === 'minatbaca' ? 'bg-emerald-600 border-emerald-600 text-white shadow-lg' : 'bg-white border-slate-200 text-slate-400 hover:border-emerald-200'}`}>Minat Baca</button>
            </div>
            <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-slate-900 mb-2">Dasbor {surveyType === 'minatbaca' ? 'Minat Baca' : 'Indeks Literasi'}</h1>
            <p className="text-slate-500 font-medium text-lg">Visualisasi {surveyType === 'minatbaca' ? 'Aktivitas Membaca' : 'Ekosistem Literasi'} Indonesia 2026.</p>
          </div>

          <div className="bg-white border border-slate-200 p-5 rounded-[1.5rem] shadow-sm flex flex-col gap-3 min-w-[240px]">
            <span className="font-black text-[10px] uppercase tracking-widest text-slate-400 block border-b border-slate-100 pb-2">Status Form Survey</span>
            <div className="space-y-3">
              <label className="flex items-center justify-between cursor-pointer select-none">
                <span className="text-xs font-bold text-slate-700">Ekosistem Literasi</span>
                <div className="relative flex items-center">
                  <input 
                    type="checkbox" 
                    checked={surveySettings.survey_literasi_open === 'true'} 
                    onChange={(e) => handleToggleSurvey('survey_literasi_open', e.target.checked)}
                    className="sr-only peer" 
                  />
                  <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-sky-600"></div>
                </div>
              </label>

              <label className="flex items-center justify-between cursor-pointer select-none">
                <span className="text-xs font-bold text-slate-700">Minat Baca</span>
                <div className="relative flex items-center">
                  <input 
                    type="checkbox" 
                    checked={surveySettings.survey_minatbaca_open === 'true'} 
                    onChange={(e) => handleToggleSurvey('survey_minatbaca_open', e.target.checked)}
                    className="sr-only peer" 
                  />
                  <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                </div>
              </label>
            </div>
          </div>
        </div>


        <div className="bg-white rounded-[2.5rem] border border-slate-200 p-8 shadow-lg shadow-slate-200/50 mb-8 space-y-6">
          <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center flex-wrap">
            <div className="flex flex-col">
              <span className="font-black text-[10px] uppercase tracking-widest text-slate-400 block mb-1 ml-1">{surveyType === 'literasi' ? 'Ekosistem' : 'Lingkup Jenjang'}</span>
              <select value={filterLingkup} onChange={e => { setFilterLingkup(e.target.value); setFilterKabupaten(''); setFilterDesa(''); setFilterSekolah(''); setFilterTbm(''); }} className="px-4 py-2.5 rounded-xl border border-slate-200 font-bold text-sm text-slate-700 bg-slate-50 focus:outline-none focus:border-sky-300 transition-all cursor-pointer">
                <option value="all">Semua {surveyType === 'literasi' ? 'Ekosistem' : 'Jenjang'}</option>
                {surveyType === 'literasi' ? (
                  <><option value="masyarakat">Masyarakat</option><option value="keluarga">Keluarga</option><option value="sekolah">Sekolah</option></>
                ) : (
                  <><option value="SD KELAS 1-3">SD KELAS 1-3</option><option value="SD KELAS 4-6">SD KELAS 4-6</option><option value="SMP-SMA">SMP-SMA</option><option value="DEWASA">DEWASA</option></>
                )}
              </select>
            </div>

            {filterLingkup !== 'all' && (
              <>
                <div className="flex flex-col">
                  <span className="font-black text-[10px] uppercase tracking-widest text-slate-400 block mb-1 ml-1">Wilayah</span>
                  <select value={filterKabupaten} onChange={e => { setFilterKabupaten(e.target.value); setFilterDesa(''); setFilterSekolah(''); setFilterTbm(''); }} className="px-4 py-2.5 rounded-xl border border-slate-200 font-bold text-sm text-slate-700 bg-slate-50 focus:outline-none focus:border-sky-300 transition-all cursor-pointer">
                    <option value="">Semua Wilayah</option>
                    {kabupatenList.map(k => <option key={k} value={k}>{k}</option>)}
                  </select>
                </div>

                {surveyType === 'minatbaca' && filterKabupaten && (
                  <div className="flex flex-col">
                    <span className="font-black text-[10px] uppercase tracking-widest text-slate-400 block mb-1 ml-1">Nama TBM</span>
                    <select value={filterTbm} onChange={e => setFilterTbm(e.target.value)} className="px-4 py-2.5 rounded-xl border border-slate-200 font-bold text-sm text-slate-700 bg-slate-50 focus:outline-none focus:border-sky-300 transition-all cursor-pointer">
                      <option value="">Semua TBM</option>
                      {tbmList.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                )}

                {!(filterLingkup === 'DEWASA' || filterLingkup === 'masyarakat' || filterLingkup === 'keluarga') && (
                  <div className="flex flex-col">
                    <span className="font-black text-[10px] uppercase tracking-widest text-slate-400 block mb-1 ml-1">Sekolah</span>
                    <select value={filterSekolah} disabled={!filterKabupaten} onChange={e => setFilterSekolah(e.target.value)} className="px-4 py-2.5 rounded-xl border border-slate-200 font-bold text-sm text-slate-700 bg-slate-50 focus:outline-none focus:border-sky-300 transition-all cursor-pointer disabled:opacity-40"><option value="">Semua Sekolah</option>{sekolahList.map(s => <option key={s} value={s}>{s}</option>)}</select>
                  </div>
                )}

                {(filterLingkup === 'DEWASA' || filterLingkup === 'masyarakat' || filterLingkup === 'keluarga') && (
                  <div className="flex flex-col">
                    <span className="font-black text-[10px] uppercase tracking-widest text-slate-400 block mb-1 ml-1">Desa</span>
                    <select value={filterDesa} disabled={!filterKabupaten} onChange={e => setFilterDesa(e.target.value)} className="px-4 py-2.5 rounded-xl border border-slate-200 font-bold text-sm text-slate-700 bg-slate-50 focus:outline-none focus:border-sky-300 transition-all cursor-pointer disabled:opacity-40"><option value="">Semua Desa</option>{desaList.map(d => <option key={d} value={d}>{d}</option>)}</select>
                  </div>
                )}
              </>
            )}

            {surveyType === 'minatbaca' && (
              <div className="flex flex-col">
                <span className="font-black text-[10px] uppercase tracking-widest text-slate-400 block mb-1 ml-1">Kunjungan TBM</span>
                <select value={tbmVisitFilter} onChange={e => setTbmVisitFilter(e.target.value)} className="px-4 py-2.5 rounded-xl border border-emerald-200 font-bold text-sm text-emerald-700 bg-emerald-50 focus:outline-none focus:border-emerald-400 transition-all cursor-pointer"><option value="Semua">Semua Data TBM</option><option value="Tidak pernah">Tidak pernah</option><option value="Pernah">Pernah</option><option value="Sering">Sering</option></select>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <StatCard title="Total Responden" value={stats?.totalResponses || 0} icon="users" subtitle="Sampel data masuk" />
          <StatCard title="Indeks" value={stats?.avgScore?.toFixed(2) || '0.00'} icon="chart" subtitle={surveyType === 'minatbaca' ? 'Skala 5.00' : 'Skala 4.00'} color="sky" numericValue={stats?.avgScore || 0} />
          <StatCard title="Kategori Dominan" value={dominantCategory(stats?.categoryDistribution)} icon="award" subtitle="Berdasarkan sebaran" color="emerald" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {filterLingkup === 'all' && (
            <div className="lg:col-span-2">
              <div className="bg-white rounded-[2.5rem] border border-slate-200 p-8 shadow-2xl shadow-slate-200/50 h-full">
                <div className="mb-8"><h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Capaian per {surveyType === 'minatbaca' ? 'Jenjang' : 'Ekosistem'}</h3></div>
                <LingkupComparison data={stats?.lingkupStats || []} />
              </div>
            </div>
          )}

          {filterLingkup !== 'all' && (
             <div className="lg:col-span-2">
               <div className="bg-white rounded-[2.5rem] border border-slate-200 p-8 shadow-2xl shadow-slate-200/50 h-full">
                  <div className="mb-8">
                    <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Capaian Responden {filterLingkup.toUpperCase()}</h3>
                    <p className="text-slate-400 text-sm font-medium">Distribusi partisipasi dan skor rata-rata</p>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-slate-100">
                          <th className="pb-4 font-black text-[10px] uppercase tracking-widest text-slate-400 text-left">Lokasi / Distribusi</th>
                          <th className="pb-4 font-black text-[10px] uppercase tracking-widest text-slate-400 text-center">Responden</th>
                          <th className="pb-4 font-black text-[10px] uppercase tracking-widest text-slate-400 text-center">Skor Avg</th>
                          <th className="pb-4 font-black text-[10px] uppercase tracking-widest text-slate-400 text-right">Kategori</th>
                          {filterLingkup !== 'all' && filterKabupaten !== '' && (
                            <th className="pb-4 font-black text-[10px] uppercase tracking-widest text-slate-400 text-right pr-4">
                              <div className="flex items-center justify-end gap-3">
                                {selectedRespondents.size > 0 ? (
                                  <button 
                                    onClick={handleDeleteSelectedRespondents}
                                    className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-[10px] font-bold uppercase transition-colors shadow-sm"
                                  >
                                    Hapus ({selectedRespondents.size})
                                  </button>
                                ) : (
                                  <span>AKSI</span>
                                )}
                                <input 
                                  type="checkbox" 
                                  onChange={toggleAllRespondents}
                                  checked={visibleRespondents.length > 0 && selectedRespondents.size === visibleRespondents.length}
                                  className="w-4 h-4 rounded border-slate-300 text-sky-500 focus:ring-sky-500 cursor-pointer"
                                  title="Pilih Semua"
                                />
                              </div>
                            </th>
                          )}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {groupedBreakdown?.length > 0 ? (
                          groupedBreakdown.map((row, i) => {
                            const badge = getCategoryBadge(row.avg_score);
                            const isExpanded = expandedRows.has(row.label);
                            const showDeleteAction = filterLingkup !== 'all' && filterKabupaten !== '';
                            const hasChildren = showDeleteAction ? true : (row.children && row.children.length > 0);

                            const rowRespondents = showDeleteAction
                              ? respondentsList.filter(resp => {
                                  if (surveyType === 'minatbaca') {
                                    const respTbm = resp.tbm || 'Tanpa TBM';
                                    return respTbm === row.label;
                                  } else {
                                    if (filterLingkup === 'sekolah') {
                                      const respSekolah = resp.sekolah || 'Tanpa Nama sekolah';
                                      return respSekolah === row.label;
                                    } else {
                                      const respDesa = resp.desa || 'Tanpa Nama Desa';
                                      return respDesa === row.label;
                                    }
                                  }
                                })
                              : [];

                            return (
                              <React.Fragment key={i}>
                                <tr className={`group transition-colors cursor-pointer ${hasChildren ? 'hover:bg-slate-50' : ''}`} onClick={() => hasChildren && toggleRow(row.label)}>
                                  <td className="py-4">
                                    <div className="flex items-center gap-3">
                                      {hasChildren ? (isExpanded ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />) : <div className="w-8 h-8 rounded-lg bg-sky-100 flex items-center justify-center text-sky-600">{filterLingkup === 'sekolah' || (surveyType === 'minatbaca' && filterLingkup !== 'DEWASA') ? <School className="w-4 h-4" /> : <MapPin className="w-4 h-4" />}</div>}
                                      <span className="font-bold text-slate-700">{row.label}</span>
                                    </div>
                                  </td>
                                  <td className="py-4 text-center"><span className="font-black text-slate-900">{row.count}</span></td>
                                  <td className="py-4 text-center"><span className="font-black text-sky-600">{row.avg_score.toFixed(2)}</span></td>
                                  <td className="py-4 text-right"><span className={`inline-block px-3 py-1 rounded-full text-[10px] font-black text-white uppercase ${badge.color}`}>{badge.label}</span></td>
                                  {showDeleteAction && <td className="py-4 text-right">-</td>}
                                </tr>
                                {isExpanded && !showDeleteAction && row.children && row.children.map((child, idx) => {
                                  const childBadge = getCategoryBadge(child.avg_score);
                                  let childLabel = '';
                                  if (filterLingkup === 'keluarga' || (surveyType === 'minatbaca' && filterLingkup === 'DEWASA')) {
                                    if (child.rt || child.rw) childLabel = `RT ${child.rt || '-'} / RW ${child.rw || '-'}`;
                                    else childLabel = child.desa || 'Responden Umum';
                                  } else {
                                    childLabel = child.sekolah || 'Responden Umum';
                                  }
                                  return (
                                    <tr key={`${i}-${idx}`} className="bg-slate-50/50 border-l-4 border-sky-500">
                                      <td className="py-3 pl-12"><div className="flex items-center gap-2">{filterLingkup === 'keluarga' || filterLingkup === 'DEWASA' ? <Home className="w-3 h-3 text-slate-400" /> : <School className="w-3 h-3 text-slate-400" />}<span className="text-sm font-medium text-slate-600">{childLabel}</span></div></td>
                                      <td className="py-3 text-center text-sm font-bold text-slate-500">{child.count}</td>
                                      <td className="py-3 text-center text-sm font-black text-sky-500">{child.avg_score.toFixed(2)}</td>
                                      <td className="py-3 text-right"><span className={`inline-block px-2 py-0.5 rounded-full text-[8px] font-black text-white uppercase ${childBadge.color}`}>{childBadge.label}</span></td>
                                    </tr>
                                  );
                                })}
                                {isExpanded && showDeleteAction && rowRespondents.map((resp, idx) => {
                                  const score = parseFloat(resp.weightedAvg || 0);
                                  const respBadge = getCategoryBadge(score);
                                  const details = [];
                                  if (resp.desa) details.push(resp.desa);
                                  if (resp.sekolah) details.push(resp.sekolah);
                                  if (resp.rt || resp.rw) details.push(`RT ${resp.rt || '-'}/RW ${resp.rw || '-'}`);
                                  const detailsStr = details.length > 0 ? ` (${details.join(', ')})` : '';

                                  return (
                                    <tr key={resp.id} className="bg-slate-50/50 border-l-4 border-rose-500">
                                      <td className="py-3 pl-12">
                                        <div className="flex items-center gap-2">
                                          <Users className="w-3 h-3 text-slate-400" />
                                          <span className="text-sm font-medium text-slate-600">{resp.nama || 'Responden Tanpa Nama'}<span className="text-[10px] text-slate-400">{detailsStr}</span></span>
                                        </div>
                                      </td>
                                      <td className="py-3 text-center text-sm font-bold text-slate-500">-</td>
                                      <td className="py-3 text-center text-sm font-black text-sky-500">{score.toFixed(2)}</td>
                                      <td className="py-3 text-right"><span className={`inline-block px-2 py-0.5 rounded-full text-[8px] font-black text-white uppercase ${respBadge.color}`}>{respBadge.label}</span></td>
                                      <td className="py-3 text-right pr-4">
                                        <div className="flex items-center justify-end gap-3">
                                          <button 
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleDeleteRespondent(resp.id, resp.nama);
                                            }} 
                                            className="px-2.5 py-1 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-[10px] font-black uppercase tracking-wider transition-colors"
                                          >
                                            Hapus
                                          </button>
                                          <input
                                            type="checkbox"
                                            checked={selectedRespondents.has(resp.id)}
                                            onChange={(e) => {
                                              e.stopPropagation();
                                              toggleRespondentSelection(resp.id);
                                            }}
                                            onClick={(e) => e.stopPropagation()}
                                            className="w-4 h-4 rounded border-slate-300 text-sky-500 focus:ring-sky-500 cursor-pointer"
                                          />
                                        </div>
                                      </td>
                                    </tr>
                                  );
                                })}
                              </React.Fragment>
                            );
                          })
                        ) : (<tr><td colSpan={filterLingkup !== 'all' && filterKabupaten !== '' ? 5 : 4} className="py-8 text-center text-slate-400 font-bold">Data tidak ditemukan</td></tr>)}
                      </tbody>
                    </table>
                  </div>
               </div>
             </div>
          )}

          <div className="flex flex-col gap-6 h-full">
            <div className="bg-slate-900 text-white rounded-[2.5rem] p-8 shadow-2xl flex-1 overflow-hidden">
              <h4 className="text-xl font-black mb-6 uppercase tracking-widest text-[#7dcbe1]">Kategorisasi Interpretasi</h4>
              <div className="space-y-4">
                {stats?.categoryDistribution && Object.entries(stats.categoryDistribution).length > 0
                  ? Object.entries(stats.categoryDistribution).map(([cat, count]) => (
                    <div key={cat} className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${cat === 'Membudaya' || cat === 'Sangat Tinggi' ? 'bg-emerald-400' : cat === 'Berkembang' || cat === 'Tinggi' ? 'bg-sky-400' : cat === 'Mulai Berkembang' || cat === 'Sedang' ? 'bg-blue-400' : cat === 'Mulai Tumbuh' || cat === 'Rendah' ? 'bg-amber-400' : 'bg-red-400'}`}></div>
                        <span className="text-slate-200 font-bold text-sm">{cat}</span>
                      </div>
                      <span className="font-black text-lg">{count}</span>
                    </div>
                  )) : <p className="text-slate-500 font-bold text-sm">Belum ada data</p>
                }
              </div>
            </div>

            <div className="bg-sky-600 text-white rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden">
              <div className="relative z-10">
                <h4 className="text-xl font-black mb-1 uppercase tracking-widest">Target</h4>
                {(() => {
                  const target = getTarget(filterLingkup, filterKabupaten, surveyType);
                  const actual = stats?.totalResponses || 0;
                  const pct = target > 0 ? (actual / target) * 100 : 0;
                  return (
                    <><div className="text-5xl font-black mb-2">{pct.toFixed(1)}%</div><div className="w-full bg-sky-800/50 rounded-full h-3 mb-2 overflow-hidden"><div className="bg-white h-full rounded-full transition-all duration-1000" style={{ width: `${Math.min(pct, 100)}%` }}></div></div><p className="text-sky-100 font-bold text-[10px] uppercase tracking-widest">{actual.toLocaleString()} dari {target.toLocaleString()} Sampel</p></>
                  );
                })()}
              </div>
            </div>
          </div>
        </div>

        {filterLingkup === 'all' && (
          <div className="bg-white rounded-[2.5rem] border border-slate-200 p-8 shadow-2xl shadow-slate-200/50 mb-8">
            <div className="mb-8"><h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Perbandingan Lokasi</h3></div>
            <ComparisonChart surveyType={surveyType} tbmVisit={tbmVisitFilter} />
          </div>
        )}

        <div className="bg-white rounded-[2.5rem] border border-slate-200 p-8 shadow-2xl shadow-slate-200/50">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-10">
            <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Analisis Detail Indikator</h3>
            <div className="flex flex-wrap gap-2 bg-slate-50 p-1.5 rounded-2xl border border-slate-100">
              {(surveyType === 'minatbaca' ? ['SD KELAS 1-3', 'SD KELAS 4-6', 'SMP-SMA', 'DEWASA'] : filterLingkup !== 'all' ? [filterLingkup.toUpperCase()] : ['SEKOLAH', 'KELUARGA', 'MASYARAKAT']).map(l => (
                <button key={l} onClick={() => { setActiveLingkup(l); setRadarClusters([]); }} className={`px-5 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${activeLingkup === l ? `bg-white ${surveyType === 'minatbaca' ? 'text-emerald-600' : 'text-sky-600'} shadow-lg shadow-slate-200 scale-105 z-10` : 'text-slate-400 hover:text-slate-600'}`}>
                  {l}
                </button>
              ))}
            </div>
          </div>
          <IndicatorRadar key={`${activeLingkup}-${surveyType}`} lingkup={activeLingkup} surveyType={surveyType} onDataLoaded={setRadarClusters} kabupaten={filterKabupaten} desa={filterDesa} sekolah={filterSekolah} tbm={filterTbm} tbmVisit={tbmVisitFilter} />
          <div className="mt-12 pt-12 border-t border-slate-100">
            <CategoricalInsight key={`${activeLingkup}-${surveyType}-insight`} lingkup={activeLingkup} surveyType={surveyType} onDataLoaded={setCategoricalData} kabupaten={filterKabupaten} desa={filterDesa} sekolah={filterSekolah} tbm={filterTbm} tbmVisit={tbmVisitFilter} />
          </div>
          <QualitativeAdvice surveyType={surveyType} lingkup={activeLingkup} clusters={radarClusters} categoricalData={categoricalData} />
        </div>
      </div>
    </div>
  );
}
