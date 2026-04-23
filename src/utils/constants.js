// src/utils/constants.js
import sekolahData from '../../json/sekolah.json';
import keluargaData from '../../json/keluarga.json';
import masyarakatData from '../../json/masyarakat.json';

// Helper function untuk meratakan (flatten) data dari struktur Variabel > Indikator
const flattenIndicators = (data) => {
  const flattened = [];
  data.Variabel.forEach(v => {
    v.Indikator.forEach(ind => {
      flattened.push({
        kode: ind.Kode,
        variabel: v.Variabel,
        indikator: ind.Indikator,
        deskripsi: ind.Deskripsi,
        tipe_skala: ind.Tipe_Skala,
        // Konversi Skala_Scoring object ke string format lama agar kompatibel dengan sistem label dinamis kita
        skala_detail: Object.entries(ind.Skala_Scoring)
          .map(([key, val]) => `${key} = ${val}`)
          .join('\n'),
        bobot: ind.Bobot,
        observasi: ind.Observasi,
        kode_variabel: v.Kode_Variabel
      });
    });
  });
  return flattened;
};

export const SURVEY_QUESTIONS = {
  SEKOLAH: flattenIndicators(sekolahData),
  KELUARGA: flattenIndicators(keluargaData),
  MASYARAKAT: flattenIndicators(masyarakatData)
};

export const RAW_DATA = {
  SEKOLAH: sekolahData,
  KELUARGA: keluargaData,
  MASYARAKAT: masyarakatData
};
