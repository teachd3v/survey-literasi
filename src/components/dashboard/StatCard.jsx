// src/components/dashboard/StatCard.jsx
export default function StatCard({ title, value, subtitle, icon, trend }) {
  return (
    <div className="group relative">
      {/* Glow Effect */}
      <div className="absolute -inset-0.5 bg-gradient-to-r from-[#39a0c9] to-[#7dcbe1] rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-300"></div>
      
      {/* Card */}
      <div className="relative backdrop-blur-2xl bg-white/10 rounded-2xl border border-white/20 p-6 hover:bg-white/15 transition-all duration-300 shadow-xl">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm text-white/70 mb-2 font-medium uppercase tracking-wide">{title}</p>
            <h3 className="text-4xl font-bold text-white mb-1 bg-gradient-to-r from-white to-[#7dcbe1] bg-clip-text text-transparent">
              {value}
            </h3>
            {subtitle && (
              <p className="text-sm text-white/60 mt-2">{subtitle}</p>
            )}
          </div>
          
          {icon && (
            <div className="backdrop-blur-xl bg-gradient-to-br from-[#39a0c9]/30 to-[#7dcbe1]/30 rounded-xl p-3 border border-white/20 shadow-lg">
              {icon}
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
