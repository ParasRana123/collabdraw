// bootstrap.ts
// --- Silence anything non-JSON early ---
const originalWrite = process.stdout.write.bind(process.stdout);

// Properly type all overloads of process.stdout.write
process.stdout.write = function (
  chunk: any,
  encoding?: any,
  callback?: any
): boolean {
  try {
    const text = chunk?.toString?.().trim?.() ?? "";

    // Only allow JSON-like output
    if (text.startsWith("{") || text.startsWith("[")) {
      return originalWrite(chunk, encoding, callback);
    }

    // Ignore non-JSON logs
    return true;
  } catch {
    return true;
  }
} as typeof process.stdout.write;

// --- Start main logic after patch is active ---
import("./index.js");

