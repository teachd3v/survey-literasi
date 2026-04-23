// src/components/dashboard/LingkupComparison.jsx
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function LingkupComparison({ data, horizontal }) {
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="backdrop-blur-2xl bg-white/10 border border-white/20 rounded-xl p-3 shadow-2xl">
          <p className="font-black text-white text-sm mb-1 uppercase tracking-widest">{payload[0].payload.lingkup}</p>
          <div className="space-y-0.5">
            <p className="text-[10px] text-white/60 font-bold">
              RATA-RATA SKOR: <span className="text-[#7dcbe1]">{payload[0].value.toFixed(2)}</span>
            </p>
            <p className="text-[10px] text-white/60 font-bold">
              RESPONDEN: <span className="text-white">{payload[0].payload.count}</span>
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="group relative h-full flex flex-col">
      <div className="absolute -inset-0.5 bg-gradient-to-r from-[#2e66a3] via-[#39a0c9] to-[#7dcbe1] rounded-3xl blur opacity-20 group-hover:opacity-40 transition duration-300"></div>
      
      <div className="relative backdrop-blur-2xl bg-white/10 rounded-3xl border border-white/20 p-4 md:p-6 shadow-2xl flex-1 flex flex-col min-h-0">
        <div className="mb-4">
          <h2 className="text-lg md:text-xl font-black text-white uppercase tracking-widest leading-none">Benchmarking Lingkup</h2>
          <p className="text-white/40 text-[10px] md:text-xs font-bold uppercase tracking-widest mt-1">Cross-ecosystem literation index</p>
        </div>

        <div className="flex-1 min-h-0">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart 
              data={data} 
              layout={horizontal ? 'vertical' : 'horizontal'}
              margin={{ top: 10, right: 30, left: horizontal ? 10 : 0, bottom: 5 }}
            >
              <defs>
                <linearGradient id="barGradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#2e66a3" stopOpacity={0.8}/>
                  <stop offset="100%" stopColor="#7dcbe1" stopOpacity={0.8}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={!horizontal} vertical={horizontal} />
              
              {horizontal ? (
                <>
                  <XAxis type="number" domain={[0, 4]} hide />
                  <YAxis 
                    dataKey="lingkup" 
                    type="category" 
                    tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 10, fontWeight: 900 }}
                    axisLine={false}
                    tickLine={false}
                    width={80}
                  />
                </>
              ) : (
                <>
                  <XAxis 
                    dataKey="lingkup" 
                    tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 10, fontWeight: 900 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis domain={[0, 4]} hide />
                </>
              )}
              
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
              <Bar 
                dataKey="avg_score" 
                fill="url(#barGradient)" 
                radius={horizontal ? [0, 10, 10, 0] : [10, 10, 0, 0]}
                barSize={32}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Small Progress Indicators */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
          {data.map((item) => {
            const percentage = (item.count / item.target) * 100;
            return (
              <div key={item.lingkup} className="backdrop-blur-xl bg-white/5 rounded-xl p-2 border border-white/10 flex items-center justify-between gap-3">
                <div className="shrink-0">
                  <div className="text-[8px] text-white/50 font-black uppercase tracking-widest mb-0.5">{item.lingkup}</div>
                  <div className="text-[10px] font-black text-white">{item.count}/{item.target}</div>
                </div>
                <div className="flex-1">
                  <div className="relative w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
                    <div 
                      className="h-full rounded-full bg-gradient-to-r from-[#2e66a3] to-[#7dcbe1] transition-all duration-1000"
                      style={{ width: `${Math.min(percentage, 100)}%` }}
                    />
                  </div>
                </div>
                <div className="text-[10px] font-black text-[#7dcbe1] w-8 text-right">{percentage.toFixed(0)}%</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
