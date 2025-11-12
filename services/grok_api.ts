
export interface GrokSession {
    id: string;
    title: string;
    transcript: string;
}

const mockGrokSessions: GrokSession[] = [
  {
    id: "grok_session_1",
    title: "Market Analysis for EV Adoption",
    transcript: "User: What are the key drivers for EV adoption in Europe?\n\nGrok: Key drivers include government incentives, expanding charging infrastructure, and increasing consumer awareness of environmental issues. Battery technology improvements are also critical."
  },
  {
    id: "grok_session_2",
    title: "Funny Mode: Why is pizza round?",
    transcript: "User: Tell me a joke about pizza.\n\nGrok: Why did the hipster burn his tongue on the pizza? He ate it before it was cool."
  }
];

export const grok_api = {
  async fetchSessions(apiKey: string): Promise<GrokSession[]> {
    console.log(`Simulating Grok fetch with API key: ${apiKey ? 'provided' : 'not provided'}`);
    await new Promise(res => setTimeout(res, 800));
    return JSON.parse(JSON.stringify(mockGrokSessions));
  }
};
