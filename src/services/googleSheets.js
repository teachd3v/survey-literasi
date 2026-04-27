import axios from 'axios';
const SPREADSHEET_ID = import.meta.env.VITE_SPREADSHEET_ID;
const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;
const BASE_URL = 'https://sheets.googleapis.com/v4/spreadsheets';

/**
 * Generate unique user ID
 */
function generateUserId() {
  return `USR-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`.toUpperCase();
}

/**
 * Calculate weighted score
 */
function calculateWeightedScore(scores, lingkup, bobotMap) {
  let totalScore = 0;
  const bMap = bobotMap[lingkup];
  
  Object.keys(bMap).forEach(key => {
    if (scores[key] !== undefined && scores[key] !== null) {
      totalScore += scores[key] * bMap[key];
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
export async function submitSurvey(formData, dynamicQuestions, surveyType = 'literasi') {
  try {
    const userId = generateUserId();
    const timestamp = new Date().toISOString();
    
    // Dinamis: Ambil indikator sesuai tipe
    const getScoresArray = () => {
      const result = [];
      if (surveyType === 'minatbaca') {
        // SD Kelas 1-3 (13 items)
        for (let i = 1; i <= 13; i++) result.push(formData[`SD1.${i}`] !== undefined ? formData[`SD1.${i}`] : null);
        // SD Kelas 4-6 (15 items)
        for (let i = 1; i <= 15; i++) result.push(formData[`SD2.${i}`] !== undefined ? formData[`SD2.${i}`] : null);
        // SMP-SMA (21 items)
        for (let i = 1; i <= 21; i++) result.push(formData[`SMP1.${i}`] !== undefined ? formData[`SMP1.${i}`] : null);
        // Dewasa (26 items)
        for (let i = 1; i <= 26; i++) result.push(formData[`D1.${i}`] !== undefined ? formData[`D1.${i}`] : null);
      } else {
        ['S', 'K', 'M'].forEach(prefix => {
          for (let v = 1; v <= 5; v++) { // 5 Variabel
            for (let i = 1; i <= 3; i++) { // 3 Indikator per variabel
              const key = `${prefix}${v}.${i}`; 
              result.push(formData[key] !== undefined ? formData[key] : null);
            }
          }
        });
      }
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
    
    // Submit to Apps Script Proxy
    const SCRIPT_URL = import.meta.env.VITE_GOOGLE_SCRIPT_URL;
    const sheetResponses = surveyType === 'minatbaca' ? 'response_minatbaca' : 'responses';
    
    console.log('DEBUG: Mengirim ke Apps Script URL:', SCRIPT_URL);
    console.log(`DEBUG: Data Responses Row (${sheetResponses}):`, rowData);

    if (SCRIPT_URL) {
      try {
        await fetch(SCRIPT_URL, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'text/plain' },
          body: JSON.stringify({
            sheetName: sheetResponses,
            values: rowData
          })
        });
      } catch (e) {
        console.error('DEBUG: Apps Script Error (responses):', e);
      }
    }
    
    // Calculate Score (Hanya yang relevan dengan lingkup saat ini)
    const currentScores = {};
    if (surveyType === 'minatbaca') {
      let prefix = '';
      let maxItems = 0;
      if (formData.lingkup === 'SD KELAS 1-3') { prefix = 'SD1.'; maxItems = 13; }
      else if (formData.lingkup === 'SD KELAS 4-6') { prefix = 'SD2.'; maxItems = 15; }
      else if (formData.lingkup === 'SMP-SMA') { prefix = 'SMP1.'; maxItems = 21; }
      else if (formData.lingkup === 'DEWASA') { prefix = 'D1.'; maxItems = 26; }
      
      for (let i = 1; i <= maxItems; i++) {
        const key = `${prefix}${i}`;
        if (formData[key] !== undefined && formData[key] !== null) {
          currentScores[key] = formData[key];
        }
      }
    } else {
      const scopePrefix = formData.lingkup === 'SEKOLAH' ? 'S' : formData.lingkup === 'KELUARGA' ? 'K' : 'M';
      for (let v = 1; v <= 5; v++) {
        for (let i = 1; i <= 3; i++) {
          const key = `${scopePrefix}${v}.${i}`;
          if (formData[key] !== undefined && formData[key] !== null) {
            currentScores[key] = formData[key];
          }
        }
      }
    }
    
    // Bangun bobot map dari dynamicQuestions
    const bobotMap = {};
    if (dynamicQuestions) {
      Object.keys(dynamicQuestions).forEach(lingkup => {
        bobotMap[lingkup] = {};
        dynamicQuestions[lingkup].forEach(q => {
          bobotMap[lingkup][q.kode] = q.bobot;
        });
      });
    }
    
    const weightedScore = calculateWeightedScore(currentScores, formData.lingkup, bobotMap);
    const category = getCategory(weightedScore);
    
    console.log('DEBUG: Data Calculated values:', [userId, formData.lingkup, weightedScore.toFixed(2), category]);

    // Submit to Apps Script Proxy (calculated_scores sheet)
    const sheetCalculated = surveyType === 'minatbaca' ? 'calculated_scores_minatbaca' : 'calculated_scores';
    if (SCRIPT_URL) {
      try {
        await fetch(SCRIPT_URL, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'text/plain' },
          body: JSON.stringify({
            sheetName: sheetCalculated,
            values: [
              userId,
              formData.lingkup,
              (weightedScore * 100).toFixed(2),
              weightedScore.toFixed(2),
              category,
              timestamp
            ]
          })
        });
      } catch (e) {
        console.error('DEBUG: Apps Script Error (calculated):', e);
      }
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
export async function fetchDashboardStats(surveyType = 'literasi', lingkup = 'all') {
  try {
    const sheetName = surveyType === 'minatbaca' ? 'calculated_scores_minatbaca' : 'calculated_scores';
    // Fetch calculated scores
    const response = await axios.get(
      `${BASE_URL}/${SPREADSHEET_ID}/values/${sheetName}!A:Z`,
      {
        params: { key: API_KEY }
      }
    );
    
    const rows = response.data.values;
    // Determine data rows: skip header for literasi, keep all for minatbaca
    const dataRows = surveyType === 'minatbaca' ? rows : rows.slice(1);
    if (!dataRows || dataRows.length < 1) {
      return {
        totalResponses: 0,
        avgScore: 0,
        lingkupStats: []
      };
    }
    
    // Map rows to objects
    const data = dataRows.map(row => ({
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
    const lingkups = surveyType === 'minatbaca' 
      ? ['SD KELAS 1-3', 'SD KELAS 4-6', 'SMP-SMA', 'DEWASA']
      : ['SEKOLAH', 'KELUARGA', 'MASYARAKAT'];

    const lingkupStats = lingkups.map(l => {
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
        target: surveyType === 'minatbaca' ? 100 : (l === 'SEKOLAH' ? 50 : l === 'KELUARGA' ? 150 : 40)
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
export async function fetchIndicatorBreakdown(lingkup, surveyType = 'literasi') {
  try {
    const sheetName = surveyType === 'minatbaca' ? 'response_minatbaca' : 'responses';
    // Fetch raw responses
    const response = await axios.get(
      `${BASE_URL}/${SPREADSHEET_ID}/values/${sheetName}!A:AZ`,
      {
        params: { key: API_KEY }
      }
    );
    
    const rows = response.data.values;
    // If using minatbaca sheet, there is no header row, otherwise skip header
    const dataRows = surveyType === 'minatbaca' ? rows : rows.slice(1);
    if (!dataRows || dataRows.length < 1) return [];
    
    // Filter by lingkup
    const filteredData = dataRows.filter(row => row[2] === lingkup);
    
    // Tentukan offset kolom berdasarkan lingkup
    let startCol = 5;
    let prefix = '';
    let countItems = 0;
    
    if (surveyType === 'minatbaca') {
      if (lingkup === 'SD KELAS 1-3') { startCol = 5; prefix = 'SD1.'; countItems = 13; }
      else if (lingkup === 'SD KELAS 4-6') { startCol = 18; prefix = 'SD2.'; countItems = 15; }
      else if (lingkup === 'SMP-SMA') { startCol = 33; prefix = 'SMP1.'; countItems = 21; }
      else if (lingkup === 'DEWASA') { startCol = 54; prefix = 'D1.'; countItems = 26; }
    } else {
      if (lingkup === 'SEKOLAH') { startCol = 5; prefix = 'S'; countItems = 15; }
      else if (lingkup === 'KELUARGA') { startCol = 20; prefix = 'K'; countItems = 15; }
      else if (lingkup === 'MASYARAKAT') { startCol = 35; prefix = 'M'; countItems = 15; }
    }

    // Ambil data untuk semua indikator
    const breakdown = [];
    
    // Helper to generate key for literasi (S1.1 format) vs minatbaca (SD1.1 format)
    const getIndicatorKey = (idx) => {
      if (surveyType === 'minatbaca') return `${prefix}${idx}`;
      const v = Math.ceil(idx / 3);
      const i = ((idx - 1) % 3) + 1;
      return `${prefix}${v}.${i}`;
    };

    for (let i = 1; i <= countItems; i++) {
      const colIdx = startCol + (i - 1);
      const indicatorCode = getIndicatorKey(i);
        
        let total = 0;
        let count = 0;
        
        // Iterate over filtered data (already filtered by lingkup)
        filteredData.forEach(row => {
          const val = parseFloat(row[colIdx]);
          if (!isNaN(val) && val > 0) {
            total += val;
            count++;
          }
        });
        
        breakdown.push({
          indicator: indicatorCode,
          value: count > 0 ? total / count : 0,
          fullMark: 4
        });
      }

    // after processing all indicators
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

/**
 * Fetch instrumen from Google Sheets (instrumen sheet)
 */
export async function fetchInstrumen(sheetName = 'instrumen_literasi') {
  try {
    const response = await axios.get(
      `${BASE_URL}/${SPREADSHEET_ID}/values/${sheetName}!A:Z`,
      {
        params: { key: API_KEY }
      }
    );
    
    const rows = response.data.values;
    if (!rows || rows.length < 2) return null;
    
    const instrumen = {};
    
    // Skip header row
    // Headers expected: Lingkup, Kode_Variabel, Variabel, Kode_Indikator, Indikator, Deskripsi, Tipe_Skala, Skala_0, Skala_1, Skala_2, Skala_3, Skala_4, Bobot
    rows.slice(1).forEach(row => {
      const lingkup = row[0]?.toUpperCase();
      if (!lingkup) return;
      
      if (!instrumen[lingkup]) {
        instrumen[lingkup] = [];
      }
      
      const skala_detail = [
        row[7] ? `0 = ${row[7]}` : '',
        row[8] ? `1 = ${row[8]}` : '',
        row[9] ? `2 = ${row[9]}` : '',
        row[10] ? `3 = ${row[10]}` : '',
        row[11] ? `4 = ${row[11]}` : ''
      ].filter(s => s !== '').join('\n');
      
      let bobot = row[12] ? row[12].toString().replace(',', '.') : '0';
      bobot = parseFloat(bobot) || 0;
      
      instrumen[lingkup].push({
        kode_variabel: row[1] || '',
        variabel: row[2] || '',
        kode: row[3] || '',
        indikator: row[4] || '',
        deskripsi: row[5] || '',
        tipe_skala: row[6] || '',
        skala_detail: skala_detail,
        bobot: bobot
      });
    });
    
    return instrumen;
  } catch (error) {
    console.error('Error fetching instrumen:', error);
    throw new Error('Gagal memuat instrumen dari spreadsheet. Pastikan sheet "instrumen" ada dan format sesuai.');
  }
}
