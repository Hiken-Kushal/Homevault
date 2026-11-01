import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { AIChatMessage } from '../../types';
import { sendChatMessage } from '../../lib/api';
import {
  calculateWarrantyStatus,
  calculateExpiryDate,
  formatDate,
  formatRemainingTime,
  getOfficialWarrantySearchUrl,
  formatCurrency,
} from '../../lib/dateUtils';
import {
  Sparkles,
  Send,
  Bot,
  User,
  ShieldCheck,
  AlertTriangle,
  Clock,
  ScanLine,
  Calculator,
  Search,
  ExternalLink,
  Loader2,
  HelpCircle,
  Cpu,
  Key,
} from 'lucide-react';

const QUICK_PROMPTS = [
  'Is my refrigerator still under warranty?',
  'When does my washing machine warranty expire?',
  'How much have I spent on appliance repairs?',
  'Which appliances have expired warranties?',
  'What documents are required for a warranty claim?',
  'Check MacBook warranty status and coverage',
];

export const AssistantView: React.FC = () => {
  const {
    appliances,
    repairs,
    documents,
    settings,
    setIsScannerOpen,
    apiStatus,
    showToast,
  } = useApp();

  // Chat conversation state
  const [messages, setMessages] = useState<AIChatMessage[]>([
    {
      id: 'msg-welcome',
      role: 'assistant',
      content: `Hello! I'm your **HomeVault AI Warranty Advisor**, powered by Google's **gemini-3.8-flash**.

I have real-time access to your **${appliances.length} saved appliances** and **${repairs.length} repair records**.

You can ask me anything about your warranty coverage, upcoming expirations, repair spending, or claim requirements!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [inputMessage, setInputMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Warranty Calculator state
  const [calcDate, setCalcDate] = useState(new Date().toISOString().split('T')[0]);
  const [calcDuration, setCalcDuration] = useState<number>(12);
  const [calcResult, setCalcResult] = useState<{ expiry: string; status: string } | null>(null);

  // Official warranty lookup selector
  const [selectedAppLookupId, setSelectedAppLookupId] = useState(
    appliances.length > 0 ? appliances[0].id : ''
  );

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isSending]);

  // Handle calculator computation
  const handleCalculateExpiry = () => {
    if (!calcDate || !calcDuration) return;
    const expiry = calculateExpiryDate(calcDate, calcDuration);
    const status = calculateWarrantyStatus(expiry);
    setCalcResult({ expiry, status });
  };

  // Chat message submission
  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || isSending) return;

    const userMsg: AIChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setIsSending(true);

    try {
      // Send to backend Gemini chat endpoint
      const response = await sendChatMessage(text, { appliances, repairs });

      if (response.success && response.reply) {
        const assistantMsg: AIChatMessage = {
          id: `ai-${Date.now()}`,
          role: 'assistant',
          content: response.reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, assistantMsg]);
      } else {
        // Fallback response with local context if API key not set
        const localFallbackReply = generateLocalContextAnswer(text, appliances, repairs, settings);
        const fallbackMsg: AIChatMessage = {
          id: `ai-${Date.now()}`,
          role: 'assistant',
          content: localFallbackReply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, fallbackMsg]);
      }
    } catch (err: any) {
      const fallbackMsg: AIChatMessage = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: `I encountered an issue connecting to the Gemini backend: ${err.message}. Please verify the server is running on port 3001.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsSending(false);
    }
  };

  // Helper for answering queries based on local registry when API key is missing
  function generateLocalContextAnswer(
    query: string,
    apps: typeof appliances,
    reps: typeof repairs,
    userSettings: typeof settings
  ): string {
    const q = query.toLowerCase();

    if (q.includes('refrigerator') || q.includes('fridge')) {
      const fridge = apps.find((a) => a.category === 'Refrigerator' || a.name.toLowerCase().includes('refrigerator'));
      if (fridge) {
        const status = calculateWarrantyStatus(fridge.warrantyExpiryDate);
        return `**${fridge.name}**\n\n- **Warranty Status**: ${status} (${formatRemainingTime(fridge.warrantyExpiryDate)})\n- **Expiry Date**: ${formatDate(fridge.warrantyExpiryDate)}\n- **Coverage Details**: ${fridge.coverageDetails || '10 years on compressor, 2 years comprehensive'}\n- **Warranty Provider**: ${fridge.warrantyProvider || fridge.brand}\n\n*Note: Add GEMINI_API_KEY to server/.env for live multi-turn AI reasoning.*`;
      }
    }

    if (q.includes('washing machine') || q.includes('washer')) {
      const washer = apps.find((a) => a.category === 'Washing Machine' || a.name.toLowerCase().includes('washer'));
      if (washer) {
        const status = calculateWarrantyStatus(washer.warrantyExpiryDate);
        return `**${washer.name}**\n\n- **Status**: ⚠️ **${status}** (${formatRemainingTime(washer.warrantyExpiryDate)})\n- **Expiry Date**: ${formatDate(washer.warrantyExpiryDate)}\n- **Notes**: ${washer.notes || '10 years motor warranty, standard comprehensive ending soon'}\n\nWe recommend initiating an extended warranty inquiry before expiration!`;
      }
    }

    if (q.includes('repair') || q.includes('spent') || q.includes('cost')) {
      const total = reps.reduce((sum, r) => sum + (Number(r.repairCost) || 0), 0);
      return `You have logged **${reps.length} repair records** with a total expenditure of **${formatCurrency(total, userSettings.currency)}**.\n\n` +
        reps.map((r) => `- **${r.applianceName}**: ${formatCurrency(r.repairCost, r.currency)} on ${formatDate(r.repairDate)} (${r.problemDescription})`).join('\n');
    }

    if (q.includes('expired')) {
      const expiredApps = apps.filter((a) => calculateWarrantyStatus(a.warrantyExpiryDate) === 'Expired');
      if (expiredApps.length === 0) return 'None of your appliances have expired warranties! All are protected or active.';
      return `The following appliances have **expired warranties**:\n\n` +
        expiredApps.map((a) => `- **${a.name}** (${a.brand}) - Expired on ${formatDate(a.warrantyExpiryDate)}`).join('\n');
    }

    if (q.includes('document') || q.includes('claim')) {
      return `### Official Warranty Claim Checklist:\n\n1. **Purchase Tax Invoice**: Proves date of purchase and authorized retail origin.\n2. **Original Warranty Card**: Must have manufacturer model & serial stamp.\n3. **Product Serial Number Plate**: Clear photo of the rear/underside serial sticker.\n4. **Previous Service Sheets**: Any prior repair receipts to prove valid maintenance.\n\nAll these documents can be stored and previewed directly in your **Warranty Vault**!`;
    }

    return `Based on your HomeVault registry of **${apps.length} appliances** and **${reps.length} repairs**, your items are monitored. For deep natural language answers, ensure your **GEMINI_API_KEY** is configured in \`server/.env\`.`;
  }

  const lookupAppliance = appliances.find((a) => a.id === selectedAppLookupId) || appliances[0];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <span>AI Warranty Assistant</span>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-teal-100 text-teal-800 border border-teal-200">
              gemini-3.8-flash
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Ask natural language questions about your appliances, warranty terms, and repair expenses.
          </p>
        </div>

        {/* API Status badge */}
        <div className="flex items-center gap-2">
          <span
            className={`w-2.5 h-2.5 rounded-full ${
              apiStatus.geminiConfigured ? 'bg-emerald-500' : 'bg-amber-500'
            }`}
          />
          <span className="text-xs font-semibold text-slate-700">
            {apiStatus.geminiConfigured ? 'Gemini 3.8 Live Engine' : 'Setup GEMINI_API_KEY'}
          </span>
        </div>
      </div>

      {/* Main 2-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Interactive Conversational Chat */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200/90 shadow-xs flex flex-col h-[650px] overflow-hidden">
          {/* Chat Header Bar */}
          <div className="px-5 py-3.5 border-b border-slate-100 bg-slate-50/70 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-teal-600 text-white flex items-center justify-center font-bold">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-900">Warranty Intelligence Bot</h3>
                <p className="text-[10px] text-teal-700 font-medium">
                  {appliances.length} Appliances &bull; {repairs.length} Repairs &bull; {documents.length} Docs in context
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsScannerOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 font-semibold text-xs hover:bg-slate-50 cursor-pointer shadow-2xs"
            >
              <ScanLine className="w-3.5 h-3.5 text-teal-600" />
              <span>Scan Doc</span>
            </button>
          </div>

          {/* Chat Message Scrollable Container */}
          <div className="flex-1 p-5 overflow-y-auto space-y-4">
            {messages.map((msg) => {
              const isUser = msg.role === 'user';

              return (
                <div
                  key={msg.id}
                  className={`flex gap-3 items-start ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  <div
                    className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs flex-shrink-0 ${
                      isUser
                        ? 'bg-slate-900 text-white'
                        : 'bg-teal-100 text-teal-800'
                    }`}
                  >
                    {isUser ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
                  </div>

                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs leading-relaxed ${
                      isUser
                        ? 'bg-slate-900 text-white rounded-tr-xs'
                        : 'bg-slate-50 border border-slate-200/80 text-slate-800 rounded-tl-xs space-y-2'
                    }`}
                  >
                    <div className="whitespace-pre-wrap">{msg.content}</div>
                    <div
                      className={`text-[9px] mt-1 text-right ${
                        isUser ? 'text-slate-400' : 'text-slate-400'
                      }`}
                    >
                      {msg.timestamp}
                    </div>
                  </div>
                </div>
              );
            })}

            {isSending && (
              <div className="flex gap-3 items-start">
                <div className="w-7 h-7 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center text-xs flex-shrink-0">
                  <Bot className="w-3.5 h-3.5" />
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-xs text-slate-500 rounded-tl-xs flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-teal-600" />
                  <span>Consulting appliance registry and Gemini...</span>
                </div>
              </div>
            )}

            <div ref={chatBottomRef} />
          </div>

          {/* Quick Prompts Chips */}
          <div className="px-4 py-2 border-t border-slate-100 bg-white flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            <span className="text-[10px] uppercase font-bold text-slate-400 flex-shrink-0 mr-1">
              Ask:
            </span>
            {QUICK_PROMPTS.map((prompt, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSendMessage(prompt)}
                disabled={isSending}
                className="text-[11px] font-medium text-slate-600 bg-slate-100 hover:bg-teal-50 hover:text-teal-800 hover:border-teal-200 border border-slate-200 px-3 py-1.5 rounded-full whitespace-nowrap transition-colors cursor-pointer disabled:opacity-50"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Input Box Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-3.5 border-t border-slate-100 bg-slate-50/50 flex items-center gap-2"
          >
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ask anything about your appliances or warranty coverage..."
              className="flex-1 px-4 py-2.5 text-xs rounded-xl bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-slate-800"
            />
            <button
              type="submit"
              disabled={!inputMessage.trim() || isSending}
              className="p-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white shadow-xs transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              aria-label="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* Right 1 Col: Quick Tools Panel */}
        <div className="space-y-5">
          {/* Tool 1: Smart Warranty Scanner Card */}
          <div className="p-5 rounded-3xl bg-gradient-to-br from-teal-600 to-emerald-700 text-white shadow-md shadow-teal-700/20 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
                <ScanLine className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold">Smart Warranty Scanner</h3>
            </div>
            <p className="text-xs text-teal-100 leading-relaxed">
              Upload an invoice or warranty booklet. Gemini 3.8 Flash extracts model details, serials, purchase price, and coverage terms automatically.
            </p>
            <button
              type="button"
              onClick={() => setIsScannerOpen(true)}
              className="w-full py-2.5 rounded-xl bg-white text-teal-900 font-bold text-xs hover:bg-teal-50 transition-colors cursor-pointer shadow-xs"
            >
              Launch Smart Scanner
            </button>
          </div>

          {/* Tool 2: Warranty Expiry Calculator */}
          <div className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-3.5">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                <Calculator className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Warranty Expiry Calculator</h3>
                <p className="text-[11px] text-slate-400">Compute status &amp; deadlines</p>
              </div>
            </div>

            <div className="space-y-2.5 text-xs">
              <div>
                <label className="block text-slate-600 font-medium mb-1">Purchase Date</label>
                <input
                  type="date"
                  value={calcDate}
                  onChange={(e) => setCalcDate(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-slate-800"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">Duration (Months)</label>
                <input
                  type="number"
                  min="1"
                  max="120"
                  value={calcDuration}
                  onChange={(e) => setCalcDuration(Number(e.target.value))}
                  className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-slate-800"
                />
              </div>

              <button
                type="button"
                onClick={handleCalculateExpiry}
                className="w-full py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors cursor-pointer"
              >
                Calculate Expiration
              </button>

              {calcResult && (
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Expiry Date:</span>
                    <strong className="text-slate-900">{formatDate(calcResult.expiry)}</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Calculated Status:</span>
                    <strong
                      className={`px-2 py-0.5 rounded-full text-[10px] ${
                        calcResult.status === 'Active'
                          ? 'bg-emerald-100 text-emerald-800'
                          : calcResult.status === 'Expiring Soon'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {calcResult.status}
                    </strong>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Tool 3: Find Official Warranty Information */}
          <div className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-3.5">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                <Search className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Official Warranty Lookup</h3>
                <p className="text-[11px] text-slate-400">Search manufacturer support in India</p>
              </div>
            </div>

            <div className="space-y-2.5 text-xs">
              <label className="block text-slate-600 font-medium">Select Appliance</label>
              <select
                value={selectedAppLookupId}
                onChange={(e) => setSelectedAppLookupId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-800"
              >
                {appliances.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name} ({a.brand})
                  </option>
                ))}
              </select>

              {lookupAppliance && (
                <a
                  href={getOfficialWarrantySearchUrl(
                    lookupAppliance.brand,
                    lookupAppliance.modelNumber,
                    lookupAppliance.category
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 px-3 rounded-xl bg-teal-50 hover:bg-teal-100 border border-teal-200 text-teal-800 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <span>Search Official Policy for {lookupAppliance.brand}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}

              <p className="text-[10px] text-slate-400 leading-tight">
                *Opens a verified Google search query targeting official India manufacturer service centers without fabricating policy durations.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
