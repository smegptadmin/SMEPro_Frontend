

export type SubscriptionPlan = 'solo' | 'business';
export type SubscriptionType = 'trial' | 'payNow';

export type ApiProvider = 'openai' | 'grok' | 'aws' | 'gemini';

export interface ApiConnector {
  provider: ApiProvider;
  apiKey: string;
  isEnabled: boolean;
  syncStatus: 'idle' | 'syncing' | 'synced' | 'error';
  lastSynced?: number;
}

export interface UserProfile {
  name: string;
  email: string;
  accountType: SubscriptionPlan;
  billingCycle?: 'monthly' | 'annual';
  apiConnectors?: ApiConnector[];
}

export interface SmeConfig {
  industry: string;
  subType: string;
  segment: string;
}

// A part can be text or inline data (image, video, audio etc.)
// This structure aligns with the Gemini API request format
export interface Part {
  text?: string;
  inlineData?: {
    mimeType: string;
    data: string; // base64 encoded string
  };
}

// New interface for a single clickable item in an interactive response
export interface InteractiveItem {
  title: string;
  summary: string;
  followUpPrompt: string;
}

// New interface for the overall structure of an interactive response
export interface InteractiveResponseData {
  introduction: string;
  items: InteractiveItem[];
}

// New interface for a single action type in the intermediate selection step
export interface ActionTypeItem {
  type: 'procedure' | 'forms' | 'information' | 'contacts';
  title: string;
  description: string;
  followUpPrompt: string;
}

// New interface for the action type selection menu
export interface ActionTypeResponseData {
  topic: string;
  introduction: string;
  actions: ActionTypeItem[];
}

// New interface for a step within a guided session
export interface Step {
  title: string;
  description: string;
  status: 'pending' | 'active' | 'complete';
}

// New interface for the overall structure of a guided session
export interface GuidedSessionData {
  title: string;
  objective: string;
  steps: Step[];
}

export interface Citation {
  uri: string;
  title: string;
}

// Interface for recommending a new SME to join the chat
export interface SmeSuggestionData {
    reasoning: string;
    suggestedSme: SmeConfig;
}

export interface Message {
  role: 'user' | 'model';
  parts: Part[];
  citations?: Citation[];
  feedback?: { vote: 'up' | 'down'; text?: string } | null;
  interactiveData?: InteractiveResponseData;
  guidedSessionData?: GuidedSessionData; // Optional field for structured guided sessions
  actionTypeData?: ActionTypeResponseData; // Optional field for intermediate action selection
  smeSuggestionData?: SmeSuggestionData; // Optional field for suggesting a new SME
  suggestedPrompts?: string[];
  // Collaboration fields
  userId?: string; // email of the user
  userName?: string; // name of the user
}


// Represents a file attachment before it's sent
export interface Attachment {
  file: File;
  type: 'image' | 'video' | 'audio';
  previewUrl: string; // Object URL for previewing
}

// Represents a full chat session with its metadata
export interface ChatSession {
  sessionId: string; // Unique ID for the session
  plan: 'solo' | 'business';
  smeConfigs: SmeConfig[];
  messages: Message[];
  participants: UserProfile[];
  lastModified: number;
  title?: string; // Optional custom title for the session
}

// Represents a single curated item saved to the user's knowledge base
export interface VaultItem {
  id: string;
  smeConfig: SmeConfig;
  message: Message;
  savedAt: number;
  category: string;
  syncStatus: 'pending' | 'synced' | 'error';
  sessionTitle?: string;
  origin?: 'smepro' | 'openai' | 'grok' | 'aws' | 'gemini';
  sourceSessionId?: string; // ID of the session this item was saved from
}

// Represents the state of the new AI-powered context search
export interface ContextualSearchState {
  query: string;
  result: string;
  isLoading: boolean;
}

// Represents a single search result item for the landing page search
export interface SearchResult {
  title: string;
  content: string;
  keywords: string[];
}

// Mock type for OpenAI session data
export interface OpenAiChatMessage {
    role: 'user' | 'assistant';
    content: string;
}

export interface OpenAiSession {
    id: string;
    title: string;
    messages: OpenAiChatMessage[];
}

// Mock type for Gemini session data
export interface GeminiChatMessage {
    role: 'user' | 'model';
    parts: Part[];
}

export interface GeminiSession {
    id: string;
    title: string;
    messages: GeminiChatMessage[];
}

// Represents a user who is currently typing
export interface TypingUser {
    userId: string;
    userName: string;
}

// Represents a logged instance of a safety violation
export interface FlaggedPrompt {
  id: string;
  timestamp: number;
  userId: string; // user's email
  prompt: string;
  detectionMethod: 'keyword' | 'ai';
  actionTaken: 'warn' | 'lockout';
  details: string; // The keyword or the AI's reasoning
}