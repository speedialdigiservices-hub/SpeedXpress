
import { GoogleGenAI, Type } from "@google/genai";
import { Order, Courier, TrafficDensity } from "../types";

export const getLogisticsInsights = async (orders: Order[], couriers: Courier[]) => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Analyze the following Nigerian logistics data (Abuja, Kaduna, Kano) and provide 3 actionable insights.
      Orders: ${JSON.stringify(orders)}
      Riders: ${JSON.stringify(couriers)}`,
      config: {
        systemInstruction: "You are a logistics expert for Northern Nigeria. Consider local factors like Abuja city gate traffic, Kaduna bypass routing, and Kano market congestion. Provide concise, high-impact strategy tips in English.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            insights: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  description: { type: Type.STRING },
                  impact: { type: Type.STRING, enum: ['low', 'medium', 'high'] }
                },
                required: ['title', 'description', 'impact']
              }
            }
          },
          required: ['insights']
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("Empty AI response");
    return JSON.parse(text.trim());
  } catch (error) {
    console.error("Error fetching AI insights:", error);
    return { insights: [{ title: "NETWORK STABLE", description: "All riders active across northern hubs.", impact: "medium" }] };
  }
};

export const getTrafficAnalysis = async () => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Generate a real-time traffic density report for major routes in Abuja, Kaduna, and Kano. Current time is ${new Date().toLocaleTimeString()}.`,
      config: {
        systemInstruction: "You are an AI traffic monitor. For each city, determine if major routes are 'light', 'moderate', or 'heavy'. Consider peak hours (morning/evening rush in Abuja, market hours in Kano). Return JSON: { 'ABUJA': 'density', 'KADUNA': 'density', 'KANO': 'density' }.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            ABUJA: { type: Type.STRING, enum: ['light', 'moderate', 'heavy'] },
            KADUNA: { type: Type.STRING, enum: ['light', 'moderate', 'heavy'] },
            KANO: { type: Type.STRING, enum: ['light', 'moderate', 'heavy'] }
          },
          required: ['ABUJA', 'KADUNA', 'KANO']
        }
      }
    });
    const text = response.text;
    return text ? JSON.parse(text.trim()) : { ABUJA: 'moderate', KADUNA: 'light', KANO: 'heavy' };
  } catch (error) {
    console.error("Traffic Analysis error:", error);
    return { ABUJA: 'moderate', KADUNA: 'light', KANO: 'moderate' };
  }
};

export const getAIEtaPrediction = async (order: Order, courier?: Courier) => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Predict ETA for this delivery in Nigeria.
      Order Status: ${order.status}
      Hub: ${order.id.includes('ABJ') ? 'Abuja' : order.id.includes('KAD') ? 'Kaduna' : 'Kano'}
      Pickup: ${order.pickupAddress}
      Delivery: ${order.deliveryAddress}
      Courier Info: ${courier ? `${courier.vehicleType} at ${JSON.stringify(courier.location)}` : 'Assigning rider'}
      Current Time: ${new Date().toLocaleTimeString()}`,
      config: {
        systemInstruction: "You are a logistics AI for SpeeDial Express. Predict the remaining time in minutes. Factor in local context: Garki/Maitama traffic in Abuja, Sabon Gari market density in Kano, or Kaduna bypass flow. Return exactly one JSON object: { 'prediction': 'X mins', 'context': 'short reason' }.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            prediction: { type: Type.STRING },
            context: { type: Type.STRING }
          },
          required: ['prediction', 'context']
        }
      }
    });
    
    const text = response.text;
    if (!text) return { prediction: '15-20 mins', context: 'Standard routing' };
    return JSON.parse(text.trim());
  } catch (error) {
    console.error("ETA Prediction error:", error);
    return { prediction: 'Calculating...', context: 'Refining GPS data' };
  }
};

export const getOrderUpdateAI = async (orderId: string, status: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Write a friendly professional message for a customer in Nigeria whose order ${orderId} is now ${status}.`
  });
  return response.text;
};
