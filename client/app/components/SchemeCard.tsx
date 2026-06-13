"use client";

import React, { useState } from "react";
import { Scheme, useSchemes } from "@/context/SchemeContext";
import { Bookmark, BookmarkCheck, Calendar, Globe, Building2, FileCheck, CheckCircle2 } from "lucide-react";
import { redirect } from "next/navigation";

interface SchemeCardProps {
  scheme: Scheme;
  onCheckEligibility: (schemeId: string) => void;
}

export default function SchemeCard({ scheme, onCheckEligibility }: SchemeCardProps) {
  const { savedSchemes, appliedSchemes, toggleSaveScheme, applyForScheme, actionLoading } = useSchemes();
  const [applying, setApplying] = useState(false);
  const [saving, setSaving] = useState(false);
  const [redirectUrl, setRedirectUrl] = useState<string | null>(null);

  const isSaved = savedSchemes.some((s) => s.id === scheme.id);
  const isApplied = appliedSchemes.some((a) => a.schemeId === scheme.id);
  const application = appliedSchemes.find((a) => a.schemeId === scheme.id);

  if (redirectUrl) {
    redirect(redirectUrl);
  }

  const handleSave = async () => {
    if (saving || actionLoading) return;
    setSaving(true);
    await toggleSaveScheme(scheme.id);
    setSaving(false);
  };

  const handleApply = async () => {
    if (applying || isApplied || actionLoading) return;
    setApplying(true);
    const success = await applyForScheme(scheme.id);
    setApplying(false);
    if (success && scheme.officialUrl) {
      setRedirectUrl(scheme.officialUrl);
    }
  };

  return (
    <div className="bg-white border border-zinc-200 rounded-md p-5 transition-all flex flex-col justify-between h-full group hover:shadow-sm">
      <div>
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-1.5 text-zinc-500">
            <Building2 className="w-3.5 h-3.5" />
            <span className="text-[10px] uppercase tracking-wider font-bold">
              {scheme.ministry || "General"}
            </span>
          </div>
          <button
            onClick={handleSave}
            disabled={saving || actionLoading}
            className="text-zinc-400 hover:text-zinc-950 transition-colors cursor-pointer disabled:opacity-50"
          >
            {isSaved ? (
              <BookmarkCheck className="w-4 h-4 text-zinc-900" />
            ) : (
              <Bookmark className="w-4 h-4" />
            )}
          </button>
        </div>

        <h4 className="text-base font-bold text-zinc-950 mb-2">
          {scheme.name}
        </h4>
        
        <p className="text-xs text-zinc-500 mb-4 line-clamp-3 leading-relaxed">
          {scheme.description}
        </p>

        <div className="bg-zinc-50 border border-zinc-200 rounded p-3 mb-4">
          <span className="block text-[9px] font-bold uppercase tracking-wider text-zinc-500 mb-1">
            Benefits
          </span>
          <span className="text-xs text-zinc-800 leading-relaxed font-semibold">
            {scheme.benefits}
          </span>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex flex-wrap gap-2 text-[10px] text-zinc-500">
          <div className="flex items-center space-x-1 bg-zinc-50 border border-zinc-200 px-2 py-0.5 rounded">
            <Globe className="w-3 h-3" />
            <span>State: {scheme.stateAvailability || "All"}</span>
          </div>
          {scheme.deadline && (
            <div className="flex items-center space-x-1 bg-zinc-50 border border-zinc-200 px-2 py-0.5 rounded">
              <Calendar className="w-3 h-3" />
              <span>Ends: {scheme.deadline}</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-zinc-100">
          <button
            onClick={() => onCheckEligibility(scheme.id)}
            disabled={actionLoading}
            className="w-full text-center border border-zinc-300 hover:border-zinc-900 hover:bg-zinc-50 text-zinc-800 font-semibold text-xs py-2 rounded transition-colors cursor-pointer flex items-center justify-center space-x-1"
          >
            <FileCheck className="w-3 h-3" />
            <span>Check Match</span>
          </button>

          {isApplied ? (
            <div className="w-full text-center bg-zinc-50 border border-zinc-200 text-zinc-400 font-semibold text-xs py-2 rounded flex items-center justify-center space-x-1 cursor-default">
              <CheckCircle2 className="w-3.5 h-3.5 text-zinc-400" />
              <span>Applied ({application?.status || "Pending"})</span>
            </div>
          ) : (
            <button
              onClick={handleApply}
              disabled={applying || actionLoading}
              className="w-full text-center bg-black hover:bg-zinc-800 text-white font-semibold text-xs py-2 rounded transition-colors cursor-pointer flex items-center justify-center space-x-1 disabled:opacity-50"
            >
              <span>{applying ? "Applying..." : "Apply Now"}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
