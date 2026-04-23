// src/services/googleSheets.js
import axios from 'axios';

const SPREADSHEET_ID = import.meta.env.VITE_SPREADSHEET_ID;
const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;
const BASE_URL = 'https://sheets.googleapis.com/v4/spreadsheets';

// Bobot per indikator (dari instrumen)
const BOBOT = {
  SEKOLAH: { S1: 0.25, S2: 0.25, S3: 0.20, S4: 0.15, S5: 0.15 },
  KELUARGA: { K1: 0.30, K2: 0.25, K3: 0.15, K4: 0.15, K5: 0.15 },
  MASYARAKAT: { M1: 0.25, M2: 0.25, M3: 0.20, M4: 0.15, M5: 0.15 }
};

/**
 * Generate unique user ID
 */
function generateUserId() {
  return `USR-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`.toUpperCase();
}

/**
 * Calculate weighted score
 */
function calculateWeightedScore(scores, lingkup) {
  let totalScore = 0;
  const bobotMap = BOBOT[lingkup];
  
  Object.keys(bobotMap).forEach(key => {
    if (scores[key]) {
      totalScore += scores[key] * bobotMap[key];
    }
  });
  
  return totalScore;
}

/**
 * Get category from score
 */
function getCategory(score) {
  if (score >= 3.6) return 'Sangat Baik';
  if (score >= 3.0) return 'Baik';
  if (score >= 2.0) return 'Berkembang';
  return 'Perlu Perhatian';
}

/**
 * Submit survey response
 */
export async function submitSurvey(formData) {
  try {
    const userId = generateUserId();
    const timestamp = new Date().toISOString();
    
    // Prepare scores array (15 columns: S1-S5, K1-K5, M1-M5)
    const scoresArray = Array(15).fill(null);
    
    // Fill scores based on lingkup
    if (formData.lingkup === 'SEKOLAH') {
      scoresArray[0] = formData.S1;
      scoresArray[1] = formData.S2;
      scoresArray[2] = formData.S3;
      scoresArray[3] = formData.S4;
      scoresArray[4] = formData.S5;
    } else if (formData.lingkup === 'KELUARGA') {
      scoresArray[5] = formData.K1;
      scoresArray[6] = formData.K2;
      scoresArray[7] = formData.K3;
      scoresArray[8] = formData.K4;
      scoresArray[9] = formData.K5;
    } else if (formData.lingkup === 'MASYARAKAT') {
      scoresArray[10] = formData.M1;
      scoresArray[11] = formData.M2;
      scoresArray[12] = formData.M3;
      scoresArray[13] = formData.M4;
      scoresArray[14] = formData.M5;
    }
    
    // Row data for 'responses' sheet
    const rowData = [
      timestamp,
      userId,
      formData.lingkup,
      formData.responden_nama,
      formData.email || '',
      formData.wilayah || '',
      ...scoresArray
    ];
    
    // Append to 'responses' sheet
    const response = await axios.post(
      `${BASE_URL}/${SPREADSHEET_ID}/values/responses!A:Z:append`,
      {
        values: [rowData],
        range: 'responses!A:Z'
      },
      {
        params: {
          key: API_KEY,
          valueInputOption: 'USER_ENTERED'
        }
      }
    );
    
    // Calculate score
    const scores = {};
    if (formData.lingkup === 'SEKOLAH') {
      scores.S1 = formData.S1;
      scores.S2 = formData.S2;
      scores.S3 = formData.S3;
      scores.S4 = formData.S4;
      scores.S5 = formData.S5;
    } else if (formData.lingkup === 'KELUARGA') {
      scores.K1 = formData.K1;
      scores.K2 = formData.K2;
      scores.K3 = formData.K3;
      scores.K4 = formData.K4;
      scores.K5 = formData.K5;
    } else {
      scores.M1 = formData.M1;
      scores.M2 = formData.M2;
      scores.M3 = formData.M3;
      scores.M4 = formData.M4;
      scores.M5 = formData.M5;
    }
    
    const weightedScore = calculateWeightedScore(scores, formData.lingkup);
    const category = getCategory(weightedScore);
    
    // Append to 'calculated_scores' sheet
    await axios.post(
      `${BASE_URL}/${SPREADSHEET_ID}/values/calculated_scores!A:Z:append`,
      {
        values: [[
          userId,
          formData.lingkup,
          (weightedScore * 100).toFixed(2),
          weightedScore.toFixed(2),
          category,
          timestamp
        ]],
        range: 'calculated_scores!A:Z'
      },
      {
        params: {
          key: API_KEY,
          valueInputOption: 'USER_ENTERED'
        }
      }
    );
    
    return {
      success: true,
      userId,
      score: weightedScore,
      category
    };
    
  } catch (error) {
    console.error('Error submitting survey:', error);
    throw new Error('Gagal mengirim survey. Silakan coba lagi.');
  }
}

/**
 * Fetch dashboard statistics
 */
export async function fetchDashboardStats(lingkup = 'all') {
  try {
    // Fetch calculated scores
    const response = await axios.get(
      `${BASE_URL}/${SPREADSHEET_ID}/values/calculated_scores!A:Z`,
      {
        params: { key: API_KEY }
      }
    );
    
    const rows = response.data.values;
    if (!rows || rows.length < 2) {
      return {
        totalResponses: 0,
        avgScore: 0,
        lingkupStats: []
      };
    }
    
    // Skip header row
    const data = rows.slice(1).map(row => ({
      userId: row[0],
      lingkup: row[1],
      totalScore: parseFloat(row[2]),
      weightedAvg: parseFloat(row[3]),
      category: row[4],
      timestamp: row[5]
    }));
    
    // Filter by lingkup if specified
    const filteredData = lingkup === 'all' 
      ? data 
      : data.filter(d => d.lingkup === lingkup);
    
    // Calculate stats per lingkup
    const lingkupStats = ['SEKOLAH', 'KELUARGA', 'MASYARAKAT'].map(l => {
      const lingkupData = data.filter(d => d.lingkup === l);
      const scores = lingkupData.map(d => d.weightedAvg);
      
      return {
        lingkup: l,
        count: lingkupData.length,
        avg_score: scores.length > 0 
          ? scores.reduce((a, b) => a + b, 0) / scores.length 
          : 0,
        min: scores.length > 0 ? Math.min(...scores) : 0,
        max: scores.length > 0 ? Math.max(...scores) : 0,
        target: l === 'SEKOLAH' ? 50 : l === 'KELUARGA' ? 150 : 40
      };
    });
    
    // Overall stats
    const allScores = data.map(d => d.weightedAvg);
    const avgScore = allScores.length > 0 
      ? allScores.reduce((a, b) => a + b, 0) / allScores.length 
      : 0;
    
    // Category distribution
    const categoryDist = {
      'Sangat Baik': data.filter(d => d.category === 'Sangat Baik').length,
      'Baik': data.filter(d => d.category === 'Baik').length,
      'Berkembang': data.filter(d => d.category === 'Berkembang').length,
      'Perlu Perhatian': data.filter(d => d.category === 'Perlu Perhatian').length
    };
    
    return {
      totalResponses: data.length,
      avgScore: avgScore,
      lingkupStats,
      categoryDistribution: categoryDist,
      lastUpdate: data.length > 0 ? data[data.length - 1].timestamp : null
    };
    
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    throw new Error('Gagal memuat data dashboard.');
  }
}

/**
 * Fetch indicator breakdown for a specific lingkup
 */
export async function fetchIndicatorBreakdown(lingkup) {
  try {
    // Fetch raw responses
    const response = await axios.get(
      `${BASE_URL}/${SPREADSHEET_ID}/values/responses!A:Z`,
      {
        params: { key: API_KEY }
      }
    );
    
    const rows = response.data.values;
    if (!rows || rows.length < 2) return [];
    
    // Skip header, filter by lingkup
    const data = rows.slice(1).filter(row => row[2] === lingkup);
    
    // Column indices for indicators
    const indicatorIndices = {
      SEKOLAH: { S1: 6, S2: 7, S3: 8, S4: 9, S5: 10 },
      KELUARGA: { K1: 11, K2: 12, K3: 13, K4: 14, K5: 15 },
      MASYARAKAT: { M1: 16, M2: 17, M3: 18, M4: 19, M5: 20 }
    };
    
    const indices = indicatorIndices[lingkup];
    const breakdown = [];
    
    Object.keys(indices).forEach(key => {
      const idx = indices[key];
      const scores = data
        .map(row => parseFloat(row[idx]))
        .filter(s => !isNaN(s) && s > 0);
      
      const avg = scores.length > 0
        ? scores.reduce((a, b) => a + b, 0) / scores.length
        : 0;
      
      breakdown.push({
        indicator: key,
        value: avg,
        fullMark: 4
      });
    });
    
    return breakdown;
    
  } catch (error) {
    console.error('Error fetching indicator breakdown:', error);
    throw new Error('Gagal memuat breakdown indikator.');
  }
}

/**
 * Check if survey is open (from config sheet)
 */
export async function checkSurveyStatus() {
  try {
    const response = await axios.get(
      `${BASE_URL}/${SPREADSHEET_ID}/values/config!A:B`,
      {
        params: { key: API_KEY }
      }
    );
    
    const rows = response.data.values;
    const configMap = {};
    
    rows.forEach(row => {
      configMap[row[0]] = row[1];
    });
    
    return {
      isOpen: configMap['survey_open'] === 'TRUE',
      lastUpdate: configMap['last_update'],
      totalResponses: parseInt(configMap['total_responses']) || 0
    };
    
  } catch (error) {
    console.error('Error checking survey status:', error);
    return { isOpen: true }; // Default to open if error
  }
}
