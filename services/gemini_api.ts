
import { GeminiSession } from '../types';

const mockGeminiSessions: GeminiSession[] = [
  {
    "id": "gemini_session_01",
    "title": "Exploring Gemini Pro Features",
    "messages": [
      { "role": "user", "parts": [{ "text": "What are the main differences between Gemini Pro and Gemini Flash?" }] },
      { "role": "model", "parts": [{ "text": "Gemini Pro is optimized for complex reasoning tasks, while Gemini Flash is designed for speed and efficiency in high-volume, quick-response scenarios. Pro offers a larger context window and more advanced capabilities." }] }
    ]
  },
  {
    "id": "gemini_session_02",
    "title": "Drafting System Instructions",
    "messages": [
      { "role": "user", "parts": [{ "text": "Can you give me an example of a good system instruction for a code generation assistant?" }] },
      { "role": "model", "parts": [{ "text": "Certainly. A good system instruction would be: 'You are an expert programmer specializing in Python and TypeScript. Always provide clean, well-documented code. When asked for a function, include type hints and a brief explanation of its purpose.'" }] }
    ]
  }
];

export const gemini_api = {
  async fetchSessions(apiKey: string): Promise<GeminiSession[]> {
    // In a real app, you'd use the apiKey to make an API call.
    // Here, we simulate a network delay and return mock data.
    console.log(`Simulating Gemini fetch with API key: ${apiKey ? 'provided' : 'not provided'}`);
    await new Promise(res => setTimeout(res, 900));
    return JSON.parse(JSON.stringify(mockGeminiSessions)); // Deep copy
  }
};
