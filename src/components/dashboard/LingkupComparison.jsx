// src/components/dashboard/LingkupComparison.jsx

const LINGKUP_COLORS = {
  'SEKOLAH':      'bg-sky-600',
  'KELUARGA':     'bg-emerald-600',
  'MASYARAKAT':   'bg-slate-700',
  'SD KELAS 1-3': 'bg-violet-500',
  'SD KELAS 4-6': 'bg-emerald-500',
  'SMP-SMA':      'bg-amber-500',
  'DEWASA':       'bg-rose-500',
};

export default function LingkupComparison({ data, compareData, compareLabel }) {
  if (!data || data.length === 0) return (
    <div className="h-48 flex items-center justify-center">
      <p className="text-slate-400 font-bold text-sm">Belum ada data responden</p>
    </div>
  );

  const hasCompare = compareData && compareData.length > 0;
  const compareMap = hasCompare
    ? Object.fromEntries(compareData.map(d => [d.lingkup, d]))
    : {};

  return (
    <div className="space-y-8">
      {data.map((item) => {
        const divider = item.avg_score > 4 ? 5 : 4;
        const percentage = (item.avg_score / divider) * 100;
        const colorClass = LINGKUP_COLORS[item.lingkup] ?? 'bg-slate-600';
        const compareItem = compareMap[item.lingkup];
        const comparePercentage = compareItem ? (compareItem.avg_score / divider) * 100 : null;
        const delta = compareItem ? item.avg_score - compareItem.avg_score : null;

        return (
          <div key={item.lingkup} className="relative">
            <div className="flex justify-between items-end mb-3">
              <div>
                <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-1">{item.lingkup}</h4>
                <div className="flex items-center gap-3">
                  <span className="text-2xl font-black text-slate-900 leading-none">{item.avg_score?.toFixed(2)}</span>
                  <span className="text-slate-400 font-bold text-xs uppercase">/ {divider}.00 INDEX</span>
                  {delta !== null && (
                    <span className={`text-xs font-black px-2 py-0.5 rounded-full ${
                      delta > 0 ? 'bg-emerald-100 text-emerald-700' :
                      delta < 0 ? 'bg-red-100 text-red-600' :
                      'bg-slate-100 text-slate-500'
                    }`}>
                      {delta > 0 ? '▲' : delta < 0 ? '▼' : '='} {Math.abs(delta).toFixed(2)}
                    </span>
                  )}
                </div>
                {hasCompare && compareItem && (
                  <p className="text-[10px] text-violet-500 font-black mt-1 uppercase tracking-widest">
                    {compareLabel}: {compareItem.avg_score.toFixed(2)} ({compareItem.count} resp.)
                  </p>
                )}
              </div>
              <div className="text-right">
                <span className="text-slate-400 font-black text-[10px] uppercase tracking-widest block mb-1">Partisipasi</span>
                <span className="text-slate-900 font-black">{item.count} Responden</span>
              </div>
            </div>

            {/* Main bar (active period) */}
            <div className="w-full bg-slate-100 rounded-full h-4 overflow-hidden shadow-inner">
              <div
                className={`h-full rounded-full transition-all duration-1000 ${colorClass} relative`}
                style={{ width: `${Math.min(percentage, 100)}%` }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent"></div>
              </div>
            </div>

            {/* Compare bar (secondary period) */}
            {comparePercentage !== null && (
              <div className="w-full bg-slate-50 rounded-full h-2 mt-1.5 overflow-hidden border border-violet-100">
                <div
                  className="h-full rounded-full bg-violet-400/60 transition-all duration-1000"
                  style={{ width: `${Math.min(comparePercentage, 100)}%` }}
                />
              </div>
            )}

            <div className="flex justify-between mt-2">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Data Awal: 0.00</span>
              <span className="text-[10px] font-black text-sky-600 uppercase tracking-widest">Peningkatan: {percentage.toFixed(1)}%</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
