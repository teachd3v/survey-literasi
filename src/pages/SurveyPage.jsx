// src/pages/SurveyPage.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import QuestionStep from '../components/survey/QuestionStep';
import { fetchInstrumen, fetchIdentityValidation } from '../services/googleSheets';
import { submitToNeon } from '../services/neon';

// Konfigurasi field identitas berdasarkan lingkup
const IDENTITY_CONFIG = {
  'SEKOLAH': ['nama', 'kabupaten', 'sekolah'],
  'KELUARGA': ['nama', 'kabupaten', 'desa', 'rt', 'rw'],
  'MASYARAKAT': ['nama', 'kabupaten', 'desa', 'tbm'],
  'SD KELAS 1-3': ['nama', 'kabupaten', 'desa', 'sekolah', 'no_tbm'],
  'SD KELAS 4-6': ['nama', 'kabupaten', 'desa', 'sekolah', 'no_tbm'],
  'SMP-SMA': ['nama', 'kabupaten', 'desa', 'sekolah', 'no_tbm'],
  'DEWASA': ['nama', 'kabupaten', 'desa', 'rt', 'rw'],
};

// Helper untuk label input
const FIELD_LABELS = {
  nama: 'Nama Lengkap',
  kabupaten: 'Kabupaten / Kota',
  sekolah: 'Nama Sekolah',
  desa: 'Kelurahan / Desa',
  tbm: 'Nama TBM (Tempat Baca Masyarakat)',
  rt: 'RT',
  rw: 'RW',
  no_tbm: 'Saya Tidak Pernah Ke TBM'
};

export default function SurveyPage({ type = 'literasi' }) {
  const { lingkupParam } = useParams();
  const navigate = useNavigate();
  const lingkup = lingkupParam ? decodeURIComponent(lingkupParam).toUpperCase() : null;

  const [step, setStep] = useState('IDENTITY'); 
  const [identity, setIdentity] = useState({ 
    nama: '', kabupaten: '', sekolah: '', desa: '', tbm: '', rt: '', rw: '', no_tbm: false 
  });
  const [answers, setAnswers] = useState({});
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [surveyQuestions, setSurveyQuestions] = useState(null);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [validationData, setValidationData] = useState({});

  // Load validation data untuk dropdown identitas
  useEffect(() => {
    fetchIdentityValidation().then(setValidationData).catch(console.error);
  }, []);

  // Derived options untuk cascading dropdown
  const kabupatenList = Object.keys(validationData).sort();
  const desaList = identity.kabupaten ? Object.keys(validationData[identity.kabupaten] || {}).sort() : [];
  const sekolahList = (() => {
    if (!identity.kabupaten) return [];
    const kData = validationData[identity.kabupaten] || {};
    if (identity.desa && kData[identity.desa]) return kData[identity.desa].sekolah;
    return Object.values(kData).flatMap(d => d.sekolah);
  })();

  const handleIdentityChange = (field, value) => {
    if (field === 'kabupaten') {
      setIdentity(prev => ({ ...prev, kabupaten: value, desa: '', tbm: '', sekolah: '' }));
    } else if (field === 'desa') {
      const tbmVal = validationData[identity.kabupaten]?.[value]?.tbm || '';
      setIdentity(prev => ({ ...prev, desa: value, tbm: tbmVal, sekolah: '' }));
    } else {
      setIdentity(prev => ({ ...prev, [field]: value }));
    }
  };

  // Confetti saat berhasil
  useEffect(() => {
    if (step === 'SUCCESS' && window.confetti) {
      window.confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
    }
  }, [step]);

  // Load instrumen
  useEffect(() => {
    async function loadInstrumen() {
      try {
        const sheetName = type === 'minatbaca' ? 'instrumen_minatbaca' : 'instrumen_literasi';
        const data = await fetchInstrumen(sheetName);
        if (data) setSurveyQuestions(data);
        else setFetchError("Data instrumen gagal dimuat.");
      } catch (err) {
        setFetchError(err.message);
      } finally {
        setIsLoadingQuestions(false);
      }
    }
    loadInstrumen();
  }, [type]);

  const handleIdentitySubmit = (e) => {
    e.preventDefault();
    setStep('QUESTIONS');
  };

  const handleAnswer = (val) => {
    const q = surveyQuestions[lingkup][currentQuestionIdx];
    setAnswers(prev => ({ ...prev, [q.kode]: val }));
  };

  const nextQuestion = () => {
    if (currentQuestionIdx < surveyQuestions[lingkup].length - 1) {
      setCurrentQuestionIdx(prev => prev + 1);
    } else {
      setStep('REVIEW');
    }
  };

  const prevQuestion = () => {
    if (currentQuestionIdx > 0) {
      setCurrentQuestionIdx(prev => prev - 1);
    } else {
      setStep('IDENTITY');
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const questions = surveyQuestions[lingkup];
      
      // Hitung total bobot untuk auto-normalisasi
      const totalBobot = questions.reduce((sum, q) => sum + (parseFloat(q.bobot) || 1), 0);
      
      // Hitung skor terskala otomatis
      let totalWeightedScore = 0;
      questions.forEach(q => {
        const val = answers[q.kode] || 0;
        const currentBobot = parseFloat(q.bobot) || 1;
        const proporsionalBobot = totalBobot > 0 ? (currentBobot / totalBobot) : 0;
        
        // Asumsi nilai max per soal adalah 4. Jika bobot dinormalkan (sum = 1), max total = 4.0
        totalWeightedScore += (val * proporsionalBobot);
      });

      // Kalkulasi kategori (Logika sederhana)
      let category = 'Perlu Perhatian';
      if (totalWeightedScore >= 3.6) category = 'Sangat Baik';
      else if (totalWeightedScore >= 3.0) category = 'Baik';
      else if (totalWeightedScore >= 2.0) category = 'Berkembang';

      const payload = {
        surveyType: type,
        lingkup,
        identity,
        answers,
        result: {
          score: (totalWeightedScore * 25).toFixed(2), // Skala 100
          weightedAvg: totalWeightedScore.toFixed(2),
          category
        }
      };

      await submitToNeon(payload);
      setStep('SUCCESS');
    } catch (error) {
      alert(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingQuestions) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-sky-200 border-t-sky-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 font-bold">Memuat Instrumen...</p>
        </div>
      </div>
    );
  }

  if (fetchError || !surveyQuestions) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /></svg>
          </div>
          <h2 className="text-xl font-black text-slate-900 mb-2">Gagal Memuat Instrumen</h2>
          <p className="text-slate-500 text-sm mb-6">{fetchError || 'Data instrumen tidak tersedia.'}</p>
          <button onClick={() => window.location.reload()} className="px-6 py-3 rounded-xl font-bold bg-sky-600 text-white">Coba Lagi</button>
        </div>
      </div>
    );
  }

  const activeFields = IDENTITY_CONFIG[lingkup] || ['nama', 'kabupaten'];

  if (step === 'IDENTITY') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="w-full max-w-xl bg-white rounded-[2.5rem] border border-slate-200 p-8 md:p-12 shadow-2xl">
          <button onClick={() => navigate(type === 'minatbaca' ? '/minatbaca' : '/literasi')} className="flex items-center gap-2 text-slate-400 hover:text-slate-700 font-black text-xs uppercase tracking-widest mb-8 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
            Pilih Lingkup Lain
          </button>
          <div className="mb-10">
            <h2 className="text-3xl font-black text-slate-900 mb-2">Data Diri</h2>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">{lingkup}</p>
          </div>
          <form onSubmit={handleIdentitySubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {activeFields.map(field => {
                const baseSelect = "w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 text-slate-900 font-bold focus:outline-none focus:border-sky-500 focus:bg-white transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed";
                const baseInput = "w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 text-slate-900 font-bold focus:outline-none focus:border-sky-500 focus:bg-white transition-all uppercase";

                if (field === 'no_tbm') return (
                  <div key={field} className="md:col-span-2 flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border-2 border-slate-100">
                    <input type="checkbox" id={field} className="w-5 h-5 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                      checked={identity[field]} onChange={e => handleIdentityChange(field, e.target.checked)} />
                    <label htmlFor={field} className="text-slate-700 font-bold text-sm">{FIELD_LABELS[field]}</label>
                  </div>
                );

                if (field === 'kabupaten') return (
                  <div key={field}>
                    <label className="block text-slate-500 font-black uppercase tracking-widest text-[10px] mb-2 ml-1">{FIELD_LABELS[field]}</label>
                    <select required className={baseSelect} value={identity.kabupaten} onChange={e => handleIdentityChange('kabupaten', e.target.value)}>
                      <option value="">— Pilih Kabupaten —</option>
                      {kabupatenList.map(k => <option key={k} value={k}>{k}</option>)}
                    </select>
                  </div>
                );

                if (field === 'desa') return (
                  <div key={field}>
                    <label className="block text-slate-500 font-black uppercase tracking-widest text-[10px] mb-2 ml-1">{FIELD_LABELS[field]}</label>
                    <select required disabled={!identity.kabupaten} className={baseSelect} value={identity.desa} onChange={e => handleIdentityChange('desa', e.target.value)}>
                      <option value="">{identity.kabupaten ? '— Pilih Desa —' : '— Pilih kabupaten dulu —'}</option>
                      {desaList.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                );

                if (field === 'sekolah') return (
                  <div key={field} className="md:col-span-2">
                    <label className="block text-slate-500 font-black uppercase tracking-widest text-[10px] mb-2 ml-1">{FIELD_LABELS[field]}</label>
                    <select required disabled={sekolahList.length === 0} className={baseSelect} value={identity.sekolah} onChange={e => handleIdentityChange('sekolah', e.target.value)}>
                      <option value="">{sekolahList.length === 0 ? '— Pilih kabupaten/desa dulu —' : '— Pilih Sekolah —'}</option>
                      {sekolahList.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                );

                if (field === 'tbm') return (
                  <div key={field} className="md:col-span-2">
                    <label className="block text-slate-500 font-black uppercase tracking-widest text-[10px] mb-2 ml-1">{FIELD_LABELS[field]}</label>
                    <div className="w-full bg-slate-100 border-2 border-slate-100 rounded-2xl px-6 py-4 text-slate-700 font-bold min-h-[58px] flex items-center">
                      {identity.tbm || <span className="text-slate-400 font-medium text-sm normal-case">Otomatis terisi setelah memilih desa</span>}
                    </div>
                  </div>
                );

                return (
                  <div key={field} className={field === 'nama' ? 'md:col-span-2' : ''}>
                    <label className="block text-slate-500 font-black uppercase tracking-widest text-[10px] mb-2 ml-1">{FIELD_LABELS[field]}</label>
                    <input required type="text" placeholder={`Isi ${FIELD_LABELS[field]}...`} className={baseInput}
                      value={identity[field]} onChange={e => handleIdentityChange(field, e.target.value.toUpperCase())} />
                  </div>
                );
              })}
            </div>
            <button type="submit" className="w-full py-4 rounded-xl font-bold bg-gradient-to-r from-brand-cyan to-brand-light text-white shadow-lg hover:shadow-cyan-500/50 mt-4 transition-all active:scale-[0.98]">
              Lanjut Ke Pertanyaan →
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ... (Tampilan QUESTIONS, REVIEW, SUCCESS tetap sama seperti sebelumnya)
  // [Untuk menghemat ruang, bagian QUESTIONS & SUCCESS tidak saya tulis ulang semua karena logikanya identik]
  
  if (step === 'QUESTIONS') {
    const questions = surveyQuestions[lingkup];
    const q = questions[currentQuestionIdx];
    return <QuestionStep question={q} currentStep={currentQuestionIdx + 1} totalSteps={questions.length} value={answers[q.kode]} onChange={handleAnswer} onNext={nextQuestion} onPrev={prevQuestion} />;
  }

  if (step === 'REVIEW') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl bg-white rounded-[2.5rem] border border-slate-200 p-8 shadow-2xl">
          <h2 className="text-3xl font-black text-slate-900 mb-6">Review Jawaban</h2>
          <div className="space-y-3 mb-8 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
            {surveyQuestions[lingkup].map(q => (
              <div key={q.kode} className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex justify-between items-center">
                <p className="text-slate-700 text-sm font-bold line-clamp-1">{q.indikator}</p>
                <span className="shrink-0 w-8 h-8 rounded-lg bg-sky-600 text-white flex items-center justify-center font-black">{answers[q.kode] || 0}</span>
              </div>
            ))}
          </div>
          <div className="flex gap-4">
            <button onClick={() => setStep('QUESTIONS')} className="flex-1 py-4 rounded-2xl font-black text-slate-400 border-2 border-slate-100">← Edit</button>
            <button onClick={handleSubmit} disabled={isSubmitting} className="flex-1 py-4 rounded-2xl font-black bg-sky-600 text-white shadow-xl disabled:opacity-50">
              {isSubmitting ? 'Mengirim...' : 'Kirim Sekarang →'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'SUCCESS') {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="text-center max-w-lg">
          <div className="w-20 h-20 bg-emerald-500 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl animate-bounce">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" /></svg>
          </div>
          <h2 className="text-4xl font-black text-slate-900 mb-4">Berhasil!</h2>
          <p className="text-slate-500 mb-12">Data Anda telah tersimpan. Terima kasih atas partisipasinya.</p>
          <div className="flex flex-col gap-4">
            <button onClick={() => navigate('/dashboard')} className="w-full py-5 rounded-2xl font-black bg-slate-900 text-white">Lihat Dashboard →</button>
            <button onClick={() => navigate('/')} className="w-full py-5 rounded-2xl font-black border-2 border-slate-200 text-slate-600 hover:border-slate-400 transition-all">← Survey Lain</button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
