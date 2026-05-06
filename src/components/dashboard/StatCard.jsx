// src/components/dashboard/StatCard.jsx

export default function StatCard({ title, value, icon, subtitle, color = 'sky', compareValue, compareLabel, numericValue }) {
  const getIcon = () => {
    switch (icon) {
      case 'users':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        );
      case 'chart':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        );
      case 'award':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
          </svg>
        );
      case 'check':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      default:
        return null;
    }
  };

  const colors = {
    sky: 'bg-sky-50 text-sky-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    slate: 'bg-slate-50 text-slate-600',
  };

  // Numeric delta (for Total Responden, Indeks Nasional)
  const baseNum = numericValue !== undefined ? numericValue : (typeof value === 'number' ? value : null);
  const cmpNum = typeof compareValue === 'number' ? compareValue : null;
  const showNumericDelta = baseNum !== null && cmpNum !== null;
  const delta = showNumericDelta ? baseNum - cmpNum : null;

  // String comparison (for Kategori Dominan)
  const showStringCompare = typeof compareValue === 'string' && compareValue !== null;

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xl shadow-slate-200/40 relative overflow-hidden group hover:border-sky-300 transition-all">
      <div className="relative z-10 flex flex-col gap-1">
        <div className={`w-12 h-12 rounded-2xl ${colors[color]} flex items-center justify-center mb-4 transition-transform group-hover:scale-110`}>
          {getIcon()}
        </div>
        <p className="text-slate-400 font-black uppercase tracking-widest text-[10px]">{title}</p>
        <div className="flex items-baseline gap-2">
          <h3 className="text-3xl font-black text-slate-900 tracking-tighter">{value}</h3>
          {subtitle && <span className="text-slate-400 font-bold text-xs">{subtitle}</span>}
        </div>

        {/* Numeric delta */}
        {showNumericDelta && delta !== null && (
          <div className={`flex items-center gap-1 mt-1 text-[10px] font-black ${delta >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
            <span>{delta >= 0 ? '▲' : '▼'}</span>
            <span>{delta >= 0 ? '+' : ''}{typeof delta === 'number' && !Number.isInteger(delta) ? delta.toFixed(2) : delta}</span>
            <span className="text-slate-400 font-bold">vs {compareLabel}</span>
          </div>
        )}

        {/* String compare (e.g. dominant category) */}
        {showStringCompare && !showNumericDelta && (
          <div className="flex items-center gap-1 mt-1 text-[10px] font-black text-violet-600">
            <span>↔</span>
            <span className="text-slate-400 font-bold">
              {compareLabel}: <span className="text-violet-600">{compareValue}</span>
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
