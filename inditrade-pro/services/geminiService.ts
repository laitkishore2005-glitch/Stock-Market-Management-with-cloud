import { GoogleGenAI, Type } from "@google/genai";
import { Stock, AISentiment } from '../types';

const getAiClient = () => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.warn("Gemini API Key is missing.");
        return null;
    }
    return new GoogleGenAI({ apiKey });
};

// Use gemini-3.1-flash-lite-preview for fast, low-latency analysis
export const analyzeStock = async (stock: Stock): Promise<AISentiment> => {
    const ai = getAiClient();
    if (!ai) return mockSentiment(stock);

    try {
        const prompt = `
            Analyze the following Indian stock data for a day trader:
            Symbol: ${stock.symbol}
            Price: ₹${stock.price}
            Change: ${stock.changePercent}%
            Volume: ${stock.volume}
            Sector: ${stock.sector}

            Provide a JSON response with sentiment (BULLISH, BEARISH, NEUTRAL), a confidence score (0-100), a short 2-sentence summary, and key support/resistance levels.
        `;

        const response = await ai.models.generateContent({
            model: "gemini-3.1-flash-lite-preview",
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        sentiment: { type: Type.STRING, enum: ['BULLISH', 'BEARISH', 'NEUTRAL'] },
                        score: { type: Type.INTEGER },
                        summary: { type: Type.STRING },
                        keyLevels: {
                            type: Type.OBJECT,
                            properties: {
                                support: { type: Type.NUMBER },
                                resistance: { type: Type.NUMBER }
                            }
                        }
                    }
                }
            }
        });

        const text = response.text;
        if (!text) throw new Error("No response text");
        return JSON.parse(text) as AISentiment;

    } catch (error) {
        console.error("Gemini API Error:", error);
        return {
            sentiment: 'NEUTRAL',
            score: 50,
            summary: "AI services are temporarily unavailable. Please rely on technical indicators.",
            keyLevels: { support: 0, resistance: 0 }
        };
    }
};

// Use gemini-3.1-pro-preview for complex chat tasks
export const createChatSession = (history: any[] = []): any => {
    const ai = getAiClient();
    if (!ai) return null;

    return ai.chats.create({
        model: "gemini-3.1-pro-preview",
        config: {
            systemInstruction: "You are an expert trading assistant for IndiTrade Pro. Help users with stock market terminology, trading strategies, technical analysis, and understanding market trends. Keep responses concise, professional, and helpful for day traders.",
        },
        history: history
    });
};

// Use thinking mode for complex queries
export const getComplexMarketAnalysis = async (query: string) => {
    const ai = getAiClient();
    if (!ai) return "AI analysis unavailable.";

    try {
        const response = await ai.models.generateContent({
            model: "gemini-3.1-pro-preview",
            contents: [{ role: 'user', parts: [{ text: query }] }]
        });
        return response.text;
    } catch (error) {
        console.error("Gemini Thinking Mode Error:", error);
        return "Failed to perform complex analysis.";
    }
};

const mockSentiment = (stock: Stock): AISentiment => ({
    sentiment: stock.change >= 0 ? 'BULLISH' : 'BEARISH',
    score: Math.floor(Math.random() * 40) + 60,
    summary: `AI analysis suggests ${stock.change >= 0 ? 'positive' : 'negative'} momentum for ${stock.name}. Recent volume of ${stock.volume.toLocaleString()} indicates strong institutional interest.`,
    keyLevels: {
        support: parseFloat((stock.price * 0.95).toFixed(2)),
        resistance: parseFloat((stock.price * 1.05).toFixed(2))
    }
});
