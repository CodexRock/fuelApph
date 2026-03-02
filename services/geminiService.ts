import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(API_KEY);

export async function extractFuelPriceFromImage(base64Image: string) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const result = await model.generateContent([
      {
        inlineData: {
          mimeType: "image/jpeg",
          data: base64Image
        }
      },
      {
        text: `You are a specialized Moroccan fuel price OCR engine.
        Analyze this image of a fuel price totem or pump display.
        
        RULES:
        1. Extract the price per liter (e.g., 13.45).
        2. Identify the fuel type: "Diesel", "Sans Plomb", or "Premium".
        3. If multiple prices are visible, extract the most prominent DIESEL price.
        4. Return ONLY a JSON object: {"price": number, "fuelType": string}.
        5. DO NOT GUESS. If no price is clearly visible or legible, return exactly: {"price": null, "fuelType": null}.
        
        CONTEXT: Morocco fuel prices currently range between 10.00 and 17.00 MAD.`
      }
    ]);

    const response = await result.response;
    const text = response.text();
    // Use robust Regex to extract JSON block even if Gemini wraps it in ```json blocks
    const jsonStrMatch = text.match(/\{[\s\S]*\}/);
    if (jsonStrMatch) {
      return JSON.parse(jsonStrMatch[0]);
    }
  } catch (error) {
    console.error("Gemini OCR failed:", error);
    return null;
  }
}

export async function processVoiceReport(prompt: string) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(`Parse this voice input into fuel price data for Morocco: "${prompt}". Return ONLY a JSON object with keys: price (number), fuelType (one of: Diesel, Sans Plomb, Premium). If the user doesn't say the fuel type, default to Diesel.`);
    const response = await result.response;
    const text = response.text();
    // Use robust Regex to extract JSON
    const jsonStrMatch = text.match(/\{[\s\S]*\}/);
    if (jsonStrMatch) {
      return JSON.parse(jsonStrMatch[0]);
    }
    return null;
  } catch (error) {
    console.error("Gemini Voice processing failed:", error);
    return null;
  }
}