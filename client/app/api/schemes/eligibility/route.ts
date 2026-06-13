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

function evaluateRules(user: any, scheme: any) {
  let rules: any = {};
  try {
    rules = typeof scheme.eligibility === "string" 
      ? JSON.parse(scheme.eligibility) 
      : scheme.eligibility;
  } catch (e) {
    rules = scheme.eligibility || {};
  }

  const checks: { name: string; passed: boolean; message: string }[] = [];

  if (rules.incomeLimit !== undefined) {
    const userIncome = user.income || 0;
    const passed = userIncome <= rules.incomeLimit;
    checks.push({
      name: "Annual Income",
      passed,
      message: passed
        ? `Your annual income (₹${userIncome}) is within the limit of ₹${rules.incomeLimit}.`
        : `Your annual income (₹${userIncome}) exceeds the limit of ₹${rules.incomeLimit}.`,
    });
  }

  if (rules.ageMin !== undefined || rules.ageMax !== undefined) {
    const userAge = user.age || 0;
    const minPass = rules.ageMin !== undefined ? userAge >= rules.ageMin : true;
    const maxPass = rules.ageMax !== undefined ? userAge <= rules.ageMax : true;
    const passed = minPass && maxPass;

    let msg = "";
    if (rules.ageMin && rules.ageMax) msg = `Requires age between ${rules.ageMin} and ${rules.ageMax}. You are ${userAge}.`;
    else if (rules.ageMin) msg = `Requires age at least ${rules.ageMin}. You are ${userAge}.`;
    else if (rules.ageMax) msg = `Requires age at most ${rules.ageMax}. You are ${userAge}.`;

    checks.push({
      name: "Age Criteria",
      passed,
      message: msg + (passed ? " (Matches)" : " (Does not match)"),
    });
  }

  if (scheme.stateAvailability && scheme.stateAvailability.toLowerCase() !== "all") {
    const userState = user.state || "";
    const passed = userState.toLowerCase() === scheme.stateAvailability.toLowerCase();
    checks.push({
      name: "State Residency",
      passed,
      message: passed
        ? `Reside in eligible state: ${scheme.stateAvailability}.`
        : `Requires residency in ${scheme.stateAvailability}. Your profile lists ${userState || "unspecified"}.`,
    });
  }

  if (rules.requiredOccupation) {
    const userOcc = user.occupation || "";
    const passed = userOcc.toLowerCase() === rules.requiredOccupation.toLowerCase();
    checks.push({
      name: "Occupation Status",
      passed,
      message: passed
        ? `Occupation match: ${rules.requiredOccupation}.`
        : `Requires occupation: ${rules.requiredOccupation}. Your profile lists ${userOcc || "unspecified"}.`,
    });
  }

  if (rules.isFarmer !== undefined) {
    const passed = !!user.isFarmer === !!rules.isFarmer;
    checks.push({
      name: "Farmer Registry",
      passed,
      message: passed
        ? `Farmer status matched.`
        : `Requires farmer registry status: ${rules.isFarmer ? "Yes" : "No"}.`,
    });
  }

  if (rules.isStudent !== undefined) {
    const passed = !!user.isStudent === !!rules.isStudent;
    checks.push({
      name: "Student Enrollment",
      passed,
      message: passed
        ? `Student status matched.`
        : `Requires active student enrollment: ${rules.isStudent ? "Yes" : "No"}.`,
    });
  }

  if (rules.isDisability !== undefined) {
    const passed = !!user.isDisability === !!rules.isDisability;
    checks.push({
      name: "Disability Criteria",
      passed,
      message: passed
        ? `Disability status matches.`
        : `Requires disability card: ${rules.isDisability ? "Yes" : "No"}.`,
    });
  }

  const total = checks.length;
  const passedCount = checks.filter((c) => c.passed).length;
  const matchScore = total > 0 ? Math.round((passedCount / total) * 100) : 100;

  let status = "ELIGIBLE";
  if (matchScore < 50) {
    status = "NOT_ELIGIBLE";
  } else if (matchScore < 100) {
    status = "PARTIALLY_ELIGIBLE";
  }

  return { status, matchScore, checks };
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

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
    });
    const scheme = await prisma.scheme.findUnique({
      where: { id: schemeId },
    });

    if (!user || !scheme) {
      return NextResponse.json({ error: "User or Scheme not found" }, { status: 404 });
    }

    const evaluation = evaluateRules(user, scheme);

    let explanation = "";
    const apiKey = process.env.GROQ_API_KEY;
    const isApiKeyValid = apiKey && apiKey !== "your_groq_api_key_here" && apiKey.trim() !== "";

    if (isApiKeyValid) {
      try {
        const groq = new Groq({
          apiKey: apiKey,
        });

        const systemPrompt = `You are a helpful government assistance counselor. Your job is to explain a citizen's eligibility status for the scheme: "${scheme.name}". Be concise, clear, and professional. Use bullet points where appropriate.`;

        const userPrompt = `
Scheme Name: ${scheme.name}
Ministry: ${scheme.ministry || "N/A"}
Description: ${scheme.description}
Benefits: ${scheme.benefits}
State Availability: ${scheme.stateAvailability}
Documents Required: ${JSON.stringify(scheme.documents)}

User Profile:
- Name: ${user.name}
- Age: ${user.age || "N/A"}
- Gender: ${user.gender || "N/A"}
- State: ${user.state || "N/A"}
- Occupation: ${user.occupation || "N/A"}
- Annual Income: ₹${user.income || 0}
- Caste Category: ${user.casteCategory || "N/A"}
- Farmer Status: ${user.isFarmer ? "Yes" : "No"}
- Student Status: ${user.isStudent ? "Yes" : "No"}
- Disability Status: ${user.isDisability ? "Yes" : "No"}

Rule-Based Evaluation Results:
- Match Status: ${evaluation.status}
- Rule Checks: ${JSON.stringify(evaluation.checks)}

Please write:
1. A 2-3 sentence overview explaining why the user is "${evaluation.status}".
2. A list of matching parameters and any mismatches that need to be resolved.
3. Steps to apply (e.g. documents user needs to prepare: ${scheme.documents.join(", ") || "Aadhaar Card, Income Certificate"}).
4. Common mistakes to avoid.
`;

        const chatCompletion = await groq.chat.completions.create({
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          model: "llama-3.1-8b-instant",
          temperature: 0.2,
          max_tokens: 800,
        });

        explanation = chatCompletion.choices[0]?.message?.content || "";
      } catch (err: any) {
        console.error("Groq API error:", err);
        explanation = "";
      }
    }

    if (!explanation) {
      const matchDetails = evaluation.checks
        .map((c) => `- **${c.name}**: ${c.passed ? "✅ Match" : "❌ Mismatch"} - ${c.message}`)
        .join("\n");

      explanation = `
### Programmatic Match Summary
You are **${evaluation.status.replace("_", " ")}**.

Here is how your details check out against the scheme's criteria:
${matchDetails}

### Required Documents
To proceed with this scheme, please prepare:
${scheme.documents.map((d) => `- ${d}`).join("\n") || "- Aadhaar Card\n- Income Certificate"}

### Next Steps to Apply
1. Verify that all mismatches marked above are correct in your profile settings.
2. Visit the official portal: [Official Link](${scheme.officialUrl || "#"}).
3. Submit the documents and fill the application form.
4. Prevent duplicates by clicking "Apply" only once.
`;
    }

    return NextResponse.json({
      status: evaluation.status,
      matchScore: evaluation.matchScore,
      checks: evaluation.checks,
      explanation,
    });
  } catch (error: any) {
    console.error("Eligibility checker error:", error);
    return NextResponse.json({ error: error.message || "Server error" }, { status: 500 });
  }
}
