import { getDb } from './_db.js';
import { settings } from '../src/db/schema.js';

export default async function handler(req, res) {
  if (req.method !== 'POST' && req.method !== 'PUT') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const db = getDb();
    const { key, value } = req.body;

    if (!key || value === undefined) {
      return res.status(400).json({ success: false, error: 'Key dan Value wajib diisi' });
    }

    await db.insert(settings)
      .values({ key, value: String(value) })
      .onConflictDoUpdate({
        target: settings.key,
        set: { value: String(value) }
      });

    return res.status(200).json({ success: true, message: 'Setting berhasil diupdate' });
  } catch (error) {
    console.error('SERVER ERROR (Set Settings):', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}
