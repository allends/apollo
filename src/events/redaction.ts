import type { ApolloEvent } from "./types.js";

const SECRET_KEY_RE = /(token|secret|password|cookie|authorization|api[_-]?key|credential)/i;
const SECRET_VALUE_RE = /(Bearer\s+)[A-Za-z0-9._~+/-]+=*|[A-Za-z0-9_-]{32,}/g;

export function redactEvent(event: ApolloEvent): ApolloEvent {
  return {
    ...event,
    timestamp: event.timestamp ?? new Date().toISOString(),
    payload: redactValue(event.payload ?? {}) as Record<string, unknown>,
  };
}

function redactValue(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(redactValue);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value as Record<string, unknown>).map(([key, val]) => [
      key,
      SECRET_KEY_RE.test(key) ? "[REDACTED]" : redactValue(val),
    ]));
  }
  if (typeof value === "string") return value.replace(SECRET_VALUE_RE, "$1[REDACTED]");
  return value;
}
