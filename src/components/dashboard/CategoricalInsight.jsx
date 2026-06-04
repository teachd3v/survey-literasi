import { useState, useEffect, useMemo } from 'react';
import { fetchNeonCategoricalStats } from '../../services/neon';
import { fetchInstrumen } from '../../services/googleSheets';

export default function CategoricalInsight({ lingkup, surveyType = 'literasi', dateFrom, dateTo, tbmVisit, kabupaten, desa, sekolah, onDataLoaded }) {
  const [stats, setStats] = useState({});
  const [instrumen, setInstrumen] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    const sheet = surveyType === 'minatbaca' ? 'instrumen_minatbaca' : 'instrumen_literasi';
    
    Promise.all([
      fetchNeonCategoricalStats(surveyType, lingkup, { dateFrom, dateTo, tbmVisit, kabupaten, desa, sekolah }),
      fetchInstrumen(sheet)
    ])
      .then(([statsData, instrData]) => {
        if (!cancelled) {
          setStats(statsData);
          setInstrumen(instrData);
        }
      })
      .catch(e => {
        if (!cancelled) setError(e.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [lingkup, surveyType, dateFrom, dateTo, tbmVisit, kabupaten, desa, sekolah]);

  const categoricalData = useMemo(() => {
    if (!instrumen || !instrumen[lingkup] || Object.keys(stats).length === 0) return [];

    // Filter instrument to only categorical questions (Multi-select or Select)
    const categoricalQuestions = instrumen[lingkup].filter(q => 
      q.tipe_skala === 'Multi-select' || q.tipe_skala === 'Select'
    );

    return categoricalQuestions.map(q => {
      const qStats = stats[q.kode] || [];
      
      // Parse scale labels from skala_detail
      const labelMap = {};
      q.skala_detail.split('\n').forEach(line => {
        const match = line.trim().match(/^(\d+)\s*[=:]/);
        if (match) {
          labelMap[match[1]] = line.split(/[=:]/)[1]?.trim() || `Opsi ${match[1]}`;
        }
      });

      // Map stats with labels and calculate percentage
      const totalResponses = qStats.reduce((sum, s) => sum + s.count, 0);
      const chartData = qStats.map(s => ({
        label: labelMap[s.option] || `Opsi ${s.option}`,
        count: s.count,
        percentage: totalResponses > 0 ? (s.count / totalResponses) * 100 : 0
      })).sort((a, b) => b.count - a.count);

      return {
        kode: q.kode,
        variabel: q.variabel,
        indikator: q.indikator,
        data: chartData,
        total: totalResponses
      };
    }).filter(q => q.data.length > 0);
  }, [stats, instrumen, lingkup]);

  useEffect(() => {
    if (onDataLoaded && categoricalData.length > 0) {
      onDataLoaded(categoricalData);
    }
  }, [categoricalData, onDataLoaded]);

  if (loading) return (
    <div className="h-48 flex items-center justify-center text-slate-400 font-bold animate-pulse">
      Memuat Wawasan Kualitatif...
    </div>
  );

  if (error) return null; // Fail silently or show minimal error

  if (categoricalData.length === 0) return (
    <div className="bg-slate-50 rounded-3xl p-8 text-center border-2 border-dashed border-slate-200">
      <p className="text-slate-400 font-bold italic">Belum ada data kualitatif untuk lingkup ini.</p>
    </div>
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {categoricalData.map((item) => (
        <div key={item.kode} className="bg-white rounded-[2rem] border border-slate-100 p-6 shadow-sm hover:shadow-md transition-all">
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-sky-100 text-sky-700 text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-widest">
                {item.variabel}
              </span>
              <span className="text-slate-300 text-[10px] font-bold">{item.kode}</span>
            </div>
            <h4 className="text-lg font-black text-slate-800 leading-tight">
              {item.indikator}
            </h4>
          </div>

          <div className="space-y-4">
            {item.data.slice(0, 6).map((data, idx) => (
              <div key={idx} className="group">
                <div className="flex justify-between items-end mb-1">
                  <span className="text-xs font-bold text-slate-600 truncate pr-4 max-w-[80%]">
                    {data.label}
                  </span>
                  <span className="text-[10px] font-black text-slate-900 shrink-0">
                    {data.count}
                  </span>
                </div>
                <div className="w-full bg-slate-50 rounded-full h-2 overflow-hidden">
                  <div 
                    className="h-full bg-sky-500 rounded-full transition-all duration-1000 group-hover:bg-sky-600"
                    style={{ width: `${data.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-4 border-t border-slate-50 flex justify-between items-center">
             <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
               Total Pilihan: {item.total}
             </span>
             <button className="text-[10px] font-black text-sky-600 uppercase tracking-widest hover:underline">
               Lihat Detail →
             </button>
          </div>
        </div>
      ))}
    </div>
  );
}
