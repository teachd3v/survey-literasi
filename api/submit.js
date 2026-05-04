import { getDb } from './_db.js';
import { respondents, answers, results } from '../src/db/schema.js';

export default async function handler(req, res) {
  // Hanya izinkan method POST
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const db = getDb();
    const { identity, answers: surveyAnswers, result, surveyType, lingkup } = req.body;

    console.log('DEBUG: Menerima data survey untuk lingkup:', lingkup);

    // 1. Simpan Data Responden (Identity) ke tabel 'respondents'
    const [insertedRespondent] = await db.insert(respondents).values({
      surveyType,
      lingkup,
      nama: identity.nama || identity.responden_nama || '',
      kabupaten: identity.kabupaten || '',
      desa: identity.desa || '',
      sekolah: identity.sekolah || '',
      tbm: identity.tbm || '',
      rt: identity.rt || '',
      rw: identity.rw || '',
      noTbm: identity.no_tbm === 'YA' || identity.no_tbm === true,
    }).returning();

    // 2. Simpan Semua Jawaban ke tabel 'answers'
    // Kita map object { "S1.1": 4, "S1.2": 3 } jadi array of objects
    const answerRows = Object.entries(surveyAnswers).map(([code, val]) => ({
      respondentId: insertedRespondent.id,
      questionCode: code,
      value: parseInt(val),
    }));

    if (answerRows.length > 0) {
      await db.insert(answers).values(answerRows);
    }

    // 3. Simpan Hasil Skor Akhir ke tabel 'results'
    await db.insert(results).values({
      respondentId: insertedRespondent.id,
      totalScore: result.score.toString(),
      weightedAvg: (result.score / 100).toFixed(2), // Asumsi score dlm persen
      category: result.category,
    });

    console.log('DEBUG: Berhasil simpan ke Neon DB. ID:', insertedRespondent.id);

    return res.status(200).json({ 
      success: true, 
      userId: insertedRespondent.id,
      message: 'Data berhasil disimpan ke Neon DB' 
    });

  } catch (error) {
    console.error('SERVER ERROR (Submit Neon):', error);
    return res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
}
