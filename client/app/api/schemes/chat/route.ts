import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/jwt";
import { cookies } from "next/headers";
import Groq from "groq-sdk";

async function getAuthUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;
  if (!token) return null;
  return verifyToken(token);
}

export async function POST(req: Request) {
  try {
    const payload = await getAuthUser();
    if (!payload) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { message, history } = await req.json();
    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
    });

    const schemes = await prisma.scheme.findMany();

    const apiKey = process.env.GROQ_API_KEY;
    const isApiKeyValid = apiKey && apiKey !== "your_groq_api_key_here" && apiKey.trim() !== "";

    if (isApiKeyValid) {
      try {
        const groq = new Groq({
          apiKey: apiKey,
        });

        const schemesContext = schemes.map((s) => ({
          name: s.name,
          description: s.description,
          benefits: s.benefits,
          ministry: s.ministry,
          state: s.stateAvailability,
          officialUrl: s.officialUrl,
        }));

        const systemPrompt = `You are "SchemeWise AI Chatbot", a smart virtual government helper.
You assist citizens with their questions regarding available government schemes, application steps, and general eligibility.
Use the following database of schemes to answer the user's questions:
${JSON.stringify(schemesContext)}

User Profile Info:
- Name: ${user?.name}
- Age: ${user?.age || "N/A"}
- State: ${user?.state || "N/A"}
- Occupation: ${user?.occupation || "N/A"}
- Annual Income: ₹${user?.income || 0}
- Caste Category: ${user?.casteCategory || "N/A"}
- Farmer Status: ${user?.isFarmer ? "Yes" : "No"}
- Student Status: ${user?.isStudent ? "Yes" : "No"}
- Disability Status: ${user?.isDisability ? "Yes" : "No"}

Rules for response:
- Only suggest schemes from the provided context database.
- Keep the language simple, professional, and empathetic.
- Format responses nicely using Markdown (bullet points, bold text).`;

        const messages = [
          { role: "system", content: systemPrompt },
          ...(history || []).map((h: any) => ({
            role: h.role,
            content: h.content,
          })),
          { role: "user", content: message },
        ];

        const chatCompletion = await groq.chat.completions.create({
          messages: messages as any,
          model: "llama-3.1-8b-instant",
          temperature: 0.5,
          max_tokens: 600,
        });

        const responseText = chatCompletion.choices[0]?.message?.content || "";
        return NextResponse.json({ reply: responseText });
      } catch (err: any) {
        console.error("Groq Chat API error:", err);
      }
    }

    const query = message.trim().toLowerCase();

    // 1. Handle common greetings and generic queries
    if (query === "hi" || query === "hello" || query === "hey" || query === "greetings") {
      const reply = `Hello ${user?.name || "there"}! I am the SchemeWise Assistant. I help you search for schemes, check eligibility rules, and find document requirements.\n\nTo get started, try asking me something like:\n* *"Am I eligible for PM Kisan?"*\n* *"What are the documents needed for Pudhumai Penn?"*\n* *"List all schemes"*`;
      return NextResponse.json({ reply });
    }

    if (query === "help" || query === "list schemes" || query === "show all schemes" || query === "list" || query === "schemes") {
      let reply = `Here are the government schemes available in our database:\n\n`;
      schemes.forEach((s, idx) => {
        reply += `${idx + 1}. **${s.name}** (${s.ministry || "Ministry"})\n`;
      });
      reply += `\nFeel free to ask me details or document requirements for any of these!`;
      return NextResponse.json({ reply });
    }

    // 2. Perform scheme matching based on query keywords
    const matchedSchemes = schemes.filter(
      (s) =>
        s.name.toLowerCase().includes(query) ||
        s.description.toLowerCase().includes(query) ||
        (s.ministry && s.ministry.toLowerCase().includes(query)) ||
        // Check if query contains scheme name keywords
        query.includes(s.name.toLowerCase().replace("scheme", "").trim())
    );

    let reply = "";
    if (matchedSchemes.length > 0) {
      reply += `Based on your query, here are the matching scheme details:\n\n`;
      matchedSchemes.forEach((s) => {
        let eligibilityStr = "";
        try {
          const rules = typeof s.eligibility === "string" ? JSON.parse(s.eligibility) : s.eligibility;
          const criteriaList: string[] = [];
          if (rules.incomeLimit) criteriaList.push(`Annual Income limit: ₹${rules.incomeLimit.toLocaleString()}`);
          if (rules.ageMin || rules.ageMax) {
            if (rules.ageMin && rules.ageMax) criteriaList.push(`Age: between ${rules.ageMin} and ${rules.ageMax}`);
            else if (rules.ageMin) criteriaList.push(`Age: at least ${rules.ageMin}`);
            else if (rules.ageMax) criteriaList.push(`Age: at most ${rules.ageMax}`);
          }
          if (rules.isFarmer) criteriaList.push(`Requires active farmer registration`);
          if (rules.isStudent) criteriaList.push(`Requires active student enrollment`);
          if (rules.isDisability) criteriaList.push(`Requires disability certificate`);
          if (rules.gender) criteriaList.push(`Gender requirement: ${rules.gender}`);
          if (rules.casteCategory && rules.casteCategory.length > 0) {
            criteriaList.push(`Categories: ${rules.casteCategory.join(", ")}`);
          }
          eligibilityStr = criteriaList.map(c => `- ${c}`).join("\n");
        } catch (e) {
          eligibilityStr = `- Programmatic rules configured under settings.`;
        }

        const docList = s.documents.map(d => `- ${d}`).join("\n");

        reply += `### **${s.name}**\n`;
        reply += `* **Ministry**: ${s.ministry || "N/A"}\n`;
        reply += `* **Benefits**: ${s.benefits}\n`;
        reply += `* **Description**: ${s.description}\n`;
        if (s.stateAvailability && s.stateAvailability !== "All") {
          reply += `* **State Availability**: ${s.stateAvailability}\n`;
        }
        reply += `\n**Eligibility Criteria:**\n${eligibilityStr}\n\n`;
        reply += `**Required Documents:**\n${docList}\n`;
        if (s.officialUrl) {
          reply += `\n[Visit Official Portal](${s.officialUrl})\n`;
        }
        reply += `\n---\n\n`;
      });
    } else {
      reply += `I couldn't find any exact scheme matches for "${message}" in the database. \n\nHere are some schemes available:\n`;
      schemes.slice(0, 3).forEach((s) => {
        reply += `* **${s.name}** - ${s.description.slice(0, 100)}...\n`;
      });
      reply += `\nTry searching for keywords like *farmer*, *scholarship*, or *startup*.`;
    }

    return NextResponse.json({ reply });
  } catch (error: any) {
    console.error("Chat helper error:", error);
    return NextResponse.json({ error: error.message || "Server error" }, { status: 500 });
  }
}
