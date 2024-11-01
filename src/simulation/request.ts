import { createHash } from "node:crypto";

type Matcher = {
  matcher: string;
  value: string;
};

export type RequestMatcher = {
  path?: Array<Matcher> | null;
  method?: Array<Matcher> | null;
  destination?: Array<Matcher> | null;
  scheme?: Array<Matcher> | null;
  body?: Array<Matcher> | null;
  query?: Record<string, Array<Matcher>> | null;
  requiresState?: Record<string, string> | null;
};

export function requestSignature(request: RequestMatcher): string {
  const hash = createHash("sha256");
  hash.update(JSON.stringify(request));
  return hash.digest("hex");
}
