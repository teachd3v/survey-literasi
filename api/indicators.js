import { getDb } from './_db.js';
import { respondents, answers } from '../src/db/schema.js';
import { eq, avg, and } from 'drizzle-orm';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const db = getDb();
    const { type = 'literasi', lingkup } = req.query;

    if (!lingkup) {
      return res.status(400).json({ error: 'lingkup is required' });
    }

    const rows = await db.select({
      indicator: answers.questionCode,
      value: avg(answers.value),
    })
      .from(answers)
      .innerJoin(respondents, eq(answers.respondentId, respondents.id))
      .where(and(
        eq(respondents.surveyType, type),
        eq(respondents.lingkup, lingkup.toUpperCase())
      ))
      .groupBy(answers.questionCode)
      .orderBy(answers.questionCode);

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
