# HomeVault AI 🛡️
> **Your Home. Your Appliances. All Protected.**

HomeVault AI is a modern, responsive web application for managing smart home appliances, digital warranty cards, purchase invoices, and repair maintenance history. It eliminates lost physical paperwork and automatically monitors warranty expiration deadlines with Google Gemini AI.

---

## 🌟 Key Features

1. **Overview Dashboard**
   - Live metrics: Total Appliances, Active Warranties, Warranties Expiring Soon, Total Repairs.
   - Dynamic SVG Warranty Distribution chart (Active vs. Expiring Soon vs. Expired vs. Unknown).
   - Upcoming warranty expiration timeline with remaining days countdowns.
   - Recent repair activity and expenditure tracker.

2. **My Appliances**
   - Full appliance directory with real-time search, category filtering, and warranty status filters.
   - Comprehensive appliance details modal with purchase records, warranty duration, serial numbers, and maintenance history.
   - Dedicated **"Find Official Warranty"** button generating verified Google Search queries for official manufacturer policies in India.
   - Add/Edit forms with automatic warranty expiry calculation.

3. **Warranty Vault**
   - Digital document storage supporting PDF, PNG, JPG, and WEBP.
   - Persistent storage using browser **IndexedDB** (`dexie`), keeping documents accessible across page refreshes.
   - In-app interactive document preview and one-click file download.

4. **Repair & Service History**
   - Clean chronological service timeline with problem descriptions, technician details, and costs.
   - Total repair expenditure summary and average job calculations.
   - Integrated repair bill upload that automatically files into the Warranty Vault.

5. **AI Warranty Assistant (Google Gen AI SDK)**
   - Powered by official `@google/genai` using model **`gemini-3.8-flash`** (with automatic fallback to `gemini-2.5-flash`/`gemini-2.0-flash`).
   - **Smart Warranty Scanner**: Upload an invoice or warranty card; Gemini extracts appliance name, brand, model, serial, purchase date, price, warranty duration, and terms into structured JSON. Automatically pre-fills the Add Appliance form for user review.
   - **AI Warranty Assistant Chat**: Context-aware assistant that answers questions about your appliances and repair history (e.g., *"Is my refrigerator still under warranty?"*, *"How much have I spent on repairs?"*).
   - **Warranty Expiry Calculator**: Instant calculation of expiry dates from purchase dates and durations.
   - **Privacy Notice**: Documents are only transmitted to Google's official Gemini endpoint when you explicitly choose to scan them.

6. **Settings & Data Management**
   - User profile customization and currency selection (₹, $, €, £).
   - Full JSON database export and restore functionality.
   - Reset to realistic sample data (5 appliances, 3 repairs, sample vault documents) or clear all data.

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** v20+ or v22+ (tested on Node v24)
- **npm** v10+

### 1. Installation
Clone or navigate to the project directory and install dependencies:

```bash
npm install
```

### 2. Configure Google Gemini API Key

HomeVault AI includes an Express backend that communicates securely with Google's Gemini API via `@google/genai`. Your API key is stored server-side and is **never** exposed to the browser.

1. Obtain a free API key from [Google AI Studio](https://aistudio.google.com/apikey).
2. Open `server/.env` (or copy `server/.env.example` to `server/.env`):
   ```bash
   PORT=3001
   GEMINI_API_KEY=your_actual_gemini_api_key_here
   GEMINI_MODEL=gemini-3.8-flash
   ```
3. Save the file.

> **Note:** If `GEMINI_API_KEY` is not provided, the application continues to run normally with full local functionality, displaying clear configuration guidance and interactive demo extraction for testing.

---

## 🏃‍♂️ Running the Application

To run both the Express backend server and the Vite React frontend concurrently with a single command:

```bash
npm run dev
```

- **Frontend Application**: `http://localhost:5173`
- **Backend API**: `http://localhost:3001`
- **API Health Check**: `http://localhost:3001/api/status`

### Individual Run Commands
If you prefer running services separately:
- **Client only**: `npm run dev:client`
- **Backend server only**: `npm run dev:server`
- **Production build**: `npm run build`

---

## 📱 Mobile-First Design
HomeVault AI is engineered with a mobile-first philosophy:
- Fixed bottom navigation bar with tactile touch states on smartphones.
- Collapsible responsive sidebar on desktop screens (`lg:` breakpoint).
- Fluid typography, touch-friendly tap targets, and smooth modal dialogs.

---

## 🛠️ Technology Stack
- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4, Lucide React, Canvas Confetti.
- **Local Storage**: IndexedDB via Dexie.js (for offline persistence of images, documents, and records).
- **Backend**: Node.js, Express, Multer, Cors, Dotenv.
- **AI Engine**: `@google/genai` (Google Gen AI SDK, `gemini-3.8-flash`).

---

## ☁️ Deployment on Vercel (Unified Frontend + Backend)

HomeVault AI is pre-configured for a **single-project unified Vercel deployment**. The React + Vite frontend is served statically from Vercel's global Edge CDN, while the Express + Gemini AI backend runs as a Serverless Function via [api/index.js](file:///d:/Homevault/api/index.js).

### Step 1: Push Project to GitHub

1. Initialize git and commit your files:
   ```bash
   git init
   git add .
   git commit -m "feat: complete HomeVault AI application with Gemini 3.8 Flash"
   ```
2. Create a new repository on [GitHub](https://github.com/new).
3. Push to your GitHub repository:
   ```bash
   git remote add origin https://github.com/<your-username>/<your-repo-name>.git
   git branch -M main
   git push -u origin main
   ```

### Step 2: Deploy on Vercel

1. Log in to [Vercel](https://vercel.com) and click **"Add New..."** > **"Project"**.
2. Select your GitHub repository and click **"Import"**.
3. In the project configuration:
   - **Framework Preset**: Vite
   - **Root Directory**: `./` (leave default)
   - **Build Command**: `npm run build` (detected automatically)
   - **Output Directory**: `dist` (detected automatically)
4. Under **"Environment Variables"**, add:
   - **`GEMINI_API_KEY`**: `your_actual_gemini_api_key`
   - **`GEMINI_MODEL`**: `gemini-3.8-flash` (optional, defaults to `gemini-3.8-flash` with automatic fallback)
5. Click **"Deploy"**.

Once deployed, your full-stack HomeVault AI app will be live at `https://<your-project>.vercel.app` with working AI document scanning, AI advisor chat, and IndexedDB persistence!

---

## 📄 License
MIT License. Built for modern home appliance and warranty management.

