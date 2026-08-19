"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProfile() {
      try {
        const response = await fetch("/api/me", {
          cache: "no-store",
        });

        const data = await response.json();

        if (!response.ok) {
          router.push("/login");
          return;
        }

        setUser(data.user);
      } catch (error) {
        console.error("Profile Error:", error);
        router.push("/login");
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B1120] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-4">ðŸ‘¤</div>
          <p className="text-gray-400">
            Loading profile...
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#0B1120] text-white">

      {/* Header */}
      <header className="border-b border-gray-800 bg-black/60 backdrop-blur">
        <div className="max-w-5xl mx-auto flex items-center justify-between px-6 py-4">

          <Link
            href="/dashboard"
            className="text-2xl font-bold text-yellow-400"
          >
            ðŸª™ CoinFlip
          </Link>

          <Link
            href="/dashboard"
            className="bg-[#1F2937] hover:bg-yellow-500 hover:text-black px-5 py-2 rounded-lg font-semibold transition"
          >
            Dashboard
          </Link>

        </div>
      </header>

      {/* Profile */}
      <main className="max-w-3xl mx-auto px-6 py-10">

        <h1 className="text-4xl font-bold text-yellow-400 mb-8">
          My Profile
        </h1>

        {/* Profile Card */}
        <div className="bg-[#111827] rounded-2xl border border-yellow-500/20 p-8">

          <div className="flex items-center gap-5 mb-8">

            <div className="w-20 h-20 rounded-full bg-yellow-500 text-black flex items-center justify-center text-4xl font-bold">
              {user.name?.charAt(0)?.toUpperCase()}
            </div>

            <div>
              <h2 className="text-2xl font-bold">
                {user.name}
              </h2>

              <p className="text-gray-400">
                {user.email}
              </p>
            </div>

          </div>

          {/* Details */}
          <div className="space-y-4">

            <div className="bg-[#1F2937] rounded-xl p-5">
              <p className="text-gray-400 text-sm">
                Full Name
              </p>

              <p className="text-lg font-semibold mt-1">
                {user.name}
              </p>
            </div>

            <div className="bg-[#1F2937] rounded-xl p-5">
              <p className="text-gray-400 text-sm">
                Email Address
              </p>

              <p className="text-lg font-semibold mt-1">
                {user.email}
              </p>
            </div>

            <div className="bg-[#1F2937] rounded-xl p-5">
              <p className="text-gray-400 text-sm">
                Account Type
              </p>

              <p className="text-lg font-semibold text-yellow-400 mt-1 capitalize">
                {user.role || "User"}
              </p>
            </div>

            <div className="bg-[#1F2937] rounded-xl p-5">
              <p className="text-gray-400 text-sm">
                Wallet Balance
              </p>

              <p className="text-2xl font-bold text-green-400 mt-1">
                â‚¹{Number(user.walletBalance || 0).toFixed(2)}
              </p>
            </div>

          </div>

        </div>

      </main>

    </div>
  );
}
