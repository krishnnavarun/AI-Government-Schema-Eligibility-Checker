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

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      include: {
        savedSchemes: {
          include: {
            scheme: true,
          },
        },
        applications: {
          include: {
            scheme: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { password, ...safeUser } = user;
    return NextResponse.json({ user: safeUser });
  } catch (error: any) {
    console.error("Profile GET error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const payload = await getAuthUser();
    if (!payload) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      name,
      age,
      gender,
      state,
      district,
      occupation,
      income,
      education,
      casteCategory,
      isDisability,
      isFarmer,
      isStudent,
      employmentStatus,
    } = body;

    const updatedUser = await prisma.user.update({
      where: { id: payload.userId },
      data: {
        name,
        age: age !== undefined ? parseInt(age) : undefined,
        gender,
        state,
        district,
        occupation,
        income: income !== undefined ? parseFloat(income) : undefined,
        education,
        casteCategory,
        isDisability: isDisability ?? undefined,
        isFarmer: isFarmer ?? undefined,
        isStudent: isStudent ?? undefined,
        employmentStatus,
      },
    });

    const { password, ...safeUser } = updatedUser;
    return NextResponse.json({
      message: "Profile updated successfully",
      user: safeUser,
    });
  } catch (error: any) {
    console.error("Profile PUT error:", error);
    return NextResponse.json({ error: error.message || "Server error" }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete("auth_token");
    return NextResponse.json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
