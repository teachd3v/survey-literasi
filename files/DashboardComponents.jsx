// src/components/dashboard/LingkupComparison.jsx
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function LingkupComparison({ data }) {
  // Expected data format:
  // [
  //   { lingkup: 'SEKOLAH', avg_score: 3.2, count: 45, target: 50 },
  //   { lingkup: 'KELUARGA', avg_score: 2.8, count: 120, target: 150 },
  //   { lingkup: 'MASYARAKAT', avg_score: 3.1, count: 35, target: 40 }
  // ]

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200">
          <p className="font-bold text-gray-800">{payload[0].payload.lingkup}</p>
          <p className="text-sm text-gray-600">
            Rata-rata Skor: <span className="font-semibold text-indigo-600">{payload[0].value.toFixed(2)}</span>
          </p>
          <p className="text-sm text-gray-600">
            Responden: <span className="font-semibold">{payload[0].payload.count}</span>
          </p>
          <p className="text-sm text-gray-600">
            Target: <span className="font-semibold">{payload[0].payload.target}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Perbandingan Lingkup</h2>
        <p className="text-gray-600 text-sm">Rata-rata skor per ekosistem literasi</p>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis 
            dataKey="lingkup" 
            tick={{ fill: '#6b7280', fontSize: 14 }}
            axisLine={{ stroke: '#d1d5db' }}
          />
          <YAxis 
            domain={[0, 4]}
            tick={{ fill: '#6b7280', fontSize: 14 }}
            axisLine={{ stroke: '#d1d5db' }}
            label={{ value: 'Skor (1-4)', angle: -90, position: 'insideLeft' }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            wrapperStyle={{ paddingTop: '20px' }}
            iconType="circle"
          />
          <Bar 
            dataKey="avg_score" 
            fill="#6366f1" 
            radius={[8, 8, 0, 0]}
            name="Rata-rata Skor"
          />
        </BarChart>
      </ResponsiveContainer>

      {/* Progress Indicators */}
      <div className="mt-6 grid grid-cols-3 gap-4">
        {data.map((item) => (
          <div key={item.lingkup} className="text-center">
            <div className="text-sm text-gray-500 mb-1">{item.lingkup}</div>
            <div className="flex items-center justify-center gap-2">
              <span className="text-lg font-bold text-gray-800">{item.count}</span>
              <span className="text-sm text-gray-400">/</span>
              <span className="text-sm text-gray-500">{item.target}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div 
                className="bg-indigo-600 h-2 rounded-full transition-all"
                style={{ width: `${(item.count / item.target) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}


// src/components/dashboard/IndicatorRadar.jsx
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Legend } from 'recharts';

export default function IndicatorRadar({ data, lingkup }) {
  // Expected data format:
  // [
  //   { indicator: 'S1', value: 3.2, fullMark: 4 },
  //   { indicator: 'S2', value: 2.8, fullMark: 4 },
  //   ...
  // ]

  const colors = {
    SEKOLAH: '#10b981',
    KELUARGA: '#f59e0b',
    MASYARAKAT: '#3b82f6'
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Detail Indikator: {lingkup}</h2>
        <p className="text-gray-600 text-sm">Breakdown skor per indikator</p>
      </div>

      <ResponsiveContainer width="100%" height={400}>
        <RadarChart data={data}>
          <PolarGrid stroke="#e5e7eb" />
          <PolarAngleAxis 
            dataKey="indicator" 
            tick={{ fill: '#6b7280', fontSize: 12 }}
          />
          <PolarRadiusAxis 
            angle={90} 
            domain={[0, 4]} 
            tick={{ fill: '#6b7280', fontSize: 12 }}
          />
          <Radar 
            name={lingkup}
            dataKey="value" 
            stroke={colors[lingkup]} 
            fill={colors[lingkup]} 
            fillOpacity={0.6} 
          />
          <Legend />
        </RadarChart>
      </ResponsiveContainer>

      {/* Indicator Details Table */}
      <div className="mt-6 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-gray-600">Indikator</th>
              <th className="px-4 py-2 text-right text-gray-600">Skor</th>
              <th className="px-4 py-2 text-right text-gray-600">Kategori</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {data.map((item) => (
              <tr key={item.indicator} className="hover:bg-gray-50">
                <td className="px-4 py-2 font-medium text-gray-800">{item.indicator}</td>
                <td className="px-4 py-2 text-right">
                  <span className="font-semibold text-indigo-600">{item.value.toFixed(2)}</span>
                </td>
                <td className="px-4 py-2 text-right">
                  <span className={`
                    px-2 py-1 rounded-full text-xs font-medium
                    ${item.value >= 3.6 ? 'bg-green-100 text-green-700' :
                      item.value >= 3.0 ? 'bg-blue-100 text-blue-700' :
                      item.value >= 2.0 ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'}
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
  );
}


// src/components/dashboard/StatCard.jsx
export default function StatCard({ title, value, subtitle, icon, trend }) {
  return (
    <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-gray-500 mb-1">{title}</p>
          <h3 className="text-3xl font-bold text-gray-800">{value}</h3>
          {subtitle && (
            <p className="text-sm text-gray-600 mt-2">{subtitle}</p>
          )}
        </div>
        {icon && (
          <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
            {icon}
          </div>
        )}
      </div>
      
      {trend && (
        <div className={`mt-4 flex items-center text-sm ${trend.positive ? 'text-green-600' : 'text-red-600'}`}>
          <span className="font-medium">{trend.value}</span>
          <span className="ml-1">{trend.label}</span>
        </div>
      )}
    </div>
  );
}
