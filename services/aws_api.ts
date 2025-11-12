
export interface AwsBedrockSession {
    sessionId: string;
    summary: string;
    conversation: Array<{ speaker: 'user' | 'bot'; text: string; }>;
}

const mockAwsSessions: AwsBedrockSession[] = [
    {
        sessionId: "aws_session_1",
        summary: "Cloud infrastructure cost optimization discussion.",
        conversation: [
            { speaker: 'user', text: "How can we reduce our AWS bill for S3 storage?" },
            { speaker: 'bot', text: "You can implement lifecycle policies to move older data to cheaper storage tiers like Glacier. Also, enabling S3 Intelligent-Tiering can automate cost savings." }
        ]
    }
];

export const aws_api = {
    async fetchSessions(apiKey: string): Promise<AwsBedrockSession[]> {
        console.log(`Simulating AWS Bedrock fetch with API key: ${apiKey ? 'provided' : 'not provided'}`);
        await new Promise(res => setTimeout(res, 1200));
        return JSON.parse(JSON.stringify(mockAwsSessions));
    }
};
