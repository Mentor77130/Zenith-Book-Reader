import { GoogleGenAI } from "@google/genai";

export class GeminiService {
  private ai: GoogleGenAI | null = null;

  constructor() {
    const apiKey = process.env.API_KEY;
    if (apiKey) {
      this.ai = new GoogleGenAI({ apiKey });
    }
  }

  async analyzeComicPage(imageBase64: string): Promise<string> {
    if (!this.ai) {
      throw new Error("Clé API introuvable. Veuillez configurer l'environnement.");
    }

    try {
      // Using gemini-3-flash-preview as recommended for text tasks with multimodal input
      const model = 'gemini-3-flash-preview'; 
      
      const response = await this.ai.models.generateContent({
        model: model,
        contents: {
          parts: [
            {
              inlineData: {
                mimeType: 'image/jpeg', // Assuming jpeg for simplicity, though mapped from blob
                data: imageBase64
              }
            },
            {
              text: "Analyse cette page de bande dessinée. Décris l'action, le ton émotionnel et traduis tout texte visible en français s'il ne l'est pas déjà. Sois concis (moins de 100 mots). Réponds uniquement en français."
            }
          ]
        }
      });

      return response.text || "Aucune analyse disponible.";
    } catch (error) {
      console.error("Gemini analysis failed:", error);
      return "Impossible d'analyser cette page pour le moment.";
    }
  }
}

// Helper to convert blob URL to base64
export const blobUrlToBase64 = async (url: string): Promise<string> => {
  const response = await fetch(url);
  const blob = await response.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64data = reader.result as string;
      // Remove data:image/xxx;base64, prefix
      resolve(base64data.split(',')[1]);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};