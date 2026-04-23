// src/components/dashboard/Dashboard_Glassmorphism.jsx
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts';

// ============================================================================
// STAT CARD - Glassmorphism
// ============================================================================
export function StatCard({ title, value, subtitle, icon, trend }) {
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

// ============================================================================
// LINGKUP COMPARISON BAR CHART - Glassmorphism
// ============================================================================
export function LingkupComparison({ data }) {
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="backdrop-blur-2xl bg-white/10 border border-white/20 rounded-xl p-4 shadow-2xl">
          <p className="font-bold text-white text-lg mb-2">{payload[0].payload.lingkup}</p>
          <div className="space-y-1">
            <p className="text-sm text-white/80">
              Rata-rata Skor: <span className="font-bold text-[#7dcbe1]">{payload[0].value.toFixed(2)}</span>
            </p>
            <p className="text-sm text-white/80">
              Responden: <span className="font-bold text-white">{payload[0].payload.count}</span>
            </p>
            <p className="text-sm text-white/80">
              Target: <span className="font-bold text-white">{payload[0].payload.target}</span>
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  const lingkupColors = {
    SEKOLAH: '#2e66a3',
    KELUARGA: '#39a0c9',
    MASYARAKAT: '#7dcbe1'
  };

  return (
    <div className="group relative">
      {/* Glow Effect */}
      <div className="absolute -inset-0.5 bg-gradient-to-r from-[#2e66a3] via-[#39a0c9] to-[#7dcbe1] rounded-3xl blur opacity-20 group-hover:opacity-40 transition duration-300"></div>
      
      {/* Card */}
      <div className="relative backdrop-blur-2xl bg-white/10 rounded-3xl border border-white/20 p-8 shadow-2xl">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">Perbandingan Lingkup</h2>
          <p className="text-white/70">Rata-rata skor per ekosistem literasi</p>
        </div>

        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <defs>
              <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#7dcbe1" stopOpacity={0.8}/>
                <stop offset="100%" stopColor="#39a0c9" stopOpacity={0.3}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis 
              dataKey="lingkup" 
              tick={{ fill: 'rgba(255,255,255,0.8)', fontSize: 14, fontWeight: 600 }}
              axisLine={{ stroke: 'rgba(255,255,255,0.2)' }}
              tickLine={{ stroke: 'rgba(255,255,255,0.2)' }}
            />
            <YAxis 
              domain={[0, 4]}
              tick={{ fill: 'rgba(255,255,255,0.8)', fontSize: 14 }}
              axisLine={{ stroke: 'rgba(255,255,255,0.2)' }}
              tickLine={{ stroke: 'rgba(255,255,255,0.2)' }}
              label={{ value: 'Skor (1-4)', angle: -90, position: 'insideLeft', fill: 'rgba(255,255,255,0.8)' }}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
            <Legend 
              wrapperStyle={{ paddingTop: '20px' }}
              iconType="circle"
            />
            <Bar 
              dataKey="avg_score" 
              fill="url(#barGradient)" 
              radius={[12, 12, 0, 0]}
              name="Rata-rata Skor"
            />
          </BarChart>
        </ResponsiveContainer>

        {/* Progress Indicators */}
        <div className="mt-8 grid grid-cols-3 gap-6">
          {data.map((item) => {
            const percentage = (item.count / item.target) * 100;
            return (
              <div key={item.lingkup} className="backdrop-blur-xl bg-white/5 rounded-xl p-4 border border-white/10">
                <div className="text-center mb-3">
                  <div className="text-sm text-white/70 mb-1 font-medium">{item.lingkup}</div>
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-2xl font-bold text-white">{item.count}</span>
                    <span className="text-white/50">/</span>
                    <span className="text-lg text-white/70">{item.target}</span>
                  </div>
                </div>
                <div className="relative w-full bg-white/10 rounded-full h-3 overflow-hidden backdrop-blur-sm">
                  <div 
                    className="h-3 rounded-full bg-gradient-to-r from-[#39a0c9] to-[#7dcbe1] transition-all duration-500 shadow-lg"
                    style={{ width: `${Math.min(percentage, 100)}%` }}
                  />
                </div>
                <div className="text-center mt-2">
                  <span className="text-xs text-white/60">{percentage.toFixed(0)}%</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// INDICATOR RADAR CHART - Glassmorphism
// ============================================================================
export function IndicatorRadar({ data, lingkup }) {
  const colors = {
    SEKOLAH: { stroke: '#2e66a3', fill: '#2e66a3' },
    KELUARGA: { stroke: '#39a0c9', fill: '#39a0c9' },
    MASYARAKAT: { stroke: '#7dcbe1', fill: '#7dcbe1' }
  };

  const color = colors[lingkup] || colors.SEKOLAH;

  return (
    <div className="group relative">
      {/* Glow Effect */}
      <div className={`absolute -inset-0.5 bg-gradient-to-r from-${color.stroke} to-${color.fill} rounded-3xl blur opacity-20 group-hover:opacity-40 transition duration-300`}></div>
      
      {/* Card */}
      <div className="relative backdrop-blur-2xl bg-white/10 rounded-3xl border border-white/20 p-8 shadow-2xl">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">Detail Indikator: {lingkup}</h2>
          <p className="text-white/70">Breakdown skor per indikator</p>
        </div>

        <ResponsiveContainer width="100%" height={450}>
          <RadarChart data={data}>
            <PolarGrid stroke="rgba(255,255,255,0.2)" />
            <PolarAngleAxis 
              dataKey="indicator" 
              tick={{ fill: 'rgba(255,255,255,0.8)', fontSize: 13, fontWeight: 600 }}
            />
            <PolarRadiusAxis 
              angle={90} 
              domain={[0, 4]} 
              tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 12 }}
              stroke="rgba(255,255,255,0.2)"
            />
            <Radar 
              name={lingkup}
              dataKey="value" 
              stroke={color.stroke} 
              fill={color.fill} 
              fillOpacity={0.5}
              strokeWidth={3}
            />
            <Legend 
              wrapperStyle={{ paddingTop: '20px' }}
              iconType="circle"
            />
          </RadarChart>
        </ResponsiveContainer>

        {/* Indicator Details Table */}
        <div className="mt-8 backdrop-blur-xl bg-white/5 rounded-2xl border border-white/10 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="backdrop-blur-xl bg-white/10 border-b border-white/10">
              <tr>
                <th className="px-6 py-4 text-left text-white/80 font-semibold">Indikator</th>
                <th className="px-6 py-4 text-right text-white/80 font-semibold">Skor</th>
                <th className="px-6 py-4 text-right text-white/80 font-semibold">Kategori</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {data.map((item, index) => (
                <tr key={item.indicator} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4 font-semibold text-white">{item.indicator}</td>
                  <td className="px-6 py-4 text-right">
                    <span className="font-bold text-[#7dcbe1] text-lg">{item.value.toFixed(2)}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className={`
                      px-3 py-1.5 rounded-full text-xs font-bold backdrop-blur-xl border
                      ${item.value >= 3.6 
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' :
                        item.value >= 3.0 
                        ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30' :
                        item.value >= 2.0 
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' :
                        'bg-red-500/20 text-red-300 border-red-500/30'}
                    `}>
                      {item.value >= 3.6 ? 'Sangat Baik' :
                       item.value >= 3.0 ? 'Baik' :
                       item.value >= 2.0 ? 'Berkembang' :
                       'Perlu Perhatian'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// DASHBOARD PAGE LAYOUT - Glassmorphism
// ============================================================================
export function DashboardPage({ stats }) {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#2a3e63] via-[#2e66a3] to-[#39a0c9]">
        <div className="absolute top-20 left-20 w-96 h-96 bg-[#7dcbe1] rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-40 right-20 w-96 h-96 bg-[#39a0c9] rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-20 left-40 w-96 h-96 bg-[#2e66a3] rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-12">
            <h1 className="text-5xl font-bold text-white mb-3 bg-gradient-to-r from-white via-[#7dcbe1] to-[#39a0c9] bg-clip-text text-transparent">
              Dashboard Ekosistem Literasi
            </h1>
            <p className="text-white/70 text-lg">Monitor dan analisis data literasi secara real-time</p>
          </div>

          {/* Overview Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <StatCard 
              title="Total Responden" 
              value={stats?.totalResponses || 0} 
              icon={
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              }
            />
            <StatCard 
              title="Rata-rata Skor" 
              value={stats?.avgScore?.toFixed(2) || '0.00'} 
              subtitle="Dari skala 1-4"
              icon={
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              }
              trend={{ positive: true, value: '+12%', label: 'vs bulan lalu' }}
            />
            <StatCard 
              title="Completion Rate" 
              value="87%" 
              icon={
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
            />
            <StatCard 
              title="Last Update" 
              value={new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })} 
              subtitle={new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
              icon={
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
            />
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            <LingkupComparison data={stats?.lingkupStats || []} />
            <IndicatorRadar data={stats?.indicatorBreakdown || []} lingkup="SEKOLAH" />
          </div>
        </div>
      </div>

      {/* Animation Keyframes */}
      <style jsx>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(20px, -50px) scale(1.1); }
          50% { transform: translate(-20px, 20px) scale(0.9); }
          75% { transform: translate(50px, 50px) scale(1.05); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}
