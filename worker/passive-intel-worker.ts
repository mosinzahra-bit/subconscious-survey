import { Worker, Job } from "bullmq";
import { PrismaClient } from "@prisma/client";
import { collectFromReddit, collectFromApify, collectFromTwitter } from "../lib/passive/collectors";
import { analyzeWithClaude } from "../lib/passive/nlp-analyze";
import { calculatePassiveAssociationScore, type TextAnalysisResult } from "../lib/passive/pas-scoring";
import type { PassiveJobPayload } from "../lib/passive/queue";

const prisma = new PrismaClient();
const connection = {
  host: process.env.REDIS_HOST ?? "localhost",
  port: parseInt(process.env.REDIS_PORT ?? "6379", 10),
  password: process.env.REDIS_PASSWORD ?? undefined
};

async function processJob(job: Job<PassiveJobPayload>) {
  const { studyId, concepts, sources, minSamples } = job.data;
  const perSource = Math.ceil(minSamples / Math.max(1, sources.length));
  const allSamples: { rawText: string; source: string; url?: string }[] = [];

  await prisma.study.update({
    where: { id: studyId },
    data: { passiveJobStatus: "collecting" }
  });

  if (sources.includes("reddit")) {
    const terms = [...concepts.categoryA, ...concepts.categoryB].slice(0, 5);
    const reddit = await collectFromReddit(terms, perSource);
    allSamples.push(...reddit);
    await job.updateProgress({
      source: "reddit",
      collected: allSamples.length,
      total: minSamples
    });
  }
  if (sources.includes("reviews")) {
    const terms = [...concepts.categoryA, ...concepts.categoryB].slice(0, 3);
    const reviews = await collectFromApify("compass/crawler-google-places", terms, perSource);
    allSamples.push(...reviews);
    await job.updateProgress({
      source: "reviews",
      collected: allSamples.length,
      total: minSamples
    });
  }
  if (sources.includes("twitter")) {
    const terms = [...concepts.categoryA, ...concepts.categoryB].slice(0, 3);
    const twitter = await collectFromTwitter(terms, perSource);
    allSamples.push(...twitter);
    await job.updateProgress({
      source: "twitter",
      collected: allSamples.length,
      total: minSamples
    });
  }
  if (allSamples.length < 10) {
    for (let i = allSamples.length; i < Math.max(minSamples, 50); i++) {
      allSamples.push({
        rawText: `[Simulated] Sample text ${i + 1} discussing ${concepts.categoryA[0] ?? "A"} and ${concepts.categoryB[0] ?? "B"}.`,
        source: "simulated"
      });
    }
  }

  await prisma.study.update({
    where: { id: studyId },
    data: { passiveJobStatus: "analyzing" }
  });

  const analysisResults: TextAnalysisResult[] = [];
  const categoryA = concepts.categoryA[0] ?? "Category A";
  const categoryB = concepts.categoryB[0] ?? "Category B";
  const attrPos = concepts.attributePositive[0] ?? "Positive";
  const attrNeg = concepts.attributeNegative[0] ?? "Negative";

  for (let i = 0; i < allSamples.length; i++) {
    const sample = allSamples[i];
    const analyzed = await analyzeWithClaude(sample, concepts);
    analysisResults.push(analyzed);
    await prisma.passiveSample.create({
      data: {
        studyId,
        source: sample.source,
        rawText: sample.rawText.slice(0, 10000),
        url: sample.url ?? null,
        conceptA_score: (analyzed.implicitAssociationSignals.conceptA_positive - analyzed.implicitAssociationSignals.conceptA_negative) / 10,
        conceptB_score: (analyzed.implicitAssociationSignals.conceptB_positive - analyzed.implicitAssociationSignals.conceptB_negative) / 10,
        valenceScore: analyzed.emotionalValence,
        linguisticMarkers: analyzed.linguisticMarkers as object,
        isValid: analyzed.linguisticMarkers.emotionalLanguage
      }
    });
    if (i % 20 === 0) {
      await job.updateProgress({
        source: "analyzing",
        collected: i + 1,
        total: allSamples.length
      });
    }
  }

  const pasResult = calculatePassiveAssociationScore(
    analysisResults,
    categoryA,
    categoryB,
    attrPos,
    attrNeg
  );

  await prisma.study.update({
    where: { id: studyId },
    data: {
      passiveJobStatus: "complete",
      passiveJobProgress: {
        status: "complete",
        collected: allSamples.length,
        total: minSamples,
        pas: pasResult.pas,
        confidence: pasResult.confidence,
        sampleCount: pasResult.sampleCount,
        validSamples: pasResult.validSamples
      }
    }
  });
}

const worker = new Worker<PassiveJobPayload>(
  "passive-intelligence",
  processJob,
  { connection, concurrency: 1 }
);

worker.on("completed", (job) => {
  console.log(`Passive job ${job.id} completed for study ${job.data.studyId}`);
});

worker.on("failed", (job, err) => {
  console.error(`Passive job ${job?.id} failed:`, err);
  if (job?.data?.studyId) {
    prisma.study
      .update({
        where: { id: job.data.studyId },
        data: { passiveJobStatus: "failed" }
      })
      .catch(console.error);
  }
});

console.log("Passive Intelligence worker running. Waiting for jobs...");
