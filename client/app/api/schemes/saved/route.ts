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

    const saved = await prisma.savedScheme.findMany({
      where: { userId: payload.userId },
      include: {
        scheme: true,
      },
    });

    return NextResponse.json({ savedSchemes: saved.map((s) => s.scheme) });
  } catch (error) {
    console.error("Saved schemes GET error:", error);
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

    const existing = await prisma.savedScheme.findUnique({
      where: {
        userId_schemeId: {
          userId: payload.userId,
          schemeId,
        },
      },
    });

    if (existing) {
      await prisma.savedScheme.delete({
        where: {
          userId_schemeId: {
            userId: payload.userId,
            schemeId,
          },
        },
      });
      return NextResponse.json({ saved: false, message: "Scheme unsaved" });
    } else {
      await prisma.savedScheme.create({
        data: {
          userId: payload.userId,
          schemeId,
        },
      });
      return NextResponse.json({ saved: true, message: "Scheme saved" });
    }
  } catch (error: any) {
    console.error("Saved schemes POST error:", error);
    return NextResponse.json({ error: error.message || "Server error" }, { status: 500 });
  }
}
