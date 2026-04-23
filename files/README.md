# 📊 Survey & Dashboard Ekosistem Literasi

Mobile-first fullstack survey application dengan Google Sheets sebagai database backend.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ ([Download](https://nodejs.org/))
- Google Account (untuk Google Sheets API)
- Code editor (VS Code recommended)

### 1️⃣ Setup Google Sheets Database

1. **Buat Google Sheet baru**
   - Buka [Google Sheets](https://sheets.google.com/)
   - Create blank spreadsheet
   - Rename jadi "Literasi Survey Database"

2. **Setup 4 sheets dengan nama:**
   - `responses` (untuk menyimpan raw survey data)
   - `calculated_scores` (untuk processed scores)
   - `aggregated_stats` (untuk dashboard metrics)
   - `config` (untuk system settings)

3. **Setup headers di sheet "responses":**
   ```
   Row 1: timestamp | user_id | lingkup | responden_nama | email | wilayah | S1 | S2 | S3 | S4 | S5 | K1 | K2 | K3 | K4 | K5 | M1 | M2 | M3 | M4 | M5
   ```

4. **Setup headers di sheet "calculated_scores":**
   ```
   Row 1: user_id | lingkup | total_score | weighted_avg | category | timestamp
   ```

5. **Setup headers di sheet "aggregated_stats":**
   ```
   Row 1: lingkup | avg_score | count | min | max | median | last_update
   ```

6. **Setup config di sheet "config":**
   ```
   Row 1: key | value
   Row 2: survey_open | TRUE
   Row 3: last_update | 
   Row 4: total_responses | 0
   ```

7. **Share settings:**
   - Click "Share" button
   - Set to: "Anyone with the link" → "Viewer"
   - Copy spreadsheet ID dari URL (antara /d/ dan /edit)

### 2️⃣ Setup Google Sheets API

1. **Buka Google Cloud Console**
   - Go to: https://console.cloud.google.com/

2. **Create project baru**
   - Click "New Project"
   - Name: "Literasi Survey"
   - Create

3. **Enable Google Sheets API**
   - Search "Google Sheets API" di search bar
   - Click "Enable"

4. **Create API Key**
   - Go to "Credentials"
   - Click "Create Credentials" → "API Key"
   - Copy the key
   - **IMPORTANT:** Click "Restrict Key"
     - Application restrictions: HTTP referrers
     - Add: `https://your-domain.com/*` dan `http://localhost:5173/*`
     - API restrictions: Google Sheets API only
   - Save

### 3️⃣ Setup Project Locally

```bash
# Clone atau extract project files
cd literasi-survey-dashboard

# Install dependencies
npm install

# Copy .env.example ke .env.local
cp .env.example .env.local

# Edit .env.local dengan values kamu:
# VITE_GOOGLE_API_KEY=your_api_key_here
# VITE_SPREADSHEET_ID=your_spreadsheet_id_here
nano .env.local  # atau buka dengan text editor

# Run development server
npm run dev
```

Buka browser ke: `http://localhost:5173`

### 4️⃣ Test Survey

1. Buka `http://localhost:5173/survey`
2. Pilih lingkup (Sekolah/Keluarga/Masyarakat)
3. Isi form identity
4. Jawab 5 pertanyaan
5. Submit
6. Check Google Sheet → tab "responses" harus ada data baru!

### 5️⃣ Test Dashboard

1. Buka `http://localhost:5173/dashboard`
2. Kalau ada data di sheet, charts akan muncul
3. Test filter per lingkup

---

## 📁 Project Structure

```
literasi-survey-dashboard/
├── src/
│   ├── components/
│   │   ├── survey/
│   │   │   ├── WelcomeStep.jsx       # Pilih lingkup
│   │   │   ├── IdentityStep.jsx      # Form identitas
│   │   │   ├── QuestionStep.jsx      # Survey questions
│   │   │   ├── ReviewStep.jsx        # Review before submit
│   │   │   └── ThankYouStep.jsx      # Success page
│   │   └── dashboard/
│   │       ├── StatCard.jsx          # Metric cards
│   │       ├── LingkupComparison.jsx # Bar chart
│   │       └── IndicatorRadar.jsx    # Radar chart
│   ├── services/
│   │   └── googleSheets.js           # API integration
│   ├── pages/
│   │   ├── SurveyPage.jsx
│   │   └── DashboardPage.jsx
│   ├── App.jsx
│   └── main.jsx
├── .env.example                      # Template env vars
├── .env.local                        # Your actual env vars (gitignored!)
├── package.json
├── vite.config.js
└── tailwind.config.js
```

---

## 🎨 Customization

### Mengubah Warna Theme

Edit `tailwind.config.js`:

```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: '#6366f1',      // Indigo
        secondary: '#10b981',    // Green
        // Tambahkan warna custom
      }
    }
  }
}
```

### Menambah Pertanyaan

1. Update `src/utils/constants.js`:
```javascript
export const QUESTIONS = {
  SEKOLAH: [
    { kode: 'S1', variabel: '...', indikator: '...', tipe_skala: '...' },
    // Tambah pertanyaan baru
  ]
}
```

2. Update bobot di `src/services/googleSheets.js`

3. Update Google Sheets schema (tambah kolom)

---

## 🚀 Deployment

### Deploy ke Vercel (Recommended)

1. **Push code ke GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/username/repo.git
   git push -u origin main
   ```

2. **Deploy via Vercel**
   - Buka [vercel.com](https://vercel.com)
   - Import GitHub repository
   - Configure:
     - Framework Preset: Vite
     - Build Command: `npm run build`
     - Output Directory: `dist`
   - Add Environment Variables:
     - `VITE_GOOGLE_API_KEY`
     - `VITE_SPREADSHEET_ID`
   - Deploy!

3. **Update API Key Restrictions**
   - Balik ke Google Cloud Console
   - Update HTTP referrers dengan domain Vercel kamu:
     - `https://your-app.vercel.app/*`

---

## 📊 Data Analysis

### Export Data untuk Analisis

Dari Google Sheets:
- File → Download → Excel (.xlsx)
- Atau gunakan Google Sheets API untuk export otomatis

### Visualisasi Tambahan

Libraries yang bisa ditambahkan:
- **Chart.js**: Untuk custom charts
- **D3.js**: Untuk advanced visualizations
- **Plotly**: Untuk interactive plots

---

## 🔒 Security Best Practices

1. **Jangan commit `.env.local`**
   - Already in `.gitignore`
   - Vercel env vars aman

2. **Restrict API Key**
   - Domain restrictions di Google Cloud
   - Read-only untuk dashboard

3. **Data Privacy**
   - Hash email addresses sebelum simpan (optional)
   - GDPR compliance: implementasi delete request

4. **Rate Limiting**
   - Client-side: debounce submissions
   - Server-side: consider Cloudflare Workers

---

## 🐛 Troubleshooting

### Error: "API key not valid"
- Check `.env.local` file exists
- Check API key copied correctly
- Check API restrictions di Google Cloud

### Error: "Spreadsheet not found"
- Check Spreadsheet ID correct
- Check sheet is shared (Anyone with link can view)
- Check sheet names exact match

### Charts tidak muncul
- Check console untuk errors
- Verify data exists di Google Sheets
- Check format data sesuai schema

### Submit gagal
- Check network tab di DevTools
- Verify sheet names correct
- Check API quota tidak exceed

---

## 📞 Support

- **Documentation**: Lihat `FULLSTACK_PLANNING_LITERASI.md`
- **Issues**: Open issue di GitHub
- **Questions**: Contact team

---

## 📝 License

MIT License - Feel free to use for your projects!

---

**Happy coding! 🚀**
