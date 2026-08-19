"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleChange(e) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();

    setError("");

    if (!form.email || !form.password) {
      setError("Please enter email and password.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Login failed.");
        return;
      }

      router.push("/dashboard");
    } catch (error) {
      console.error("Login error:", error);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center px-6">

      <div className="w-full max-w-md bg-[#111827] rounded-2xl p-8 border border-yellow-500/20 shadow-2xl">

        <h1 className="text-4xl font-bold text-center text-yellow-400 mb-8">
          CoinFlip Login
        </h1>

        <form onSubmit={handleSubmit} className="space-y-5">

          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="Email Address"
            autoComplete="email"
            className="w-full bg-[#1f2937] border border-gray-700 rounded-lg px-4 py-3 text-white outline-none focus:border-yellow-400"
          />

          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Password"
            autoComplete="current-password"
            className="w-full bg-[#1f2937] border border-gray-700 rounded-lg px-4 py-3 text-white outline-none focus:border-yellow-400"
          />

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg p-3 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-yellow-500 hover:bg-yellow-400 disabled:bg-yellow-700 disabled:cursor-not-allowed text-black font-bold py-3 rounded-lg transition"
          >
            {loading ? "Logging in..." : "Login"}
          </button>

        </form>

        <p className="text-center text-gray-400 mt-6">
          Don't have an account?{" "}
          <Link
            href="/register"
            className="text-yellow-400 hover:underline"
          >
            Register
          </Link>
        </p>

      </div>

    </div>
  );
}
