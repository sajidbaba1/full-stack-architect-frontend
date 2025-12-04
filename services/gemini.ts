import { GoogleGenAI, Type, Schema } from "@google/genai";
import { AppIdea, AppDifficulty, ArchitectureDetails, ChatMessage } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Schema for generating a list of app ideas
const appIdeaSchema: Schema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING },
      tagline: { type: Type.STRING },
      description: { type: Type.STRING },
      difficulty: { type: Type.STRING, enum: [
        AppDifficulty.BEGINNER, 
        AppDifficulty.INTERMEDIATE, 
        AppDifficulty.ADVANCED, 
        AppDifficulty.EXPERT
      ] },
      coreFeatures: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: "List exactly 10 distinct features"
      },
      techStackHighlights: {
        type: Type.ARRAY,
        items: { type: Type.STRING }
      }
    },
    required: ["title", "tagline", "description", "difficulty", "coreFeatures", "techStackHighlights"]
  }
};

// Schema for generating detailed architecture
const architectureSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    databaseSchema: { type: Type.STRING, description: "A simplified SQL schema or ERD description" },
    springBootModules: { 
      type: Type.ARRAY, 
      items: { type: Type.STRING },
      description: "List of key Spring Boot modules/packages"
    },
    reactComponents: { 
      type: Type.ARRAY, 
      items: { type: Type.STRING },
      description: "Key React components needed"
    },
    apiEndpoints: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          method: { type: Type.STRING },
          path: { type: Type.STRING },
          description: { type: Type.STRING }
        }
      }
    },
    // New Fields
    userStories: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "5-7 key user stories or flows"
    },
    securityStrategy: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Authentication and authorization details (e.g. JWT, OAuth2, RBAC)"
    },
    stateManagement: { type: Type.STRING, description: "Recommended React state management approach (e.g. Redux, Context, React Query)" },
    deploymentStrategy: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "CI/CD, Docker, and Cloud deployment steps"
    },
    externalIntegrations: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Required 3rd party APIs (e.g. Stripe, SendGrid)"
    },
    performanceOptimizations: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Caching (Redis), lazy loading, etc."
    }
  },
  required: [
    "databaseSchema", "springBootModules", "reactComponents", "apiEndpoints",
    "userStories", "securityStrategy", "stateManagement", "deploymentStrategy",
    "externalIntegrations", "performanceOptimizations"
  ]
};

export const generateAppIdeas = async (niche: string): Promise<AppIdea[]> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Generate 3 unique, full-stack application ideas using Spring Boot (Backend) and React (Frontend) for the niche: "${niche}". 
      Requirements:
      1. Each idea must have exactly 10 specific core features.
      2. Focus on modern best practices.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: appIdeaSchema,
        temperature: 0.7
      }
    });

    if (response.text) {
      const data = JSON.parse(response.text);
      return data.map((item: any, index: number) => ({
        ...item,
        id: `idea-${Date.now()}-${index}`
      }));
    }
    return [];
  } catch (error) {
    console.error("Failed to generate ideas:", error);
    throw error;
  }
};

export const generateArchitecture = async (ideaTitle: string, description: string): Promise<ArchitectureDetails> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Design the deep technical architecture for a Spring Boot + React app called "${ideaTitle}". 
      Description: ${description}. 
      
      Provide a comprehensive 10-point technical breakdown including:
      1. Database Schema
      2. Spring Boot Modules
      3. React Component Tree
      4. API Endpoints
      5. User Stories
      6. Security Strategy
      7. State Management
      8. Deployment Strategy
      9. External Integrations
      10. Performance Optimizations`,
      config: {
        responseMimeType: "application/json",
        responseSchema: architectureSchema,
        temperature: 0.5
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as ArchitectureDetails;
    }
    throw new Error("Empty response from AI");
  } catch (error) {
    console.error("Failed to generate architecture:", error);
    throw error;
  }
};

export const streamChat = async function* (
  message: string, 
  history: ChatMessage[],
  context: string
) {
  const chat = ai.chats.create({
      model: 'gemini-2.5-flash',
      config: {
          systemInstruction: `You are a Senior Principal Software Engineer specializing in Java Spring Boot and React. 
          You are currently acting as the Lead Architect for a project.
          
          PROJECT CONTEXT:
          ${context}
          
          Your goal is to help the user implement this specific application. 
          Provide concrete code snippets (Java or TypeScript/React), explain design patterns, and guide them through implementation details.
          Be concise, technical, and practical.`
      },
      history: history.map(h => ({ 
        role: h.role, 
        parts: [{ text: h.text }] 
      }))
  });

  const result = await chat.sendMessageStream({ message });
  
  for await (const chunk of result) {
      yield chunk.text;
  }
}