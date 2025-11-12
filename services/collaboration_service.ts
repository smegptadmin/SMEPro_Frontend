import { ChatSession, Message, SmeConfig, UserProfile } from '../types';

const BASE_URL = import.meta.env.VITE_BACKEND_URL;

// --- Sessions ---
export async function fetchAllSessions(): Promise<ChatSession[]> {
  const res = await fetch(`${BASE_URL}/sessions`);
  return res.json();
}

export async function fetchSession(sessionId: string): Promise<ChatSession> {
  const res = await fetch(`${BASE_URL}/sessions/${sessionId}`);
  return res.json();
}

export async function createSession(sessionData: Partial<ChatSession>): Promise<ChatSession> {
  const res = await fetch(`${BASE_URL}/sessions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(sessionData),
  });
  return res.json();
}

export async function deleteSession(sessionId: string): Promise<void> {
  await fetch(`${BASE_URL}/sessions/${sessionId}`, { method: "DELETE" });
}

// --- Messages ---
export async function sendMessage(sessionId: string, message: Message): Promise<Message> {
  const res = await fetch(`${BASE_URL}/sessions/${sessionId}/messages`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(message),
  });
  return res.json();
}

// --- SMEs ---
export async function addSmeToSession(sessionId: string, smeConfig: SmeConfig): Promise<SmeConfig> {
  const res = await fetch(`${BASE_URL}/sessions/${sessionId}/smes`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(smeConfig),
  });
  return res.json();
}

// --- Participants ---
export async function joinSession(sessionId: string, user: UserProfile): Promise<UserProfile> {
  const res = await fetch(`${BASE_URL}/sessions/${sessionId}/participants`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(user),
  });
  return res.json();
}

export async function leaveSession(sessionId: string, user: UserProfile): Promise<void> {
  await fetch(`${BASE_URL}/sessions/${sessionId}/participants/${encodeURIComponent(user.email)}`, {
    method: "DELETE",
  });
}
