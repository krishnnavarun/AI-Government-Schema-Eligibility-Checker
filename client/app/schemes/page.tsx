"use client";

import React, { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useSchemes } from "@/context/SchemeContext";
import { redirect } from "next/navigation";
import Link from "next/link";
import SchemeCard from "@/components/SchemeCard";
import { Search, LogOut, ArrowLeft } from "lucide-react";

export default function SchemesPage() {
  const { user, loading: authLoading, logout } = useAuth();
  const {
    schemes,
    loading: schemesLoading,
    searchQuery,
    setSearchQuery,
    stateFilter,
    setStateFilter,
    ministryFilter,
    setMinistryFilter,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder
  } = useSchemes();
  const [redirectPath, setRedirectPath] = React.useState<string | null>(null);

  if (redirectPath) {
    redirect(redirectPath);
  }

  useEffect(() => {
    if (!authLoading && !user) {
      setRedirectPath("/login");
    }
  }, [user, authLoading]);

  const handleCheckEligibility = (schemeId: string) => {
    setRedirectPath(`/eligibility/${schemeId}`);
  };

  const ministries = ["All", ...Array.from(new Set(schemes.map((s) => s.ministry).filter(Boolean)))];

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-white text-zinc-900 flex flex-col items-center justify-center space-y-4">
        <div className="w-8 h-8 rounded-full border-2 border-zinc-200 border-t-black animate-spin"></div>
        <p className="text-xs text-zinc-400 font-mono tracking-widest uppercase">Loading Portal...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-zinc-950 flex flex-col">
      <header className="border-b border-zinc-200 bg-white sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Link href="/" className="w-9 h-9 rounded bg-black text-white font-extrabold flex items-center justify-center text-lg shadow-sm hover:opacity-95 transition-opacity">
              SW
            </Link>
            <div>
              <h1 className="text-base font-bold tracking-tight text-zinc-900 flex items-center">
                <span>SchemeWise Finder</span>
              </h1>
              <span className="text-[9px] text-zinc-400 block">Citizen Eligibility Bridge</span>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="text-right hidden sm:block">
              <span className="text-xs font-semibold text-zinc-900 block">{user.name}</span>
              <span className="text-[9px] text-zinc-400 font-mono">{user.email}</span>
            </div>
            <button
              onClick={logout}
              className="text-zinc-500 hover:text-zinc-900 transition-colors cursor-pointer"
              title="Sign out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <Link
          href="/"
          className="inline-flex items-center space-x-2 text-xs text-zinc-500 hover:text-zinc-900 transition-colors mb-2"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Dashboard</span>
        </Link>

        <div className="bg-zinc-50 border border-zinc-200 rounded-md p-5 space-y-4">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1 flex items-center bg-white border border-zinc-300 rounded px-3 py-2 focus-within:border-zinc-900 transition-colors">
              <Search className="w-4 h-4 text-zinc-400 mr-2 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by keywords (e.g. farmer, scholarship, kisan, post matric)..."
                className="bg-transparent text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none w-full"
              />
            </div>

            <div className="flex items-center space-x-2 shrink-0">
              <span className="text-[10px] uppercase font-bold text-zinc-500">State:</span>
              <select
                value={stateFilter}
                onChange={(e) => setStateFilter(e.target.value)}
                className="bg-white border border-zinc-300 rounded px-2 py-2 text-xs text-zinc-900 focus:outline-none focus:border-zinc-900"
              >
                <option value="All">All States</option>
                <option value="Tamil Nadu">Tamil Nadu</option>
                <option value="Karnataka">Karnataka</option>
                <option value="All">Other States</option>
              </select>
            </div>

            <div className="flex items-center space-x-2 shrink-0">
              <span className="text-[10px] uppercase font-bold text-zinc-500">Ministry:</span>
              <select
                value={ministryFilter}
                onChange={(e) => setMinistryFilter(e.target.value)}
                className="bg-white border border-zinc-300 rounded px-2 py-2 text-xs text-zinc-900 focus:outline-none focus:border-zinc-900 max-w-[150px]"
              >
                {ministries.map((min, idx) => (
                  <option key={idx} value={min || "All"}>
                    {min || "All"}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-zinc-200 pt-3 text-[10px] text-zinc-500 font-medium">
            <span>Showing {schemes.length} schemes matches</span>
            <div className="flex items-center space-x-3">
              <span className="font-bold uppercase tracking-wider text-zinc-450">Sort By:</span>
              <button
                onClick={() => {
                  const order = sortBy === "name" && sortOrder === "asc" ? "desc" : "asc";
                  setSortBy("name");
                  setSortOrder(order);
                }}
                className={`hover:text-zinc-900 transition-colors cursor-pointer ${
                  sortBy === "name" ? "text-zinc-900 font-bold" : ""
                }`}
              >
                Name {sortBy === "name" && (sortOrder === "asc" ? "↑" : "↓")}
              </button>
              <button
                onClick={() => {
                  const order = sortBy === "deadline" && sortOrder === "asc" ? "desc" : "asc";
                  setSortBy("deadline");
                  setSortOrder(order);
                }}
                className={`hover:text-zinc-900 transition-colors cursor-pointer ${
                  sortBy === "deadline" ? "text-zinc-900 font-bold" : ""
                }`}
              >
                Deadline {sortBy === "deadline" && (sortOrder === "asc" ? "↑" : "↓")}
              </button>
            </div>
          </div>
        </div>

        {schemesLoading ? (
          <div className="py-12 flex flex-col items-center justify-center space-y-2">
            <div className="w-6 h-6 rounded-full border-2 border-zinc-200 border-t-black animate-spin"></div>
            <span className="text-[10px] text-zinc-400 uppercase tracking-widest font-mono">Querying schemes...</span>
          </div>
        ) : schemes.length === 0 ? (
          <div className="bg-zinc-50 border border-zinc-200 rounded-md p-12 text-center text-zinc-400 text-xs">
            No schemes match your criteria. Try adjusting your search keywords or state filters.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {schemes.map((scheme) => (
              <SchemeCard
                key={scheme.id}
                scheme={scheme}
                onCheckEligibility={handleCheckEligibility}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
