import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/auth/server";
import { prisma } from "@/lib/db/prisma";
import JSZip from "jszip";
import PDFDocument from "pdfkit";

export async function GET(
  req: Request,
  { params }: { params: { studyId: string } }
) {
  const supabase = getSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const study = await prisma.study.findFirst({
    where: { id: params.studyId, clientId: user.id }
  });
  if (!study) return NextResponse.json({ error: "Study not found" }, { status: 404 });

  const url = new URL(req.url);
  const reportId = url.searchParams.get("reportId");
  const report = reportId
    ? await prisma.strategyReport.findFirst({
        where: { id: reportId, studyId: params.studyId }
      })
    : await prisma.strategyReport.findFirst({
        where: { studyId: params.studyId },
        orderBy: { version: "desc" }
      });
  if (!report) return NextResponse.json({ error: "Report not found" }, { status: 404 });

  const data = report.reportData as Record<string, unknown>;

  const zip = new JSZip();

  const addPdf = (name: string, fn: (doc:typeof PDFDocument) => void): Promise<Buffer> => {
    const doc = new PDFDocument({ margin: 50 });
    const chunks: Buffer[] = [];
    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    const bufferPromise = new Promise<Buffer>((resolve) => {
      doc.on("end", () => resolve(Buffer.concat(chunks)));
    });
    fn(doc);
    doc.end();
    return bufferPromise;
  };

  const strategyPdf = await addPdf("strategy_summary.pdf", (doc) => {
    doc.fontSize(14).text("HUSBAR STRATEGY REPORT", { align: "center" });
    doc.moveDown();
    doc.fontSize(10).text(String(data.executiveSummary ?? ""), { align: "justify" });
    doc.moveDown(2);
    ["pillar1_signal", "pillar2_trigger", "pillar3_friction", "pillar4_bridge", "pillar5_anchor", "pillar6_automation"].forEach((key) => {
      const p = data[key] as Record<string, unknown>;
      if (p && p.headline) {
        doc.fontSize(11).text(String(p.headline), { continued: false });
        doc.moveDown();
      }
    });
  });
  zip.file("strategy_summary.pdf", strategyPdf);

  const n8nWorkflow = {
    name: `Husbar funnel - ${study.title}`,
    nodes: [
      { id: "1", type: "n8n-nodes-base.manualTrigger", position: [0, 0] },
      { id: "2", type: "n8n-nodes-base.noOp", position: [200, 0], name: "Awareness" },
      { id: "3", type: "n8n-nodes-base.noOp", position: [400, 0], name: "Capture" },
      { id: "4", type: "n8n-nodes-base.noOp", position: [600, 0], name: "Nurture" },
      { id: "5", type: "n8n-nodes-base.noOp", position: [800, 0], name: "Conversion" }
    ],
    connections: {},
    meta: { templateCredsSetupCompleted: false }
  };
  zip.file("n8n_workflow.json", JSON.stringify(n8nWorkflow, null, 2));

  const p6 = data.pillar6_automation as Record<string, unknown>;
  const ghlNotes = await addPdf("ghl_funnel_notes.pdf", (doc) => {
    doc.fontSize(12).text("GoHighLevel funnel setup — from your strategy", { continued: false });
    doc.moveDown();
    doc.fontSize(10).text(String(p6?.businessContext ?? "Follow Pillar 6 automation stack from your report."), { align: "justify" });
    doc.moveDown();
    const layers = (p6?.funnelLayers as Array<Record<string, string>>) ?? [];
    layers.forEach((l) => {
      doc.text(`${l.layer}: ${l.tool}`);
      doc.text(`Psychology: ${l.psychologicalRole}`);
      doc.text(`Automation: ${l.automation}`);
      doc.moveDown();
    });
  });
  zip.file("ghl_funnel_notes.pdf", ghlNotes);

  const p4 = data.pillar4_bridge as Record<string, { channelRecommendations?: { email?: { subjectLineApproach?: string; exampleSubjectLine?: string } } }>;
  const emailSeq = await addPdf("email_sequence.pdf", (doc) => {
    doc.fontSize(12).text("Email sequence — psychological brief", { continued: false });
    doc.moveDown();
    doc.fontSize(10).text(p4?.channelRecommendations?.email?.subjectLineApproach ?? "Use subject lines that match the trigger identified in Pillar 2.");
    doc.text("Example subject: " + (p4?.channelRecommendations?.email?.exampleSubjectLine ?? "From your report"));
    const p6layers = (data.pillar6_automation as Record<string, { funnelLayers?: Array<Record<string, { emailSequence?: Array<Record<string, string>> }>> }>)?.funnelLayers;
    const nurture = p6layers?.find((l: Record<string, string>) => l.layer === "Nurture");
    const seq = (nurture as any)?.emailSequence ?? [];
    seq.forEach((e: Record<string, string>) => {
      doc.moveDown();
      doc.text(`Day ${e.day}: ${e.subjectLine ?? e.trigger ?? ""}`);
    });
  });
  zip.file("email_sequence.pdf", emailSeq);

  const copyTemplates = await addPdf("copy_templates.pdf", (doc) => {
    doc.fontSize(12).text("Copy templates from Pillar 4", { continued: false });
    doc.moveDown();
    const rec = p4?.channelRecommendations as Record<string, Record<string, string>> | undefined;
    if (rec?.website) doc.text("Website hero: " + (rec.website.heroMessage ?? ""));
    if (rec?.paidAds) doc.text("Ad headline: " + (rec.paidAds.exampleHeadline ?? ""));
  });
  zip.file("copy_templates.pdf", copyTemplates);

  const p2 = data.pillar2_trigger as Record<string, unknown>;
  const p3 = data.pillar3_friction as Record<string, unknown>;
  const p5 = data.pillar5_anchor as Record<string, unknown>;
  const cheatsheet = await addPdf("psychology_cheatsheet.pdf", (doc) => {
    doc.fontSize(14).text("Psychology cheatsheet — what to say and why", { continued: false });
    doc.moveDown(2);
    doc.fontSize(11).text("Trigger (Pillar 2): " + String(p2?.dominantTrigger ?? "—"), { continued: false });
    doc.fontSize(10).text(String(p2?.triggerRationale ?? ""));
    doc.moveDown();
    doc.fontSize(11).text("Friction (Pillar 3): " + String(p3?.frictionType ?? "—"), { continued: false });
    doc.fontSize(10).text(String(p3?.frictionRationale ?? ""));
    doc.moveDown();
    doc.fontSize(11).text("Bridge: " + String((data.pillar4_bridge as Record<string, string>)?.messagingArchitecture ?? "—"), { continued: false });
    doc.moveDown();
    doc.fontSize(11).text("Anchor: " + String(p5?.["12MonthAssociationGoal"] ?? "—"), { continued: false });
  });
  zip.file("psychology_cheatsheet.pdf", cheatsheet);

  const blob = await zip.generateAsync({ type: "nodebuffer" });

  return new NextResponse(blob, {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="Husbar_DIY_Toolkit_${study.title.replace(/\s/g, "_")}.zip"`
    }
  });
}
