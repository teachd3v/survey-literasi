# 📋 SISTEM SURVEY & DASHBOARD EKOSISTEM LITERASI
## Fullstack Planning & Implementation Guide

---

## 🏗️ TECH STACK

### **Frontend**
- **Framework**: Vite + React 18 (atau Vue 3 / Svelte - pilih sesuai preferensi)
- **Styling**: TailwindCSS 3.x (mobile-first, utility-based)
- **State Management**: Zustand (lightweight, ~1KB)
- **Form Management**: React Hook Form + Zod (validation)
- **Charts**: Recharts (React-native, responsive)
- **Icons**: Lucide React (modern, tree-shakeable)
- **Routing**: React Router v6
- **HTTP Client**: Axios

### **Backend/Database**
- **Primary**: Google Sheets API v4
- **Auth**: Google Service Account (server-side) atau OAuth 2.0 (user-side)
- **Optional Middleware**: Cloudflare Workers / Vercel Edge Functions (untuk caching/rate limiting)

### **Deployment**
- **Frontend**: Vercel (auto-deploy dari Git, free tier cukup)
- **Environment**: .env untuk API keys (never commit!)

---

## 📊 GOOGLE SHEETS DATABASE SCHEMA

### **Sheet 1: `responses`** (Raw Survey Data)

```
Columns (20 total):
┌────────────┬──────────┬──────────┬────────────────┬───────┬────────────┐
│ timestamp  │ user_id  │ lingkup  │ responden_nama │ email │ wilayah    │
│ (datetime) │ (string) │ (enum)   │ (string)       │ (str) │ (string)   │
├────────────┼──────────┼──────────┼────────────────┼───────┼────────────┤
│ S1, S2, S3, S4, S5 (SEKOLAH scores, 1-4)                               │
│ K1, K2, K3, K4, K5 (KELUARGA scores, 1-4)                              │
│ M1, M2, M3, M4, M5 (MASYARAKAT scores, 1-4)                            │
└─────────────────────────────────────────────────────────────────────────┘
```

**Validation Rules:**
- `lingkup`: ENUM('SEKOLAH', 'KELUARGA', 'MASYARAKAT')
- Scores: INTEGER 1-4 or NULL (if not applicable)
- `timestamp`: Auto-generated (ISO 8601 format)
- `user_id`: Auto-generated (UUID v4)

---

### **Sheet 2: `calculated_scores`** (Processed Data)

```
Columns:
┌──────────┬──────────┬─────────────┬──────────────┬─────────────┬────────────┐
│ user_id  │ lingkup  │ total_score │ weighted_avg │ category    │ timestamp  │
│ (string) │ (enum)   │ (number)    │ (float)      │ (string)    │ (datetime) │
└──────────┴──────────┴─────────────┴──────────────┴─────────────┴────────────┘

Calculation Formula:
- total_score = Σ(score_i × bobot_i) × 100
- weighted_avg = total_score / 100 (range: 1.0 - 4.0)
- category: 
  * 1.0-1.9 = "Perlu Perhatian"
  * 2.0-2.9 = "Berkembang"
  * 3.0-3.5 = "Baik"
  * 3.6-4.0 = "Sangat Baik"
```

---

### **Sheet 3: `aggregated_stats`** (Dashboard Metrics)

```
Columns:
┌──────────┬──────────┬───────┬─────┬─────┬────────┬─────────────┐
│ lingkup  │ avg_score│ count │ min │ max │ median │ last_update │
└──────────┴──────────┴───────┴─────┴─────┴────────┴─────────────┘

Plus per-indicator breakdown:
┌──────────┬───────────┬──────────┬──────────┬─────┐
│ lingkup  │ indicator │ avg_val  │ std_dev  │ ... │
└──────────┴───────────┴──────────┴──────────┴─────┘
```

---

### **Sheet 4: `config`** (System Settings)

```
Key-Value pairs:
┌──────────────────┬─────────────────────────────┐
│ key              │ value                       │
├──────────────────┼─────────────────────────────┤
│ survey_open      │ TRUE/FALSE                  │
│ last_update      │ timestamp                   │
│ total_responses  │ integer                     │
│ target_responses │ integer (goal)              │
│ admin_email      │ email@domain.com            │
└──────────────────┴─────────────────────────────┘
```

---

## 🔄 API FLOW & DATA PIPELINE

### **1. Survey Submission Flow**

```mermaid
User fills survey → Validation (client-side) → Submit
                                                  ↓
                                    Axios POST to /api/submit
                                                  ↓
                                    API Service Layer
                                                  ↓
                            Google Sheets API: append row to 'responses'
                                                  ↓
                            Trigger calculation (Apps Script or client)
                                                  ↓
                            Update 'calculated_scores' sheet
                                                  ↓
                            Return success + user_id
                                                  ↓
                            Redirect to thank you page
```

**Code Example (API Service):**

```javascript
// src/services/googleSheets.js
import axios from 'axios';

const SPREADSHEET_ID = import.meta.env.VITE_SPREADSHEET_ID;
const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;

export const submitSurvey = async (data) => {
  const values = [
    [
      new Date().toISOString(),
      generateUserId(),
      data.lingkup,
      data.responden_nama,
      data.email,
      data.wilayah,
      ...getScoreArray(data, data.lingkup)
    ]
  ];

  const response = await axios.post(
    `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/responses!A:Z:append`,
    {
      values,
      valueInputOption: 'USER_ENTERED'
    },
    {
      params: { key: API_KEY }
    }
  );

  return response.data;
};

function getScoreArray(data, lingkup) {
  const scores = new Array(15).fill(null);
  
  if (lingkup === 'SEKOLAH') {
    scores[0] = data.S1; scores[1] = data.S2; /* ... */ scores[4] = data.S5;
  } else if (lingkup === 'KELUARGA') {
    scores[5] = data.K1; scores[6] = data.K2; /* ... */ scores[9] = data.K5;
  } else if (lingkup === 'MASYARAKAT') {
    scores[10] = data.M1; scores[11] = data.M2; /* ... */ scores[14] = data.M5;
  }
  
  return scores;
}
```

---

### **2. Dashboard Data Fetching Flow**

```mermaid
Dashboard loads → Fetch aggregated stats
                           ↓
              GET /api/stats?lingkup=all
                           ↓
              Google Sheets API: read 'aggregated_stats'
                           ↓
              Transform data for charts
                           ↓
              Render visualizations
```

**Code Example (Dashboard Service):**

```javascript
// src/services/dashboard.js
export const fetchDashboardStats = async (lingkup = 'all') => {
  const response = await axios.get(
    `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/aggregated_stats!A:Z`,
    {
      params: { key: API_KEY }
    }
  );

  const rows = response.data.values;
  const stats = parseStatsData(rows, lingkup);
  
  return stats;
};
```

---

## 📱 MOBILE-FIRST SURVEY UI/UX

### **Design Principles**

1. **Progressive Disclosure**: 1 question per screen (wizard-style)
2. **Visual Feedback**: Progress bar at top, clear CTA buttons
3. **Touch-Optimized**: Button min-height 48px, spacing 16px
4. **Offline Support**: LocalStorage backup sebelum submit
5. **Accessibility**: ARIA labels, keyboard navigation, high contrast

### **Survey Flow (Wizard Steps)**

```
Step 1: Welcome Screen
  ├─ Pilih Lingkup (3 cards: Sekolah, Keluarga, Masyarakat)
  └─ Animasi smooth entrance

Step 2: Identity Form
  ├─ Nama Responden
  ├─ Email (optional)
  └─ Wilayah/Lokasi

Step 3-7: Questions (1 per step)
  ├─ Question text (large, readable)
  ├─ Scale selector (radio buttons, large touch targets)
  ├─ Progress indicator (e.g., "3 dari 5")
  └─ Prev/Next navigation

Step 8: Review & Submit
  ├─ Summary semua jawaban
  ├─ Edit button per section
  └─ Submit CTA (prominent)

Step 9: Thank You
  ├─ Success message
  ├─ User ID (untuk tracking)
  └─ Option: Lihat dashboard
```

---

## 📁 FOLDER STRUCTURE (Vite + React)

```
literasi-survey/
├── public/
│   └── favicon.ico
├── src/
│   ├── assets/
│   │   └── images/
│   ├── components/
│   │   ├── survey/
│   │   │   ├── WelcomeStep.jsx
│   │   │   ├── IdentityStep.jsx
│   │   │   ├── QuestionStep.jsx
│   │   │   ├── ReviewStep.jsx
│   │   │   ├── ThankYouStep.jsx
│   │   │   └── ProgressBar.jsx
│   │   ├── dashboard/
│   │   │   ├── StatCard.jsx
│   │   │   ├── BarChart.jsx
│   │   │   ├── RadarChart.jsx
│   │   │   ├── HeatMap.jsx
│   │   │   └── FilterPanel.jsx
│   │   └── common/
│   │       ├── Button.jsx
│   │       ├── Card.jsx
│   │       └── Loader.jsx
│   ├── pages/
│   │   ├── SurveyPage.jsx
│   │   ├── DashboardPage.jsx
│   │   └── AdminPage.jsx
│   ├── services/
│   │   ├── googleSheets.js
│   │   ├── dashboard.js
│   │   └── validation.js
│   ├── store/
│   │   └── surveyStore.js (Zustand)
│   ├── utils/
│   │   ├── calculateScore.js
│   │   ├── formatters.js
│   │   └── constants.js
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css (Tailwind)
├── .env.example
├── .env.local (gitignored)
├── vite.config.js
├── tailwind.config.js
└── package.json
```

---

## 📊 DASHBOARD VISUALIZATIONS

### **Key Metrics to Display**

1. **Overview Cards (Top)**
   - Total Responses
   - Average Score Overall
   - Completion Rate
   - Latest Update Time

2. **Lingkup Comparison**
   - Bar Chart: Avg Score per Lingkup
   - Target vs Actual responses

3. **Detailed Breakdown**
   - Radar Chart: 5 indicators per lingkup (actual vs ideal)
   - Heatmap: Score distribution across regions/schools

4. **Trend Analysis** (jika multi-period)
   - Line Chart: Score over time
   - Progress toward targets

5. **Distribution**
   - Histogram: Response count by score category
   - Pie Chart: Category breakdown (Perlu Perhatian vs Baik vs Sangat Baik)

### **Dashboard Components Example**

```jsx
// src/pages/DashboardPage.jsx
import { useEffect, useState } from 'react';
import { fetchDashboardStats } from '../services/dashboard';
import StatCard from '../components/dashboard/StatCard';
import BarChart from '../components/dashboard/BarChart';

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const data = await fetchDashboardStats();
      setStats(data);
      setLoading(false);
    }
    loadData();
  }, []);

  if (loading) return <Loader />;

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Dashboard Ekosistem Literasi</h1>
        
        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <StatCard title="Total Responden" value={stats.totalResponses} />
          <StatCard title="Rata-rata Skor" value={stats.avgScore.toFixed(2)} />
          <StatCard title="Completion Rate" value={`${stats.completionRate}%`} />
          <StatCard title="Last Update" value={stats.lastUpdate} />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <BarChart data={stats.lingkupComparison} title="Perbandingan Lingkup" />
          <RadarChart data={stats.indicatorBreakdown} title="Detail Indikator" />
        </div>
      </div>
    </div>
  );
}
```

---

## 🔐 SECURITY & BEST PRACTICES

### **Environment Variables**

```bash
# .env.local (NEVER commit!)
VITE_GOOGLE_API_KEY=your_api_key_here
VITE_SPREADSHEET_ID=your_spreadsheet_id
VITE_OAUTH_CLIENT_ID=your_client_id (if using OAuth)
```

### **API Security**

1. **Rate Limiting**: Implement client-side debouncing, server-side rate limits
2. **Input Validation**: Zod schemas for all inputs
3. **CORS**: Configure allowed origins in Google Cloud Console
4. **Read-Only Dashboard**: Use separate API key with read-only permissions

### **Data Privacy**

- Hash email addresses before storing (optional)
- GDPR compliance: Allow data deletion requests
- Anonymize data untuk public dashboard

---

## 🚀 DEPLOYMENT CHECKLIST

### **Pre-Deployment**

- [ ] Setup Google Sheets database (4 sheets)
- [ ] Create Google Cloud Project
- [ ] Enable Google Sheets API
- [ ] Generate API Key / Service Account credentials
- [ ] Configure CORS settings
- [ ] Test all API endpoints locally

### **Frontend Deployment (Vercel)**

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel --prod

# Set environment variables in Vercel dashboard
```

### **Post-Deployment**

- [ ] Test survey submission end-to-end
- [ ] Verify dashboard data rendering
- [ ] Check mobile responsiveness (use Chrome DevTools)
- [ ] Setup monitoring (Vercel Analytics)
- [ ] Configure custom domain (optional)

---

## 📱 MOBILE OPTIMIZATION CHECKLIST

- [ ] Viewport meta tag: `<meta name="viewport" content="width=device-width, initial-scale=1">`
- [ ] Touch-friendly buttons (min 44x44px)
- [ ] Swipe gestures for wizard navigation
- [ ] Lazy loading for dashboard charts
- [ ] Offline fallback (Service Worker - optional)
- [ ] Progressive Web App (PWA) manifest
- [ ] Fast loading (<3s on 3G)

---

## 🎨 UI/UX MOCK FLOW

### **Survey Mobile View**

```
┌─────────────────────┐
│  [Progress: ████░░] │ ← Always visible
│                     │
│  Pertanyaan 1/5     │
│                     │
│  Sekolah memiliki   │
│  program literasi   │
│  yang terencana...  │
│                     │
│  ○ 1 - Tidak ada    │
│  ○ 2 - Ada tapi...  │
│  ● 3 - Ada dan...   │ ← Selected
│  ○ 4 - Ada dan...   │
│                     │
│  [Kembali] [Lanjut] │
└─────────────────────┘
```

### **Dashboard Desktop View**

```
┌──────────────────────────────────────────────────────────┐
│  Dashboard Literasi          [Filter: Semua Lingkup ▼]   │
├──────────────────────────────────────────────────────────┤
│  ┌───────┐ ┌───────┐ ┌───────┐ ┌───────┐                │
│  │  165  │ │  3.2  │ │  85%  │ │ 2024  │                │
│  │Respond│ │Avg Sc │ │Compl. │ │Update │                │
│  └───────┘ └───────┘ └───────┘ └───────┘                │
│                                                          │
│  ┌─────────────────────┐  ┌──────────────────────────┐  │
│  │   Bar Chart:        │  │   Radar Chart:           │  │
│  │   Lingkup Scores    │  │   Indicator Breakdown    │  │
│  │                     │  │                          │  │
│  │   [Chart]           │  │   [Chart]                │  │
│  └─────────────────────┘  └──────────────────────────┘  │
└──────────────────────────────────────────────────────────┘
```

---

## 📦 IMPLEMENTATION TIMELINE

### **Phase 1: Setup (Week 1)**
- Setup Vite project
- Configure TailwindCSS
- Setup Google Sheets database
- Test API connection

### **Phase 2: Survey Module (Week 2)**
- Build wizard components
- Implement form validation
- Connect to Google Sheets API
- Mobile testing

### **Phase 3: Dashboard Module (Week 3)**
- Fetch & parse data
- Build chart components
- Implement filters
- Responsive design

### **Phase 4: Polish & Deploy (Week 4)**
- Final testing
- Performance optimization
- Deploy to Vercel
- User acceptance testing

---

## 🔧 GOOGLE APPS SCRIPT (Optional)

For automatic calculation after form submission:

```javascript
// Google Apps Script attached to the sheet
function onEdit(e) {
  const sheet = e.source.getActiveSheet();
  
  if (sheet.getName() === 'responses') {
    calculateScores(e.range.getRow());
    updateAggregatedStats();
  }
}

function calculateScores(row) {
  const responsesSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('responses');
  const scoresSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('calculated_scores');
  
  const data = responsesSheet.getRange(row, 1, 1, 20).getValues()[0];
  const lingkup = data[2];
  const scores = data.slice(6, 21); // S1-M5
  
  const weighted = calculateWeightedScore(scores, lingkup);
  const category = getCategory(weighted);
  
  scoresSheet.appendRow([
    data[1], // user_id
    lingkup,
    weighted * 100,
    weighted,
    category,
    new Date()
  ]);
}
```

---

## 📞 SUPPORT & RESOURCES

- **Google Sheets API**: https://developers.google.com/sheets/api
- **Vite Docs**: https://vitejs.dev/
- **TailwindCSS**: https://tailwindcss.com/
- **Recharts**: https://recharts.org/

---

**Ready to implement? Let's goooo! 🚀**
