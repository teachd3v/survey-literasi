import { getDb } from './_db.js';
import { respondents, answers } from '../src/db/schema.js';
import { eq, and, gte, lt, count } from 'drizzle-orm';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const db = getDb();
    const { type = 'literasi', lingkup, dateFrom, dateTo, tbmVisit } = req.query;

    if (!lingkup) {
      return res.status(400).json({ error: 'lingkup is required' });
    }

    const conds = [
      eq(respondents.surveyType, type),
      eq(respondents.lingkup, lingkup.toUpperCase()),
    ];
    if (dateFrom) conds.push(gte(respondents.createdAt, new Date(dateFrom)));
    if (dateTo) conds.push(lt(respondents.createdAt, new Date(dateTo)));
    if (tbmVisit && tbmVisit !== 'Semua') conds.push(eq(respondents.noTbm, tbmVisit));

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

    // Grouping the result by indicator
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
