import { getDb } from './_db.js';
import { respondents, results } from '../src/db/schema.js';
import { eq, avg, count, and, ilike, sql } from 'drizzle-orm';

const VALID_GROUP_BY = ['kabupaten', 'tbm', 'sekolah', 'desa_rt', 'desa_sekolah'];

function buildFuzzyWhere(column, value) {
  if (!value || value.trim() === '') return null;
  const fuzzy = '%' + value.trim().replace(/[^a-zA-Z0-9]/g, '%') + '%';
  return ilike(column, fuzzy);
}

function buildWhere(type, extraCond, tbmVisit, lingkup, kabupaten, desa, sekolah) {
  const conds = [ilike(respondents.surveyType, `%${type.trim()}%`)];
  if (extraCond) conds.push(extraCond);
  
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
      groupBy = 'kabupaten', 
      tbmVisit,
      lingkup,
      kabupaten: fKabupaten,
      desa: fDesa,
      sekolah: fSekolah
    } = req.query;

    if (!VALID_GROUP_BY.includes(groupBy)) {
      return res.status(400).json({ error: 'Invalid groupBy parameter' });
    }

    const where = buildWhere(type, null, tbmVisit || '', lingkup || 'all', fKabupaten || '', fDesa || '', fSekolah || '');

    if (groupBy === 'desa_sekolah') {
      const raw = await db.select({
        desa: respondents.desa,
        sekolah: respondents.sekolah,
        avg_score: avg(results.weightedAvg),
        count: count(),
      })
        .from(results)
        .innerJoin(respondents, eq(results.respondentId, respondents.id))
        .where(where)
        .groupBy(respondents.desa, respondents.sekolah);

      return res.status(200).json(
        raw
          .map(r => ({
            desa: r.desa || 'Tanpa Nama Desa',
            sekolah: r.sekolah || 'Responden Umum',
            avg_score: parseFloat(r.avg_score) || 0,
            count: Number(r.count),
          }))
          .filter(r => r.count > 0)
          .sort((a, b) => b.avg_score - a.avg_score)
      );
    }

    if (groupBy === 'desa_rt') {
      const raw = await db.select({
        desa: respondents.desa,
        rt: respondents.rt,
        rw: respondents.rw,
        avg_score: avg(results.weightedAvg),
        count: count(),
      })
        .from(results)
        .innerJoin(respondents, eq(results.respondentId, respondents.id))
        .where(where)
        .groupBy(respondents.desa, respondents.rt, respondents.rw);

      return res.status(200).json(
        raw
          .map(r => ({
            label: [r.desa, r.rt ? `RT ${r.rt}` : null, r.rw ? `RW ${r.rw}` : null].filter(Boolean).join(' / ') || 'Tanpa Nama Desa',
            avg_score: parseFloat(r.avg_score) || 0,
            count: Number(r.count),
          }))
          .filter(r => r.count > 0)
          .sort((a, b) => b.avg_score - a.avg_score)
      );
    }

    const columnMap = {
      kabupaten: respondents.kabupaten,
      sekolah: respondents.sekolah,
      tbm: respondents.tbm
    };

    const targetCol = columnMap[groupBy];

    const rows = await db.select({
      label: targetCol,
      avg_score: avg(results.weightedAvg),
      count: count(),
    })
      .from(results)
      .innerJoin(respondents, eq(results.respondentId, respondents.id))
      .where(where)
      .groupBy(targetCol);

    return res.status(200).json(
      rows
        .map(r => ({
          label: r.label || `Tanpa Nama ${groupBy}`,
          avg_score: parseFloat(r.avg_score) || 0,
          count: Number(r.count),
        }))
        .filter(r => r.count > 0)
        .sort((a, b) => b.avg_score - a.avg_score)
    );

  } catch (error) {
    console.error('SERVER ERROR (Comparison):', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}
