export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface AgentInput {
  message: string;
  conversationId: string;
  history: ChatMessage[];
}

export interface AgentStep {
  name: string;
  detail: string;
  provider?: 'ZeroScript' | 'Nilo' | 'Nexus';
}

export interface AgentResult {
  response: string;
  activity: string;
  steps: AgentStep[];
  providers: {
    zeroScript: string;
    nilo: string;
    combined: string;
  };
}
