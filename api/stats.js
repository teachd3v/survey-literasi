import { getDb } from './_db.js';
import { respondents, results } from '../src/db/schema.js';
import { eq, avg, count } from 'drizzle-orm';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const db = getDb();
    const { type = 'literasi' } = req.query;

    const [totalRes, avgRes, catRes, lingkupRes] = await Promise.all([
      db.select({ count: count() })
        .from(respondents)
        .where(eq(respondents.surveyType, type)),

      db.select({ avg: avg(results.weightedAvg) })
        .from(results)
        .innerJoin(respondents, eq(results.respondentId, respondents.id))
        .where(eq(respondents.surveyType, type)),

      db.select({ category: results.category, count: count() })
        .from(results)
        .innerJoin(respondents, eq(results.respondentId, respondents.id))
        .where(eq(respondents.surveyType, type))
        .groupBy(results.category),

      db.select({
        lingkup: respondents.lingkup,
        avg_score: avg(results.weightedAvg),
        count: count(),
      })
        .from(results)
        .innerJoin(respondents, eq(results.respondentId, respondents.id))
        .where(eq(respondents.surveyType, type))
        .groupBy(respondents.lingkup),
    ]);

    return res.status(200).json({
      totalResponses: Number(totalRes[0].count),
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
