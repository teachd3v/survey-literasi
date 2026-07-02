import { getDb } from './_db.js';
import { respondents } from '../src/db/schema.js';
import { eq } from 'drizzle-orm';

export default async function handler(req, res) {
  if (req.method !== 'DELETE' && req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const db = getDb();
    const id = req.query.id || req.body.id;

    if (!id) {
      return res.status(400).json({ success: false, error: 'ID responden wajib diisi' });
    }

    await db.delete(respondents).where(eq(respondents.id, id));

    return res.status(200).json({ 
      success: true, 
      message: 'Responden berhasil dihapus' 
    });

  } catch (error) {
    console.error('SERVER ERROR (Delete Respondent):', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}
