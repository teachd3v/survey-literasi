import { getDb } from './_db.js';
import { respondents, results } from '../src/db/schema.js';
import { eq, avg, count, and, sql, ilike } from 'drizzle-orm';

/**
 * Super robust fuzzy filter builder using schema objects
 */
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

    // Step 1: Baseline match (Survey Type + Lingkup ONLY)
    const baselineWhere = and(
      ilike(respondents.surveyType, `%${type.trim()}%`),
      lingkup && lingkup !== 'all' ? ilike(respondents.lingkup, `%${lingkup.trim()}%`) : sql`1=1`
    );
    
    const [totalRes, baselineRes] = await Promise.all([
      db.select({ count: count() }).from(respondents).where(where),
      db.select({ count: count() }).from(respondents).where(baselineWhere)
    ]);

    const totalResponses = Number(totalRes[0].count);
    const baselineCount = Number(baselineRes[0].count);

    if (totalResponses === 0) {
      return res.status(200).json({
        totalResponses: 0,
        avgScore: 0,
        categoryDistribution: {},
        lingkupStats: [],
        debug: { 
          params: req.query, 
          baselineCount,
          status: 'Filtered out'
        }
      });
    }

    const [avgRes, catRes, lingkupRes] = await Promise.all([
      db.select({ avg: avg(results.weightedAvg) })
        .from(results)
        .innerJoin(respondents, eq(results.respondentId, respondents.id))
        .where(where),

      db.select({ category: results.category, count: count() })
        .from(results)
        .innerJoin(respondents, eq(results.respondentId, respondents.id))
        .where(where)
        .groupBy(results.category),

      db.select({
        lingkup: respondents.lingkup,
        avg_score: avg(results.weightedAvg),
        count: count(),
      })
        .from(results)
        .innerJoin(respondents, eq(results.respondentId, respondents.id))
        .where(where)
        .groupBy(respondents.lingkup),
    ]);

    return res.status(200).json({
      totalResponses,
      avgScore: parseFloat(avgRes[0].avg) || 0,
      categoryDistribution: catRes.reduce((acc, row) => {
        if (row.category) acc[row.category] = Number(row.count);
        return acc;
      }, {}),
      lingkupStats: lingkupRes.map(row => ({
        lingkup: row.lingkup,
        avg_score: parseFloat(row.avg_score) || 0,
        count: Number(row.count),
      })),
    });

  } catch (error) {
    console.error('SERVER ERROR (Stats):', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}
