import { getDb } from './_db.js';
import { respondents, answers } from '../src/db/schema.js';
import { eq, and, count, ilike, sql } from 'drizzle-orm';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const db = getDb();
    const { 
      type = 'literasi', 
      lingkup, 
      tbmVisit,
      kabupaten,
      desa,
      sekolah
    } = req.query;

    if (!lingkup) {
      return res.status(400).json({ error: 'lingkup is required' });
    }

    const conds = [
      ilike(respondents.surveyType, `%${type.trim()}%`),
      ilike(respondents.lingkup, `%${lingkup.trim()}%`),
    ];
    
    if (tbmVisit && tbmVisit !== 'Semua') {
      conds.push(ilike(respondents.noTbm, `%${tbmVisit.trim()}%`));
    }
    if (kabupaten && kabupaten.trim() !== '') {
      conds.push(ilike(respondents.kabupaten, `%${kabupaten.trim().replace(/[^a-zA-Z0-9]/g, '%')}%`));
    }
    if (desa && desa.trim() !== '') {
      conds.push(ilike(respondents.desa, `%${desa.trim().replace(/[^a-zA-Z0-9]/g, '%')}%`));
    }
    if (sekolah && sekolah.trim() !== '') {
      conds.push(ilike(respondents.sekolah, `%${sekolah.trim().replace(/[^a-zA-Z0-9]/g, '%')}%`));
    }

    const rows = await db.select({
      indicator: answers.questionCode,
      value: answers.value,
      count: count(answers.id),
    })
      .from(answers)
      .innerJoin(respondents, eq(answers.respondentId, respondents.id))
      .where(and(...conds))
      .groupBy(answers.questionCode, answers.value)
      .orderBy(answers.questionCode, answers.value);

    const result = {};
    rows.forEach(row => {
      if (!result[row.indicator]) {
        result[row.indicator] = [];
      }
      result[row.indicator].push({
        option: row.value,
        count: parseInt(row.count),
      });
    });

    return res.status(200).json(result);

  } catch (error) {
    console.error('SERVER ERROR (Categorical Stats):', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}
