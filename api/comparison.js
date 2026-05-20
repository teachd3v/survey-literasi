import { getDb } from './_db.js';
import { respondents, results } from '../src/db/schema.js';
import { eq, avg, count, and, ne, gte, lt } from 'drizzle-orm';

const VALID_GROUP_BY = ['kabupaten', 'tbm', 'sekolah', 'desa_rt'];

function buildWhere(type, extraCond, dateFrom, dateTo, tbmVisit) {
  const conds = [eq(respondents.surveyType, type), extraCond];
  if (dateFrom) conds.push(gte(respondents.createdAt, new Date(dateFrom)));
  if (dateTo) conds.push(lt(respondents.createdAt, new Date(dateTo)));
  if (tbmVisit && tbmVisit !== 'Semua') conds.push(eq(respondents.noTbm, tbmVisit));
  return and(...conds);
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const db = getDb();
    const { type = 'literasi', groupBy = 'kabupaten', dateFrom, dateTo, tbmVisit } = req.query;

    if (!VALID_GROUP_BY.includes(groupBy)) {
      return res.status(400).json({ error: 'Invalid groupBy parameter' });
    }

    let rows;

    if (groupBy === 'kabupaten') {
      rows = await db.select({
        label: respondents.kabupaten,
        avg_score: avg(results.weightedAvg),
        count: count(),
      })
        .from(results)
        .innerJoin(respondents, eq(results.respondentId, respondents.id))
        .where(buildWhere(type, ne(respondents.kabupaten, ''), dateFrom, dateTo, tbmVisit))
        .groupBy(respondents.kabupaten);

    } else if (groupBy === 'tbm') {
      rows = await db.select({
        label: respondents.tbm,
        avg_score: avg(results.weightedAvg),
        count: count(),
      })
        .from(results)
        .innerJoin(respondents, eq(results.respondentId, respondents.id))
        .where(buildWhere(type, ne(respondents.tbm, ''), dateFrom, dateTo, tbmVisit))
        .groupBy(respondents.tbm);

    } else if (groupBy === 'sekolah') {
      rows = await db.select({
        label: respondents.sekolah,
        avg_score: avg(results.weightedAvg),
        count: count(),
      })
        .from(results)
        .innerJoin(respondents, eq(results.respondentId, respondents.id))
        .where(buildWhere(type, ne(respondents.sekolah, ''), dateFrom, dateTo, tbmVisit))
        .groupBy(respondents.sekolah);

    } else if (groupBy === 'desa_rt') {
      const raw = await db.select({
        desa: respondents.desa,
        rt: respondents.rt,
        rw: respondents.rw,
        avg_score: avg(results.weightedAvg),
        count: count(),
      })
        .from(results)
        .innerJoin(respondents, eq(results.respondentId, respondents.id))
        .where(buildWhere(type, ne(respondents.desa, ''), dateFrom, dateTo, tbmVisit))
        .groupBy(respondents.desa, respondents.rt, respondents.rw);

      return res.status(200).json(
        raw
          .filter(r => r.desa)
          .map(r => ({
            label: [r.desa, r.rt ? `RT ${r.rt}` : null, r.rw ? `RW ${r.rw}` : null].filter(Boolean).join(' / '),
            avg_score: parseFloat(r.avg_score) || 0,
            count: Number(r.count),
          }))
          .sort((a, b) => b.avg_score - a.avg_score)
      );
    }

    return res.status(200).json(
      rows
        .filter(r => r.label)
        .map(r => ({
          label: r.label,
          avg_score: parseFloat(r.avg_score) || 0,
          count: Number(r.count),
        }))
        .sort((a, b) => b.avg_score - a.avg_score)
    );

  } catch (error) {
    console.error('SERVER ERROR (Comparison):', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}
