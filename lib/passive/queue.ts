import { Queue } from "bullmq";

export interface PassiveJobPayload {
  studyId: string;
  concepts: {
    categoryA: string[];
    categoryB: string[];
    attributePositive: string[];
    attributeNegative: string[];
  };
  sources: string[];
  targetAudience: string;
  dateRange: string;
  language: string;
  minSamples: number;
}

let queue: Queue | null = null;

function getQueue(): Queue | null {
  if (queue) return queue;
  const host = process.env.REDIS_HOST ?? "localhost";
  const port = parseInt(process.env.REDIS_PORT ?? "6379", 10);
  const password = process.env.REDIS_PASSWORD ?? undefined;
  try {
    queue = new Queue("passive-intelligence", {
      connection: { host, port, password },
      defaultJobOptions: {
        attempts: 2,
        backoff: { type: "exponential", delay: 5000 },
        removeOnComplete: { count: 100 }
      }
    });
    return queue;
  } catch {
    return null;
  }
}

export async function enqueuePassiveJob(payload: PassiveJobPayload): Promise<string> {
  const q = getQueue();
  if (!q) return "";
  try {
    const job = await q.add("collect-and-analyze", payload);
    return job.id ?? "";
  } catch {
    return "";
  }
}
