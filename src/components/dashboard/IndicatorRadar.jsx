// src/components/dashboard/IndicatorRadar.jsx
import React, { useState, useEffect } from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import { fetchIndicatorBreakdown } from '../../services/googleSheets';

export default function IndicatorRadar({ lingkup }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadBreakdown() {
      setLoading(true);
      try {
        const breakdown = await fetchIndicatorBreakdown(lingkup);
        setData(breakdown);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    loadBreakdown();
  }, [lingkup]);

  if (loading) return <div className="h-64 flex items-center justify-center text-slate-400 font-bold animate-pulse">Menghitung Indikator...</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
      <div className="h-72 md:h-96">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
            <PolarGrid stroke="#e2e8f0" />
            <PolarAngleAxis dataKey="indicator" tick={{ fill: '#64748b', fontSize: 12, fontWeight: 900 }} />
            <Radar
              name="Skor"
              dataKey="value"
              stroke="#0284c7"
              fill="#0ea5e9"
              fillOpacity={0.5}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      <div className="space-y-3">
        {data.map((item) => (
          <div key={item.indicator} className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-center justify-between group hover:bg-white hover:shadow-lg hover:border-sky-100 transition-all">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="w-8 h-8 rounded-lg bg-sky-600 text-white flex items-center justify-center font-black text-xs">{item.indicator}</span>
                <span className="text-slate-900 font-black text-sm uppercase tracking-tight">Kualitas Capaian</span>
              </div>
              <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Skor Rata-rata dari target 4.00</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-black text-slate-900 leading-none">{item.value?.toFixed(2)}</div>
              <div className={`text-[9px] font-black uppercase mt-1 ${
                item.value >= 3.5 ? 'text-emerald-500' :
                item.value >= 2.5 ? 'text-sky-500' : 'text-amber-500'
              }`}>
                {item.value >= 3.5 ? 'Excellent' : item.value >= 2.5 ? 'Good' : 'Development'}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
