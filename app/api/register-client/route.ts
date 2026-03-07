import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

interface Body {
  userId: string;
  email: string;
  companyName: string;
  businessType?: string;
  industry?: string;
  targetMarket?: string;
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Body;

    await prisma.client.upsert({
      where: { id: body.userId },
      update: {
        email: body.email,
        companyName: body.companyName,
        businessType: body.businessType,
        industry: body.industry,
        targetMarket: body.targetMarket
      },
      create: {
        id: body.userId,
        email: body.email,
        companyName: body.companyName,
        businessType: body.businessType,
        industry: body.industry,
        targetMarket: body.targetMarket,
        plan: "STARTER"
      }
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to register client profile" },
      { status: 500 }
    );
  }
}

