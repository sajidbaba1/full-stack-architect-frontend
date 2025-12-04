export enum AppDifficulty {
  BEGINNER = 'Beginner',
  INTERMEDIATE = 'Intermediate',
  ADVANCED = 'Advanced',
  EXPERT = 'Expert'
}

export interface AppIdea {
  id: string;
  title: string;
  tagline: string;
  description: string;
  difficulty: AppDifficulty;
  coreFeatures: string[];
  techStackHighlights: string[];
}

export interface ArchitectureDetails {
  // Original 4 Features
  databaseSchema: string; 
  springBootModules: string[];
  reactComponents: string[];
  apiEndpoints: Array<{ method: string; path: string; description: string }>;
  
  // New 6 Features (Total 10)
  userStories: string[];
  securityStrategy: string[];
  stateManagement: string;
  deploymentStrategy: string[];
  externalIntegrations: string[];
  performanceOptimizations: string[];

  // Visual Features (Total 12)
  projectStructure: string; // ASCII Folder Tree
  developmentPhases: string[]; // Implementation Roadmap

  // New Analytical & Visual Features
  projectEstimation: {
    totalWeeks: number;
    complexityScore: number; // 1-100
    teamSizeRecommendation: number;
  };
  mermaidDiagrams: {
    erd: string; // Mermaid ER Diagram syntax
    sequence: string; // Mermaid Sequence Diagram syntax
  };
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}