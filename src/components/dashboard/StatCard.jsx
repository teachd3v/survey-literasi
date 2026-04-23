// src/components/dashboard/StatCard.jsx
export default function StatCard({ title, value, subtitle, icon, trend, compact }) {
  return (
    <div className="group relative">
      {/* Glow Effect */}
      <div className="absolute -inset-0.5 bg-gradient-to-r from-[#39a0c9] to-[#7dcbe1] rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-300"></div>
      
      {/* Card */}
      <div className={`
        relative backdrop-blur-2xl bg-white/10 rounded-2xl border border-white/20 hover:bg-white/15 transition-all duration-300 shadow-xl
        ${compact ? 'p-4' : 'p-6'}
      `}>
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className={`text-white/50 font-black uppercase tracking-widest ${compact ? 'text-[8px] mb-1' : 'text-xs mb-2'}`}>
              {title}
            </p>
            <h3 className={`font-black text-white bg-gradient-to-r from-white to-[#7dcbe1] bg-clip-text text-transparent leading-none ${compact ? 'text-xl' : 'text-4xl'}`}>
              {value}
            </h3>
            {subtitle && (
              <p className={`text-white/40 font-bold uppercase tracking-tighter ${compact ? 'text-[8px] mt-1' : 'text-xs mt-2'}`}>
                {subtitle}
              </p>
            )}
          </div>
          
          {icon && (
            <div className={`backdrop-blur-xl bg-white/5 rounded-xl border border-white/10 shadow-lg ${compact ? 'p-2' : 'p-3'}`}>
              <svg className={compact ? 'w-4 h-4 text-[#7dcbe1]' : 'w-6 h-6 text-[#7dcbe1]'} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {icon}
              </svg>
            </div>
          )}
        </div>
        
        {trend && (
          <div className={`mt-4 flex items-center text-sm font-medium ${trend.positive ? 'text-emerald-300' : 'text-red-300'}`}>
            <span className="mr-1">{trend.positive ? '↗' : '↘'}</span>
            <span>{trend.value}</span>
            <span className="ml-1 text-white/60">{trend.label}</span>
          </div>
        )}
      </div>
    </div>
  );
}
