import { PrismaClient } from "@prisma/client";
import { createClient } from "@supabase/supabase-js";

const prisma = new PrismaClient();

function gaussian(mean: number, sd: number): number {
  const u = Math.random();
  const v = Math.random();
  const z = Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  return mean + sd * z;
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function main() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  let demoClientId: string;

  if (supabaseUrl && supabaseServiceKey) {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { data: userData, error } = await supabase.auth.admin.createUser({
      email: "zahra@husbar.com",
      password: "Demo1234!",
      email_confirm: true
    });
    if (error && !error.message.includes("already been registered")) {
      console.warn("Supabase user create:", error.message);
      demoClientId = "seed-demo-client-id";
    } else {
      demoClientId = userData?.user?.id ?? "seed-demo-client-id";
    }
  } else {
    demoClientId = "seed-demo-client-id";
  }

  await prisma.client.upsert({
    where: { id: demoClientId },
    create: {
      id: demoClientId,
      email: "zahra@husbar.com",
      companyName: "Husbar Demo",
      plan: "RETAINER",
      businessType: "B2C",
      industry: "Consumer brands",
      targetMarket: "Global"
    },
    update: {
      email: "zahra@husbar.com",
      companyName: "Husbar Demo",
      plan: "RETAINER",
      businessType: "B2C",
      industry: "Consumer brands",
      targetMarket: "Global"
    }
  });

  const studyConfig = {
    measurementGoal: "brand_preference",
    categoryA: {
      label: "Nike",
      stimuli: ["Nike", "Just Do It", "Swoosh", "Running", "Athletic", "Sport"]
    },
    categoryB: {
      label: "Adidas",
      stimuli: ["Adidas", "Three Stripes", "Originals", "Streetwear", "Comfort", "Classic"]
    },
    attributePositive: {
      label: "Positive",
      stimuli: ["Wonderful", "Excellent", "Joyful", "Pleasant", "Brilliant", "Happy"]
    },
    attributeNegative: {
      label: "Negative",
      stimuli: ["Awful", "Terrible", "Dreadful", "Unpleasant", "Miserable", "Failure"]
    },
    trialsPerBlock: { practice: 20, test: 40 },
    theme: { backgroundColor: "#040d09", textColor: "#f0fdf4", accentColor: "#22c55e" },
    completionMessage: "Thank you. Your responses have been recorded.",
    language: "en"
  };

  let study = await prisma.study.findFirst({
    where: { clientId: demoClientId, title: "Nike vs Adidas Brand Preference" }
  });
  if (!study) {
    study = await prisma.study.create({
      data: {
        clientId: demoClientId,
        title: "Nike vs Adidas Brand Preference",
        description: "Measure which brand holds the faster, more automatic positive association among our target audience.",
        status: "CLOSED",
        shareToken: "seed-nike-adidas-demo",
        config: studyConfig,
        participantMode: "LIVE_IAT"
      }
    });
  } else {
    const existingSessions = await prisma.session.findMany({
      where: { studyId: study.id },
      select: { id: true }
    });
    for (const sess of existingSessions) {
      await prisma.trial.deleteMany({ where: { sessionId: sess.id } });
    }
    await prisma.session.deleteMany({ where: { studyId: study.id } });
  }

  const IAT_BLOCKS = [
    { index: 0, trials: 20 },
    { index: 1, trials: 20 },
    { index: 2, trials: 20 },
    { index: 3, trials: 40 },
    { index: 4, trials: 20 },
    { index: 5, trials: 20 },
    { index: 6, trials: 40 }
  ];

  const congruentMean = 600;
  const congruentSd = 75;
  const incongruentMean = 621;
  const incongruentSd = 75;

  for (let s = 0; s < 47; s++) {
    const participantCode = `P-seed-${String(s + 1).padStart(3, "0")}`;
    const startedAt = new Date(Date.now() - (47 - s) * 86400000);
    const completedAt = new Date(startedAt.getTime() + (180 + randomInt(0, 120)) * 1000);

    const session = await prisma.session.create({
      data: {
        studyId: study.id,
        participantCode,
        startedAt,
        completedAt
      }
    });

    let dScoreSum = 0;
    const trialsForD: { blockIndex: number; rt: number; hadError: boolean }[] = [];

    for (const block of IAT_BLOCKS) {
      const isCritical = [2, 3, 5, 6].includes(block.index);
      const isCongruent = [2, 3].includes(block.index);
      const mean = isCritical ? (isCongruent ? congruentMean : incongruentMean) : 550;
      const sd = isCritical ? (isCongruent ? congruentSd : incongruentSd) : 60;

      for (let t = 0; t < block.trials; t++) {
        const rt = Math.max(350, Math.min(5000, Math.round(gaussian(mean, sd))));
        const hadError = Math.random() < 0.05;
        trialsForD.push({
          blockIndex: block.index,
          rt: hadError ? rt + 600 : rt,
          hadError
        });
        await prisma.trial.create({
          data: {
            sessionId: session.id,
            blockIndex: block.index,
            trialIndex: t,
            stimulus: "Word",
            stimulusType: block.index <= 1 ? "target_a" : "attribute_pos",
            correctKey: "e",
            pressedKey: "e",
            isCorrect: true,
            reactionTimeMs: rt,
            hadError,
            errorPenaltyMs: hadError ? 600 : 0
          }
        });
      }
    }

    const congruent = trialsForD.filter((x) => [2, 3].includes(x.blockIndex));
    const incongruent = trialsForD.filter((x) => [5, 6].includes(x.blockIndex));
    const meanC = congruent.reduce((a, x) => a + x.rt, 0) / congruent.length;
    const meanI = incongruent.reduce((a, x) => a + x.rt, 0) / incongruent.length;
    const allRTs = [...congruent, ...incongruent].map((x) => x.rt);
    const grandMean = allRTs.reduce((a, b) => a + b, 0) / allRTs.length;
    const variance = allRTs.reduce((sum, rt) => sum + Math.pow(rt - grandMean, 2), 0) / (allRTs.length - 1);
    const pooledSD = Math.sqrt(variance);
    const dScore = pooledSD > 0 ? (meanI - meanC) / pooledSD : 0;
    dScoreSum += dScore;

    const valid = trialsForD.filter((x) => x.rt < 300).length / trialsForD.length <= 0.1;
    const label =
      dScore > 0.35
        ? "Moderate preference for Nike"
        : dScore > 0.15
        ? "Slight preference for Nike"
        : dScore >= -0.15
        ? "No significant implicit preference"
        : dScore >= -0.35
        ? "Slight preference for Adidas"
        : "Moderate preference for Adidas";

    await prisma.session.update({
      where: { id: session.id },
      data: {
        isValid: valid,
        dScore: parseFloat(dScore.toFixed(4)),
        dScoreLabel: label,
        invalidReason: valid ? null : "Too many fast responses"
      }
    });
  }

  console.log("Seed complete: demo client zahra@husbar.com, Nike vs Adidas study with 47 sessions.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
