// src/components/dashboard/IndicatorRadar.jsx
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Legend } from 'recharts';

export default function IndicatorRadar({ data, lingkup }) {
  const colors = {
    SEKOLAH: { stroke: '#2e66a3', fill: '#2e66a3' },
    KELUARGA: { stroke: '#39a0c9', fill: '#39a0c9' },
    MASYARAKAT: { stroke: '#7dcbe1', fill: '#7dcbe1' }
  };

  const color = colors[lingkup] || colors.SEKOLAH;

  return (
    <div className="group relative">
      <div className={`absolute -inset-0.5 bg-gradient-to-r from-${color.stroke} to-${color.fill} rounded-3xl blur opacity-20 group-hover:opacity-40 transition duration-300`}></div>
      
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
              {data.map((item) => (
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
