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

export default function LingkupComparison({ data }) {
  if (!data || data.length === 0) return (
    <div className="h-48 flex items-center justify-center">
      <p className="text-slate-400 font-bold text-sm">Belum ada data responden</p>
    </div>
  );

  return (
    <div className="space-y-8">
      {data.map((item) => {
        const percentage = (item.avg_score / 4) * 100;
        const colorClass = LINGKUP_COLORS[item.lingkup] ?? 'bg-slate-600';
        
        return (
          <div key={item.lingkup} className="relative">
            <div className="flex justify-between items-end mb-3">
              <div>
                <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-1">{item.lingkup}</h4>
                <div className="flex items-center gap-3">
                  <span className="text-2xl font-black text-slate-900 leading-none">{item.avg_score?.toFixed(2)}</span>
                  <span className="text-slate-400 font-bold text-xs uppercase">/ 4.00 INDEX</span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-slate-400 font-black text-[10px] uppercase tracking-widest block mb-1">Partisipasi</span>
                <span className="text-slate-900 font-black">{item.count} Responden</span>
              </div>
            </div>
            
            <div className="w-full bg-slate-100 rounded-full h-4 overflow-hidden shadow-inner">
              <div 
                className={`h-full rounded-full transition-all duration-1000 ${colorClass} relative`}
                style={{ width: `${percentage}%` }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent"></div>
              </div>
            </div>
            
            <div className="flex justify-between mt-2">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Baseline: 0.00</span>
              <span className="text-[10px] font-black text-sky-600 uppercase tracking-widest">Growth: {percentage.toFixed(1)}%</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
