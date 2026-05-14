export interface PiExtensionAPI {
  on(event: "input", handler: (event: InputEvent, ctx: PiContext) => void | Promise<void>): void;
  on(event: "before_agent_start", handler: (event: BeforeAgentStartEvent, ctx: PiContext) => void | Promise<void>): void;
  on(event: "tool_call", handler: (event: ToolCallEvent, ctx: PiContext) => void | Promise<void>): void;
  on(event: "tool_result", handler: (event: ToolResultEvent, ctx: PiContext) => void | Promise<void>): void;
  on(event: "turn_end", handler: (event: TurnEndEvent, ctx: PiContext) => void | Promise<void>): void;
  on(event: "agent_end", handler: (event: AgentEndEvent, ctx: PiContext) => void | Promise<void>): void;
  on(event: "session_start", handler: (event: unknown, ctx: PiContext) => void | Promise<void>): void;
  registerCommand?(name: string, options: { description?: string; handler: (args: string, ctx: PiContext) => void | Promise<void> }): void;
  appendEntry?<T = unknown>(customType: string, data?: T): void;
}

export interface PiContext {
  hasUI?: boolean;
  ui?: { notify(message: string, level?: "info" | "warning" | "error" | "success"): void };
  sessionManager?: { getBranch(): unknown[]; getSessionFile(): string | undefined };
}

export interface InputEvent {
  text: string;
  source?: string;
}

export interface BeforeAgentStartEvent {
  prompt: string;
  systemPromptOptions?: { skills?: Array<{ name: string; filePath?: string }> };
}

export interface ToolCallEvent {
  toolCallId: string;
  toolName: string;
}

export interface ToolResultEvent {
  toolCallId: string;
  toolName: string;
  isError: boolean;
}

export interface TurnEndEvent {
  turnIndex?: number;
}

export interface AgentEndEvent {
  messages?: unknown[];
}
