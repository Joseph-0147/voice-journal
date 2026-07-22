export {};

declare global {
  interface Window {
    puter?: {
      ai: {
        chat: (
          prompt: string,
          options?: { model?: string; stream?: boolean }
        ) => Promise<AsyncIterable<{ text?: string }>> | Promise<{ text?: string }>;
      };
    };
  }
}