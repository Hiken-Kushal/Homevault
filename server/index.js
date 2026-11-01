import express from 'express';
import cors from 'cors';
import multer from 'multer';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper function to dynamically reload .env files on demand in local dev
function loadEnv() {
  const envPaths = [
    path.join(__dirname, '.env'),
    path.join(__dirname, '../.env'),
    path.join(process.cwd(), '.env'),
    path.join(process.cwd(), 'server/.env'),
  ];

  for (const envPath of envPaths) {
    if (fs.existsSync(envPath)) {
      dotenv.config({ path: envPath, override: true });
    }
  }
}

// Initial load for local dev
loadEnv();

const app = express();
const PORT = process.env.PORT || 3001;

function getApiKey() {
  if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim() !== '') {
    return process.env.GEMINI_API_KEY.trim();
  }
  loadEnv();
  return (process.env.GEMINI_API_KEY || '').trim();
}

function getPrimaryModel() {
  if (process.env.GEMINI_MODEL && process.env.GEMINI_MODEL.trim() !== '') {
    return process.env.GEMINI_MODEL.trim();
  }
  loadEnv();
  return (process.env.GEMINI_MODEL || 'gemini-3.8-flash').trim();
}

// Modern fallback models supported by the API
const FALLBACK_MODELS = [
  'gemini-3.5-flash-lite',
  'gemini-3.1-flash-lite',
  'gemini-flash-latest',
  'gemini-3.5-flash',
  'gemini-3.7-flash',
];

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Setup multer for in-memory file handling (PDF, PNG, JPG, JPEG, WEBP)
// 4MB limit ensures compatibility with Vercel Serverless Function 4.5MB payload limit
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 4 * 1024 * 1024, // 4MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedMimes = [
      'application/pdf',
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/webp',
    ];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Unsupported file type: ${file.mimetype}. Please upload a PDF, PNG, JPG, or WEBP file.`));
    }
  },
});

// Helper to initialize Google Gen AI client with current key
function getGenAIClient() {
  const apiKey = getApiKey();
  if (!apiKey || apiKey === 'YOUR_GEMINI_API_KEY_HERE') {
    return null;
  }
  return new GoogleGenAI({ apiKey });
}

// Timeout wrapper to prevent slow or congested preview models from blocking the user
async function generateWithTimeout(ai, requestPayload, model, timeoutMs = 9000) {
  let timer;
  const timeoutPromise = new Promise((_, reject) => {
    timer = setTimeout(
      () => reject(new Error(`Model ${model} timed out after ${timeoutMs}ms (Google API high demand)`)),
      timeoutMs
    );
  });

  const apiPromise = ai.models.generateContent({
    ...requestPayload,
    model,
  }).finally(() => clearTimeout(timer));

  return Promise.race([apiPromise, timeoutPromise]);
}

// Robust helper to call Gemini with automatic fallback if primary model is unavailable or busy (503)
async function generateContentWithFallback(ai, requestPayload) {
  const primary = getPrimaryModel();
  const modelsToTry = [primary, ...FALLBACK_MODELS.filter((m) => m !== primary)];
  let lastError = null;

  for (const model of modelsToTry) {
    try {
      console.log(`[HomeVault AI] Calling Gemini with model: ${model}...`);
      const response = await generateWithTimeout(ai, requestPayload, model, 9000);
      console.log(`[HomeVault AI] Success with model: ${model}`);
      return { response, modelUsed: model };
    } catch (err) {
      console.warn(`[HomeVault AI] Model ${model} returned: ${err.message}. Trying next fallback...`);
      lastError = err;
      if (err.message && (err.message.includes('API_KEY_INVALID') || err.message.includes('key not valid'))) {
        throw err;
      }
    }
  }

  throw lastError || new Error('All model attempts failed.');
}

// Router containing all API logic
const apiRouter = express.Router();

// 1. Health & Config Status endpoint
apiRouter.get('/status', (req, res) => {
  const apiKey = getApiKey();
  const primaryModel = getPrimaryModel();
  const isConfigured = Boolean(
    apiKey &&
    apiKey !== 'YOUR_GEMINI_API_KEY_HERE' &&
    apiKey.length > 10
  );

  res.json({
    status: 'ok',
    geminiConfigured: isConfigured,
    model: primaryModel,
    message: isConfigured
      ? `Gemini API is active using ${primaryModel}.`
      : 'GEMINI_API_KEY is not configured. Add your key to environment variables to enable live scanning and assistant chat.',
  });
});

apiRouter.get('/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});

// 2. Document Analysis (Smart Warranty Scanner)
apiRouter.post('/analyze-warranty', upload.single('file'), async (req, res) => {
  try {
    const ai = getGenAIClient();
    if (!ai) {
      return res.status(503).json({
        error: 'API_KEY_MISSING',
        message: 'Google Gemini API key is not configured. Please add GEMINI_API_KEY in your environment variables.',
        requiresConfig: true,
      });
    }

    if (!req.file) {
      return res.status(400).json({
        error: 'NO_FILE_PROVIDED',
        message: 'No document file uploaded. Please upload a PDF, PNG, or JPG file.',
      });
    }

    const mimeType = req.file.mimetype;
    const base64Data = req.file.buffer.toString('base64');

    const extractionPrompt = `
You are an expert document parser for appliance invoices, receipts, and warranty cards.
Analyze this document with extreme precision. Extract the appliance details and warranty terms.

CRITICAL INSTRUCTIONS:
1. NEVER INVENT OR GUESS missing details. If a piece of information is not present or cannot be clearly confirmed from the document, return null for that field.
2. In 'missingOrUnclearFields', list every standard field that could not be determined from the document.
3. For dates, format strictly as 'YYYY-MM-DD' when found. If only year or month is found, approximate safely or set to null.
4. For category, choose strictly from: ["Refrigerator", "Washing Machine", "Television", "Air Conditioner", "Microwave", "Laptop", "Dishwasher", "Vacuum Cleaner", "Water Purifier", "Other"].
5. Extract purchase price as a numeric value without currency symbols.
6. Return purely valid JSON matching the exact schema below without any markdown code fences.

JSON Response Schema:
{
  "applianceName": string | null,
  "brand": string | null,
  "modelNumber": string | null,
  "serialNumber": string | null,
  "category": string | null,
  "purchaseDate": string | null,
  "purchasePrice": number | null,
  "seller": string | null,
  "warrantyProvider": string | null,
  "warrantyDurationMonths": number | null,
  "warrantyStartDate": string | null,
  "warrantyExpiryDate": string | null,
  "coverageDetails": string | null,
  "importantConditions": string | null,
  "confidenceScore": number,
  "missingOrUnclearFields": string[]
}
`;

    const { response, modelUsed } = await generateContentWithFallback(ai, {
      contents: [
        {
          role: 'user',
          parts: [
            { text: extractionPrompt },
            {
              inlineData: {
                mimeType,
                data: base64Data,
              },
            },
          ],
        },
      ],
      config: {
        responseMimeType: 'application/json',
      },
    });

    const responseText = response.text || '{}';
    let parsedData;
    try {
      const cleaned = responseText.replace(/```json\n?|\n?```/g, '').trim();
      parsedData = JSON.parse(cleaned);
    } catch (parseErr) {
      console.error('Failed to parse Gemini JSON output:', responseText);
      return res.status(500).json({
        error: 'PARSE_ERROR',
        message: 'Could not parse structured extraction from model response.',
        raw: responseText,
      });
    }

    return res.json({
      success: true,
      modelUsed,
      data: parsedData,
    });
  } catch (error) {
    console.error('Warranty analysis error:', error);
    const isQuotaOrRate = error.message && (error.message.includes('429') || error.message.includes('Quota') || error.message.includes('RESOURCE_EXHAUSTED'));
    const isAuth = error.message && (error.message.includes('API_KEY_INVALID') || error.message.includes('key not valid'));

    return res.status(isQuotaOrRate ? 429 : isAuth ? 401 : 500).json({
      error: isQuotaOrRate ? 'RATE_LIMIT_EXCEEDED' : isAuth ? 'INVALID_API_KEY' : 'ANALYSIS_FAILED',
      message: error.message || 'An unexpected error occurred during document analysis.',
    });
  }
});

// 3. AI Warranty Assistant Chat
apiRouter.post('/chat', async (req, res) => {
  try {
    const ai = getGenAIClient();
    if (!ai) {
      return res.status(503).json({
        error: 'API_KEY_MISSING',
        message: 'Gemini API key is not configured. Please configure GEMINI_API_KEY in environment variables.',
      });
    }

    const { message, history = [], context = {} } = req.body;

    if (!message || message.trim() === '') {
      return res.status(400).json({ error: 'Message cannot be empty.' });
    }

    const appliances = context.appliances || [];
    const repairs = context.repairs || [];

    const systemPrompt = `
You are HomeVault AI, a smart appliance and warranty advisor assistant.
Your goal is to help users manage their appliances, understand warranty coverage, track repair expenditures, and know when warranties expire.

TODAY'S DATE: ${new Date().toISOString().split('T')[0]}

USER'S SAVED APPLIANCES (${appliances.length} registered):
${JSON.stringify(
  appliances.map((a) => ({
    name: a.name,
    category: a.category,
    brand: a.brand,
    model: a.modelNumber,
    serialNumber: a.serialNumber,
    purchaseDate: a.purchaseDate,
    price: `${a.currency || '₹'}${a.purchasePrice}`,
    warrantyProvider: a.warrantyProvider,
    warrantyDuration: `${a.warrantyDurationMonths} months`,
    warrantyExpiryDate: a.warrantyExpiryDate,
    notes: a.notes,
    coverage: a.coverageDetails,
    conditions: a.importantConditions,
  })),
  null,
  2
)}

USER'S REPAIR HISTORY (${repairs.length} records):
${JSON.stringify(
  repairs.map((r) => ({
    appliance: r.applianceName,
    problem: r.problemDescription,
    date: r.repairDate,
    cost: `${r.currency || '₹'}${r.repairCost}`,
    serviceProvider: r.serviceProvider,
    partsReplaced: r.partsReplaced,
  })),
  null,
  2
)}

BEHAVIOR GUIDELINES:
1. Always base answers on the user's registered appliances and repairs listed above.
2. Answer questions like "Is my refrigerator under warranty?", "How much have I spent on repairs?", "Which warranties are expiring soon?", or "What documents do I need for a claim?" accurately.
3. If an appliance has expired or has an unknown warranty, explicitly state it.
4. Calculate total repair spending correctly using the data provided.
5. NEVER invent or fabricate official manufacturer warranty coverage policies or URLs.
6. Keep answers friendly, formatted with markdown bullet points where appropriate, and actionable.
`;

    const contents = [
      {
        role: 'user',
        parts: [{ text: systemPrompt + '\n\nUser Question: ' + message }],
      },
    ];

    const { response, modelUsed } = await generateContentWithFallback(ai, {
      contents,
    });

    const reply = response.text || 'I could not generate a response. Please try again.';

    return res.json({
      success: true,
      modelUsed,
      reply,
    });
  } catch (error) {
    console.error('Chat error:', error);
    const isQuota = error.message && (error.message.includes('429') || error.message.includes('Quota'));

    return res.status(isQuota ? 429 : 500).json({
      error: isQuota ? 'RATE_LIMIT_EXCEEDED' : 'CHAT_FAILED',
      message: error.message || 'Chat service encountered an error.',
    });
  }
});

// Mount router on both '/api' and '/' to ensure full compatibility with Vercel rewrites and local proxy
app.use('/api', apiRouter);
app.use('/', apiRouter);

// Error handling middleware
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        error: 'FILE_TOO_LARGE',
        message: 'File size exceeds 4MB limit. Please upload a smaller document.',
      });
    }
  }
  if (err) {
    return res.status(400).json({
      error: 'UPLOAD_ERROR',
      message: err.message,
    });
  }
  next();
});

// Export app for Vercel Serverless Function entry point
export default app;

// In standalone/local development, start listening on PORT
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    const currentKey = getApiKey();
    const currentModel = getPrimaryModel();
    console.log(`[HomeVault AI Server] running on http://localhost:${PORT}`);
    console.log(`[HomeVault AI Server] Gemini Model: ${currentModel}`);
    console.log(
      `[HomeVault AI Server] API Key Status: ${
        currentKey && currentKey !== 'YOUR_GEMINI_API_KEY_HERE'
          ? `Configured (${currentKey.slice(0, 8)}...)`
          : 'Missing or Default (AI features will show configuration guide)'
      }`
    );
  });
}
