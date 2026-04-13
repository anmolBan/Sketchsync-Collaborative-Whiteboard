import { Queue } from "bullmq";
import { REDIS_HOST, REDIS_PORT, REDIS_PASSWORD, REDIS_TLS } from "@repo/backend_common";
import { promisify } from "util";
import { gzip, gunzip } from "zlib";

const gzipAsync = promisify(gzip);
const gunzipAsync = promisify(gunzip);

// ── Compression utilities ──────────────────────────────────────────────
export async function compressData(data: any): Promise<string> {
  const json = JSON.stringify(data);
  const compressed = await gzipAsync(Buffer.from(json));
  return compressed.toString("base64");
}

export async function decompressData(compressed: string): Promise<any> {
  const buffer = Buffer.from(compressed, "base64");
  const decompressed = await gunzipAsync(buffer);
  return JSON.parse(decompressed.toString());
}

// ── Strip non-essential appState fields ────────────────────────────────
const ESSENTIAL_APP_STATE_KEYS = [
  "viewBackgroundColor",
  "currentItemFontFamily",
  "currentItemFontSize",
  "currentItemBackgroundColor",
  "currentItemStrokeColor",
  "currentItemStrokeWidth",
  "currentItemRoughness",
  "currentItemOpacity",
  "currentItemRoundness",
  "gridSize",
  "gridStep",
  "gridModeEnabled",
  "theme",
];

export function stripAppState(appState: any): any {
  if (!appState) return appState;
  const stripped: Record<string, any> = {};
  for (const key of ESSENTIAL_APP_STATE_KEYS) {
    if (key in appState) {
      stripped[key] = appState[key];
    }
  }
  return stripped;
}

// ── Job data interfaces ────────────────────────────────────────────────
export interface ChatJobData {
  roomId: string;
  userId: string;
  message: string;
}

export interface CanvasUpdateJobData {
  roomId: string;
  userId: string;
  compressedData: string; // gzip + base64 encoded {elements, appState, files}
}

export const QUEUE_NAME = "chat-messages-and-canvas-updates";

export const queue = new Queue<ChatJobData | CanvasUpdateJobData>(QUEUE_NAME, {
  connection: {
    host: REDIS_HOST,
    port: REDIS_PORT,
    password: REDIS_PASSWORD || undefined,
    tls: REDIS_TLS ? {} : undefined,
    maxRetriesPerRequest: null,
  },
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 1000,
    },
    removeOnComplete: true,  // remove immediately after completion
    removeOnFail: 50,        // keep only last 50 failed jobs for debugging
  },
});

console.log(`Chat message queue initialized (Redis: ${REDIS_HOST}:${REDIS_PORT})`);
