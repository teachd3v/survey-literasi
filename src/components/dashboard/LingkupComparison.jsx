// src/components/dashboard/LingkupComparison.jsx
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function LingkupComparison({ data }) {
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

  return (
    <div className="group relative">
      <div className="absolute -inset-0.5 bg-gradient-to-r from-[#2e66a3] via-[#39a0c9] to-[#7dcbe1] rounded-3xl blur opacity-20 group-hover:opacity-40 transition duration-300"></div>
      
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
