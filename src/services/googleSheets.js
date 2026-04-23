import axios from 'axios';
import { SURVEY_QUESTIONS } from '../utils/constants';

const SPREADSHEET_ID = import.meta.env.VITE_SPREADSHEET_ID;
const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;
const BASE_URL = 'https://sheets.googleapis.com/v4/spreadsheets';

// Fungsi helper untuk mendapatkan bobot dinamis dari konstanta
function getBobotMap() {
  const map = {};
  Object.keys(SURVEY_QUESTIONS).forEach(lingkup => {
    map[lingkup] = {};
    SURVEY_QUESTIONS[lingkup].forEach(q => {
      map[lingkup][q.kode] = q.bobot;
    });
  });
  return map;
}

const BOBOT = getBobotMap();

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
    
    // Dinamis: Ambil semua 45 indikator (15 per eko x 3 eko)
    const getScoresArray = () => {
      const result = [];
      ['S', 'K', 'M'].forEach(prefix => {
        for (let v = 1; v <= 5; v++) { // 5 Variabel
          for (let i = 1; i <= 3; i++) { // 3 Indikator per variabel
            const key = `${prefix}${v}.${i}`; 
            result.push(formData[key] || null);
          }
        }
      });
      return result;
    };

    const scoresArray = getScoresArray();
    
    // Row data for 'responses' sheet (Urutan: Timestamp, ID, Lingkup, Nama, Wilayah, 15 Skor S, 15 Skor K, 15 Skor M)
    const rowData = [
      timestamp,
      userId,
      formData.lingkup,
      formData.responden_nama,
      formData.wilayah || '',
      ...scoresArray
    ];
    
    // Submit to Apps Script Proxy (responses sheet)
    const SCRIPT_URL = import.meta.env.VITE_GOOGLE_SCRIPT_URL;
    
    if (SCRIPT_URL) {
      await axios.post(SCRIPT_URL, JSON.stringify({
        sheetName: 'responses',
        values: rowData
      }), {
        headers: { 'Content-Type': 'text/plain;charset=utf-8' }
      });
    }
    
    // Calculate Score (Hanya yang relevan dengan lingkup saat ini)
    const currentScores = {};
    const scopePrefix = formData.lingkup === 'SEKOLAH' ? 'S' : formData.lingkup === 'KELUARGA' ? 'K' : 'M';
    for (let v = 1; v <= 5; v++) {
      for (let i = 1; i <= 3; i++) {
        const key = `${scopePrefix}${v}.${i}`;
        if (formData[key]) {
          currentScores[key] = formData[key];
        }
      }
    }
    
    const weightedScore = calculateWeightedScore(currentScores, formData.lingkup);
    const category = getCategory(weightedScore);
    
    // Submit to Apps Script Proxy (calculated_scores sheet)
    if (SCRIPT_URL) {
      await axios.post(SCRIPT_URL, JSON.stringify({
        sheetName: 'calculated_scores',
        values: [
          userId,
          formData.lingkup,
          (weightedScore * 100).toFixed(2),
          weightedScore.toFixed(2),
          category,
          timestamp
        ]
      }), {
        headers: { 'Content-Type': 'text/plain;charset=utf-8' }
      });
    }
    
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
