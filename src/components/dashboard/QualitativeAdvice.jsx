import React from 'react';

// Maturity Levels & Descriptions
const MATURITY_LEVELS = [
  { label: 'Membudaya', min: 4.2, literasiMin: 86, cls: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  { label: 'Berkembang', min: 3.4, literasiMin: 71, cls: 'text-sky-400', bg: 'bg-sky-500/10' },
  { label: 'Sedang', min: 2.6, literasiMin: 56, cls: 'text-blue-400', bg: 'bg-blue-500/10' },
  { label: 'Tumbuh', min: 1.8, literasiMin: 40, cls: 'text-amber-400', bg: 'bg-amber-500/10' },
  { label: 'Intervensi', min: 0, literasiMin: 0, cls: 'text-rose-400', bg: 'bg-rose-500/10' },
];

const getMaturity = (score, type) => {
  if (type === 'minatbaca') {
    return MATURITY_LEVELS.find(l => score >= l.min) || MATURITY_LEVELS[4];
  } else {
    const s = score * 25; // Scale 4 to 100
    return MATURITY_LEVELS.find(l => s >= l.literasiMin) || MATURITY_LEVELS[4];
  }
};

const KNOWLEDGE_BASE = {
  'minatbaca': {
    'minat': {
      'Membudaya': { advice: 'Antusiasme membaca sudah menjadi bagian dari identitas diri.', action: 'Jadikan responden sebagai "Duta Literasi" untuk menginspirasi rekan sebaya.' },
      'Berkembang': { advice: 'Minat sudah stabil namun masih terfokus pada genre tertentu.', action: 'Berikan tantangan membaca genre baru (Cross-Genre Challenge) untuk memperluas wawasan.' },
      'Sedang': { advice: 'Ketertarikan ada namun sering kalah oleh distraksi lain.', action: 'Gunakan teknik "Gamifikasi" (reward kecil setelah selesai 1 buku) untuk menjaga momentum.' },
      'Tumbuh': { advice: 'Responden masih melihat membaca sebagai beban/kewajiban.', action: 'Kenalkan "Light Reading" (Komik, Infografis, atau Cerpen) untuk membangun rasa senang dulu.' },
      'Intervensi': { advice: 'Responden merasa tidak memiliki hubungan dengan aktivitas membaca.', action: 'Pendekatan melalui audio-visual (Storytelling atau Nonton Film adaptasi buku) sebelum masuk ke teks.' }
    },
    'akses': {
      'Membudaya': { advice: 'Akses terhadap bahan bacaan sangat melimpah dan mudah.', action: 'Fokus pada kurasi bahan bacaan yang lebih berkualitas dan up-to-date.' },
      'Sedang': { advice: 'Fasilitas tersedia namun jarak atau birokrasi menjadi kendala.', action: 'Terapkan sistem "Jemput Bola" atau Kotak Literasi di titik-titik kumpul responden.' },
      'Intervensi': { advice: 'Terjadi "Kelaparan Literasi" karena ketiadaan bahan bacaan.', action: 'Pengadaan unit pojok baca darurat atau donasi buku massal di lokasi ini.' }
    },
    'default': {
      'Membudaya': { advice: 'Aspek ini telah mencapai standar keunggulan yang tinggi.', action: 'Pertahankan kualitas dan jadikan sebagai standar baku untuk lingkup lainnya.' },
      'Berkembang': { advice: 'Progres yang baik, performa berada di atas rata-rata.', action: 'Lakukan penguatan pada detail-detail kecil untuk mencapai level membudaya.' },
      'Sedang': { advice: 'Performa cukup stabil namun masih bisa ditingkatkan.', action: 'Identifikasi hambatan operasional dan lakukan aktivasi program secara rutin.' },
      'Tumbuh': { advice: 'Aspek ini baru mulai menunjukkan pertumbuhan positif.', action: 'Berikan pendampingan lebih intensif dan pastikan ketersediaan sumber daya dasar.' },
      'Intervensi': { advice: 'Aspek ini memerlukan perhatian serius dan segera.', action: 'Lakukan audit menyeluruh dan susun rencana aksi prioritas untuk perbaikan dasar.' }
    }
  },
  'literasi': {
    'program': {
      'Membudaya': { advice: 'Program literasi berjalan mandiri dan berkelanjutan.', action: 'Dokumentasikan program sebagai "Best Practice" untuk direplikasi di wilayah lain.' },
      'Sedang': { advice: 'Program ada namun bersifat seremonial (hanya saat ada lomba).', action: 'Ubah program menjadi kegiatan rutin mingguan yang sederhana namun konsisten.' },
      'Intervensi': { advice: 'Belum ada agenda literasi yang terencana.', action: 'Inisiasi satu program sederhana, misal "15 Menit Membaca Sebelum Belajar".' }
    },
    'default': {
      'Membudaya': { advice: 'Ekosistem pada aspek ini sudah sangat suportif.', action: 'Teruskan inovasi dan bagikan keberhasilan ini kepada unit atau lembaga lain.' },
      'Berkembang': { advice: 'Struktur ekosistem sudah terbentuk dengan baik.', action: 'Tingkatkan partisipasi aktif dari seluruh elemen pemangku kepentingan.' },
      'Sedang': { advice: 'Dukungan ekosistem sudah ada namun belum optimal.', action: 'Perkuat koordinasi antar bagian dan pastikan program berjalan terjadwal.' },
      'Tumbuh': { advice: 'Pondasi ekosistem baru saja mulai diletakkan.', action: 'Fokus pada sosialisasi pentingnya literasi bagi seluruh anggota ekosistem.' },
      'Intervensi': { advice: 'Ekosistem pada aspek ini masih sangat lemah.', action: 'Susun kebijakan tertulis yang mewajibkan dukungan terhadap aktivitas literasi.' }
    }
  }
};

const getAdviceContent = (surveyType, variabel, level) => {
  const typeBase = KNOWLEDGE_BASE[surveyType] || KNOWLEDGE_BASE['literasi'];
  const varKey = Object.keys(typeBase).find(k => variabel.toLowerCase().includes(k)) || 'default';
  const content = typeBase[varKey][level] || typeBase['default'][level] || typeBase['default']['Sedang'];
  return content;
};

export default function QualitativeAdvice({ surveyType, lingkup, clusters, categoricalData = [] }) {
  if (!clusters || clusters.length === 0) return null;

  // Hybrid Logic: Find top barriers
  const barriers = categoricalData.find(c => c.variabel.toLowerCase().includes('hambatan'))?.data || [];
  const topBarrier = barriers.length > 0 ? barriers[0].label : null;

  const advices = clusters.map(c => {
    const maturity = getMaturity(c.avg, surveyType);
    const content = getAdviceContent(surveyType, c.variabel, maturity.label);
    
    let action = content.action;
    
    // Inject Hybrid Logic if barrier matches
    if (topBarrier) {
      if (topBarrier.toLowerCase().includes('hp') || topBarrier.toLowerCase().includes('gadget')) {
        action += ' Disarankan juga untuk mengarahkan ke perpustakaan digital (e-library) agar penggunaan gadget menjadi lebih produktif.';
      } else if (topBarrier.toLowerCase().includes('waktu')) {
        action += ' Terapkan teknik "Micro-reading" (baca 5-10 menit) untuk mengatasi kendala keterbatasan waktu.';
      } else if (topBarrier.toLowerCase().includes('menarik') || topBarrier.toLowerCase().includes('bahan')) {
        action += ' Lakukan peremajaan koleksi buku sesuai dengan genre yang paling diminati responden.';
      }
    }

    return {
      variabel: c.variabel,
      level: maturity.label,
      cls: maturity.cls,
      bg: maturity.bg,
      score: c.avg.toFixed(2),
      ...content,
      action
    };
  });

  return (
    <div className="bg-slate-900 rounded-[3rem] p-8 md:p-12 shadow-2xl mt-12 text-white relative overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-sky-500 rounded-full blur-[120px] opacity-10"></div>
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 bg-emerald-500 rounded-full blur-[120px] opacity-10"></div>
      
      <div className="relative z-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 bg-gradient-to-tr from-sky-600 to-emerald-500 rounded-2xl flex items-center justify-center shadow-lg shadow-sky-500/20">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <div>
              <h3 className="text-3xl font-black uppercase tracking-tight text-white leading-none mb-2">Konsultan Strategis AI</h3>
              <p className="text-slate-400 text-sm font-medium tracking-wide">Rencana Aksi Komprehensif Berdasarkan Level Kedewasaan Variabel</p>
            </div>
          </div>
          <div className="px-5 py-2 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-sky-400 block mb-1">Status Analisis</span>
            <span className="text-xs font-bold text-slate-200 uppercase">100% Holistik & Terintegrasi</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {advices.map((advice, idx) => (
            <div key={idx} className="group bg-white/5 hover:bg-white/[0.08] rounded-[2rem] p-8 border border-white/10 transition-all duration-500">
              <div className="flex items-center justify-between mb-6">
                <div className={`px-4 py-1.5 rounded-full ${advice.bg} ${advice.cls} text-[10px] font-black uppercase tracking-widest border border-current/20`}>
                  Level: {advice.level}
                </div>
                <div className="text-right">
                  <span className="text-2xl font-black text-white">{advice.score}</span>
                  <span className="text-[10px] text-slate-500 font-bold ml-1">/ {surveyType === 'minatbaca' ? '5.00' : '4.00'}</span>
                </div>
              </div>

              <div className="mb-6">
                <h4 className="text-xl font-black text-white mb-2 group-hover:text-sky-400 transition-colors uppercase tracking-tight">{advice.variabel}</h4>
                <p className="text-slate-400 text-sm leading-relaxed font-medium">
                  {advice.advice}
                </p>
              </div>

              <div className="bg-white/5 rounded-2xl p-5 border border-white/5 group-hover:border-sky-500/30 transition-all">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse"></div>
                  <p className="text-sky-400 text-[10px] font-black uppercase tracking-[0.2em]">Prioritas Strategi</p>
                </div>
                <p className="text-slate-200 text-sm leading-relaxed font-bold italic">
                  "{advice.action}"
                </p>
              </div>
            </div>
          ))}
        </div>
        
        {/* Footer info */}
        <div className="mt-12 pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em]">Sekolah Literasi Indonesia © 2026</p>
          <div className="flex items-center gap-2 text-sky-500/50">
            <span className="w-2 h-2 rounded-full bg-current"></span>
            <span className="w-2 h-2 rounded-full bg-current opacity-60"></span>
            <span className="w-2 h-2 rounded-full bg-current opacity-30"></span>
          </div>
        </div>
      </div>
    </div>
  );
}
