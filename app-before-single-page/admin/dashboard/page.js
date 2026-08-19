"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    users: 0,
    deposits: 0,
    withdraws: 0,
    games: 0,
    pendingDeposits: 0,
    pendingWithdraws: 0,
  });

  const [recentDeposits, setRecentDeposits] = useState([]);
  const [loading, setLoading] = useState(true);

  async function loadDashboard() {
    try {
      setLoading(true);

      const response = await fetch("/api/admin/dashboard", {
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        console.error("Dashboard API error:", data.message);
        return;
      }

      setStats({
        users: Number(data.stats?.users || 0),
        deposits: Number(data.stats?.deposits || 0),
        withdraws: Number(data.stats?.withdraws || 0),
        games: Number(data.stats?.games || 0),
        pendingDeposits: Number(data.stats?.pendingDeposits || 0),
        pendingWithdraws: Number(data.stats?.pendingWithdraws || 0),
      });

      setRecentDeposits(data.recentDeposits || []);
    } catch (error) {
      console.error("Dashboard loading error:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  function formatMoney(amount) {
    return `â‚¹${Number(amount || 0).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }

  function formatDate(date) {
    if (!date) return "-";

    return new Date(date).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return (
    <div className="min-h-screen bg-[#0B1120] text-white flex">

      {/* Sidebar */}
      <aside className="w-72 bg-[#111827] p-6 border-r border-gray-700">

        <h1 className="text-3xl font-bold text-yellow-400 mb-10">
          Admin Panel
        </h1>

        <div className="space-y-4">

          <Link
            href="/admin/dashboard"
            className="block bg-yellow-500 text-black rounded-lg p-4 font-bold"
          >
            Dashboard
          </Link>

          <Link
            href="/admin/users"
            className="block bg-[#1F2937] rounded-lg p-4 hover:bg-yellow-500 hover:text-black transition"
          >
            Users
          </Link>

          <Link
            href="/admin/deposits"
            className="block bg-[#1F2937] rounded-lg p-4 hover:bg-yellow-500 hover:text-black transition"
          >
            Deposit Requests
          </Link>

          <Link
            href="/admin/withdraws"
            className="block bg-[#1F2937] rounded-lg p-4 hover:bg-yellow-500 hover:text-black transition"
          >
            Withdraw Requests
          </Link>

          <Link
            href="/admin/games"
            className="block bg-[#1F2937] rounded-lg p-4 hover:bg-yellow-500 hover:text-black transition"
          >
            Games
          </Link>

          <Link
            href="/admin/settings"
            className="block bg-[#1F2937] rounded-lg p-4 hover:bg-yellow-500 hover:text-black transition"
          >
            Settings
          </Link>

        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-auto">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">

          <div>
            <h1 className="text-4xl font-bold text-yellow-400">
              Dashboard
            </h1>

            <p className="text-gray-400 mt-2">
              Overview of your CoinFlip platform
            </p>
          </div>

          <button
            onClick={loadDashboard}
            disabled={loading}
            className="bg-gray-700 hover:bg-gray-600 disabled:opacity-50 px-5 py-3 rounded-xl font-semibold"
          >
            {loading ? "Loading..." : "Refresh"}
          </button>

        </div>

        {/* Statistics Cards */}
        <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-6">

          {/* Users */}
          <div className="bg-[#111827] p-6 rounded-xl border border-gray-800">

            <p className="text-gray-400">
              Users
            </p>

            <h2 className="text-4xl font-bold mt-2">
              {stats.users}
            </h2>

          </div>

          {/* Deposits */}
          <div className="bg-[#111827] p-6 rounded-xl border border-gray-800">

            <p className="text-gray-400">
              Deposits
            </p>

            <h2 className="text-4xl font-bold text-green-400 mt-2">
              {formatMoney(stats.deposits)}
            </h2>

            <p className="text-yellow-400 text-sm mt-2">
              Pending: {stats.pendingDeposits}
            </p>

          </div>

          {/* Withdrawals */}
          <div className="bg-[#111827] p-6 rounded-xl border border-gray-800">

            <p className="text-gray-400">
              Withdraw
            </p>

            <h2 className="text-4xl font-bold text-red-400 mt-2">
              {formatMoney(stats.withdraws)}
            </h2>

            <p className="text-yellow-400 text-sm mt-2">
              Pending: {stats.pendingWithdraws}
            </p>

          </div>

          {/* Games */}
          <div className="bg-[#111827] p-6 rounded-xl border border-gray-800">

            <p className="text-gray-400">
              Games
            </p>

            <h2 className="text-4xl font-bold text-yellow-400 mt-2">
              {stats.games}
            </h2>

          </div>

        </div>

        {/* Recent Deposit Requests */}
        <div className="bg-[#111827] rounded-xl p-6 mt-8 border border-gray-800">

          <div className="flex items-center justify-between mb-5">

            <div>
              <h2 className="text-2xl font-bold text-yellow-400">
                Recent Deposit Requests
              </h2>

              <p className="text-gray-500 text-sm mt-1">
                Latest deposit activity
              </p>
            </div>

            <Link
              href="/admin/deposits"
              className="text-yellow-400 hover:underline text-sm"
            >
              View All
            </Link>

          </div>

          <div className="overflow-x-auto">

            <table className="w-full">

              <thead>

                <tr className="border-b border-gray-700">

                  <th className="text-left py-3">
                    User
                  </th>

                  <th className="text-left">
                    Amount
                  </th>

                  <th className="text-left">
                    Status
                  </th>

                  <th className="text-left">
                    Date
                  </th>

                </tr>

              </thead>

              <tbody>

                {recentDeposits.length === 0 ? (

                  <tr>

                    <td
                      colSpan="4"
                      className="text-center py-10 text-gray-500"
                    >
                      No deposit requests found
                    </td>

                  </tr>

                ) : (

                  recentDeposits.map((deposit) => (

                    <tr
                      key={deposit._id}
                      className="border-b border-gray-800"
                    >

                      <td className="py-4">

                        <div className="font-semibold">
                          {deposit.user?.name || "Unknown User"}
                        </div>

                        <div className="text-xs text-gray-500">
                          {deposit.user?.email || "-"}
                        </div>

                      </td>

                      <td className="font-bold">
                        {formatMoney(deposit.amount)}
                      </td>

                      <td>

                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold ${
                            deposit.status === "completed"
                              ? "bg-green-500/20 text-green-400"
                              : deposit.status === "pending"
                              ? "bg-yellow-500/20 text-yellow-400"
                              : "bg-red-500/20 text-red-400"
                          }`}
                        >
                          {deposit.status || "unknown"}
                        </span>

                      </td>

                      <td className="text-gray-400 text-sm">
                        {formatDate(deposit.createdAt)}
                      </td>

                    </tr>

                  ))

                )}

              </tbody>

            </table>

          </div>

        </div>

      </main>

    </div>
  );
}
