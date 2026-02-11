/**
 * @agente-tritutario/rag - Retrieval-Augmented Generation utilities
 *
 * This package provides interfaces and utilities for RAG functionality,
 * including vector database integration and document retrieval.
 *
 * To be implemented in Story 1.5
 */

export interface VectorSearchResult {
  id: string;
  content: string;
  score: number;
  metadata?: Record<string, unknown>;
}

export interface RAGQuery {
  query: string;
  limit?: number;
  threshold?: number;
}

/**
 * RAG service interface - to be implemented with Pinecone or Weaviate
 */
export interface RAGService {
  search(query: RAGQuery): Promise<VectorSearchResult[]>;
  upsert(id: string, content: string, metadata?: Record<string, unknown>): Promise<void>;
}

export class RAGStub implements RAGService {
  async search(_query: RAGQuery): Promise<VectorSearchResult[]> {
    // Stub implementation
    return [];
  }

  async upsert(_id: string, _content: string, _metadata?: Record<string, unknown>): Promise<void> {
    // Stub implementation
  }
}
