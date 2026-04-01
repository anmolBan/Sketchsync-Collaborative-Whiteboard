import { Queue } from "bullmq";
import { REDIS_HOST, REDIS_PORT, REDIS_PASSWORD, REDIS_TLS } from "@repo/backend_common";

export interface ChatJobData {
  roomId: string;
  userId: string;
  message: string;
}

export const CHAT_QUEUE_NAME = "chat-messages";

export const chatQueue = new Queue<ChatJobData>(CHAT_QUEUE_NAME, {
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
    removeOnComplete: 1000,
    removeOnFail: 5000,
  },
});

console.log(`Chat message queue initialized (Redis: ${REDIS_HOST}:${REDIS_PORT})`);
