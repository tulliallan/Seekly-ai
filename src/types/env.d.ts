declare global {
  namespace NodeJS {
    interface ProcessEnv {
      TAVILY_API_KEY: string;
      GOOGLE_AI_KEY: string;
      // ... other env variables
      YOUTUBE_API_KEY?: string;
    }
  }
}

export {} 