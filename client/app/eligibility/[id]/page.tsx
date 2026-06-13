"use client";

import React, { useState, useEffect, use } from "react";
import { useAuth } from "@/context/AuthContext";
import { useSchemes } from "@/context/SchemeContext";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, AlertTriangle, XCircle, FileText, ShieldCheck, LogOut } from "lucide-react";

interface CheckerCheck {
  name: string;
  passed: boolean;
  message: string;
}

interface EligibilityResult {
  status: string;
  matchScore: number;
  checks: CheckerCheck[];
  explanation: string;
}

function renderMarkdownToHtml(md: string) {
  if (!md) return "";
  const lines = md.split("\n");
  let html = "";
  let inList = false;

  for (let line of lines) {
    line = line.trim();

    if (line.startsWith("### ")) {
      if (inList) { html += "</ul>"; inList = false; }
      html += `<h4 class="text-xs font-bold text-zinc-900 mt-4 mb-2 uppercase tracking-wider">${line.slice(4)}</h4>`;
    } else if (line.startsWith("## ")) {
      if (inList) { html += "</ul>"; inList = false; }
      html += `<h3 class="text-sm font-bold text-zinc-900 mt-5 mb-2 border-b border-zinc-200 pb-1">${line.slice(3)}</h3>`;
    } else if (line.startsWith("# ")) {
      if (inList) { html += "</ul>"; inList = false; }
      html += `<h2 class="text-base font-bold text-zinc-900 mt-6 mb-3">${line.slice(2)}</h2>`;
    } else if (line.startsWith("- ") || line.startsWith("* ")) {
      if (!inList) {
        html += '<ul class="space-y-1.5 mb-4">';
        inList = true;
      }
      const itemContent = line.slice(2);
      html += `<li class="text-xs text-zinc-700 flex items-start"><span class="mr-2 text-zinc-400">•</span><div>${itemContent}</div></li>`;
    } else if (!line) {
      if (inList) { html += "</ul>"; inList = false; }
      html += '<div class="h-2"></div>';
    } else {
      if (inList) { html += "</ul>"; inList = false; }
      html += `<p class="text-xs text-zinc-650 mb-2 leading-relaxed">${line}</p>`;
    }
  }

  if (inList) {
    html += "</ul>";
  }

  html = html
    .replace(/\*\*(.*?)\*\?/g, '<strong class="text-zinc-900 font-bold">$1</strong>')
    .replace(/\*\*(.*?)\*\*/g, '<strong class="text-zinc-900 font-bold">$1</strong>')
    .replace(/`(.*?)`/g, '<code class="bg-zinc-100 border border-zinc-200 px-1.5 py-0.5 rounded text-[10px] font-mono text-zinc-800">$1</code>')
    .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-zinc-900 underline hover:text-zinc-500">$1</a>');

  return html;
}

export default function EligibilityPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: schemeId } = use(params);
  const { user, loading: authLoading, logout } = useAuth();
  const { schemes, checkEligibility } = useSchemes();
  const [redirectPath, setRedirectPath] = useState<string | null>(null);

  if (redirectPath) {
    redirect(redirectPath);
  }

  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<EligibilityResult | null>(null);

  const scheme = schemes.find((s) => s.id === schemeId);

  useEffect(() => {
    if (!authLoading && !user) {
      setRedirectPath("/login");
      return;
    }

    if (user && schemeId) {
      const fetchAssessment = async () => {
        setLoading(true);
        const res = await checkEligibility(schemeId);
        if (res) {
          setResult(res);
        }
        setLoading(false);
      };
      fetchAssessment();
    }
  }, [user, authLoading, schemeId]);

  if (authLoading || !user || loading) {
    return (
      <div className="min-h-screen bg-white text-zinc-900 flex flex-col items-center justify-center space-y-4">
        <div className="w-8 h-8 rounded-full border-2 border-zinc-200 border-t-black animate-spin"></div>
        <p className="text-xs text-zinc-400 font-mono tracking-widest uppercase">
          {loading && !authLoading ? "Assessing Eligibility..." : "Loading Portal..."}
        </p>
      </div>
    );
  }

  if (!scheme) {
    return (
      <div className="min-h-screen bg-white text-zinc-900 flex flex-col items-center justify-center p-4">
        <p className="text-sm text-zinc-450 mb-4">Selected scheme was not found in the database.</p>
        <Link href="/schemes" className="text-xs text-zinc-900 underline">
          Go back to Schemes Finder
        </Link>
      </div>
    );
  }

  const status = result?.status || "NOT_ELIGIBLE";
  const matchScore = result?.matchScore || 0;
  const checks = result?.checks || [];
  const explanation = result?.explanation || "";

  let statusColor = "bg-emerald-50 border-emerald-200 text-emerald-800";
  let statusIcon = <CheckCircle2 className="w-5 h-5 text-emerald-700" />;
  let statusText = "Eligible";

  if (status === "NOT_ELIGIBLE") {
    statusColor = "bg-red-50 border-red-200 text-red-800";
    statusIcon = <XCircle className="w-5 h-5 text-red-750" />;
    statusText = "Not Eligible";
  } else if (status === "PARTIALLY_ELIGIBLE") {
    statusColor = "bg-yellow-50 border-yellow-200 text-yellow-850";
    statusIcon = <AlertTriangle className="w-5 h-5 text-yellow-750" />;
    statusText = "Partially Eligible";
  }

  return (
    <div className="min-h-screen bg-white text-zinc-900 flex flex-col">
      <header className="border-b border-zinc-200 bg-white sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Link href="/" className="w-9 h-9 rounded bg-black text-white font-extrabold flex items-center justify-center text-lg shadow-sm">
              SW
            </Link>
            <div>
              <h1 className="text-base font-bold tracking-tight text-zinc-900 flex items-center">
                <span>Eligibility Assessment</span>
              </h1>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="text-right hidden sm:block">
              <span className="text-xs font-semibold text-zinc-900 block">{user.name}</span>
            </div>
            <button
              onClick={logout}
              className="text-zinc-500 hover:text-zinc-900 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <Link
          href="/schemes"
          className="inline-flex items-center space-x-2 text-xs text-zinc-550 hover:text-zinc-900 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Finder list</span>
        </Link>

        <div className="bg-white border border-zinc-200 rounded-md p-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-zinc-150 pb-4 mb-5">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">
                Citizen Match assessment report
              </span>
              <h3 className="text-base font-bold text-zinc-900">{scheme.name}</h3>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className={`border p-4 rounded-md flex flex-col justify-center items-center text-center ${statusColor}`}>
              <span className="text-[10px] font-bold uppercase tracking-wider mb-2 opacity-85">
                Eligibility Status
              </span>
              <div className="flex items-center space-x-2">
                {statusIcon}
                <span className="text-base font-bold tracking-tight">{statusText}</span>
              </div>
            </div>

            <div className="bg-zinc-50 border border-zinc-200 p-4 rounded-md flex flex-col justify-center">
              <div className="flex items-center space-x-2 text-zinc-900 mb-1">
                <ShieldCheck className="w-4 h-4 text-zinc-500" />
                <span className="text-xs font-bold">Verification Guarantee</span>
              </div>
              <p className="text-[11px] text-zinc-500 leading-relaxed">
                Matches are calculated relative to your updated profile data. Ensure your profile remains accurate.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <div className="border border-zinc-200 rounded-md p-4 bg-zinc-50/50 shadow-sm">
                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-3 flex items-center space-x-1.5">
                  <FileText className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Rule Matching Parameters</span>
                </h4>
                <div className="space-y-3">
                  {checks.map((check, idx) => (
                    <div key={idx} className="border-b border-zinc-150 pb-2.5 last:border-b-0 last:pb-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-semibold text-zinc-800">{check.name}</span>
                        {check.passed ? (
                          <span className="text-[9px] bg-emerald-50 border border-emerald-200 text-emerald-700 px-1.5 py-0.5 rounded">
                            Match
                          </span>
                        ) : (
                          <span className="text-[9px] bg-red-50 border border-red-200 text-red-700 px-1.5 py-0.5 rounded">
                            Mismatch
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-zinc-500 leading-relaxed">{check.message}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="lg:col-span-3">
              <div className="border border-zinc-200 rounded-md p-5 bg-zinc-50/50 shadow-sm">
                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-3 flex items-center space-x-1.5 border-b border-zinc-150 pb-2">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-zinc-950 animate-pulse-slow"></span>
                  <span>Eligibility Counselor Explanation</span>
                </h4>
                <div 
                  className="prose max-w-none space-y-2 text-zinc-800"
                  dangerouslySetInnerHTML={{ __html: renderMarkdownToHtml(explanation) }}
                />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
