// src/utils/constants.js
import instrumentData from '../../Instrumen_Literasi_REVISI_15_Indikator.json';

// Mapping data dari JSON ke format yang digunakan aplikasi
export const SURVEY_QUESTIONS = instrumentData["Instrumen Literasi (Revisi)"].reduce((acc, item) => {
  const lingkup = item.Lingkup;
  if (!acc[lingkup]) acc[lingkup] = [];
  
  acc[lingkup].push({
    kode: item.Kode,
    variabel: item.Variabel,
    indikator: item.Indikator,
    tipe_skala: item["Tipe Skala"],
    skala_detail: item["Skala Scoring (1-4)"],
    bobot: item.Bobot
  });
  
  return acc;
}, {});

// Export data mentah jika dibutuhkan untuk referensi lain
export const RAW_INSTRUMENT_DATA = instrumentData["Instrumen Literasi (Revisi)"];
