/**
 * @agente-tritutario/ai-agent - AI Agent utilities
 *
 * This package provides interfaces and utilities for the AI agent,
 * including message handling, conversation state, and OpenAI integration.
 *
 * To be implemented in Epic 4
 */

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  metadata?: Record<string, unknown>;
}

export interface ConversationState {
  id: string;
  messages: Message[];
  context?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface AgentResponse {
  content: string;
  confidence: number;
  sources?: string[];
}

/**
 * AI Agent service interface - to be implemented with OpenAI
 */
export interface AIAgentService {
  chat(message: string, conversationId: string): Promise<AgentResponse>;
  getContext(topic: string): Promise<Record<string, unknown>>;
}

export class AIAgentStub implements AIAgentService {
  async chat(message: string, conversationId: string): Promise<AgentResponse> {
    // Stub implementation
    return {
      content: 'This is a placeholder response. AI agent implementation pending.',
      confidence: 0,
    };
  }

  async getContext(topic: string): Promise<Record<string, unknown>> {
    // Stub implementation
    return {};
  }
}
