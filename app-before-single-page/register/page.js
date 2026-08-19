"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  function handleChange(e) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!form.name || !form.email || !form.password || !form.confirmPassword) {
      setError("Please fill all fields.");
      return;
    }

    if (form.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: form.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Registration failed.");
        return;
      }

      setSuccess("Account created successfully! Redirecting...");

      setForm({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
      });

      setTimeout(() => {
        router.push("/login");
      }, 1500);
    } catch (error) {
      console.error("Registration error:", error);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center px-6">

      <div className="w-full max-w-md bg-[#111827] rounded-2xl p-8 border border-yellow-500/20 shadow-2xl">

        <h1 className="text-4xl font-bold text-center text-yellow-400 mb-8">
          Create Account
        </h1>

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Name */}
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Full Name"
            autoComplete="name"
            className="w-full bg-[#1f2937] border border-gray-700 rounded-lg px-4 py-3 text-white outline-none focus:border-yellow-400"
          />

          {/* Email */}
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="Email Address"
            autoComplete="email"
            className="w-full bg-[#1f2937] border border-gray-700 rounded-lg px-4 py-3 text-white outline-none focus:border-yellow-400"
          />

          {/* Password */}
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Password"
            autoComplete="new-password"
            className="w-full bg-[#1f2937] border border-gray-700 rounded-lg px-4 py-3 text-white outline-none focus:border-yellow-400"
          />

          {/* Confirm Password */}
          <input
            type="password"
            name="confirmPassword"
            value={form.confirmPassword}
            onChange={handleChange}
            placeholder="Confirm Password"
            autoComplete="new-password"
            className="w-full bg-[#1f2937] border border-gray-700 rounded-lg px-4 py-3 text-white outline-none focus:border-yellow-400"
          />

          {/* Error */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg p-3 text-sm">
              {error}
            </div>
          )}

          {/* Success */}
          {success && (
            <div className="bg-green-500/10 border border-green-500/30 text-green-400 rounded-lg p-3 text-sm">
              {success}
            </div>
          )}

          {/* Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-yellow-500 hover:bg-yellow-400 disabled:bg-yellow-700 disabled:cursor-not-allowed text-black font-bold py-3 rounded-lg transition"
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>

        </form>

        <p className="text-center text-gray-400 mt-6">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-yellow-400 hover:underline"
          >
            Login
          </Link>
        </p>

      </div>

    </div>
  );
}