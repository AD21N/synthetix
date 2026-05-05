import { GoogleGenAI, Type } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY }); // Required to use process.env as per platform constraints

export interface AIBug {
  title: string;
  trigger: string;
  severity: 'HIGH' | 'CRITICAL' | 'MEDIUM' | 'LOW';
  desc: string;
}

export interface AIReviewResult {
  bugs: AIBug[];
  performanceScore: number;
  styleSuggestions: string[];
  refactoredCode: string;
}

// Robust JSON parsing
export function extractJSON(text: string): string {
  // First attempt: match code blocks with or without json tag
  const match = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  if (match) {
    return match[1].trim();
  }
  
  // Second attempt: find raw JSON object structure directly
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start !== -1 && end !== -1 && end >= start) {
    return text.substring(start, end + 1);
  }
  
  return text.trim();
}

export async function analyzeCode(userCode: string): Promise<AIReviewResult> {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Analyze the following code snippet.

<user_code>
${userCode}
</user_code>`,
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          bugs: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING, description: 'Short title of the bug' },
                trigger: { type: Type.STRING, description: 'The line of code or function name that triggers the bug' },
                severity: { type: Type.STRING, description: 'Severity of the bug: HIGH, CRITICAL, MEDIUM, or LOW' },
                desc: { type: Type.STRING, description: 'Detailed description of the bug' },
              },
            },
          },
          performanceScore: {
            type: Type.INTEGER,
            description: 'Performance score from 0 to 100',
          },
          styleSuggestions: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: 'List of style improvement suggestions',
          },
          refactoredCode: {
            type: Type.STRING,
            description: 'The complete refactored code. If the code is already perfect, do not return an empty string; return the original code with a comment explaining why no changes were needed.',
          },
        },
      },
      systemInstruction: 'You are an elite cyber-security AI Code Reviewer. Analyze code thoroughly for vulnerabilities, bugs, performance issues, and styling. Provide a refactored version. If the provided code is already perfect, do not return an empty refactor string; return the original code with a comment explaining why no changes were needed. Reply EXCLUSIVELY in JSON format.',
    },
  });

  const text = response.text;
  if (!text) {
    throw new Error('No response from AI');
  }

  try {
    const extracted = extractJSON(text);
    const result = JSON.parse(extracted) as AIReviewResult;
    return result;
  } catch (error) {
    console.error('JSON Parse Error:', error, 'Raw Extract:', text);
    throw new Error('Failed to parse Neural Core response: Invalid JSON structure.');
  }
}
