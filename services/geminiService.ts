import { GoogleGenAI, Type } from "@google/genai";
import type { BeatData, ModelContent } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const beatSchema = {
    type: Type.OBJECT,
    properties: {
        meta: {
            type: Type.OBJECT,
            properties: {
                bpm: { type: Type.INTEGER, description: "Beats per minute for the track, typically between 80 and 160." },
                bars: { type: Type.INTEGER, description: "Number of bars, must be 4." },
            },
            required: ['bpm', 'bars'],
        },
        tracks: {
            type: Type.ARRAY,
            description: "An array of drum tracks. Include at least a kick, snare, and hi-hat.",
            items: {
                type: Type.OBJECT,
                properties: {
                    id: { type: Type.STRING, description: "A unique identifier for the track, e.g., 'd_kick'." },
                    type: { type: Type.STRING, description: "The type of track, must be 'drum'." },
                    drum: { type: Type.STRING, description: "The drum sound, e.g., 'kick', 'snare', 'hihat', 'open_hat', 'clap'." },
                    steps: {
                        type: Type.ARRAY,
                        description: "An array of 64 integers representing the steps. 1 for a hit, 0 for silence.",
                        items: { type: Type.INTEGER }
                    },
                    adsr: {
                        type: Type.OBJECT,
                        properties: {
                            attack: { type: Type.NUMBER },
                            decay: { type: Type.NUMBER },
                            sustain: { type: Type.NUMBER },
                            release: { type: Type.NUMBER },
                        },
                        required: ['attack', 'decay', 'sustain', 'release'],
                    }
                },
                required: ['id', 'type', 'drum', 'steps', 'adsr'],
            }
        }
    },
    required: ['meta', 'tracks'],
};

const responseSchema = {
    type: Type.OBJECT,
    properties: {
        responseText: {
            type: Type.STRING,
            description: "A short, encouraging, and creative text response about the generated beat."
        },
        beat: beatSchema,
    },
    required: ['responseText', 'beat']
};


export const generateBeat = async (prompt: string, baseBeat?: BeatData): Promise<ModelContent> => {
    try {
        const systemInstruction = baseBeat
            ? `You are an expert beat modification AI. The user has provided an existing beat as a JSON object and a text prompt with instructions on how to change it. Your task is to return a single, complete JSON object representing the *modified* beat.
- You MUST return the full beat structure, not just the changed parts.
- The 'beat' property must strictly adhere to the provided schema.
- CRITICAL: The 'steps' array for each track MUST be exactly 64 numbers long.
- Base your response on the user's text prompt, but use the provided beat as the starting point.
- The 'responseText' should describe the change you made.`
            : `You are an expert beatmaker AI. Your task is to generate a single JSON object based on the user's prompt. 
- This JSON object must contain two properties: 'responseText' and 'beat'.
- The 'responseText' should be a short, encouraging text message about the beat you created.
- The 'beat' property must strictly adhere to the provided schema for beat data.
- CRITICAL: The 'steps' array for each track MUST be exactly 64 numbers long (0s and 1s). This is a strict requirement.
- Create a complete and playable beat with at least 3-5 tracks.`;

        const contentPrompt = baseBeat
            ? `Here is the original beat:\n\n${JSON.stringify(baseBeat, null, 2)}\n\nNow, please apply this modification: "${prompt}"`
            : prompt;


        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: contentPrompt,
            config: {
                systemInstruction: systemInstruction,
                responseMimeType: "application/json",
                responseSchema: responseSchema,
            },
        });

        const jsonText = response.text.trim();
        const responseData = JSON.parse(jsonText);
        
        const beatData: BeatData = responseData.beat;
        const text: string = responseData.responseText;

        if (!beatData.meta || !Array.isArray(beatData.tracks)) {
            throw new Error("Invalid JSON structure received from API.");
        }
        
        beatData.tracks.forEach(track => {
            const originalLength = track.steps?.length || 0;
            if (originalLength !== 64) {
                console.warn(
                    `Track '${track.id}' has an incorrect number of steps. Expected 64, got ${originalLength}. Correcting.`
                );
                const correctedSteps = new Array(64).fill(0);
                const stepsToCopy = track.steps || [];
                
                for (let i = 0; i < Math.min(64, originalLength); i++) {
                    correctedSteps[i] = stepsToCopy[i] === 1 ? 1 : 0;
                }
                track.steps = correctedSteps;
            } else {
                 track.steps = track.steps.map(step => step === 1 ? 1 : 0);
            }
        });


        return { beatData, text };
    } catch (error) {
        console.error("Error generating beat:", error);
        throw new Error("Failed to generate beat. The model may be unavailable or the request was invalid.");
    }
};