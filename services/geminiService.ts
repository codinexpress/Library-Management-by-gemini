
import { GoogleGenAI } from "@google/genai";
import { Book } from "../types.ts";

export const getLibrarianResponse = async (query: string, inventory: Book[]) => {
  // Access process.env inside the function scope to ensure it's evaluated at runtime
  const apiKey = process.env.API_KEY;
  if (!apiKey) return "API Key is missing. Please check your environment.";

  const ai = new GoogleGenAI({ apiKey });
  const modelName = 'gemini-3-flash-preview';
  
  const inventoryContext = inventory.map(b => 
    `- ${b.title} by ${b.author} (${b.category}) - Status: ${b.status}`
  ).join('\n');

  const systemPrompt = `You are Lumina, a world-class AI Librarian. 
You assist users with managing their personal library.
Current Library Inventory:
${inventoryContext}

Rules:
1. Be helpful, professional, and concise.
2. If a user asks for a recommendation based on their library, look at their existing books.
3. If they ask about a specific book, check if it's in the inventory.
4. If the library is empty, encourage them to add books.
5. Use markdown for formatting.`;

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: query,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.7,
      },
    });

    return response.text || "I'm sorry, I couldn't process that request.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Error communicating with Lumina Librarian.";
  }
};
