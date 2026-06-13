import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/jwt";
import { cookies } from "next/headers";

async function getAuthUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;
  if (!token) return null;
  return verifyToken(token);
}

export async function GET() {
  try {
    const payload = await getAuthUser();
    if (!payload) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const applications = await prisma.application.findMany({
      where: { userId: payload.userId },
      include: {
        scheme: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ applications });
  } catch (error) {
    console.error("Applications GET error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const payload = await getAuthUser();
    if (!payload) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { schemeId } = await req.json();
    if (!schemeId) {
      return NextResponse.json({ error: "Scheme ID is required" }, { status: 400 });
    }

    const scheme = await prisma.scheme.findUnique({
      where: { id: schemeId },
    });
    if (!scheme) {
      return NextResponse.json({ error: "Scheme not found" }, { status: 404 });
    }

    const existing = await prisma.application.findFirst({
      where: {
        userId: payload.userId,
        schemeId,
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "You have already applied for this scheme" },
        { status: 400 }
      );
    }

    const application = await prisma.application.create({
      data: {
        userId: payload.userId,
        schemeId,
        status: "SUBMITTED",
      },
      include: {
        scheme: true,
      },
    });

    return NextResponse.json({
      message: "Application submitted successfully",
      application,
    });
  } catch (error: any) {
    console.error("Applications POST error:", error);
    return NextResponse.json({ error: error.message || "Server error" }, { status: 500 });
  }
}
