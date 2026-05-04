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

export async function fetchNeonStats(surveyType) {
  try {
    const response = await axios.get('/api/stats', { params: { type: surveyType } });
    return response.data;
  } catch (error) {
    console.error('Service Error (Stats):', error);
    throw error;
  }
}

export async function fetchNeonComparison(surveyType, groupBy) {
  try {
    const response = await axios.get(
      `/api/comparison?type=${encodeURIComponent(surveyType)}&groupBy=${encodeURIComponent(groupBy)}`
    );
    return response.data;
  } catch (error) {
    console.error('Service Error (Comparison):', error);
    throw error;
  }
}

export async function fetchNeonIndicators(surveyType, lingkup) {
  try {
    const response = await axios.get(
      `/api/indicators?type=${encodeURIComponent(surveyType)}&lingkup=${encodeURIComponent(lingkup)}`
    );
    return response.data;
  } catch (error) {
    console.error('Service Error (Indicators):', error);
    throw error;
  }
}
