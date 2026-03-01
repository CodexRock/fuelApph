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
        text: `You are an expert fuel price analyst in Morocco. 
        Analyze this image of a gas station price tower or pump display.
        Extract the price per liter for the fuel types shown.
        Focus on values typically ranging from 10.00 to 18.00 MAD.
        Return ONLY a JSON object with:
        - "price": number (the detected price per liter)
        - "fuelType": string (one of: "Diesel", "Sans Plomb", "Premium")
        
        Example: {"price": 13.45, "fuelType": "Diesel"}
        If multiple are shown, prioritize the most prominent or standard Diesel.`
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