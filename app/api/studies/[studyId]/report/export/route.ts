import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/auth/server";
import { prisma } from "@/lib/db/prisma";
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
  if (!reportId) return NextResponse.json({ error: "reportId required" }, { status: 400 });

  const report = await prisma.strategyReport.findFirst({
    where: { id: reportId, studyId: params.studyId }
  });
  if (!report) return NextResponse.json({ error: "Report not found" }, { status: 404 });

  const data = report.reportData as Record<string, unknown>;
  const doc = new PDFDocument({ margin: 50 });

  const chunks: Buffer[] = [];
  doc.on("data", (chunk: Buffer) => chunks.push(chunk));
  const bufferPromise = new Promise<Buffer>((resolve) => {
    doc.on("end", () => resolve(Buffer.concat(chunks)));
  });

  doc.fontSize(18).text("HUSBAR STRATEGY REPORT", { align: "center" });
  doc.moveDown();
  doc.fontSize(14).text(study.title, { align: "center" });
  doc.fontSize(10).text(`Generated: ${report.generatedAt}`, { align: "center" });
  doc.moveDown(2);

  doc.fontSize(11).text("Executive summary", { continued: false });
  doc.fontSize(10).text(String(data.executiveSummary ?? ""), { align: "justify" });
  doc.moveDown(2);

  const p1 = data.pillar1_signal as Record<string, string>;
  if (p1) {
    doc.fontSize(11).text("Pillar 1 — Signal", { continued: false });
    doc.fontSize(10).text(p1.headline ?? "");
    doc.text(p1.psychologicalState ?? "");
    doc.text(`Awareness stage: ${p1.awarenessStage ?? ""}. ${p1.implication ?? ""}`);
    doc.moveDown(2);
  }

  const p2 = data.pillar2_trigger as Record<string, unknown>;
  if (p2) {
    doc.fontSize(11).text("Pillar 2 — Trigger", { continued: false });
    doc.fontSize(10).text(String(p2.headline ?? ""));
    doc.text(String(p2.triggerRationale ?? ""));
    doc.moveDown(2);
  }

  const p3 = data.pillar3_friction as Record<string, unknown>;
  if (p3) {
    doc.fontSize(11).text("Pillar 3 — Friction", { continued: false });
    doc.fontSize(10).text(String(p3.headline ?? ""));
    doc.text(String(p3.frictionRationale ?? ""));
    doc.moveDown(2);
  }

  const p4 = data.pillar4_bridge as Record<string, unknown>;
  if (p4) {
    doc.fontSize(11).text("Pillar 4 — Bridge", { continued: false });
    doc.fontSize(10).text(String(p4.headline ?? ""));
    doc.text(String(p4.messagingArchitecture ?? ""));
    doc.moveDown(2);
  }

  const p5 = data.pillar5_anchor as Record<string, unknown>;
  if (p5) {
    doc.fontSize(11).text("Pillar 5 — Anchor", { continued: false });
    doc.fontSize(10).text(String(p5.headline ?? ""));
    doc.text(String(p5["12MonthAssociationGoal"] ?? ""));
    doc.moveDown(2);
  }

  const p6 = data.pillar6_automation as Record<string, unknown>;
  if (p6) {
    doc.fontSize(11).text("Pillar 6 — Automation", { continued: false });
    doc.fontSize(10).text(String(p6.headline ?? ""));
    doc.text(String(p6.businessContext ?? ""));
    doc.moveDown();
    const layers = (p6.funnelLayers as Array<Record<string, string>>) ?? [];
    layers.forEach((l) => {
      doc.text(`${l.layer}: ${l.tool} — ${l.psychologicalRole}`);
    });
  }

  doc.end();
  const buffer = await bufferPromise;

 return new NextResponse(buffer as unknown as BodyInit, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="Husbar_Strategy_Report.pdf"`
    }
  });
}
