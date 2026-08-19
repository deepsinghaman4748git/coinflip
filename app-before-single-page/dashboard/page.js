"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getUser() {
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
        console.error("Dashboard Error:", error);
        router.push("/login");
      } finally {
        setLoading(false);
      }
    }

    getUser();
  }, [router]);

  async function logout() {
  try {
    await fetch("/api/logout", {
      method: "POST",
    });
  } catch (error) {
    console.error("Logout Error:", error);
  } finally {
    router.push("/login");
  }
}

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B1120] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">ðŸª™</div>
          <p className="text-gray-400">
            Loading dashboard...
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
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">

          <Link
            href="/"
            className="text-2xl font-bold text-yellow-400"
          >
            ðŸª™ CoinFlip
          </Link>

          <div className="flex items-center gap-4">

            <div className="hidden sm:block">
              <p className="text-sm text-gray-400">
                Welcome
              </p>

              <p className="font-semibold">
                {user.name}
              </p>
            </div>

            <div className="bg-[#111827] border border-green-500/20 px-5 py-2 rounded-lg">
              <span className="text-gray-400 text-sm">
                Wallet
              </span>

              <span className="text-green-400 font-bold ml-2">
                â‚¹{Number(user.walletBalance || 0).toFixed(2)}
              </span>
            </div>

            <button
              onClick={logout}
              className="bg-red-500 hover:bg-red-600 px-5 py-2 rounded-lg font-semibold transition"
            >
              Logout
            </button>

          </div>

        </div>
      </header>

      {/* Main */}
      <main className="max-w-7xl mx-auto p-6">

        {/* Welcome */}
        <div className="mb-8">

          <h1 className="text-4xl font-bold">
            Welcome, {user.name} ðŸ‘‹
          </h1>

          <p className="text-gray-400 mt-2">
            Ready to play CoinFlip?
          </p>

        </div>

        {/* Wallet */}
        <div className="bg-[#111827] rounded-2xl p-6 border border-yellow-500/20">

          <p className="text-gray-400">
            Available Balance
          </p>

          <h2 className="text-5xl font-bold text-green-400 mt-2">
            â‚¹{Number(user.walletBalance || 0).toFixed(2)}
          </h2>

          <div className="flex flex-wrap gap-4 mt-6">

            <Link
              href="/wallet"
              className="bg-green-500 hover:bg-green-600 text-black px-6 py-3 rounded-lg font-bold transition"
            >
              + Add Money
            </Link>

            <Link
              href="/wallet"
              className="bg-red-500 hover:bg-red-600 px-6 py-3 rounded-lg font-bold transition"
            >
              Withdraw
            </Link>

          </div>

        </div>

        {/* Games */}
        <h2 className="text-2xl font-bold mt-10 mb-5">
          Games
        </h2>

        <div className="grid md:grid-cols-3 gap-6">

          <Link
            href="/game"
            className="bg-[#111827] rounded-2xl p-8 border border-yellow-500/20 hover:border-yellow-400 hover:-translate-y-1 transition text-center"
          >

            <div className="text-6xl">
              ðŸª™
            </div>

            <h3 className="text-2xl font-bold mt-4">
              Coin Toss
            </h3>

            <p className="text-gray-400 mt-2">
              Head or Tail
            </p>

            <div className="mt-5 bg-yellow-500 text-black font-bold py-3 rounded-lg">
              Play Now
            </div>

          </Link>

          <Link
            href="/history"
            className="bg-[#111827] rounded-2xl p-8 border border-yellow-500/20 hover:border-yellow-400 hover:-translate-y-1 transition text-center"
          >

            <div className="text-6xl">
              ðŸ“œ
            </div>

            <h3 className="text-2xl font-bold mt-4">
              Game History
            </h3>

            <p className="text-gray-400 mt-2">
              View your matches
            </p>

          </Link>

          <Link
            href="/profile"
            className="bg-[#111827] rounded-2xl p-8 border border-yellow-500/20 hover:border-yellow-400 hover:-translate-y-1 transition text-center"
          >

            <div className="text-6xl">
              ðŸ‘¤
            </div>

            <h3 className="text-2xl font-bold mt-4">
              Profile
            </h3>

            <p className="text-gray-400 mt-2">
              Manage your account
            </p>

          </Link>

        </div>

        {/* Statistics */}
        <h2 className="text-2xl font-bold mt-10 mb-5">
          Your Statistics
        </h2>

        <div className="grid md:grid-cols-3 gap-6">

          <div className="bg-[#111827] rounded-xl p-6 border border-gray-800">

            <p className="text-gray-400">
              Games Played
            </p>

            <p className="text-4xl font-bold mt-3">
              0
            </p>

          </div>

          <div className="bg-[#111827] rounded-xl p-6 border border-gray-800">

            <p className="text-gray-400">
              Wins
            </p>

            <p className="text-4xl font-bold text-green-400 mt-3">
              0
            </p>

          </div>

          <div className="bg-[#111827] rounded-xl p-6 border border-gray-800">

            <p className="text-gray-400">
              Losses
            </p>

            <p className="text-4xl font-bold text-red-400 mt-3">
              0
            </p>

          </div>

        </div>

      </main>

    </div>
  );
}
