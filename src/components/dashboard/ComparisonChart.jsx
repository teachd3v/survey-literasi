import { useState, useEffect } from 'react';
import { fetchNeonComparison } from '../../services/neon';

const GROUPS = [
  { id: 'kabupaten', label: 'Kabupaten' },
  { id: 'sekolah',   label: 'Sekolah' },
  { id: 'tbm',       label: 'TBM' },
  { id: 'desa_rt',   label: 'Desa & RT/RW' },
];

const scoreColor = (score, surveyType) => {
  if (surveyType === 'minatbaca') {
    if (score >= 4.2) return 'bg-emerald-500';
    if (score >= 3.4) return 'bg-sky-500';
    if (score >= 2.6) return 'bg-blue-500';
    if (score >= 1.8) return 'bg-amber-500';
    return 'bg-red-400';
  } else {
    const s = score * 25;
    if (s >= 86) return 'bg-emerald-500';
    if (s >= 71) return 'bg-sky-500';
    if (s >= 56) return 'bg-blue-500';
    if (s >= 40) return 'bg-amber-500';
    return 'bg-red-400';
  }
};

const scoreCategory = (score, surveyType) => {
  if (surveyType === 'minatbaca') {
    if (score >= 4.2) return { label: 'Sangat Tinggi', cls: 'bg-emerald-100 text-emerald-700' };
    if (score >= 3.4) return { label: 'Tinggi',        cls: 'bg-sky-100 text-sky-700' };
    if (score >= 2.6) return { label: 'Sedang',        cls: 'bg-blue-100 text-blue-700' };
    if (score >= 1.8) return { label: 'Rendah',        cls: 'bg-amber-100 text-amber-700' };
    return                    { label: 'Sangat Rendah', cls: 'bg-red-100 text-red-600' };
  } else {
    const s = score * 25;
    if (s >= 86) return { label: 'Membudaya',        cls: 'bg-emerald-100 text-emerald-700' };
    if (s >= 71) return { label: 'Berkembang',       cls: 'bg-sky-100 text-sky-700' };
    if (s >= 56) return { label: 'Mulai Berkembang', cls: 'bg-blue-100 text-blue-700' };
    if (s >= 40) return { label: 'Mulai Tumbuh',     cls: 'bg-amber-100 text-amber-700' };
    return              { label: 'Perlu Intervensi', cls: 'bg-red-100 text-red-600' };
  }
};

export default function ComparisonChart({ surveyType }) {
  const [activeGroup, setActiveGroup] = useState('kabupaten');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    setData([]);

    fetchNeonComparison(surveyType, activeGroup)
      .then(d => { if (!cancelled) setData(d); })
      .catch(e => { if (!cancelled) setError(e.message); })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [surveyType, activeGroup]);

  const maxScore = Math.max(...data.map(d => d.avg_score), surveyType === 'minatbaca' ? 5 : 4);

  return (
    <div>
      {/* Group tabs */}
      <div className="flex flex-wrap gap-2 mb-8">
        {GROUPS.map(g => (
          <button
            key={g.id}
            onClick={() => setActiveGroup(g.id)}
            className={`px-5 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all
              ${activeGroup === g.id
                ? `bg-white ${surveyType === 'minatbaca' ? 'text-emerald-600' : 'text-sky-600'} shadow-lg shadow-slate-200 scale-105`
                : 'text-slate-400 hover:text-slate-600'}`}
          >
            {g.label}
          </button>
        ))}
      </div>

      {loading && (
        <div className="h-48 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-slate-200 border-t-sky-500 rounded-full animate-spin"></div>
        </div>
      )}

      {error && (
        <div className="h-48 flex items-center justify-center">
          <p className="text-red-400 font-bold text-sm">{error}</p>
        </div>
      )}

      {!loading && !error && data.length === 0 && (
        <div className="h-48 flex items-center justify-center">
          <p className="text-slate-400 font-bold text-sm">Belum ada data untuk perbandingan ini</p>
        </div>
      )}

      {!loading && !error && data.length > 0 && (
        <div className="space-y-5">
          {data.map((item, idx) => {
            const divider = surveyType === 'minatbaca' ? 5 : 4;
            const pct = (item.avg_score / divider) * 100;
            const cat = scoreCategory(item.avg_score, surveyType);
            return (
              <div key={item.label} className="flex items-center gap-4">
                {/* Rank */}
                <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center font-black text-xs shrink-0">
                  {idx + 1}
                </div>

                {/* Bar area */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-slate-800 font-bold text-sm truncate pr-4">{item.label}</span>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`text-[9px] font-black px-2 py-0.5 rounded-full ${cat.cls}`}>{cat.label}</span>
                      <span className="font-black text-slate-900">{item.avg_score.toFixed(2)}</span>
                      <span className="text-slate-400 text-xs">/ {surveyType === 'minatbaca' ? '5.00' : '4.00'}</span>
                    </div>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${scoreColor(item.avg_score, surveyType)}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className="text-[10px] text-slate-400 font-bold">{item.count} responden</span>
                    <span className="text-[10px] text-slate-400 font-bold">{pct.toFixed(1)}%</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
