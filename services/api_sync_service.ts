

import { GoogleGenAI, Type } from '@google/genai';
import { ApiProvider, VaultItem } from '../types';
import { backend } from './backend';
import { openai_api } from './openai_api';
import { grok_api } from './grok_api';
import { aws_api } from './aws_api';
import { gemini_api } from './gemini_api';

const getVaultCategories = async (): Promise<string[]> => {
    return await backend.fetchCategories();
};

const normalizeDataWithGemini = async (ai: GoogleGenAI, provider: ApiProvider, session: any): Promise<Omit<VaultItem, 'id' | 'savedAt' | 'syncStatus' | 'origin'>> => {
    const categories = await getVaultCategories();

    let contentToAnalyze = `Title: ${session.title || session.summary || session.sessionId || session.id}\n\n`;
    if (provider === 'openai') {
        contentToAnalyze += session.messages.map((m: any) => `[${m.role}]: ${m.content}`).join('\n');
    } else if (provider === 'grok') {
        contentToAnalyze += session.transcript;
    } else if (provider === 'aws') {
        contentToAnalyze += session.conversation.map((m: any) => `[${m.speaker}]: ${m.text}`).join('\n');
    } else if (provider === 'gemini') {
        contentToAnalyze += session.messages.map((m: any) => `[${m.role}]: ${m.parts.map((p: any) => p.text || '[Non-text content]').join('\n')}`).join('\n');
    }

    const schema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING, description: "A concise, descriptive title for the conversation, max 5 words." },
            summary: { type: Type.STRING, description: "A one-paragraph summary of the key insights or outcomes." },
            category: { type: Type.STRING, description: `The most fitting category from this list: ${JSON.stringify(categories)}` }
        },
        required: ['title', 'summary', 'category']
    };

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [{ role: 'user', parts: [{ text: `Analyze the following conversation log and extract the required information.\n\n${contentToAnalyze}` }] }],
        config: {
            responseMimeType: 'application/json',
            responseSchema: schema,
        },
    });

    const analysis = JSON.parse(response.text);
    const sessionTitle = session.title || session.summary || session.sessionId || session.id;

    return {
        smeConfig: { industry: 'Imported', subType: provider.charAt(0).toUpperCase() + provider.slice(1), segment: analysis.title || sessionTitle },
        message: { role: 'model', parts: [{ text: analysis.summary }] },
        category: categories.includes(analysis.category) ? analysis.category : 'Uncategorized',
        sessionTitle: sessionTitle,
    };
};

export const apiSyncService = {
    async sync(provider: ApiProvider, apiKey: string): Promise<VaultItem[]> {
        if (!process.env.API_KEY) throw new Error("Gemini API_KEY not set.");
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

        let sessions: any[] = [];
        switch (provider) {
            case 'openai':
                sessions = await openai_api.fetchSessions(apiKey);
                break;
            case 'grok':
                sessions = await grok_api.fetchSessions(apiKey);
                break;
            case 'aws':
                sessions = await aws_api.fetchSessions(apiKey);
                break;
            case 'gemini': sessions = await gemini_api.fetchSessions(apiKey); break;
            default:
                throw new Error(`Unsupported provider: ${provider}`);
        }

        const newVaultItems: VaultItem[] = [];
        for (const session of sessions) {
            try {
                const normalizedData = await normalizeDataWithGemini(ai, provider, session);
                const newItem: VaultItem = {
                    ...normalizedData,
                    id: `vault_${provider}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
                    savedAt: Date.now(),
                    syncStatus: 'synced',
                    origin: provider,
                };
                newVaultItems.push(newItem);
            } catch(e) {
                console.error(`Failed to normalize session ${session.id || session.sessionId} from ${provider}`, e);
                // Continue to next session
            }
        }

        return newVaultItems;
    }
};
