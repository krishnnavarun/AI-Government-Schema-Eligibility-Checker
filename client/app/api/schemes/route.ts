import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const state = searchParams.get("state") || "";
    const ministry = searchParams.get("ministry") || "";
    const sortBy = searchParams.get("sortBy") || "name";
    const sortOrder = searchParams.get("sortOrder") || "asc";

    let schemes = await prisma.scheme.findMany();

    if (search) {
      const q = search.toLowerCase();
      schemes = schemes.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.description.toLowerCase().includes(q) ||
          s.benefits.toLowerCase().includes(q) ||
          (s.ministry && s.ministry.toLowerCase().includes(q))
      );
    }

    if (state && state.toLowerCase() !== "all") {
      schemes = schemes.filter(
        (s) =>
          !s.stateAvailability ||
          s.stateAvailability.toLowerCase() === "all" ||
          s.stateAvailability.toLowerCase() === state.toLowerCase()
      );
    }

    if (ministry && ministry.toLowerCase() !== "all") {
      schemes = schemes.filter(
        (s) => s.ministry && s.ministry.toLowerCase() === ministry.toLowerCase()
      );
    }

    schemes.sort((a, b) => {
      let valA = a[sortBy as keyof typeof a] || "";
      let valB = b[sortBy as keyof typeof b] || "";

      if (sortBy === "createdAt") {
        valA = new Date(a.createdAt).getTime();
        valB = new Date(b.createdAt).getTime();
      }

      if (valA < valB) return sortOrder === "asc" ? -1 : 1;
      if (valA > valB) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    return NextResponse.json({ schemes });
  } catch (error: any) {
    console.error("Schemes GET error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
