import { getDb } from './_db.js';
import { respondents, answers } from '../src/db/schema.js';
import { eq, and, count, ilike, sql } from 'drizzle-orm';

function buildFuzzyWhere(column, value) {
  if (!value || value.trim() === '') return null;
  const fuzzy = '%' + value.trim().replace(/[^a-zA-Z0-9]/g, '%') + '%';
  return ilike(column, fuzzy);
}

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
      sekolah,
      tbm
    } = req.query;

    console.log('DEBUG: Categorical API Query:', JSON.stringify(req.query, null, 2));

    if (!lingkup) {
      return res.status(400).json({ error: 'lingkup is required' });
    }

    const conds = [];
    conds.push(buildFuzzyWhere(respondents.surveyType, type));
    conds.push(buildFuzzyWhere(respondents.lingkup, lingkup));
    
    if (tbmVisit && tbmVisit !== 'Semua') {
      conds.push(ilike(respondents.noTbm, `%${tbmVisit.trim()}%`));
    }
    if (kabupaten && kabupaten.trim() !== '') {
      conds.push(buildFuzzyWhere(respondents.kabupaten, kabupaten));
    }
    if (desa && desa.trim() !== '') {
      conds.push(buildFuzzyWhere(respondents.desa, desa));
    }
    if (sekolah && sekolah.trim() !== '') {
      conds.push(buildFuzzyWhere(respondents.sekolah, sekolah));
    }
    if (tbm && tbm.trim() !== '') {
      conds.push(buildFuzzyWhere(respondents.tbm, tbm));
    }

    const rows = await db.select({
      indicator: answers.questionCode,
      value: answers.value,
      count: count(answers.id),
    })
      .from(answers)
      .innerJoin(respondents, eq(answers.respondentId, respondents.id))
      .where(and(...conds.filter(Boolean)))
      .groupBy(answers.questionCode, answers.value)
      .orderBy(answers.questionCode, answers.value);

    console.log('DEBUG: Categorical API Result Count:', rows.length);

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
