import axios from 'axios';

/**
 * Mengirim data survey ke Neon DB melalui Vercel Serverless Function
 * @param {Object} payload 
 * @returns {Promise}
 */
export async function submitToNeon(payload) {
  try {
    // Payload harus berisi: identity, answers, result, surveyType, lingkup
    const response = await axios.post('/api/submit', payload);
    return response.data;
  } catch (error) {
    console.error('Service Error (Neon):', error.response?.data || error.message);
    throw new Error(error.response?.data?.error || 'Gagal menyimpan data ke database.');
  }
}

export async function fetchNeonStats(surveyType, { dateFrom, dateTo } = {}) {
  try {
    const params = { type: surveyType };
    if (dateFrom) params.dateFrom = dateFrom;
    if (dateTo) params.dateTo = dateTo;
    const response = await axios.get('/api/stats', { params });
    return response.data;
  } catch (error) {
    console.error('Service Error (Stats):', error);
    throw error;
  }
}

export async function fetchNeonComparison(surveyType, groupBy, { dateFrom, dateTo } = {}) {
  try {
    const params = { type: surveyType, groupBy };
    if (dateFrom) params.dateFrom = dateFrom;
    if (dateTo) params.dateTo = dateTo;
    const response = await axios.get('/api/comparison', { params });
    return response.data;
  } catch (error) {
    console.error('Service Error (Comparison):', error);
    throw error;
  }
}

export async function fetchNeonCategoricalStats(surveyType, lingkup, { dateFrom, dateTo } = {}) {
  try {
    const params = { type: surveyType, lingkup };
    if (dateFrom) params.dateFrom = dateFrom;
    if (dateTo) params.dateTo = dateTo;
    const response = await axios.get('/api/categorical-stats', { params });
    return response.data;
  } catch (error) {
    console.error('Service Error (Categorical Stats):', error);
    throw error;
  }
}

export async function fetchNeonIndicators(surveyType, lingkup, { dateFrom, dateTo } = {}) {
  try {
    const params = { type: surveyType, lingkup };
    if (dateFrom) params.dateFrom = dateFrom;
    if (dateTo) params.dateTo = dateTo;
    const response = await axios.get('/api/indicators', { params });
    return response.data;
  } catch (error) {
    console.error('Service Error (Indicators):', error);
    throw error;
  }
}
