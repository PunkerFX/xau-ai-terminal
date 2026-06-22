export interface AIProviderConfig { apiKey: string; model?: string; temperature?: number; maxTokens?: number; }
export interface AIRequest { systemPrompt: string; userPrompt: string; context?: Record<string, unknown>; }
export interface AIResponse { content: string; usage: { promptTokens: number; completionTokens: number; totalTokens: number; }; latency: number; }
export interface AIProvider { name: string; generate(request: AIRequest): Promise<AIResponse>; isAvailable(): boolean; }
