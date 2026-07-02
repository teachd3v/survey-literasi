import { getDb } from './_db.js';
import { settings } from '../src/db/schema.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const db = getDb();
    const rows = await db.select().from(settings);
    
    // Map rows to a key-value object
    const config = {};
    rows.forEach(row => {
      config[row.key] = row.value;
    });

    // Default values if not set in DB
    if (config['survey_literasi_open'] === undefined) {
      config['survey_literasi_open'] = 'true';
    }
    if (config['survey_minatbaca_open'] === undefined) {
      config['survey_minatbaca_open'] = 'true';
    }

    return res.status(200).json(config);
  } catch (error) {
    console.error('SERVER ERROR (Get Settings):', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}
