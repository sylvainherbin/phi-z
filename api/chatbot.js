// api/chatbot.js
import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(request, response) {
  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method Not Allowed', message: 'Only POST requests are accepted.' });
  }

  const { message } = request.body;

  if (!message) {
    return response.status(400).json({ error: 'Bad Request', message: 'Missing message in request body.' });
  }

  // Ensure API key is set as an environment variable in Vercel
  const API_KEY = process.env.GEMINI_API_KEY;

  if (!API_KEY) {
    console.error("GEMINI_API_KEY is not set as an environment variable.");
    return response.status(500).json({ error: 'Internal Server Error', message: 'AI service not configured. Please contact the site administrator.' });
  }

  try {
    const genAI = new GoogleGenerativeAI(API_KEY);
    // Use a suitable model, e.g., 'gemini-1.5-flash' for cost-effectiveness and speed
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `You are a helpful AI assistant specialized in the Dynamic Fractal Cosmological Model (DFCM). Your purpose is to explain and clarify concepts related to DFCM, resolving cosmological tensions (Hubble tension, Lithium-7 problem, LSS tensions) and its testable predictions. Be concise, informative, and always base your answers on the principles of the DFCM as described on the phi-z.space website. If a question is outside the scope of DFCM or general cosmology, politely state that you cannot answer.

    Here is the user's question: ${message}`;

    const result = await model.generateContent(prompt);
    const textResponse = result.response.text();

    response.status(200).json({ reply: textResponse });

  } catch (error) {
    console.error('Error calling Gemini API:', error);
    if (error.response && error.response.status) {
        console.error('Gemini API Error Status:', error.response.status);
        console.error('Gemini API Error Data:', await error.response.json());
    }
    response.status(500).json({ error: 'Internal Server Error', message: 'Failed to get a response from the AI. Please try again later.' });
  }
}

