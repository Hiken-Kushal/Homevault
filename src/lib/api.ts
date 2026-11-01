import { ExtractedWarrantyData, Appliance, RepairRecord } from '../types';

export interface ApiStatus {
  isOnline: boolean;
  geminiConfigured: boolean;
  model: string;
  message?: string;
}

export interface AnalysisResponse {
  success: boolean;
  data?: ExtractedWarrantyData;
  modelUsed?: string;
  error?: string;
  message?: string;
  requiresConfig?: boolean;
}

export interface ChatResponse {
  success: boolean;
  reply?: string;
  modelUsed?: string;
  error?: string;
  message?: string;
}

/**
 * Checks backend health and Gemini API key status
 */
export async function checkApiStatus(): Promise<ApiStatus> {
  try {
    const res = await fetch('/api/status', {
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) {
      return {
        isOnline: false,
        geminiConfigured: false,
        model: 'unknown',
        message: 'Backend server returned status ' + res.status,
      };
    }
    const data = await res.json();
    return {
      isOnline: true,
      geminiConfigured: Boolean(data.geminiConfigured),
      model: data.model || 'gemini-3.8-flash',
      message: data.message,
    };
  } catch (err: any) {
    return {
      isOnline: false,
      geminiConfigured: false,
      model: 'unknown',
      message: 'Could not connect to HomeVault backend server on port 3001.',
    };
  }
}

/**
 * Analyzes uploaded invoice or warranty card via Gemini API
 */
export async function analyzeWarrantyDocument(file: File): Promise<AnalysisResponse> {
  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await fetch('/api/analyze-warranty', {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error || 'ANALYSIS_ERROR',
        message: data.message || 'Failed to analyze document.',
        requiresConfig: data.requiresConfig || data.error === 'API_KEY_MISSING',
      };
    }

    return {
      success: true,
      data: data.data,
      modelUsed: data.modelUsed,
    };
  } catch (err: any) {
    return {
      success: false,
      error: 'NETWORK_ERROR',
      message: err.message || 'Failed to reach analysis service. Ensure backend is running.',
    };
  }
}

/**
 * Sends chat message with appliance and repair context to Gemini Assistant
 */
export async function sendChatMessage(
  message: string,
  context: { appliances: Appliance[]; repairs: RepairRecord[] },
  history: { role: string; content: string }[] = []
): Promise<ChatResponse> {
  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        context,
        history,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error || 'CHAT_ERROR',
        message: data.message || 'Could not process chat request.',
      };
    }

    return {
      success: true,
      reply: data.reply,
      modelUsed: data.modelUsed,
    };
  } catch (err: any) {
    return {
      success: false,
      error: 'NETWORK_ERROR',
      message: err.message || 'Could not connect to chat service.',
    };
  }
}
