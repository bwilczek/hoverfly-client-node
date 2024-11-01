import { Buffer } from "buffer";
import { brotliDecompressSync } from "zlib";

export type ResponseData = {
  status: number;
  body: string;
  encodedBody: boolean;
  headers?: Record<string, Array<string>> | null;
  templated: boolean;
  transitionsState?: Record<string, string> | null;
};

export function decodeResponseBody(response: ResponseData): string {
  if (response.encodedBody && response.headers?.["Content-Encoding"]?.includes("br")) {
    return Buffer.from(brotliDecompressSync(Buffer.from(response.body, "base64"))).toString("utf-8");
  }
  return response.body;
}
