const SECRET_VALUE_RE = /(Bearer\s+)[A-Za-z0-9._~+/-]+=*|[A-Za-z0-9_-]{32,}/g;

export function redactText(value: string): string {
  return value.replace(SECRET_VALUE_RE, "$1[REDACTED]");
}
