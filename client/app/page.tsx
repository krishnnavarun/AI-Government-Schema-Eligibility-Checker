"use client";

import React from "react";
import { useAuth } from "@/context/AuthContext";
import { useSchemes } from "@/context/SchemeContext";
import { redirect } from "next/navigation";
import Link from "next/link";
import ProfileForm from "@/components/ProfileForm";
import { 
  FileText, 
  User as UserIcon, 
  LogOut, 
  Search, 
  Sparkles, 
  LayoutDashboard, 
  Layers,
  ChevronRight,
  Bookmark
} from "lucide-react";

export default function Home() {
  const { user, loading: authLoading, logout } = useAuth();
  const { 
    savedSchemes, 
    appliedSchemes, 
  } = useSchemes();
  const [redirectPath, setRedirectPath] = React.useState<string | null>(null);

  if (redirectPath) {
    redirect(redirectPath);
  }

  const profileProgress = () => {
    if (!user) return 0;
    const fields = [
      user.age, user.gender, user.state, user.district, 
      user.occupation, user.income, user.education, user.casteCategory
    ];
    const completed = fields.filter((f) => f !== null && f !== undefined && f !== "").length;
    return Math.round((completed / fields.length) * 100);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-white text-zinc-900 flex flex-col items-center justify-center space-y-4">
        <div className="w-8 h-8 rounded-full border-2 border-zinc-200 border-t-black animate-spin"></div>
        <p className="text-xs text-zinc-400 font-mono tracking-widest uppercase">Loading SchemeWise...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-zinc-950 flex flex-col">
      <header className="border-b border-zinc-200 bg-white sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded bg-black text-white font-extrabold flex items-center justify-center text-lg shadow-sm">
              SW
            </div>
            <div>
              <h1 className="text-base font-bold tracking-tight text-zinc-900 flex items-center">
                <span>SchemeWise</span>
                <span className="text-[10px] bg-zinc-100 text-zinc-650 font-normal px-1.5 py-0.5 rounded ml-2 border border-zinc-200">Rule Engine</span>
              </h1>
              <span className="text-[9px] text-zinc-500 block">Citizen Eligibility Bridge</span>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-3">
                <div className="text-right hidden sm:block">
                  <span className="text-xs font-semibold text-zinc-900 block">{user.name}</span>
                  <span className="text-[9px] text-zinc-400 font-mono">{user.email}</span>
                </div>
                <div className="w-8 h-8 rounded-full bg-zinc-100 border border-zinc-200 flex items-center justify-center">
                  <UserIcon className="w-4 h-4 text-zinc-500" />
                </div>
                <button
                  onClick={logout}
                  className="text-zinc-500 hover:text-zinc-900 transition-colors cursor-pointer"
                  title="Sign out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setRedirectPath("/login")}
                  className="text-zinc-500 hover:text-zinc-900 text-xs font-semibold px-3 py-1.5 rounded cursor-pointer"
                >
                  Login
                </button>
                <button
                  onClick={() => setRedirectPath("/register")}
                  className="bg-black hover:bg-zinc-800 text-white text-xs font-semibold px-4.5 py-1.5 rounded transition-all cursor-pointer shadow-sm"
                >
                  Sign Up
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {!user ? (
        <main className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 py-16 max-w-5xl mx-auto text-center space-y-12 bg-white">
          <div className="space-y-4">
            <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-zinc-950 leading-tight">
              Unlock Your Eligible Government <br />
              <span className="text-zinc-500">Benefits Instantly.</span>
            </h2>
            <p className="text-sm sm:text-base text-zinc-500 max-w-2xl mx-auto leading-relaxed">
              Millions of citizens fail to receive benefits because policies are complex and scattered.
              SchemeWise maps your profile against all rules instantly and guides you through the application process.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => setRedirectPath("/register")}
              className="w-full sm:w-auto bg-black hover:bg-zinc-800 text-white font-bold text-sm px-8 py-3 rounded-md transition-all cursor-pointer shadow-sm"
            >
              Get Started (Free)
            </button>
            <button
              onClick={() => setRedirectPath("/login")}
              className="w-full sm:w-auto border border-zinc-350 hover:border-zinc-900 text-zinc-900 font-medium text-sm px-8 py-3 rounded-md transition-colors cursor-pointer"
            >
              Access Portal
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full pt-10 border-t border-zinc-200">
            <div className="text-left border border-zinc-200 p-5 rounded-md bg-zinc-50">
              <div className="w-8 h-8 rounded bg-white border border-zinc-200 flex items-center justify-center mb-3">
                <Layers className="w-4 h-4 text-black" />
              </div>
              <h3 className="text-sm font-bold text-zinc-900 mb-1">Rule-Based Filtering</h3>
              <p className="text-xs text-zinc-500 leading-relaxed">
                Matches your age, state, caste, farmer, student status, and income threshold accurately against all guidelines.
              </p>
            </div>

            <div className="text-left border border-zinc-200 p-5 rounded-md bg-zinc-50">
              <div className="w-8 h-8 rounded bg-white border border-zinc-200 flex items-center justify-center mb-3">
                <Sparkles className="w-4 h-4 text-black" />
              </div>
              <h3 className="text-sm font-bold text-zinc-900 mb-1">Match Explainer</h3>
              <p className="text-xs text-zinc-500 leading-relaxed">
                Uses rule checks to generate step-by-step personalized document requirements and clear eligibility advice.
              </p>
            </div>

            <div className="text-left border border-zinc-200 p-5 rounded-md bg-zinc-50">
              <div className="w-8 h-8 rounded bg-white border border-zinc-200 flex items-center justify-center mb-3">
                <Sparkles className="w-4 h-4 text-black" />
              </div>
              <h3 className="text-sm font-bold text-zinc-900 mb-1">Scheme Support Chat</h3>
              <p className="text-xs text-zinc-500 leading-relaxed">
                Ask simple questions and retrieve matching schemes and support links from the database immediately.
              </p>
            </div>
          </div>
        </main>
      ) : (
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col lg:flex-row gap-8">
          <section className="w-full lg:w-64 shrink-0 space-y-6">
            <div className="bg-zinc-50 border border-zinc-200 rounded-md p-5">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-white border border-zinc-200 flex items-center justify-center shadow-sm">
                  <UserIcon className="w-5 h-5 text-zinc-800" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-zinc-900 leading-tight">{user.name}</h3>
                  <span className="text-[10px] text-zinc-400 font-mono">Verified Citizen</span>
                </div>
              </div>


              <div className="mt-4 pt-3 border-t border-zinc-200 text-[10px] space-y-2 text-zinc-500">
                <div className="flex justify-between">
                  <span>State:</span>
                  <span className="text-zinc-850 font-bold">{user.state || "unspecified"}</span>
                </div>
                <div className="flex justify-between">
                  <span>Occupation:</span>
                  <span className="text-zinc-850 font-bold">{user.occupation || "unspecified"}</span>
                </div>
                <div className="flex justify-between">
                  <span>Income Limit:</span>
                  <span className="text-zinc-850 font-bold">
                    {user.income ? `₹${user.income.toLocaleString()}` : "unspecified"}
                  </span>
                </div>
              </div>
            </div>

            <nav className="bg-white border border-zinc-200 rounded-md overflow-hidden flex flex-col">
              <Link
                href="/schemes"
                className="flex items-center space-x-3 px-4 py-3 text-xs font-semibold tracking-wide border-l-2 border-transparent text-zinc-650 hover:text-zinc-950 hover:bg-zinc-50 transition-colors"
              >
                <Search className="w-4 h-4" />
                <span>Search Schemes</span>
              </Link>

              <Link
                href="/"
                className="flex items-center space-x-3 px-4 py-3 text-xs font-semibold tracking-wide border-l-2 border-black bg-zinc-50 text-zinc-900 transition-colors"
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>My Dashboard</span>
              </Link>

              <Link
                href="/chat"
                className="flex items-center space-x-3 px-4 py-3 text-xs font-semibold tracking-wide border-l-2 border-transparent text-zinc-650 hover:text-zinc-950 hover:bg-zinc-50 transition-colors"
              >
                <Sparkles className="w-4 h-4" />
                <span>Chat Assistant</span>
              </Link>
            </nav>
          </section>

          <section className="flex-1 space-y-6">
            {profileProgress() < 50 && (
              <div className="p-4 bg-yellow-50 border border-yellow-250 rounded-md flex items-start space-x-3 text-yellow-800">
                <UserIcon className="w-5 h-5 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-zinc-950 mb-0.5">Profile incomplete</h4>
                  <p className="text-[10px] leading-relaxed text-zinc-650">
                    Please complete your profile details below to allow SchemeWise rules to assess matching and eligibility status accurately.
                  </p>
                </div>
              </div>
            )}

            <ProfileForm />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white border border-zinc-200 rounded-md p-5 shadow-sm">
                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-3 flex items-center space-x-1.5">
                  <Bookmark className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Saved Schemes ({savedSchemes.length})</span>
                </h4>
                {savedSchemes.length === 0 ? (
                  <p className="text-[11px] text-zinc-400 py-6 text-center border border-dashed border-zinc-200 rounded">
                    Bookmarked schemes appear here for quick access.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {savedSchemes.map((scheme) => (
                      <div 
                        key={scheme.id}
                        className="flex items-center justify-between p-3 border border-zinc-200 bg-zinc-50/50 rounded hover:border-zinc-350 transition-colors"
                      >
                        <div>
                          <span className="text-xs font-bold text-zinc-900 block truncate max-w-[200px]">{scheme.name}</span>
                          <span className="text-[9px] text-zinc-400 truncate block max-w-[200px]">{scheme.ministry || "Ministry"}</span>
                        </div>
                        <button
                          onClick={() => setRedirectPath(`/eligibility/${scheme.id}`)}
                          className="text-[10px] border border-zinc-300 hover:border-zinc-900 text-zinc-800 px-2 py-1.5 rounded transition-colors cursor-pointer bg-white"
                        >
                          Check Match
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-white border border-zinc-200 rounded-md p-5 shadow-sm">
                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-3 flex items-center space-x-1.5">
                  <FileText className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Active Applications ({appliedSchemes.length})</span>
                </h4>
                {appliedSchemes.length === 0 ? (
                  <p className="text-[11px] text-zinc-400 py-6 text-center border border-dashed border-zinc-200 rounded">
                    Applied schemes tracking list.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {appliedSchemes.map((app) => (
                      <div 
                        key={app.id}
                        className="flex items-center justify-between p-3 border border-zinc-200 bg-zinc-50/50 rounded"
                      >
                        <div>
                          <span className="text-xs font-bold text-zinc-900 block truncate max-w-[200px]">{app.scheme.name}</span>
                          <span className="text-[9px] text-zinc-400 block">Applied on: {new Date(app.createdAt).toLocaleDateString()}</span>
                        </div>
                        <span className="text-[9px] font-mono font-bold tracking-wider px-2 py-0.5 bg-emerald-550/10 border border-emerald-300 text-emerald-700 rounded">
                          {app.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </section>
        </main>
      )}

      <footer className="border-t border-zinc-200 py-6 bg-zinc-50 text-center text-[10px] text-zinc-500 font-mono tracking-wide mt-auto">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>&copy; {new Date().getFullYear()} SchemeWise. All Rights Reserved.</span>
          <span className="text-zinc-400">Built with Next.js</span>
        </div>
      </footer>
    </div>
  );
}
