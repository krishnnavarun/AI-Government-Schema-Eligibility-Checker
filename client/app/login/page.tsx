"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function LoginPage() {
  const { login, error, clearError, user } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [redirectPath, setRedirectPath] = useState<string | null>(null);

  if (redirectPath) {
    redirect(redirectPath);
  }

  useEffect(() => {
    if (user) {
      setRedirectPath("/");
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    
    const success = await login(email, password);
    setSubmitting(false);
    if (success) {
      setRedirectPath("/");
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 flex flex-col items-center justify-center p-4">
      <Link
        href="/"
        className="absolute top-6 left-6 flex items-center space-x-2 text-xs text-zinc-500 hover:text-zinc-900 transition-colors"
        onClick={clearError}
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to Portal</span>
      </Link>

      <div className="w-full max-w-md bg-white border border-zinc-200 rounded-md shadow-sm p-8">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded bg-black text-white font-extrabold flex items-center justify-center text-xl mx-auto shadow-sm mb-4">
            SW
          </div>
          <h2 className="text-xl font-bold tracking-tight text-zinc-900 flex items-center justify-center">
            <span>SchemeWise Login</span>
          </h2>
          <p className="text-xs text-zinc-500 mt-2">Sign in to check matching government schemes and chat with our assistant.</p>
        </div>

        {error && (
          <div className="p-3 mb-5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-md">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-white border border-zinc-300 rounded px-3 py-2.5 text-xs text-zinc-900 focus:outline-none focus:border-zinc-900 transition-colors"
              disabled={submitting}
              placeholder="name@example.com"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white border border-zinc-300 rounded px-3 py-2.5 text-xs text-zinc-900 focus:outline-none focus:border-zinc-900 transition-colors"
              disabled={submitting}
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-black hover:bg-zinc-800 text-white font-semibold text-xs py-2.5 rounded transition-all flex items-center justify-center cursor-pointer disabled:opacity-50"
          >
            {submitting ? "Signing In..." : "Sign In"}
          </button>
        </form>

        <div className="mt-8 text-center text-xs text-zinc-500 border-t border-zinc-100 pt-6">
          Don't have an account?{" "}
          <Link
            href="/register"
            className="text-zinc-900 underline hover:text-zinc-650 cursor-pointer font-semibold"
            onClick={clearError}
          >
            Create account
          </Link>
        </div>
      </div>
    </div>
  );
}
