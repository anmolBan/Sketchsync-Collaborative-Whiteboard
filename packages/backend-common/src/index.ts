import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Resolve .env from the monorepo root (3 levels up from packages/backend-common/src/)
dotenv.config({ path: path.resolve(__dirname, "../../../.env") });

export const JWT_SECRET = process.env.JWT_SECRET || "1231231234";
export const WS_PORT = process.env.WS_PORT ? parseInt(process.env.WS_PORT) : 8080;
export const HTTP_PORT = process.env.HTTP_PORT ? parseInt(process.env.HTTP_PORT) : 3002;
export const BACKEND_URL = process.env.BACKEND_URL || `http://localhost:${HTTP_PORT}`;
export const WS_URL = process.env.WS_URL || `ws://localhost:${WS_PORT}`;

// Type definitions