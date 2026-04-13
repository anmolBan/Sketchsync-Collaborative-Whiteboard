import { Worker, Job } from "bullmq";
import { REDIS_HOST, REDIS_PORT, REDIS_PASSWORD, REDIS_TLS } from "@repo/backend_common";
import prisma from "@repo/db";
import { CanvasUpdateJobData, ChatJobData, QUEUE_NAME, decompressData } from "./queue.js";

const chatWorker = new Worker<ChatJobData | CanvasUpdateJobData>(
  QUEUE_NAME,
  async (job: Job<ChatJobData | CanvasUpdateJobData>) => {
    if(job.data && "message" in job.data){
      const { roomId, userId, message } = job.data
      await prisma.chat.create({
        data: {
          roomId,
          userId,
          message,
        },
      });

      console.log(`[Worker] Saved chat message from user ${userId} in room ${roomId}`);
    } else if(job.data && "compressedData" in job.data){
      const { roomId, userId, compressedData } = job.data;
      const { elements, appState, files } = await decompressData(compressedData);
      await prisma.room.update({
        where: { id: roomId },
        data: {
          canvasData: {
            elements,
            appState,
            files
          }
        }
      });
      console.log(`[Worker] Saved canvas update from user ${userId} in room ${roomId}`);
    }
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
    drainDelay: 60, // Wait 60s between polls when idle (reduces Upstash command usage)
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
