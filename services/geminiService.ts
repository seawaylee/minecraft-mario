import { GoogleGenAI } from "@google/genai";
import { DEFAULT_LEVEL_MAP } from "../constants";

let ai: GoogleGenAI | null = null;
try {
  ai = new GoogleGenAI(import.meta.env.VITE_GEMINI_API_KEY || "dummy_key");
} catch (e) {
  console.error("Failed to init Gemini Client:", e);
}

const FALLBACK_LEVEL = DEFAULT_LEVEL_MAP.join('\n');

export const generateLevelWithAI = async (theme: string = "classic minecraft"): Promise<string[]> => {
  if (!ai) return DEFAULT_LEVEL_MAP;
  const timestamp = Date.now(); // Add randomness to prompt
  
  const prompt = `
    Generate a long 2D platformer level layout (approx 100-120 characters wide, 15 high).
    Theme: ${theme}. Random seed: ${timestamp}.
    
    Legend:
    '.' : Air
    'G' : Grass
    'D' : Dirt
    'S' : Stone
    '#' : Bedrock (Bottom row)
    'L' : Lava
    '?' : Floating Platform
    'C' : Creeper (Ground enemy)
    'M' : Enderman (Ground enemy, fast)
    '^' : Ghast (Flying enemy, high up)
    'B' : BOSS (Place one at the very end before the portal)
    'E' : End Portal (Goal, far right)

    Rules:
    1. Make it LONG (100+ chars).
    2. Start with flat ground for 10 chars.
    3. Ensure jumps are possible.
    4. Place the 'B' (Boss) guarding the 'E' (Portal).
    5. Return ONLY the grid strings.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: { temperature: 0.8 }
    });

    const text = response.text || FALLBACK_LEVEL;
    
    const lines = text.trim().split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0 && !line.startsWith('```'));

    if (lines.length < 5) return DEFAULT_LEVEL_MAP;

    return lines;
  } catch (error) {
    console.error("Gemini Level Gen Error:", error);
    // Return a slightly modified default level to fake randomness if AI fails
    return DEFAULT_LEVEL_MAP;
  }
};