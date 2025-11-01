// Silence anything that writes non-JSON to stdout
const originalWrite = process.stdout.write.bind(process.stdout);

process.stdout.write = function (
  chunk: any,
  encoding?: BufferEncoding | ((err?: Error | null | undefined) => void),
  callback?: (err?: Error | null | undefined) => void
): boolean {
  const text = chunk.toString().trim();

  // Only allow valid JSON output
  if (text.startsWith("{") || text.startsWith("[")) {
    return originalWrite(chunk, encoding as any, callback);
  }

  // Ignore non-JSON logs
  return true;
} as typeof process.stdout.write;



import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import server from "./server.js";

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);

  const { connectToBackend } = await import("./mcp/utils/websoketClient.js");
  connectToBackend();

  // Load env safely after MCP is ready
  const dotenv = (await import("dotenv")).default;
  dotenv.config({ override: true, debug: false });
}

main().catch((error) => {
//   console.error("Fatal error in main():", error);
  process.exit(1);
});
