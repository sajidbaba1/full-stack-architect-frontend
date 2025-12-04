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
    },
    projectStructure: {
      type: Type.STRING,
      description: "A detailed ASCII tree for a monorepo: /backend (Spring Boot standard layout) and /frontend (React Vite standard layout)"
    },
    developmentPhases: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Step-by-step development roadmap (e.g., Phase 1: Setup, Phase 2: Core API)"
    },
    // New Fields
    projectEstimation: {
      type: Type.OBJECT,
      properties: {
        totalWeeks: { type: Type.INTEGER, description: "Estimated weeks to MVP" },
        complexityScore: { type: Type.INTEGER, description: "0-100 difficulty score" },
        teamSizeRecommendation: { type: Type.INTEGER, description: "Recommended dev count" }
      },
      required: ["totalWeeks", "complexityScore", "teamSizeRecommendation"]
    },
    mermaidDiagrams: {
      type: Type.OBJECT,
      properties: {
        erd: { type: Type.STRING, description: "Valid Mermaid.js 'erDiagram' syntax code for the database. Do not use '```mermaid' tags." },
        sequence: { type: Type.STRING, description: "Valid Mermaid.js 'sequenceDiagram' syntax code for the main user flow. Do not use '```mermaid' tags." }
      },
      required: ["erd", "sequence"]
    }
  },
  required: [
    "databaseSchema", "springBootModules", "reactComponents", "apiEndpoints",
    "userStories", "securityStrategy", "stateManagement", "deploymentStrategy",
    "externalIntegrations", "performanceOptimizations", "projectStructure", 
    "developmentPhases", "projectEstimation", "mermaidDiagrams"
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
      
      Provide a comprehensive technical breakdown including visual diagrams and estimations.
      
      Important for Mermaid Diagrams:
      1. 'erd': Use standard Mermaid 'erDiagram' syntax. Define entities and relationships (||--o{).
      2. 'sequence': Use standard Mermaid 'sequenceDiagram' syntax. Show the flow between Client, API, Service, and Database.
      3. Do NOT include markdown code blocks (backticks) in the mermaid strings.`,
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