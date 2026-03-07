import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/auth/server";
import { prisma } from "@/lib/db/prisma";

export async function GET() {
  const supabase = getSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const client = await prisma.client.findUnique({
    where: { id: user.id }
  });
  if (!client) return NextResponse.json({ calendlyUrl: null });

  return NextResponse.json({
    calendlyUrl: client.calendlyUrl,
    companyName: client.companyName
  });
}
