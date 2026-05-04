import { useState, useEffect, useMemo } from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { fetchNeonIndicators } from '../../services/neon';
import { fetchInstrumen } from '../../services/googleSheets';

const catInfo = (v) => {
  if (v >= 3.6) return { label: 'Sangat Baik', cls: 'bg-emerald-100 text-emerald-700' };
  if (v >= 3.0) return { label: 'Baik',         cls: 'bg-sky-100 text-sky-700' };
  if (v >= 2.0) return { label: 'Berkembang',   cls: 'bg-amber-100 text-amber-700' };
  return             { label: 'Perlu Perhatian', cls: 'bg-red-100 text-red-600' };
};

// Keep first 3 words for radar axis label
const shortLabel = (name) => name.split(' ').slice(0, 3).join(' ');

// Build grouped cluster data from raw API scores + instrument map
function buildClusters(data, instrumen, lingkup) {
  if (!instrumen || !instrumen[lingkup] || data.length === 0) return null;

  const detail = {};            // kode → { indikator, variabel }
  const orderMap = new Map();   // variabel → first kode (or just preserves order)

  instrumen[lingkup].forEach(q => {
    if (!q.kode) return;
    detail[q.kode] = q;
    if (!orderMap.has(q.variabel)) orderMap.set(q.variabel, q.variabel);
  });

  const groups = {};
  data.forEach(item => {
    const info = detail[item.indicator];
    if (!info) return;
    const key = info.variabel;
    if (!groups[key]) groups[key] = [];
    groups[key].push({ kode: item.indicator, indikator: info.indikator, value: item.value });
  });

  return [...orderMap.entries()]
    .filter(([kv]) => groups[kv])
    .map(([kv, variabel]) => {
      const scores = [...groups[kv]].sort((a, b) => {
          // Sort by code (e.g. SD2.1 then SD2.2) to maintain order instead of sorting by value
          const numA = parseFloat(a.kode.match(/\d+$/)?.[0] || 0);
          const numB = parseFloat(b.kode.match(/\d+$/)?.[0] || 0);
          return numA - numB;
      });
      const avg = scores.reduce((s, i) => s + i.value, 0) / scores.length;
      return { kode_variabel: '', variabel, avg, scores }; // remove kode_variabel display
    });
}

const CustomRadarTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0];
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-lg px-3 py-2 text-xs">
      <p className="font-black text-slate-700">{d.payload.fullLabel}</p>
      <p className="font-bold text-sky-600 mt-0.5">Rata-rata: {d.value?.toFixed(2)} / 4.00</p>
    </div>
  );
};

export default function IndicatorRadar({ lingkup, surveyType = 'literasi', onDataLoaded }) {
  const [data, setData] = useState([]);
  const [instrumen, setInstrumen] = useState(null);
  const [instrLoading, setInstrLoading] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch instrument once per surveyType
  useEffect(() => {
    setInstrLoading(true);
    const sheet = surveyType === 'minatbaca' ? 'instrumen_minatbaca' : 'instrumen_literasi';
    fetchInstrumen(sheet)
      .then(d => setInstrumen(d))
      .catch(() => setInstrumen(null))
      .finally(() => setInstrLoading(false));
  }, [surveyType]);

  // Fetch per-indicator scores from DB
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    setData([]);

    fetchNeonIndicators(surveyType, lingkup)
      .then(d => { if (!cancelled) setData(d); })
      .catch(e => { if (!cancelled) setError(e.response?.data?.error || e.message); })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [lingkup, surveyType]);

  const clusters = useMemo(() => buildClusters(data, instrumen, lingkup), [data, instrumen, lingkup]);

  useEffect(() => {
    if (onDataLoaded && clusters) {
      onDataLoaded(clusters);
    }
  }, [clusters, onDataLoaded]);

  if (loading || instrLoading) return (
    <div className="h-64 flex items-center justify-center text-slate-400 font-bold animate-pulse">
      Menghitung Rumpun Indikator...
    </div>
  );

  if (error) return (
    <div className="h-64 flex items-center justify-center">
      <div className="text-center">
        <p className="text-red-500 font-bold text-sm mb-1">Gagal memuat indikator</p>
        <p className="text-slate-400 text-xs font-mono">{error}</p>
      </div>
    </div>
  );

  if (data.length === 0) return (
    <div className="h-64 flex items-center justify-center">
      <p className="text-slate-400 font-bold text-sm">
        Belum ada data untuk lingkup <span className="text-slate-600">{lingkup}</span>
      </p>
    </div>
  );

  if (!clusters || clusters.length === 0) return (
    <div className="h-64 flex items-center justify-center">
      <p className="text-slate-400 font-bold text-sm">Struktur rumpun belum tersedia</p>
    </div>
  );

  // Radar uses sheet order (clusters, not sorted) for consistent shape
  const radarData = clusters.map(c => ({
    label:     shortLabel(c.variabel),
    fullLabel: c.variabel,
    value:     parseFloat(c.avg.toFixed(2)),
    fullMark:  4,
  }));

  const ClusterItem = ({ c, index }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const cat = catInfo(c.avg);
    
    return (
      <div className="bg-slate-50 rounded-2xl border border-slate-100 overflow-hidden transition-all duration-300">
        {/* Cluster header (Clickable) */}
        <div 
          className="flex items-center justify-between p-4 gap-3 cursor-pointer hover:bg-slate-100/50"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black text-sm shrink-0">
              {index + 1}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-slate-800 font-bold text-sm leading-snug">{c.variabel}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className={`text-[9px] font-black px-2 py-0.5 rounded-full inline-block ${cat.cls}`}>
                  {cat.label}
                </span>
                <span className="text-slate-400 text-[10px] font-bold">
                  {c.scores.length} Indikator
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4 shrink-0">
            <div className="text-right">
              <div className="text-xl font-black text-slate-900">{c.avg.toFixed(2)}</div>
              <div className="text-[10px] text-slate-400 font-bold">/ 4.00</div>
            </div>
            {/* Chevron Icon */}
            <div className={`w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        {/* Individual indicators inside the cluster (Collapsible) */}
        <div 
          className={`border-slate-100 overflow-hidden transition-all duration-300 ease-in-out ${isExpanded ? 'max-h-[1000px] border-t opacity-100' : 'max-h-0 opacity-0'}`}
        >
          {c.scores.map((s, i) => (
            <div
              key={s.kode}
              className={`flex items-start gap-3 px-4 py-2.5 ${i < c.scores.length - 1 ? 'border-b border-slate-100' : ''} bg-white`}
            >
              <span className="text-[10px] font-black bg-slate-200 text-slate-500 px-1.5 py-0.5 rounded shrink-0 mt-0.5">
                {s.kode}
              </span>
              <p className="text-slate-500 text-xs font-medium flex-1 leading-snug">{s.indikator}</p>
              <span className={`text-xs font-black tabular-nums shrink-0 mt-0.5 ${
                s.value >= 3.0 ? 'text-emerald-600' : s.value >= 2.0 ? 'text-amber-600' : 'text-red-500'
              }`}>
                {s.value.toFixed(2)}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col xl:flex-row gap-8 items-start">
      {/* Radar Chart — shows cluster averages */}
      <div className="w-full xl:w-[40%] h-[380px] shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="65%" data={radarData}>
            <PolarGrid stroke="#e2e8f0" />
            <PolarAngleAxis
              dataKey="label"
              tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700 }}
            />
            <Radar
              name="Rata-rata Rumpun"
              dataKey="value"
              stroke="#0284c7"
              fill="#0ea5e9"
              fillOpacity={0.4}
            />
            <Tooltip content={<CustomRadarTooltip />} />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* Cluster detail list */}
      <div className="w-full xl:w-[60%] max-h-[600px] overflow-y-auto pr-1 space-y-3">
        {clusters.map((c, index) => <ClusterItem key={c.variabel} c={c} index={index} />)}
      </div>
    </div>
  );
}
