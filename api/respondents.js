import { getDb } from './_db.js';
import { respondents, results } from '../src/db/schema.js';
import { eq, and, ilike } from 'drizzle-orm';

function buildFuzzyWhere(column, value) {
  if (!value || value.trim() === '') return null;
  const fuzzy = '%' + value.trim().replace(/[^a-zA-Z0-9]/g, '%') + '%';
  return ilike(column, fuzzy);
}

function buildWhere(type, tbmVisit, lingkup, kabupaten, desa, sekolah, tbm) {
  const conds = [ilike(respondents.surveyType, `%${type.trim()}%`)];
  
  if (tbmVisit && tbmVisit !== 'Semua') {
    conds.push(buildFuzzyWhere(respondents.noTbm, tbmVisit));
  }
  
  if (lingkup && lingkup !== 'all') {
    conds.push(buildFuzzyWhere(respondents.lingkup, lingkup));
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
  
  return and(...conds.filter(Boolean));
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const db = getDb();
    const { 
      type = 'literasi', 
      tbmVisit,
      lingkup,
      kabupaten,
      desa,
      sekolah,
      tbm
    } = req.query;

    const where = buildWhere(type, tbmVisit || '', lingkup || 'all', kabupaten || '', desa || '', sekolah || '', tbm || '');

    const rows = await db.select({
      id: respondents.id,
      nama: respondents.nama,
      kabupaten: respondents.kabupaten,
      desa: respondents.desa,
      sekolah: respondents.sekolah,
      tbm: respondents.tbm,
      rt: respondents.rt,
      rw: respondents.rw,
      surveyType: respondents.surveyType,
      lingkup: respondents.lingkup,
      createdAt: respondents.createdAt,
      weightedAvg: results.weightedAvg,
      category: results.category,
    })
      .from(respondents)
      .leftJoin(results, eq(respondents.id, results.respondentId))
      .where(where);

    return res.status(200).json(rows);
  } catch (error) {
    console.error('SERVER ERROR (Respondents):', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}
