// src/components/dashboard/IndicatorRadar.jsx
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Legend } from 'recharts';

export default function IndicatorRadar({ data, lingkup, compact }) {
  const colors = {
    SEKOLAH: { stroke: '#2e66a3', fill: '#2e66a3' },
    KELUARGA: { stroke: '#39a0c9', fill: '#39a0c9' },
    MASYARAKAT: { stroke: '#7dcbe1', fill: '#7dcbe1' }
  };

  const color = colors[lingkup] || colors.SEKOLAH;

  return (
    <div className="group relative h-full flex flex-col">
      <div className={`absolute -inset-0.5 bg-gradient-to-r from-${color.stroke} to-${color.fill} rounded-3xl blur opacity-20 group-hover:opacity-40 transition duration-300`}></div>
      
      <div className={`
        relative backdrop-blur-2xl bg-white/10 rounded-3xl border border-white/20 shadow-2xl flex-1 flex flex-col min-h-0
        ${compact ? 'p-4' : 'p-8'}
      `}>
        <div className={compact ? 'mb-4' : 'mb-8'}>
          <h2 className={`${compact ? 'text-lg' : 'text-3xl'} font-bold text-white mb-1 leading-tight uppercase`}>Analisis {lingkup}</h2>
          <p className="text-white/40 text-[10px] md:text-xs font-bold uppercase tracking-widest">Detail skor per indikator</p>
        </div>

        <div className="flex-1 min-h-0">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={data} margin={{ top: 10, right: 30, bottom: 0, left: 30 }}>
              <PolarGrid stroke="rgba(255,255,255,0.15)" />
              <PolarAngleAxis 
                dataKey="indicator" 
                tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: compact ? 9 : 12, fontWeight: 700 }}
              />
              <PolarRadiusAxis 
                angle={90} 
                domain={[0, 4]} 
                tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 8 }}
                stroke="rgba(255,255,255,0.1)"
              />
              <Radar 
                name={lingkup}
                dataKey="value" 
                stroke={color.stroke} 
                fill={color.fill} 
                fillOpacity={0.4}
                strokeWidth={3}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        <div className={`
          mt-4 backdrop-blur-xl bg-white/5 rounded-xl border border-white/10 overflow-hidden overflow-y-auto custom-scrollbar
          ${compact ? 'max-h-[150px]' : 'max-h-[300px]'}
        `}>
          <table className="w-full text-[10px] md:text-xs">
            <thead className="backdrop-blur-xl bg-white/10 border-b border-white/10 sticky top-0 z-10">
              <tr>
                <th className="px-3 py-2 text-left text-white/50 font-black uppercase tracking-widest">Indikator</th>
                <th className="px-3 py-2 text-right text-white/50 font-black uppercase tracking-widest">Skor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {data.map((item) => (
                <tr key={item.indicator} className="hover:bg-white/5 transition-colors">
                  <td className="px-3 py-2 font-bold text-white/90">{item.indicator}</td>
                  <td className="px-3 py-2 text-right">
                    <span className="font-black text-[#7dcbe1]">{item.value.toFixed(2)}</span>
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
