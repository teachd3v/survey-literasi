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

    console.log('DEBUG: Payload diterima:', JSON.stringify({ surveyType, lingkup, identity }, null, 2));

    if (!identity || !surveyAnswers || !result) {
      return res.status(400).json({ success: false, error: 'Payload tidak lengkap' });
    }

    // 1. Simpan Data Responden (Identity) ke tabel 'respondents'
    console.log('DEBUG: Menyimpan responden...');
    const result_insert = await db.insert(respondents).values({
      surveyType,
      lingkup,
      nama: identity.nama || identity.responden_nama || '',
      kabupaten: identity.kabupaten || '',
      desa: identity.desa || '',
      sekolah: identity.sekolah || '',
      tbm: identity.tbm || '',
      rt: identity.rt || '',
      rw: identity.rw || '',
      noTbm: identity.no_tbm || 'Tidak pernah',
    }).returning();

    if (!result_insert || result_insert.length === 0) {
      throw new Error('Gagal menyimpan responden: Database tidak mengembalikan data');
    }
    const insertedRespondent = result_insert[0];
    console.log('DEBUG: Responden disimpan, ID:', insertedRespondent.id);

    // 2. Simpan Semua Jawaban ke tabel 'answers'
    console.log('DEBUG: Menyimpan jawaban...');
    const answerRows = [];
    Object.entries(surveyAnswers).forEach(([code, val]) => {
      const parsedVal = parseInt(val);
      if (Array.isArray(val)) {
        val.forEach(v => {
          const pv = parseInt(v);
          if (!isNaN(pv)) {
            answerRows.push({
              respondentId: insertedRespondent.id,
              questionCode: code,
              value: pv,
            });
          }
        });
      } else if (!isNaN(parsedVal)) {
        answerRows.push({
          respondentId: insertedRespondent.id,
          questionCode: code,
          value: parsedVal,
        });
      }
    });

    if (answerRows.length > 0) {
      await db.insert(answers).values(answerRows);
    }
    console.log(`DEBUG: ${answerRows.length} jawaban disimpan.`);

    // 3. Simpan Hasil Skor Akhir ke tabel 'results'
    console.log('DEBUG: Menyimpan hasil...');
    await db.insert(results).values({
      respondentId: insertedRespondent.id,
      totalScore: result.score.toString(),
      weightedAvg: result.weightedAvg.toString(),
      category: result.category,
    });

    console.log('DEBUG: Berhasil simpan semua data.');

    return res.status(200).json({ 
      success: true, 
      userId: insertedRespondent.id,
      message: 'Data berhasil disimpan ke Neon DB' 
    });

  } catch (error) {
    console.error('SERVER ERROR (Submit Neon):', error);
    return res.status(500).json({ 
      success: false, 
      error: error.message,
      details: error.toString()
    });
  }
}
