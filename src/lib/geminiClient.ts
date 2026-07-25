import { GoogleGenAI } from '@google/genai';

const apiKey = process.env.GEMINI_API_KEY || '';

if (!apiKey) {
  console.warn('GEMINI_API_KEY environment variable is missing. AI features will fail without it.');
}

// Instantiate GoogleGenAI client (requires Node.js environment/Server Side)
export const ai = new GoogleGenAI({ apiKey });
export default ai;
