import { Worker, Job } from "bullmq";
import { REDIS_HOST, REDIS_PORT, REDIS_PASSWORD, REDIS_TLS } from "@repo/backend_common";
import prisma from "@repo/db";
import { ChatJobData, CHAT_QUEUE_NAME } from "./queue.js";

const chatWorker = new Worker<ChatJobData>(
  CHAT_QUEUE_NAME,
  async (job: Job<ChatJobData>) => {
    const { roomId, userId, message } = job.data;

    await prisma.chat.create({
      data: {
        roomId,
        userId,
        message,
      },
    });

    console.log(`[Worker] Saved chat message from user ${userId} in room ${roomId}`);
  },
  {
    connection: {
      host: REDIS_HOST,
      port: REDIS_PORT,
      password: REDIS_PASSWORD || undefined,
      tls: REDIS_TLS ? {} : undefined,
      maxRetriesPerRequest: null,
    },
    concurrency: 10,
  }
);

chatWorker.on("completed", (job) => {
  console.log(`[Worker] Job ${job.id} completed`);
});

chatWorker.on("failed", (job, err) => {
  console.error(`[Worker] Job ${job?.id} failed:`, err.message);
});

console.log("Chat message worker started");

export { chatWorker };
