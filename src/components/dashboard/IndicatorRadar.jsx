// src/components/dashboard/IndicatorRadar.jsx
import React, { useState, useEffect } from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import { fetchIndicatorBreakdown } from '../../services/googleSheets';

export default function IndicatorRadar({ lingkup, surveyType = 'literasi' }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadBreakdown() {
      setLoading(true);
      try {
        const breakdown = await fetchIndicatorBreakdown(lingkup, surveyType);
        setData(breakdown);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    loadBreakdown();
  }, [lingkup, surveyType]);

  if (loading) return <div className="h-64 flex items-center justify-center text-slate-400 font-bold animate-pulse">Menghitung Indikator...</div>;

  return (
    <div className="flex flex-col xl:flex-row gap-8 items-start">
      {/* Radar Chart Section */}
      <div className="w-full xl:w-[45%] h-[400px] shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="75%" data={data}>
            <PolarGrid stroke="#e2e8f0" />
            <PolarAngleAxis 
              dataKey="indicator" 
              tick={{ fill: '#64748b', fontSize: 10, fontWeight: 900 }} 
            />
            <Radar
              name="Skor"
              dataKey="value"
              stroke="#0284c7"
              fill="#0ea5e9"
              fillOpacity={0.4}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* Details List Section - Scrollable Grid */}
      <div className="w-full xl:w-[55%] grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
        {data.map((item) => (
          <div key={item.indicator} className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-center justify-between group hover:bg-white hover:shadow-xl hover:border-sky-200 transition-all">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black text-xs shadow-lg group-hover:bg-sky-600 transition-colors">
                {item.indicator}
              </div>
              <div>
                <span className="text-slate-900 font-bold text-sm tracking-tight block">Analisis Detail</span>
                <span className="text-slate-400 text-[9px] font-black uppercase tracking-widest leading-none">Indeks 4.00</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xl font-black text-slate-900">{item.value?.toFixed(2)}</div>
              <div className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full inline-block mt-1 ${
                item.value >= 3.5 ? 'bg-emerald-100 text-emerald-700' :
                item.value >= 2.5 ? 'bg-sky-100 text-sky-700' : 'bg-amber-100 text-amber-700'
              }`}>
                {item.value >= 3.5 ? 'Optimum' : item.value >= 2.5 ? 'Good' : 'Develop'}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
