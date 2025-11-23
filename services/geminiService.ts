
import { GoogleGenAI, Type } from "@google/genai";

const API_KEY = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey: API_KEY });

// Estimate market rent for a specific location and unit configuration
export const estimateMarketRent = async (
  address: string,
  bedrooms: number,
  bathrooms: number
): Promise<{ estimatedRent: number; confidence: string; reasoning: string }> => {
  if (!API_KEY) {
    return { estimatedRent: 1500, confidence: 'Low (No API Key)', reasoning: 'Default placeholder value.' };
  }

  try {
    const prompt = `
      Estimate the monthly market rent for a ${bedrooms} bedroom, ${bathrooms} bathroom apartment at ${address}.
      Provide a realistic conservative estimate for FHA house hacking calculations.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            estimatedRent: { type: Type.NUMBER },
            confidence: { type: Type.STRING, description: "High, Medium, or Low" },
            reasoning: { type: Type.STRING },
          },
        },
      },
    });

    if (response.text) {
      return JSON.parse(response.text);
    }
    throw new Error("No response text");
  } catch (error) {
    console.error("AI Rent Estimation Failed:", error);
    return { estimatedRent: 0, confidence: 'Error', reasoning: 'Failed to fetch data.' };
  }
};

// Analyze a deal for FHA suitability
export const analyzeDealWithAI = async (
  propertyDetails: string,
  financials: string
): Promise<string> => {
  if (!API_KEY) return "AI Key missing. Unable to analyze.";

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `
        Act as a real estate investment expert specializing in FHA house hacking.
        Analyze this deal:
        Property: ${propertyDetails}
        Financials: ${financials}

        Provide a brief checklist of pros, cons, and whether it likely passes the FHA Self-Sufficiency Test (Net Rental Income >= PITI).
      `,
      config: {
        systemInstruction: "You are a helpful, conservative real estate underwriter.",
      }
    });
    return response.text || "No analysis generated.";
  } catch (error) {
    console.error("AI Analysis Failed:", error);
    return "Error generating analysis.";
  }
};

// Find deals in a location using Google Search
export const findRealEstateDeals = async (
  location: string,
  query: string
): Promise<{ text: string; sources: Array<{ uri: string; title: string }> }> => {
  if (!API_KEY) return { text: "AI Key missing. Unable to search.", sources: [] };

  try {
    const prompt = `
      Find active multi-family (duplex, triplex, fourplex) real estate listings in or near ${location}.
      Focus on properties that might work for FHA house hacking (under FHA loan limits if known).
      Additional criteria: ${query}.
      
      For each finding, provide:
      1. Approximate Address
      2. Price
      3. Unit composition (e.g. Duplex, Triplex)
      4. Brief description
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const sources =
      response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map(
        (chunk: any) => chunk.web
      ).filter((w: any) => w) || [];

    return {
      text: response.text || "No listings found.",
      sources: sources,
    };
  } catch (error) {
    console.error("AI Deal Finding Failed:", error);
    return { text: "Error searching for deals.", sources: [] };
  }
};
