import React from 'react';

// Fungsi untuk memberikan rekomendasi kualitatif berdasarkan ruleset
const generateAdvice = (surveyType, lingkup, clusters) => {
  if (!clusters || clusters.length === 0) return [];

  const adviceList = [];
  
  // Buat dictionary map untuk memudahkan pencarian nilai rata-rata per variabel
  const scoreMap = {};
  clusters.forEach(c => {
    // Kita gunakan lowercase untuk pencocokan yang lebih fleksibel
    scoreMap[c.variabel.toLowerCase()] = c.avg;
  });

  // Helper untuk mendapatkan skor (mengatasi perbedaan penamaan variabel)
  const getScore = (keywords) => {
    const key = Object.keys(scoreMap).find(k => keywords.some(word => k.includes(word)));
    return key ? scoreMap[key] : null;
  };

  const HIGH = 3.0; // Skor >= 3.0 dianggap tinggi/baik
  const LOW = 2.5;  // Skor <= 2.5 dianggap rendah/perlu intervensi

  if (surveyType === 'minatbaca') {
    const minat = getScore(['minat']);
    const perilaku = getScore(['perilaku']);
    const akses = getScore(['akses', 'fasilitas']);
    const lingkungan = getScore(['lingkungan']);
    const motivasi = getScore(['motivasi']);

    // Rule 1: Minat Tinggi, Perilaku Rendah (Niat ada, aksi kurang)
    if (minat >= HIGH && perilaku < HIGH) {
      adviceList.push({
        title: 'Gap antara Ketertarikan dan Kebiasaan',
        desc: 'Responden memiliki ketertarikan yang tinggi terhadap bacaan, namun belum menjadi rutinitas. Perlu dorongan untuk mengubah "minat" menjadi "kebiasaan".',
        action: 'Sediakan waktu khusus membaca (jam baca senyap 15 menit/hari) dan dekatkan bahan bacaan dengan aktivitas keseharian mereka.'
      });
    }

    // Rule 2: Akses Tinggi, Minat Rendah (Fasilitas nganggur)
    if (akses >= HIGH && minat < HIGH) {
      adviceList.push({
        title: 'Fasilitas Memadai, Namun Daya Tarik Kurang',
        desc: 'Buku dan fasilitas baca sudah tersedia dan mudah diakses, tetapi minat responden masih rendah.',
        action: 'Ubah strategi promosi. Alih-alih hanya "menyediakan buku", buatlah kegiatan interaktif seperti bedah buku santai, mendongeng, atau sediakan buku yang lebih relevan dengan hobi spesifik mereka.'
      });
    }

    // Rule 3: Lingkungan Rendah
    if (lingkungan <= LOW) {
      adviceList.push({
        title: 'Lingkungan Kurang Suportif',
        desc: 'Kondisi lingkungan sekitar (keluarga/teman) kurang mendukung aktivitas literasi.',
        action: 'Perlu pelibatan tokoh panutan (role model). Jadikan orang tua atau tokoh masyarakat sebagai agen yang memberikan contoh membaca secara langsung.'
      });
    }

    // Rule 4: Motivasi Rendah
    if (motivasi <= LOW) {
      adviceList.push({
        title: 'Motivasi Intrinsik Rendah',
        desc: 'Responden belum melihat nilai tambah atau manfaat personal dari membaca.',
        action: 'Tunjukkan relevansi buku dengan cita-cita atau masalah sehari-hari yang mereka hadapi. Gunakan pendekatan bacaan populer atau digital.'
      });
    }

  } else { // surveyType === 'literasi' (Ekosistem)
    const sarana = getScore(['sarana', 'fasilitas']);
    const program = getScore(['program', 'aktivitas']);
    const kolaborasi = getScore(['kolaborasi', 'kemitraan']);
    const kebijakan = getScore(['kebijakan', 'partisipasi']);

    // Rule 1: Sarana Tinggi, Program Rendah
    if (sarana >= HIGH && program < HIGH) {
      adviceList.push({
        title: 'Optimalisasi Infrastruktur Literasi',
        desc: 'Infrastruktur (perpustakaan/sudut baca) sudah sangat baik, namun pemanfaatannya lewat program/kegiatan masih sangat minim.',
        action: 'Gencarkan program aktivasi seperti lomba resensi buku, klub baca mingguan, atau wisata literasi agar fasilitas tidak menjadi "pajangan" saja.'
      });
    }

    // Rule 2: Program Berjalan, Tapi Kolaborasi Rendah
    if (program >= HIGH && kolaborasi <= LOW) {
      adviceList.push({
        title: 'Perluasan Ekosistem Lewat Kemitraan',
        desc: 'Program literasi berjalan baik, namun masih dikerjakan secara eksklusif (sendiri-sendiri).',
        action: 'Segera inisiasi kemitraan dengan penerbit, dinas perpustakaan, komunitas lokal, atau CSR perusahaan untuk memperluas dampak dan pendanaan program.'
      });
    }

    // Rule 3: Kebijakan/Partisipasi Lemah
    if (kebijakan <= LOW) {
      adviceList.push({
        title: 'Kekosongan Payung Kebijakan',
        desc: `Komitmen dari level pengambil keputusan di lingkup ${lingkup} masih lemah.`,
        action: 'Dorong pembuatan regulasi tertulis (misal: SK Kepala Sekolah, Peraturan Desa, atau Kesepakatan Jam Belajar Keluarga) yang mewajibkan waktu dedikatif untuk literasi.'
      });
    }
  }

  // Fallback if everything is somewhat average
  if (adviceList.length === 0) {
    adviceList.push({
      title: 'Pemeliharaan dan Peningkatan Bertahap',
      desc: 'Sebagian besar indikator berada pada level rata-rata atau berkembang. Tidak ada ketimpangan ekstrem yang terdeteksi.',
      action: 'Pertahankan program yang sudah berjalan, lakukan evaluasi berkala, dan fokus pada peningkatan kualitas bahan bacaan yang lebih bervariasi.'
    });
  }

  return adviceList;
};

export default function QualitativeAdvice({ surveyType, lingkup, clusters }) {
  if (!clusters || clusters.length === 0) return null;

  const advices = generateAdvice(surveyType, lingkup, clusters);

  return (
    <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-[2.5rem] p-8 md:p-10 shadow-2xl mt-8 text-white relative overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-sky-500 rounded-full blur-[80px] opacity-20"></div>
      
      <div className="relative z-10">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-14 h-14 bg-sky-500/20 rounded-2xl flex items-center justify-center border border-sky-400/30">
            <svg className="w-7 h-7 text-sky-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <div>
            <h3 className="text-2xl font-black uppercase tracking-tight text-white">Saran Intervensi AI</h3>
            <p className="text-slate-400 text-sm font-medium">Analisis kualitatif berdasarkan ketimpangan skor antar rumpun</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {advices.map((advice, idx) => (
            <div key={idx} className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700 backdrop-blur-sm">
              <div className="flex items-center gap-3 mb-3">
                <span className="w-6 h-6 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center font-black text-xs shrink-0">!</span>
                <h4 className="text-lg font-bold text-white leading-tight">{advice.title}</h4>
              </div>
              <p className="text-slate-300 text-sm mb-4 leading-relaxed">
                {advice.desc}
              </p>
              <div className="bg-sky-900/30 rounded-xl p-4 border border-sky-800/50">
                <p className="text-sky-300 text-xs font-black uppercase tracking-widest mb-1">Rekomendasi Aksi:</p>
                <p className="text-sky-100 text-sm leading-relaxed">{advice.action}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
