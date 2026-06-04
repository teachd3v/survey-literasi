import { getDb } from './_db.js';
import { respondents, answers } from '../src/db/schema.js';
import { eq, avg, and, ilike, sql } from 'drizzle-orm';

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

    console.log('DEBUG: Indicators API Query:', JSON.stringify(req.query, null, 2));

    if (!lingkup) {
      return res.status(400).json({ error: 'lingkup is required' });
    }

    const conds = [];
    
    // Robust Matching for all params
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

    const filteredConds = conds.filter(Boolean);

    const rows = await db.select({
      indicator: answers.questionCode,
      value: avg(answers.value),
    })
      .from(answers)
      .innerJoin(respondents, eq(answers.respondentId, respondents.id))
      .where(and(...filteredConds))
      .groupBy(answers.questionCode);

    console.log('DEBUG: Indicators API Result Count:', rows.length);

    return res.status(200).json(
      rows.map(row => ({
        indicator: row.indicator,
        value: parseFloat(row.value) || 0,
      }))
    );

  } catch (error) {
    console.error('SERVER ERROR (Indicators):', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}
