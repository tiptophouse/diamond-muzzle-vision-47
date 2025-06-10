
// MCP Protocol Types
export interface MCPResource {
  uri: string;
  name: string;
  description?: string;
  mimeType?: string;
}

export interface MCPTool {
  name: string;
  description: string;
  inputSchema: {
    type: string;
    properties: Record<string, any>;
    required?: string[];
  };
}

export interface MCPPrompt {
  name: string;
  description: string;
  arguments?: Array<{
    name: string;
    description: string;
    required?: boolean;
  }>;
}

export interface MCPToolCall {
  name: string;
  arguments: Record<string, any>;
}

export interface MCPToolResult {
  content: Array<{
    type: 'text' | 'image' | 'resource';
    text?: string;
    data?: string;
    uri?: string;
  }>;
  isError?: boolean;
}

export interface MCPSession {
  sessionId: string;
  clientInfo: {
    name: string;
    version: string;
  };
  serverInfo: {
    name: string;
    version: string;
    protocolVersion: string;
  };
  capabilities: {
    tools?: boolean;
    resources?: boolean;
    prompts?: boolean;
    logging?: boolean;
  };
}

export interface DiamondMCPData {
  id?: string;
  stockNumber: string;
  shape: string;
  carat: number;
  color: string;
  clarity: string;
  cut: string;
  price: number;
  status: string;
  imageUrl?: string;
  store_visible: boolean;
  fluorescence?: string;
  lab?: string;
  certificate_number?: string;
}
