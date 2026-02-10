/**
 * Gemini AI Wrapper for LC Helper
 * Generates one-time explanations of user solutions
 * Now uses Strict Schema Validation for guaranteed JSON output.
 */

import {
    GoogleGenerativeAI,
    SchemaType,
    GenerativeModel
} from '@google/generative-ai';

// 1. Immediate Environment Check
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not defined in environment variables.");
}

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(apiKey);

// 2. Define Strict Schema (Guarantees the AI output matches your Interface)
const explanationSchema = {
    description: "Explanation of a user's algorithm solution",
    type: SchemaType.OBJECT,
    properties: {
        approach_tag: {
            type: SchemaType.STRING,
            description: "Standard algorithm name (e.g., Binary Search, Two Pointers)"
        },
        core_idea: {
            type: SchemaType.STRING,
            description: "Exactly one sentence summarizing the core logic"
        },
        explanation_steps: {
            type: SchemaType.ARRAY,
            items: { type: SchemaType.STRING },
            description: "List of steps tied to concrete variables or control flow in the code"
        },
        complexity: {
            type: SchemaType.OBJECT,
            properties: {
                time: { type: SchemaType.STRING, description: "Big-O time complexity" },
                space: { type: SchemaType.STRING, description: "Big-O space complexity" }
            },
            required: ["time", "space"]
        },
        key_insight: {
            type: SchemaType.STRING,
            description: "The invariant or observation that makes this solution work"
        },
        common_pitfall: {
            type: SchemaType.STRING,
            description: "A specific mistake someone might make when implementing THIS approach"
        },
        difficulty_rating: {
            type: SchemaType.STRING,
            enum: ["Easy", "Medium", "Hard"]
        },
        roast: {
            type: SchemaType.STRING,
            nullable: true,
            description: "Optional playful critique referencing an actual code choice, or null"
        }
    },
    required: [
        "approach_tag",
        "core_idea",
        "explanation_steps",
        "complexity",
        "key_insight",
        "common_pitfall",
        "difficulty_rating"
    ]
};

// 3. Simplified System Prompt (Schema handles the formatting now)
const SYSTEM_PROMPT = `You are a strict Algorithm Tutor for a personal revision app.

Your job is to analyze ONLY the user's submitted solution and explain the approach THEY used.
Do NOT suggest alternative solutions, optimizations, or improvements.

Explain the solution in a way that helps the user recall their own thinking later.

Rules:
- Do NOT change the algorithm.
- Do NOT introduce new ideas.
- Do NOT mention better approaches.
- Do NOT compare with other techniques.
- All explanations must directly reference logic, variables, loops, or conditions present in the user's code.`;

export interface AIExplanation {
    approach_tag: string;
    core_idea: string;
    explanation_steps: string[];
    complexity: {
        time: string;
        space: string;
    };
    key_insight: string;
    common_pitfall: string;
    difficulty_rating: "Easy" | "Medium" | "Hard"; // More specific type
    roast: string | null;
}

/**
 * Generate AI explanation for a user's solution
 * @param problemTitle - Title of the problem
 * @param code - User's submitted code
 * @param language - Programming language
 * @returns Parsed AIExplanation object
 */
export async function generateExplanation(
    problemTitle: string,
    code: string,
    language: string
): Promise<AIExplanation> {
    try {
        // 4. Use Valid Model & Schema Config
        const model = genAI.getGenerativeModel({
            model: "gemini-3-flash-preview", // Stable, widely available model
            generationConfig: {
                temperature: 0.2,
                responseMimeType: "application/json",
                responseSchema: explanationSchema, // Enforces the schema strictly
            },
        });

        const prompt = `${SYSTEM_PROMPT}

Problem: ${problemTitle}
Language: ${language}

Code:
\`\`\`${language}
${code}
\`\`\`
`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Parse JSON response
        const explanation = JSON.parse(text) as AIExplanation;

        // Validate required fields (Double check)
        validateExplanation(explanation);

        return explanation;
    } catch (error) {
        console.error('Error generating AI explanation:', error);
        if (error instanceof Error) {
            throw new Error(`Failed to generate AI explanation: ${error.message}`);
        }
        throw new Error('Failed to generate AI explanation. Please try again later.');
    }
}

/**
 * Validate that the AI response matches our schema
 */
function validateExplanation(explanation: any): asserts explanation is AIExplanation {
    const required = [
        'approach_tag',
        'core_idea',
        'explanation_steps',
        'complexity',
        'key_insight',
        'common_pitfall',
        'difficulty_rating',
    ];

    for (const field of required) {
        if (!(field in explanation)) {
            throw new Error(`Missing required field: ${field}`);
        }
    }

    if (!Array.isArray(explanation.explanation_steps)) {
        throw new Error('explanation_steps must be an array');
    }

    if (
        typeof explanation.complexity !== 'object' ||
        !explanation.complexity.time ||
        !explanation.complexity.space
    ) {
        throw new Error('complexity must have time and space fields');
    }
}