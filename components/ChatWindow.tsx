

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { GoogleGenAI, Type } from '@google/genai';
import { marked } from 'marked';
import { SmeConfig, Message, Part, Attachment, GuidedSessionData, Step, Citation, ContextualSearchState, ChatSession, UserProfile, TypingUser, VaultItem, FlaggedPrompt } from '../types';
import InteractiveResponse from './InteractiveResponse';
import GuidedSession from './GuidedSession';
import ActionTypeResponse from './ActionTypeResponse';
import CitationsModal from './CitationsModal';
import ContextSearch from './ContextSearch';
import SaveToVaultModal from './SaveToVaultModal';
import SuggestedPrompts from './SuggestedPrompts';
import { collaborationService } from '../services/collaboration_service';
import ShareSessionModal from './ShareSessionModal';
import { backend } from '../services/backend';
import SmeSuggestion from './SmeSuggestion';
import ContextPopover from './ContextPopover';
import LockoutWarningModal from './LockoutWarningModal';

// Let TS know about the global hljs from the script tag in index.html
declare const hljs: any;

// Helper function to attach copy code functionality to window
if (typeof window !== 'undefined') {
  (window as any).copyCode = (button: HTMLButtonElement) => {
    const pre = button.closest('.code-block-wrapper')?.querySelector('pre');
    if (pre) {
      navigator.clipboard.writeText(pre.innerText);
      button.innerText = 'Copied!';
      setTimeout(() => {
        button.innerText = 'Copy';
      }, 2000);
    }
  };
}


// Create a new marked instance with a custom renderer for enhanced markdown
const renderer = new marked.Renderer();

// FIX: The type definitions for `marked` appear to be for a newer version than the code is written for.
// Casting the renderer to `any` to assign the custom functions bypasses the compile-time type mismatch,
// assuming the runtime version of `marked` still supports this signature.
(renderer as any).code = function(this: any, code: string, infostring: string | undefined): string {
  const language = (infostring || '').match(/\S*/)?.[0];
  const lang = (language || 'text').toLowerCase();
  const highlightedCode = hljs.getLanguage(lang)
    ? hljs.highlight(code, { language: lang, ignoreIllegals: true }).value
    : hljs.highlightAuto(code).value;
  
  const copyButton = `<button onclick="window.copyCode(this)">Copy</button>`;
  const langDisplay = `<span>${lang}</span>`;
  const header = `<div class="code-block-header">${langDisplay}${copyButton}</div>`;
  
  const codeBlock = `<pre><code class="hljs language-${lang}">${highlightedCode}</code></pre>`;
  
  return `<div class="code-block-wrapper">${header}${codeBlock}</div>`;
};

// FIX: Corrected the `this` type to `any` and cast to `any` to bypass signature mismatch for the table renderer.
(renderer as any).table = function(this: any, header: string, body: string): string {
  if (body) body = `<tbody>${body}</tbody>`;

  return `<div class="table-wrapper"><table><thead>${header}</thead>${body}</table></div>`;
};


marked.use({
  renderer,
  gfm: true,
  breaks: true,
});

interface ChatWindowProps {
  session: ChatSession;
  userProfile: UserProfile;
  lockoutEndTime: number | null;
  onToggleSidebar: () => void;
  onShowVault: () => void;
  onShowDashboard: () => void;
  onProfileEdit: () => void;
  onAddSme: (query?: string) => void;
  onEndSessionForSafety: () => void;
  onShowSafeAiModal: () => void;
  onHarmfulPromptDetected: (details: Omit<FlaggedPrompt, 'id' | 'timestamp' | 'userId' | 'actionTaken'>) => void;
}

type ChatMode = 'quickInsight' | 'expertSolution' | 'verifiedSources' | 'deepContext';

const ChatWindow: React.FC<ChatWindowProps> = ({ session, userProfile, lockoutEndTime, onToggleSidebar, onShowVault, onShowDashboard, onProfileEdit, onAddSme, onEndSessionForSafety, onShowSafeAiModal, onHarmfulPromptDetected }) => {
  const [currentSession, setCurrentSession] = useState<ChatSession>(session);
  const [messages, setMessages] = useState<Message[]>(session.messages);
  const [participants, setParticipants] = useState<UserProfile[]>(session.participants);
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editingTitleText, setEditingTitleText] = useState('');
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [safetyKeywords, setSafetyKeywords] = useState<string[]>([]);

  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [chatMode, setChatMode] = useState<ChatMode>('verifiedSources');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const [isCitationsModalOpen, setIsCitationsModalOpen] = useState(false);
  const [citationsToShow, setCitationsToShow] = useState<Citation[]>([]);
  const [contextSearchState, setContextSearchState] = useState<ContextualSearchState>({ query: '', result: '', isLoading: false });
  const [isSaveToVaultModalOpen, setIsSaveToVaultModalOpen] = useState(false);
  const [messageToSave, setMessageToSave] = useState<Message | null>(null);
  const [popoverState, setPopoverState] = useState<{ term: string, target: HTMLElement } | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Subscribe to real-time updates for the current session
  useEffect(() => {
    const handleSessionUpdate = (updatedSession: ChatSession) => {
        setCurrentSession(updatedSession);
        setMessages(updatedSession.messages);
        setParticipants(updatedSession.participants);
    };
    const handleTypingUpdate = (users: TypingUser[]) => {
        setTypingUsers(users.filter(u => u.userId !== userProfile.email));
    };

    collaborationService.subscribe(session.sessionId, handleSessionUpdate);
    collaborationService.subscribeToTyping(session.sessionId, handleTypingUpdate);
    
    // Join session
    collaborationService.joinSession(session.sessionId, userProfile);

    return () => {
        collaborationService.unsubscribe(session.sessionId, handleSessionUpdate);
        collaborationService.unsubscribeFromTyping(session.sessionId, handleTypingUpdate);
        // Leave session
        collaborationService.leaveSession(session.sessionId, userProfile);
    };
  }, [session.sessionId, userProfile]);

  useEffect(() => {
    // Fetch safety keywords on component mount
    backend.fetchSafetyKeywords().then(setSafetyKeywords);
  }, []);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading, typingUsers]);

  // Logic for handling user typing status
  useEffect(() => {
    const isTyping = userInput.length > 0;
    collaborationService.updateTypingStatus(session.sessionId, userProfile, isTyping);
  }, [userInput, session.sessionId, userProfile]);
  
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditingTitleText(e.target.value);
  };

  const handleTitleSave = () => {
    if (editingTitleText.trim()) {
        collaborationService.updateSessionTitle(session.sessionId, editingTitleText.trim());
    } else {
        collaborationService.updateSessionTitle(session.sessionId, undefined);
    }
    setIsEditingTitle(false);
  };
  
  const handleTitleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleTitleSave();
    if (e.key === 'Escape') {
        setIsEditingTitle(false);
        setEditingTitleText(currentSession.title || '');
    }
  };


  const handleStartTitleEdit = () => {
    setEditingTitleText(currentSession.title || '');
    setIsEditingTitle(true);
  };

  const performSafetyCheck = async (text: string): Promise<{ flagged: boolean; reason: 'keyword' | 'ai'; details: string } | null> => {
    const lowerText = text.toLowerCase();
    for (const keyword of safetyKeywords) {
      if (lowerText.includes(keyword.toLowerCase())) {
        return { flagged: true, reason: 'keyword', details: keyword };
      }
    }
    
    try {
        if (!process.env.API_KEY) return null; // Can't perform AI check
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const schema = {
            type: Type.OBJECT,
            properties: {
                isHarmful: { type: Type.BOOLEAN },
                category: { type: Type.STRING, description: "Category of harm, e.g., 'Hate Speech', 'Self-Harm', 'Illegal Acts', 'Harassment', 'Dangerous Content'." },
                reasoning: { type: Type.STRING, description: "A brief explanation for the classification." }
            },
            required: ['isHarmful', 'category', 'reasoning']
        };
        
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: [{ role: 'user', parts: [{ text: `Analyze the following user prompt for harmful content. Classify it based on the provided schema. Prompt: "${text}"` }] }],
            config: { responseMimeType: 'application/json', responseSchema: schema }
        });

        const analysis = JSON.parse(response.text);
        if (analysis.isHarmful) {
            return { flagged: true, reason: 'ai', details: `${analysis.category}: ${analysis.reasoning}` };
        }
    } catch (e) {
        console.error("SAFE AI analysis failed:", e);
        // Fail safe: if the safety check fails, let the prompt through but log the error.
    }

    return null;
  };

  const handleAddSme = async (config: SmeConfig) => {
    // The service now handles generating the introduction message
    await collaborationService.addSmeToSession(session.sessionId, config, messages);
  };

  const getSystemInstruction = (): Part => {
    let smeContext: string;
    if (currentSession.smeConfigs.length > 1) {
        const expertsList = currentSession.smeConfigs
            .map(c => `- An expert in **${c.segment}** within ${c.subType}, in the ${c.industry} industry.`)
            .join('\n');

        smeContext = `You are a team of expert SMEs working together in a collaborative workspace. Your team consists of:\n${expertsList}\n\nWhen responding, you MUST preface your response with the expert's title (e.g., "[Drilling Engineer]: ...") to indicate who is speaking. This is crucial for clarity. If the response is a synthesis of knowledge from multiple experts, use "[Combined Expertise]: ...". Be clear, concise, and actionable.`;
    } else if (currentSession.smeConfigs.length === 1) {
        const c = currentSession.smeConfigs[0];
        smeContext = `You are an expert in **${c.segment}** within ${c.subType}, in the ${c.industry} industry. Your persona is a helpful, expert SME. Be clear, concise, and actionable.`;
    } else {
        smeContext = 'You are a general helpful assistant.';
    }

    const mentorMode = messages.some(m => m.guidedSessionData)
        ? `\n\nMENTOR MODE: The user is in a guided session. Focus your responses on helping them complete the currently 'active' step.`
        : '';
        
    return { text: `${smeContext}${mentorMode}` };
  };
  
  const sendAndStreamJsonRequest = async (userMessage: Message, systemInstruction: Part) => {
    setIsLoading(true);
    setError(null);
    await collaborationService.sendMessage(session.sessionId, userMessage);
    const modelMessage: Message = { role: 'model', parts: [{ text: '' }] };
    await collaborationService.sendMessage(session.sessionId, modelMessage);

    try {
        if (!process.env.API_KEY) throw new Error("API_KEY not set.");
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        
        const history = messages.map(msg => ({ role: msg.role, parts: msg.parts }));
        const contents = [...history, { role: 'user', parts: userMessage.parts }];
        
        const smeSuggestionSchema = {
            type: Type.OBJECT,
            description: "A suggestion to add a different SME. Only generate this if the user's question is clearly outside the scope of your current expertise but related to another possible SME. If the question is on topic, this must be null.",
            nullable: true,
            properties: {
                reasoning: { type: Type.STRING, description: 'Explain why another SME would be better suited for this query.' },
                suggestedSme: {
                    type: Type.OBJECT,
                    properties: {
                        industry: { type: Type.STRING },
                        subType: { type: Type.STRING },
                        segment: { type: Type.STRING },
                    },
                    required: ['industry', 'subType', 'segment'],
                }
            }
        };

        const responseSchema = {
            type: Type.OBJECT,
            properties: {
                markdownContent: { type: Type.STRING, description: 'The main response formatted in markdown.' },
                suggestedPrompts: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'A list of 3 relevant follow-up questions or prompts.' },
                guidedSessionData: {
                    type: Type.OBJECT,
                    description: 'A step-by-step plan. Only generate this if the user asks for a plan, procedure, or multi-step process.',
                    nullable: true,
                    properties: {
                        title: { type: Type.STRING },
                        objective: { type: Type.STRING },
                        steps: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: { title: { type: Type.STRING }, description: { type: Type.STRING } },
                                required: ['title', 'description']
                            }
                        }
                    }
                },
                smeSuggestionData: session.smeConfigs.length > 1 ? undefined : smeSuggestionSchema, // Only allow suggestions in single-SME mode
            },
            required: ['markdownContent', 'suggestedPrompts']
        };

        const responseStream = await ai.models.generateContentStream({
            model: 'gemini-2.5-pro',
            contents: [{ role: 'user', parts: [systemInstruction, ...userMessage.parts] }],
            config: { responseMimeType: 'application/json', responseSchema: responseSchema },
        });

        let fullResponseText = '';
        for await (const chunk of responseStream) {
            fullResponseText += chunk.text;
            await collaborationService.updateStreamingMessage(session.sessionId, fullResponseText);
        }
        
        try {
            const parsedResponse = JSON.parse(fullResponseText);
            const finalMessage: Message = {
                role: 'model',
                parts: [{ text: parsedResponse.markdownContent }],
                suggestedPrompts: parsedResponse.suggestedPrompts,
                guidedSessionData: parsedResponse.guidedSessionData ? { ...parsedResponse.guidedSessionData, steps: parsedResponse.guidedSessionData.steps.map((step: any, index: number) => ({ ...step, status: index === 0 ? 'active' : 'pending' }))} : undefined,
                smeSuggestionData: parsedResponse.smeSuggestionData,
            };
            await collaborationService.replaceLastMessage(session.sessionId, finalMessage);
        } catch (jsonError) {
            console.error("Failed to parse final JSON from stream", jsonError);
            console.error("Full response text was:\n", fullResponseText);
            const mdMatch = fullResponseText.match(/"markdownContent"\s*:\s*"((?:\\.|[^"])*)"/);
            const salvagedContent = mdMatch ? JSON.parse(`"${mdMatch[1]}"`) : "I apologize, but I encountered a formatting error in my response. Please try again.";
            const fallbackMessage: Message = { role: 'model', parts: [{ text: salvagedContent + "\n\n*(Note: Full structured response could not be displayed due to a formatting error.)*" }] };
            await collaborationService.replaceLastMessage(session.sessionId, fallbackMessage);
        }
    } catch (e) {
        const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
        setError(errorMessage);
        const errorMsg: Message = { role: 'model', parts: [{ text: `Sorry, I ran into an error: ${errorMessage}` }]};
        await collaborationService.replaceLastMessage(session.sessionId, errorMsg);
    } finally {
        setIsLoading(false);
    }
  };
  
  const sendStreamingRequestWithCitations = async (userMessage: Message, systemInstruction: Part) => {
    setIsLoading(true);
    setError(null);
    await collaborationService.sendMessage(session.sessionId, userMessage);
    const modelMessage: Message = { role: 'model', parts: [{ text: '' }] };
    await collaborationService.sendMessage(session.sessionId, modelMessage);

    try {
        if (!process.env.API_KEY) throw new Error("API_KEY not set.");
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: [{ role: 'user', parts: [systemInstruction, ...userMessage.parts] }],
            config: { tools: [{ googleSearch: {} }] },
        });

        const citations = (response.candidates?.[0]?.groundingMetadata?.groundingChunks || [])
            .map((c: any) => ({ uri: c.web.uri, title: c.web.title }))
            .filter((c: any) => c.uri && c.title);
        
        const finalMessage: Message = { role: 'model', parts: [{ text: response.text }], citations };
        await collaborationService.replaceLastMessage(session.sessionId, finalMessage);
    } catch (e) {
        const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
        setError(errorMessage);
        const errorMsg: Message = { role: 'model', parts: [{ text: `Sorry, I ran into an error: ${errorMessage}` }]};
        await collaborationService.replaceLastMessage(session.sessionId, errorMsg);
    } finally {
        setIsLoading(false);
    }
  };

  const handleSendMessage = async (e?: React.FormEvent, prompt?: string) => {
    e?.preventDefault();
    const textToSend = prompt || userInput;
    if (!textToSend.trim() && attachments.length === 0) return;

    // AI Safety Check
    const safetyViolation = await performSafetyCheck(textToSend);
    if (safetyViolation) {
        onHarmfulPromptDetected({
            prompt: textToSend,
            detectionMethod: safetyViolation.reason,
            details: safetyViolation.details
        });
        setUserInput(''); // Clear the harmful prompt
        return;
    }
    
    // Slash command for adding SME
    if (textToSend.trim().startsWith('/add ')) {
      const query = textToSend.trim().substring(5);
      onAddSme(query);
      setUserInput('');
      return;
    }

    const messageParts: Part[] = [{ text: textToSend }];
    for (const attachment of attachments) {
        const base64 = await fileToBase64(attachment.file);
        messageParts.push({ inlineData: { mimeType: attachment.file.type, data: base64 } });
    }

    const userMessage: Message = { role: 'user', parts: messageParts, userId: userProfile.email, userName: userProfile.name };
    
    setUserInput('');
    setAttachments([]);

    const systemInstruction = getSystemInstruction();

    if (chatMode === 'verifiedSources') {
        await sendStreamingRequestWithCitations(userMessage, systemInstruction);
    } else {
        await sendAndStreamJsonRequest(userMessage, systemInstruction);
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            const result = (reader.result as string).split(',')[1];
            resolve(result);
        };
        reader.onerror = error => reject(error);
    });
  };

  const handleSuggestedPromptClick = (prompt: string) => {
    setUserInput(prompt); // Set input to allow editing before sending
    handleSendMessage(undefined, prompt);
  };
  
  const handleStepSelect = async (messageIndex: number, stepIndex: number) => {
    await collaborationService.updateGuidedSessionStep(session.sessionId, messageIndex, stepIndex, 'select');
  };

  const handleStepComplete = async (messageIndex: number, stepIndex: number) => {
    await collaborationService.updateGuidedSessionStep(session.sessionId, messageIndex, stepIndex, 'complete');
  };
  
  const handleSaveToVault = (message: Message) => {
    setMessageToSave(message);
    setIsSaveToVaultModalOpen(true);
  };

  const handleVaultSaveSuccess = () => {
    onShowVault();
  };
  
  const handleAnalyzeContext = async (query: string, selectedSessions: ChatSession[]) => {
    setContextSearchState(prev => ({ ...prev, isLoading: true, query, result: '' }));
    
    try {
        if (!process.env.API_KEY) throw new Error("API_KEY not set.");
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        
        const contextForAnalysis = selectedSessions
            .map(s => `--- SESSION START ---\nTitle: ${s.title || 'Untitled'}\nSME: ${s.smeConfigs.map(c => c.segment).join(', ')}\n\n${s.messages.map(m => `[${m.role}]: ${m.parts.map(p => p.text).join('\n')}`).join('\n')}\n--- SESSION END ---`)
            .join('\n\n');

        const systemInstruction = { text: `You are an AI assistant that analyzes collections of past conversations to synthesize new insights. The user has provided several of their past SMEPro chat sessions. Your task is to analyze them in the context of their query ("${query}") and provide a concise, actionable summary or a direct answer. Be insightful and find connections between sessions.` };

        const responseStream = await ai.models.generateContentStream({
            model: 'gemini-2.5-flash',
            contents: [{ role: 'user', parts: [systemInstruction, { text: contextForAnalysis }] }],
        });

        let fullResponseText = '';
        for await (const chunk of responseStream) {
            fullResponseText += chunk.text;
            setContextSearchState(prev => ({ ...prev, result: fullResponseText }));
        }

    } catch (e) {
        const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
        setContextSearchState(prev => ({ ...prev, result: `Analysis failed: ${errorMessage}`}));
    } finally {
        setContextSearchState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const handleMessageClick = (e: React.MouseEvent<HTMLElement>) => {
    const target = e.target as HTMLElement;
    if (target.tagName === 'STRONG' && target.closest('.prose') && target.closest('[data-message-role="model"]')) {
      const term = target.textContent?.trim();
      if (term) {
        setPopoverState({ term, target });
      }
    }
  };
  
  const handleSaveFromPopover = async (term: string, definition: string) => {
    const newItem: Omit<VaultItem, 'id' | 'savedAt' | 'syncStatus'> = {
      smeConfig: { industry: 'Lexicon', subType: 'Generated Insight', segment: term },
      message: { role: 'model', parts: [{ text: definition }] },
      category: 'Generated Definitions',
      sessionTitle: `Definition of ${term}`,
      origin: 'smepro',
      sourceSessionId: currentSession.sessionId,
    };

    const fullItem: VaultItem = {
      ...newItem,
      id: `vault_${Date.now()}`,
      savedAt: Date.now(),
      syncStatus: 'pending',
    };
    
    await backend.saveVaultItem(fullItem);
    setPopoverState(null);
  };

  const renderHeader = () => (
    <header className="flex-shrink-0 flex items-center justify-between p-4 border-b border-slate-700">
        <div className="flex items-center gap-3 min-w-0">
             <button onClick={onToggleSidebar} className="p-1 rounded-full text-slate-400 hover:bg-slate-700 transition-colors md:hidden">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path fillRule="evenodd" d="M2 4.75A.75.75 0 0 1 2.75 4h14.5a.75.75 0 0 1 0 1.5H2.75A.75.75 0 0 1 2 4.75ZM2 10a.75.75 0 0 1 .75-.75h14.5a.75.75 0 0 1 0 1.5H2.75A.75.75 0 0 1 2 10Zm0 5.25a.75.75 0 0 1 .75-.75h14.5a.75.75 0 0 1 0 1.5H2.75A.75.75 0 0 1-.75-.75Z" clipRule="evenodd" /></svg>
             </button>
            <div className="min-w-0">
                {isEditingTitle ? (
                    <input
                        type="text"
                        value={editingTitleText}
                        onChange={handleTitleChange}
                        onBlur={handleTitleSave}
                        onKeyDown={handleTitleKeyDown}
                        className="bg-slate-700 text-white rounded px-2 py-1 text-lg font-bold w-full"
                        autoFocus
                    />
                ) : (
                    <div className="flex items-center gap-2">
                        <h1 className="text-lg font-bold text-white truncate" title={currentSession.title || 'Untitled Session'}>{currentSession.title || 'Untitled Session'}</h1>
                        <button onClick={handleStartTitleEdit} className="text-slate-500 hover:text-white flex-shrink-0"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4"><path d="M11.354 1.646a.5.5 0 0 1 .708 0l2 2a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.354.146H2.5a.5.5 0 0 1-.5-.5v-1.146a.5.5 0 0 1 .146-.354l10-10Z" /><path d="M10.5 2.5a.5.5 0 0 0-.5-.5H3a.5.5 0 0 0-.5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5V7h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h1.146l-2-2Z" /></svg></button>
                    </div>
                )}
                 <p className="text-xs text-slate-400 truncate">
                    {currentSession.smeConfigs.map(c => c.segment).join(', ')}
                 </p>
            </div>
        </div>
        <div className="flex items-center gap-2">
            <button onClick={onShowSafeAiModal} className="p-2 rounded-full text-slate-400 hover:bg-slate-700 hover:text-white" title="SAFE AI"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path fillRule="evenodd" d="M10 1a.75.75 0 0 1 .75.75v1.5a.75.75 0 0 1-1.5 0v-1.5A.75.75 0 0 1 10 1ZM8.5 4.134a.75.75 0 0 1 .866-.5A6.5 6.5 0 0 1 18.366 12a.75.75 0 0 1-1.498.088 5 5 0 0 0-9.736-2.22.75.75 0 0 1 .434-1.392Z" clipRule="evenodd" /><path d="M3.293 4.293a.75.75 0 0 1 1.06 0l10 10a.75.75 0 0 1-1.06 1.06l-10-10a.75.75 0 0 1 0-1.06Z" /></svg></button>
            <button onClick={() => onAddSme()} className="p-2 rounded-full text-slate-400 hover:bg-slate-700 hover:text-white" title="Add another expert"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path d="M11 5a3 3 0 1 1-6 0 3 3 0 0 1 6 0ZM11 6a1 1 0 1 0-2 0 1 1 0 0 0 2 0Z" /><path d="M10 9a5.001 5.001 0 0 0-4.223 2.344.75.75 0 0 0 .946 1.112A3.501 3.501 0 0 1 10 11.5a3.501 3.501 0 0 1 3.277 1.956.75.75 0 0 0 .946-1.112A5.001 5.001 0 0 0 10 9Z" /><path d="M15 9.5a.75.75 0 0 0-1.5 0v1.5h-1.5a.75.75 0 0 0 0 1.5h1.5v1.5a.75.75 0 0 0 1.5 0v-1.5h1.5a.75.75 0 0 0 0-1.5h-1.5V9.5Z" /></svg></button>
            <button onClick={() => setIsShareModalOpen(true)} className="p-2 rounded-full text-slate-400 hover:bg-slate-700 hover:text-white" title="Share Session"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path fillRule="evenodd" d="M12.586 4.414a1.5 1.5 0 0 1 2.122 0l1.293 1.293a1.5 1.5 0 0 1 0 2.122l-2.439 2.439a.75.75 0 0 1-1.06-1.06l2.439-2.439a.001.001 0 0 0 0-2.122l-1.293-1.293a.001.001 0 0 0-2.122 0L9.9 7.03a.75.75 0 0 1-1.06-1.06l2.746-2.556Z" clipRule="evenodd" /><path fillRule="evenodd" d="M7.414 15.586a1.5 1.5 0 0 1-2.122 0L4.002 14.3a1.5 1.5 0 0 1 0-2.122l2.439-2.439a.75.75 0 0 1 1.06 1.06L5.06 13.253a.001.001 0 0 0 0 2.122l1.293 1.293a.001.001 0 0 0 2.122 0l2.556-2.746a.75.75 0 0 1 1.06 1.06L7.414 15.586Z" clipRule="evenodd" /></svg></button>
            <div className="relative group"><button onClick={onProfileEdit} className="w-8 h-8 rounded-full bg-slate-700 text-white flex items-center justify-center font-bold">{userProfile.name.charAt(0)}</button><span className="absolute top-full mt-2 right-0 w-max bg-slate-900 text-xs text-white px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">Profile & Settings</span></div>
        </div>
    </header>
  );

  if (lockoutEndTime && Date.now() < lockoutEndTime) {
    return <LockoutWarningModal endTime={lockoutEndTime} />;
  }

  return (
    <div className="flex flex-col h-full">
        {renderHeader()}
        
        {chatMode === 'deepContext' ? (
            <ContextSearch {...contextSearchState} onClose={() => setChatMode('quickInsight')} onAnalyze={handleAnalyzeContext} />
        ) : (
            <>
              <main className="flex-1 overflow-y-auto p-4 space-y-4" onClick={handleMessageClick}>
                  {messages.map((msg, index) => (
                      <div key={index} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`} data-message-role={msg.role}>
                          {msg.role === 'model' && <div className="w-7 h-7 rounded-full bg-cyan-900/50 text-cyan-400 flex items-center justify-center flex-shrink-0 text-sm font-bold">SME</div>}
                          <div className={`max-w-xl ${msg.role === 'user' ? 'bg-indigo-500 text-white' : 'bg-slate-700'} rounded-2xl p-3`}>
                              {msg.parts.map((part, pIndex) => (
                                  part.text && (
                                    <div key={pIndex} className="prose prose-invert prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: marked.parse(part.text) as string }} />
                                  )
                              ))}
                              {msg.guidedSessionData && <GuidedSession data={msg.guidedSessionData} messageIndex={index} onStepSelect={handleStepSelect} onStepComplete={handleStepComplete} />}
                              {msg.smeSuggestionData && <SmeSuggestion data={msg.smeSuggestionData} onActivate={handleAddSme} />}
                              {msg.citations && msg.citations.length > 0 && <button onClick={() => { setCitationsToShow(msg.citations!); setIsCitationsModalOpen(true);}} className="text-xs text-cyan-400 hover:underline mt-2">View Sources ({msg.citations.length})</button>}
                          </div>
                           {msg.role === 'model' && (
                              <button className="vault-button p-1 text-slate-500 hover:text-cyan-400 self-start" title="Save to Vault" onClick={() => handleSaveToVault(msg)}>
                                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M4.5 2A1.5 1.5 0 0 0 3 3.5v13.09a.75.75 0 0 0 1.21.62L10 12.811l5.79 4.4a.75.75 0 0 0 1.21-.62V3.5A1.5 1.5 0 0 0 15.5 2h-11Z" clipRule="evenodd" /></svg>
                              </button>
                           )}
                      </div>
                  ))}
                  {isLoading && messages[messages.length-1]?.role !== 'model' && <div className="flex gap-3"><div className="w-7 h-7 rounded-full bg-cyan-900/50 text-cyan-400 flex items-center justify-center text-sm font-bold">SME</div><div className="bg-slate-700 rounded-2xl p-3"><span className="blinking-cursor">|</span></div></div>}
                  <div ref={messagesEndRef} />
              </main>

              <footer className="flex-shrink-0 p-4 border-t border-slate-700">
                {typingUsers.length > 0 && <div className="text-xs text-slate-400 mb-2">{typingUsers.map(u=>u.userName).join(', ')} is typing...</div>}
                <div className="bg-slate-700 rounded-xl p-2 flex items-end">
                    <textarea
                      ref={inputRef}
                      value={userInput}
                      onChange={e => setUserInput(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { handleSendMessage(e); e.preventDefault(); }}}
                      placeholder="Ask your SME anything... or type '/add' to find another expert"
                      className="w-full bg-transparent text-white placeholder-slate-400 resize-none focus:outline-none p-2"
                      rows={1}
                      disabled={isLoading}
                    />
                    <button 
                        onClick={() => handleSendMessage()} 
                        disabled={isLoading || !userInput.trim()} 
                        className={`p-2 rounded-full transition-colors ${userInput.trim() && !isLoading ? 'bg-cyan-600 text-white hover:bg-cyan-500' : 'text-slate-400'} disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path d="M3.105 2.289a.75.75 0 0 0-.826.95l1.414 4.949a.75.75 0 0 0 .135.252l.02.034.018.031a.75.75 0 0 0 .27.243l3.838 1.406a.75.75 0 0 1 0 1.348l-3.838 1.406a.75.75 0 0 0-.27.243l-.018.03-.02.035a.75.75 0 0 0-.135.252L2.279 16.76a.75.75 0 0 0 .95.826l14.25-3.562a.75.75 0 0 0 0-1.448L3.105 2.289Z" /></svg>
                    </button>
                </div>
              </footer>
            </>
        )}
        {isCitationsModalOpen && <CitationsModal isOpen={isCitationsModalOpen} onClose={() => setIsCitationsModalOpen(false)} citations={citationsToShow} />}
        {isSaveToVaultModalOpen && messageToSave && <SaveToVaultModal messageToSave={messageToSave} smeConfig={currentSession.smeConfigs[0]} onClose={() => setIsSaveToVaultModalOpen(false)} onSuccess={handleVaultSaveSuccess} sessionTitle={currentSession.title} defaultCategory="Research & Data" />}
        {isShareModalOpen && <ShareSessionModal sessionId={session.sessionId} onClose={() => setIsShareModalOpen(false)} />}
        {/* FIX: Removed unused sessionId prop from ContextPopover. The onSave handler already has access to it. */}
        {popoverState && <ContextPopover term={popoverState.term} targetElement={popoverState.target} onClose={() => setPopoverState(null)} onSave={handleSaveFromPopover} />}
    </div>
  );
};

export default ChatWindow;