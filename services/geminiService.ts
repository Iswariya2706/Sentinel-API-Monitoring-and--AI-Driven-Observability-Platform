import { GoogleGenAI } from "@google/genai";
import { ApiLog } from "../types";

const API_KEY = process.env.API_KEY || ''; 
// NOTE: In a real app, ensure API_KEY is set in your build environment.

let ai: GoogleGenAI | null = null;
if (API_KEY) {
  ai = new GoogleGenAI({ apiKey: API_KEY });
}

export const analyzeLogWithGemini = async (log: ApiLog): Promise<string> => {
  if (!ai) {
    return "Gemini API Key is missing. Please configure the environment variable.";
  }

  const prompt = `
    You are a Senior Site Reliability Engineer. Analyze the following API Log entry and provide a concise root cause analysis and 3 specific debugging steps.
    
    API Log Details:
    - Service: ${log.serviceName}
    - Endpoint: ${log.method} ${log.endpoint}
    - Status Code: ${log.statusCode}
    - Latency: ${log.latencyMs}ms
    - Request Size: ${log.requestSize} bytes
    - Rate Limit Hit: ${log.isRateLimitHit}

    Output format: 
    **Analysis:** [Your Analysis]
    **Action Plan:**
    1. [Step 1]
    2. [Step 2]
    3. [Step 3]
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text || "No analysis generated.";
  } catch (error) {
    console.error("Gemini Analysis Failed:", error);
    return "Failed to analyze log with AI. Please try again later.";
  }
};
