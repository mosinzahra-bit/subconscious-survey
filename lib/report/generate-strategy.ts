export interface StrategyReportData {
  executiveSummary: string;
  pillar1_signal: {
    headline: string;
    psychologicalState: string;
    awarenessStage: string;
    awarenessRationale: string;
    implication: string;
  };
  pillar2_trigger: {
    headline: string;
    dominantTrigger: string;
    triggerRationale: string;
    activationExamples: string[];
  };
  pillar3_friction: {
    headline: string;
    frictionType: string;
    frictionRationale: string;
    currentCommunicationIssues: string[];
    frictionRemovalPrinciples: string[];
  };
  pillar4_bridge: {
    headline: string;
    messagingArchitecture: string;
    channelRecommendations: {
      website: { heroMessage: string; ctaPsychology: string; trustSignals: string[] };
      email: { subjectLineApproach: string; openingHookStrategy: string; exampleSubjectLine: string };
      paidAds: { leadingTrigger: string; socialProofFormat: string; exampleHeadline: string };
      socialContent: { primaryContentType: string; secondaryContentType: string; postingPsychology: string };
      outreach: { conversationOpener: string; objectionHandling: string };
    };
  };
  pillar5_anchor: {
    headline: string;
    brandArchetype: string;
    archetypeRationale: string;
    consistencyPrinciples: string[];
    "12MonthAssociationGoal": string;
    loyaltyPsychology: string;
  };
  pillar6_automation: {
    headline: string;
    businessContext: string;
    funnelLayers: {
      layer: string;
      tool: string;
      psychologicalRole: string;
      automation: string;
      copyDirection: string;
      emailSequence?: { day: number; trigger: string; psychologicalPurpose: string; subjectLine: string }[];
    }[];
    totalToolsRequired: string[];
    estimatedSetupTime: string;
    estimatedMonthlyAutomationCost: string;
  };
}

interface GenerateInput {
  study: {
    title: string;
    config: {
      measurementGoal?: string;
      categoryA?: { label: string };
      categoryB?: { label: string };
      attributePositive?: { label: string };
      attributeNegative?: { label: string };
    };
    participantMode: string;
  };
  client: {
    businessType: string | null;
    industry: string | null;
    targetMarket: string | null;
  };
  results: {
    validSessionCount: number;
    meanDScore: number;
    interpretationLabel: string;
    avgErrorRate: number;
    avgCompletionTime: number;
    meanRTCongruent: number;
    meanRTIncongruent: number;
    rtGap: number;
  };
}

export async function generateStrategyReport(input: GenerateInput): Promise<StrategyReportData> {
  const { study, client, results } = input;
  const config = study.config as any;

  const systemPrompt = `You are the senior behavioral strategist at Husbar, 
a psychology-based marketing firm. You write strategy reports that combine 
clinical behavioral psychology with practical marketing execution.

Your reports must:
- Sound like a senior behavioral scientist who deeply understands business
- Be specific to the data provided — never generic
- Reference the actual D-score numbers and what they reveal psychologically
- Use Husbar's HDAF framework: Signal → Trigger → Friction → Bridge → Anchor → Automation
- Include specific, actionable copy examples — not just principles
- Recommend specific AI tools by name (n8n, GoHighLevel, Apollo.io, Claude, etc.)
- Always explain the psychological WHY behind every recommendation
- Be confident and direct — no hedging language
- Never use the word "leverage" or "utilize" or "synergy"

The client is not a psychologist. They are a business owner or CMO.
Translate the science into business strategy they can immediately use.

Husbar brand voice: direct, insightful, psychologically precise, premium.`;

  const userPrompt = `Generate a full strategy report for this study.

STUDY DATA:
- Study Title: ${study.title}
- Measurement Goal: ${config?.measurementGoal ?? "brand_preference"}
- Category A: "${config?.categoryA?.label ?? "Category A"}"
- Category B: "${config?.categoryB?.label ?? "Category B"}"
- Positive Attribute: "${config?.attributePositive?.label ?? "Positive"}"
- Negative Attribute: "${config?.attributeNegative?.label ?? "Negative"}"

RESULTS:
- Participant Mode: ${study.participantMode}
- Total valid sessions: ${results.validSessionCount}
- Mean Association Score: ${results.meanDScore} (scale: -2 to +2)
- Score interpretation: ${results.interpretationLabel}
- Error rate: ${results.avgErrorRate}%
- Average completion time: ${results.avgCompletionTime}s
- Congruent block mean RT: ${results.meanRTCongruent}ms
- Incongruent block mean RT: ${results.meanRTIncongruent}ms
- RT gap (incongruent - congruent): ${results.rtGap}ms

Client business context:
- Business type: ${client.businessType ?? "Not set"}
- Industry: ${client.industry ?? "Not set"}
- Target market: ${client.targetMarket ?? "Not set"}

Generate the complete 6-pillar strategy report.
For Pillar 6, recommend a specific automation stack appropriate for 
a ${client.businessType ?? "B2B"} in the ${client.industry ?? "general"} sector.
Include the funnel architecture with specific tools, psychological rationale,
and automation workflow descriptions for each layer.

Respond in JSON matching this exact structure (no markdown fences):
{"executiveSummary":"...","pillar1_signal":{"headline":"...","psychologicalState":"...","awarenessStage":"...","awarenessRationale":"...","implication":"..."},"pillar2_trigger":{"headline":"...","dominantTrigger":"...","triggerRationale":"...","activationExamples":["...","...","..."]},"pillar3_friction":{"headline":"...","frictionType":"...","frictionRationale":"...","currentCommunicationIssues":["...","..."],"frictionRemovalPrinciples":["...","...","..."]},"pillar4_bridge":{"headline":"...","messagingArchitecture":"...","channelRecommendations":{"website":{...},"email":{...},"paidAds":{...},"socialContent":{...},"outreach":{...}}},"pillar5_anchor":{"headline":"...","brandArchetype":"...","archetypeRationale":"...","consistencyPrinciples":["...","..."],"12MonthAssociationGoal":"...","loyaltyPsychology":"..."},"pillar6_automation":{"headline":"...","businessContext":"...","funnelLayers":[{"layer":"...","tool":"...","psychologicalRole":"...","automation":"...","copyDirection":"..."}],"totalToolsRequired":["...","..."],"estimatedSetupTime":"...","estimatedMonthlyAutomationCost":"..."}}`;

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY!,
      "anthropic-version": "2023-06-01"
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 8000,
      system: systemPrompt,
      messages: [{ role: "user", content: userPrompt }]
    })
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Claude API error: ${res.status} ${err}`);
  }

  const data = await res.json();
  const text = data.content?.[0]?.text ?? "";
  const clean = text.replace(/```json\n?|```\n?/g, "").trim();
  const parsed = JSON.parse(clean) as StrategyReportData;
  return parsed;
}
