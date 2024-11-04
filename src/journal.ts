import { RequestMatcher } from "./simulation/request";

type Index = {
  name: string;
  entries: Array<{ key: string; journalEntryId: string }>;
};

export type JournalEntryRequest = {
  path: string;
  method: string;
  destination: string;
  scheme: string;
  query: string;
  formData: Record<string, Array<string>>;
  body: string;
  headers: Record<string, Array<string>>;
};

export type JournalEntryResponse = {
  status: number;
  body: string;
  encodedBody: boolean;
  headers: Record<string, Array<string>>;
};

export type JournalEntry = {
  request: JournalEntryRequest;
  response: JournalEntryResponse;
  mode: string;
  timeStarted: string;
  latency: number;
  id: string;
  postServeAction?: string;
};

export type Journal = {
  journal: Array<JournalEntry>;
  indexes: Array<Index> | null;
  offset: number;
  limit: number;
  total: number;
};

export type JournalSearchPayload = { request: RequestMatcher };
