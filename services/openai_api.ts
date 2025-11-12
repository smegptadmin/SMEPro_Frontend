import { OpenAiSession } from '../types';

const mockOpenAiSessions: OpenAiSession[] = [
  {
    "id": "session_001",
    "title": "Brainstorming Q3 Marketing Slogans",
    "messages": [
      { "role": "user", "content": "Let's brainstorm some slogans for our new hydration drink, 'Quench'." },
      { "role": "assistant", "content": "Great! How about: 'Quench: Your Thirst, Elevated.' or 'Quench: The Peak of Hydration.'?" },
      { "role": "user", "content": "I like the second one. Can we try a few more that focus on natural ingredients?" },
      { "role": "assistant", "content": "Of course. How about: 'Quench: Naturally Sourced, Perfectly Refreshing.' or 'Quench: Pure Hydration, Straight from Nature.'?" }
    ]
  },
  {
    "id": "session_002",
    "title": "Developing a Python Script for Data Analysis",
    "messages": [
      { "role": "user", "content": "I need a Python script to parse a CSV file and calculate the average of a column named 'sales'." },
      { "role": "assistant", "content": "Certainly. You can use the pandas library for that. Here's a basic script:\n\n```python\nimport pandas as pd\n\ndf = pd.read_csv('your_data.csv')\naverage_sales = df['sales'].mean()\nprint(f'The average sales is: {average_sales}')\n```" },
      { "role": "user", "content": "Thanks! How can I handle missing values in that column?" },
      { "role": "assistant", "content": "Good question. You can use `.dropna()` to remove rows with missing values or `.fillna()` to replace them. For example, to fill with the median:\n\n```python\nmedian_sales = df['sales'].median()\ndf['sales'].fillna(median_sales, inplace=True)\n```" }
    ]
  },
  {
    "id": "session_003",
    "title": "Outline for a Sci-Fi Novel",
    "messages": [
      { "role": "user", "content": "I'm writing a sci-fi novel about a colony on Mars. I need help with the plot outline." },
      { "role": "assistant", "content": "Exciting! Let's start with the inciting incident. What event kicks off the main conflict for your colonists?" },
      { "role": "user", "content": "A mysterious sandstorm cuts them off from Earth, and they discover an alien artifact buried beneath their habitat." },
      { "role": "assistant", "content": "That's a fantastic hook! The rising action could involve them trying to understand the artifact while their life support systems begin to fail. This creates both an external (survival) and internal (mystery) conflict." }
    ]
  }
];


export const openai_api = {
  async fetchSessions(apiKey: string): Promise<OpenAiSession[]> {
    // In a real app, you'd use the apiKey to make an API call.
    // Here, we simulate a network delay and return mock data.
    console.log(`Simulating fetch with API key: ${apiKey ? 'provided' : 'not provided'}`);
    await new Promise(res => setTimeout(res, 1000));
    return JSON.parse(JSON.stringify(mockOpenAiSessions)); // Deep copy
  }
};
