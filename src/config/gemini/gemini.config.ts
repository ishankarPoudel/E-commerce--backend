import { GoogleGenerativeAI } from "@google/generative-ai";

export const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

interface ConversationHistory {
  role: "user" | "model";
  parts: string;
}

class ConversationManager {
  private conversations: Map<string, ConversationHistory[]> = new Map();

  getHistory(sessionId: string): ConversationHistory[] {
    return this.conversations.get(sessionId) || [];
  }

  addMessage(sessionId: string, role: "user" | "model", message: string): void {
    const history = this.getHistory(sessionId);
    history.push({ role, parts: message });

    // Keep only last 10 messages to avoid token limits
    if (history.length > 20) {
      history.splice(0, history.length - 20);
    }

    this.conversations.set(sessionId, history);
  }

  clearHistory(sessionId: string): void {
    this.conversations.delete(sessionId);
  }

  // Auto-cleanup sessions older than 1 hour
  cleanup(): void {
    // Implement timestamp tracking if needed
  }
}

export const conversationManager = new ConversationManager();
