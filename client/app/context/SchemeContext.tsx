"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { useAuth } from "./AuthContext";

export interface Scheme {
  id: string;
  name: string;
  description: string;
  benefits: string;
  ministry?: string;
  eligibility: any;
  documents: string[];
  deadline?: string;
  officialUrl?: string;
  stateAvailability?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Application {
  id: string;
  userId: string;
  schemeId: string;
  status: string;
  createdAt: string;
  scheme: Scheme;
}

interface SchemeContextType {
  schemes: Scheme[];
  savedSchemes: Scheme[];
  appliedSchemes: Application[];
  loading: boolean;
  actionLoading: boolean;
  error: string | null;
  searchQuery: string;
  stateFilter: string;
  ministryFilter: string;
  sortBy: string;
  sortOrder: "asc" | "desc";
  setSearchQuery: (q: string) => void;
  setStateFilter: (s: string) => void;
  setMinistryFilter: (m: string) => void;
  setSortBy: (s: string) => void;
  setSortOrder: (o: "asc" | "desc") => void;
  fetchSchemes: () => Promise<void>;
  fetchUserData: () => Promise<void>;
  toggleSaveScheme: (schemeId: string) => Promise<boolean>;
  applyForScheme: (schemeId: string) => Promise<boolean>;
  checkEligibility: (schemeId: string) => Promise<{ status: string; matchScore: number; checks: any[]; explanation: string } | null>;
  askAI: (message: string, history: any[]) => Promise<string>;
}

const SchemeContext = createContext<SchemeContextType | undefined>(undefined);

export function SchemeProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [schemes, setSchemes] = useState<Scheme[]>([]);
  const [savedSchemes, setSavedSchemes] = useState<Scheme[]>([]);
  const [appliedSchemes, setAppliedSchemes] = useState<Application[]>([]);
  
  const [loading, setLoading] = useState<boolean>(false);
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState<string>("");
  const [stateFilter, setStateFilter] = useState<string>("All");
  const [ministryFilter, setMinistryFilter] = useState<string>("All");
  const [sortBy, setSortBy] = useState<string>("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const fetchSchemes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        search: searchQuery,
        state: stateFilter,
        ministry: ministryFilter,
        sortBy,
        sortOrder,
      });
      const res = await fetch(`/api/schemes?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setSchemes(data.schemes || []);
      } else {
        const data = await res.json();
        setError(data.error || "Failed to load schemes");
      }
    } catch (err) {
      setError("Network error loading schemes");
    } finally {
      setLoading(false);
    }
  }, [searchQuery, stateFilter, ministryFilter, sortBy, sortOrder]);

  const fetchUserData = useCallback(async () => {
    if (!user) {
      setSavedSchemes([]);
      setAppliedSchemes([]);
      return;
    }
    try {
      const savedRes = await fetch("/api/schemes/saved");
      if (savedRes.ok) {
        const data = await savedRes.json();
        setSavedSchemes(data.savedSchemes || []);
      }

      const appliedRes = await fetch("/api/schemes/apply");
      if (appliedRes.ok) {
        const data = await appliedRes.json();
        setAppliedSchemes(data.applications || []);
      }
    } catch (err) {
      console.error("Failed to load user schemes data:", err);
    }
  }, [user]);

  useEffect(() => {
    fetchSchemes();
  }, [fetchSchemes]);

  useEffect(() => {
    fetchUserData();
  }, [user, fetchUserData]);

  const toggleSaveScheme = async (schemeId: string): Promise<boolean> => {
    if (!user) return false;
    setActionLoading(true);
    try {
      const res = await fetch("/api/schemes/saved", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ schemeId }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.saved) {
          const added = schemes.find((s) => s.id === schemeId);
          if (added) setSavedSchemes((prev) => [...prev, added]);
        } else {
          setSavedSchemes((prev) => prev.filter((s) => s.id !== schemeId));
        }
        return true;
      }
      return false;
    } catch (err) {
      console.error("Save failed:", err);
      return false;
    } finally {
      setActionLoading(false);
    }
  };

  const applyForScheme = async (schemeId: string): Promise<boolean> => {
    if (!user) return false;
    setActionLoading(true);
    try {
      const res = await fetch("/api/schemes/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ schemeId }),
      });
      if (res.ok) {
        const data = await res.json();
        setAppliedSchemes((prev) => [data.application, ...prev]);
        return true;
      }
      return false;
    } catch (err) {
      console.error("Apply failed:", err);
      return false;
    } finally {
      setActionLoading(false);
    }
  };

  const checkEligibility = async (schemeId: string) => {
    if (!user) return null;
    setActionLoading(true);
    try {
      const res = await fetch("/api/schemes/eligibility", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ schemeId }),
      });
      if (res.ok) {
        return await res.json();
      }
      return null;
    } catch (err) {
      console.error("Eligibility check failed:", err);
      return null;
    } finally {
      setActionLoading(false);
    }
  };

  const askAI = async (message: string, history: any[]): Promise<string> => {
    if (!user) return "Please log in to chat with the assistant.";
    try {
      const res = await fetch("/api/schemes/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, history }),
      });
      if (res.ok) {
        const data = await res.json();
        return data.reply;
      }
      const data = await res.json();
      return data.error || "Failed to query assistant.";
    } catch (err) {
      return "Network error. Failed to reach assistant.";
    }
  };

  return (
    <SchemeContext.Provider
      value={{
        schemes,
        savedSchemes,
        appliedSchemes,
        loading,
        actionLoading,
        error,
        searchQuery,
        stateFilter,
        ministryFilter,
        sortBy,
        sortOrder,
        setSearchQuery,
        setStateFilter,
        setMinistryFilter,
        setSortBy,
        setSortOrder,
        fetchSchemes,
        fetchUserData,
        toggleSaveScheme,
        applyForScheme,
        checkEligibility,
        askAI,
      }}
    >
      {children}
    </SchemeContext.Provider>
  );
}

export function useSchemes() {
  const context = useContext(SchemeContext);
  if (context === undefined) {
    throw new Error("useSchemes must be used within a SchemeProvider");
  }
  return context;
}
