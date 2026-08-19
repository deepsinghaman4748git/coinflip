"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLogin() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function login(e) {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Invalid login");
        return;
      }

      if (data.user?.role !== "admin") {
        setError("This account does not have admin access.");
        return;
      }

      router.push("/admin/dashboard");
      router.refresh();
    } catch (error) {
      console.error("Admin Login Error:", error);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0B1120] flex justify-center items-center px-6">

      <div className="bg-[#111827] w-full max-w-[420px] rounded-2xl p-8 border border-yellow-500/20 shadow-2xl">

        <h1 className="text-4xl font-bold text-center text-yellow-400 mb-2">
          Admin Login
        </h1>

        <p className="text-center text-gray-400 mb-8">
          CoinFlip Administration
        </p>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg p-3 mb-5 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={login} className="space-y-5">

          <div>
            <label className="block text-gray-400 mb-2">
              Admin Email
            </label>

            <input
              type="email"
              placeholder="admin@CoinFlip.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full p-4 rounded-xl bg-[#1F2937] border border-gray-700 text-white outline-none focus:border-yellow-400"
            />
          </div>

          <div>
            <label className="block text-gray-400 mb-2">
              Password
            </label>

            <input
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full p-4 rounded-xl bg-[#1F2937] border border-gray-700 text-white outline-none focus:border-yellow-400"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-yellow-500 hover:bg-yellow-400 disabled:opacity-50 text-black py-4 rounded-xl font-bold transition"
          >
            {loading ? "Logging in..." : "Login as Admin"}
          </button>

        </form>

      </div>

    </div>
  );
}
