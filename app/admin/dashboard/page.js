"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const RUPEE = "₹";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    users: 0,
    totalWallet: 0,
    deposits: 0,
    withdrawals: 0,
    games: 0,
    pendingDeposits: 0,
    pendingWithdrawals: 0,
  });

  const [recentDeposits, setRecentDeposits] = useState([]);
  const [recentGames, setRecentGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadDashboard() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/admin/dashboard", {
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.message || "Unable to load dashboard.");
        return;
      }

      setStats({
        users: Number(data.stats?.users || 0),
        totalWallet: Number(data.stats?.totalWallet || 0),
        deposits: Number(data.stats?.deposits || 0),
        withdrawals: Number(data.stats?.withdrawals || 0),
        games: Number(data.stats?.games || 0),
        pendingDeposits: Number(data.stats?.pendingDeposits || 0),
        pendingWithdrawals: Number(
          data.stats?.pendingWithdrawals || 0
        ),
      });

      setRecentDeposits(data.recentDeposits || []);
      setRecentGames(data.recentGames || []);
    } catch (error) {
      console.error("Dashboard loading error:", error);
      setError("Unable to connect to dashboard.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  function money(amount) {
    return `${RUPEE}${Number(amount || 0).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }

  function date(value) {
    if (!value) return "-";

    return new Date(value).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function statusClass(status) {
    if (status === "completed" || status === "approved" || status === "won") {
      return "bg-green-500/10 text-green-400 border-green-500/20";
    }

    if (status === "pending") {
      return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20";
    }

    return "bg-red-500/10 text-red-400 border-red-500/20";
  }

  return (
    <div className="min-h-screen bg-[#070B14] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-7">

        {/* HEADER */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5 mb-8">
          <div>
            <p className="text-yellow-400 text-xs font-black uppercase tracking-[0.25em]">
              CoinFlip Admin
            </p>

            <h1 className="text-3xl md:text-4xl font-black mt-2">
              Dashboard
            </h1>

            <p className="text-gray-500 mt-2">
              Monitor users, wallet activity, games and requests.
            </p>
          </div>

          <button
            onClick={loadDashboard}
            disabled={loading}
            className="rounded-xl bg-white/5 border border-white/10 px-5 py-3 font-bold hover:bg-white/10 disabled:opacity-50"
          >
            {loading ? "Refreshing..." : "↻ Refresh"}
          </button>
        </div>

        {/* ERROR */}
        {error && (
          <div className="mb-6 rounded-2xl border border-red-500/20 bg-red-500/10 text-red-400 px-5 py-4">
            {error}
          </div>
        )}

        {/* QUICK STATS */}
        <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-5">

          <StatCard
            title="Total Users"
            value={stats.users}
            subtitle="Registered accounts"
            icon="U"
            color="blue"
          />

          <StatCard
            title="Wallet Balance"
            value={money(stats.totalWallet)}
            subtitle="Current user wallets"
            icon="₹"
            color="green"
          />

          <StatCard
            title="Total Deposits"
            value={money(stats.deposits)}
            subtitle={`${stats.pendingDeposits} pending requests`}
            icon="+"
            color="yellow"
          />

          <StatCard
            title="Total Withdrawals"
            value={money(stats.withdrawals)}
            subtitle={`${stats.pendingWithdrawals} pending requests`}
            icon="−"
            color="red"
          />
        </div>

        {/* SECOND ROW */}
        <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-5 mt-5">

          <MiniCard
            title="Total Games"
            value={stats.games}
            href="/admin/games"
          />

          <MiniCard
            title="Pending Deposits"
            value={stats.pendingDeposits}
            href="/admin/deposits"
            warning={stats.pendingDeposits > 0}
          />

          <MiniCard
            title="Pending Withdrawals"
            value={stats.pendingWithdrawals}
            href="/admin/withdraws"
            warning={stats.pendingWithdrawals > 0}
          />

          <MiniCard
            title="Manage Users"
            value="Open"
            href="/admin/users"
          />
        </div>

        {/* ACTIONS */}
        <section className="mt-8">
          <h2 className="text-xl font-black mb-4">
            Quick Actions
          </h2>

          <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-4">

            <QuickAction
              title="Deposit Requests"
              description="Review and approve deposits."
              href="/admin/deposits"
            />

            <QuickAction
              title="Withdraw Requests"
              description="Review pending withdrawals."
              href="/admin/withdraws"
            />

            <QuickAction
              title="Users"
              description="View registered users."
              href="/admin/users"
            />

            <QuickAction
              title="Game Settings"
              description="Control CoinFlip settings."
              href="/admin/settings"
            />

          </div>
        </section>

        {/* RECENT DEPOSITS */}
        <section className="mt-8 rounded-3xl border border-white/10 bg-[#111827] overflow-hidden">

          <div className="p-6 border-b border-white/10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">

            <div>
              <h2 className="text-xl font-black">
                Recent Deposit Requests
              </h2>

              <p className="text-sm text-gray-500 mt-1">
                Latest wallet deposit activity
              </p>
            </div>

            <Link
              href="/admin/deposits"
              className="text-yellow-400 text-sm font-bold hover:underline"
            >
              View All →
            </Link>

          </div>

          {loading ? (
            <div className="p-10 text-center text-gray-500">
              Loading deposits...
            </div>
          ) : recentDeposits.length === 0 ? (
            <div className="p-10 text-center text-gray-500">
              No deposit requests found.
            </div>
          ) : (
            <div className="overflow-x-auto">

              <table className="w-full min-w-[700px]">

                <thead className="bg-white/[0.02]">
                  <tr className="text-left text-xs uppercase tracking-wider text-gray-500">
                    <th className="px-6 py-4">User</th>
                    <th className="px-6 py-4">Amount</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Date</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-white/5">

                  {recentDeposits.map((deposit) => (
                    <tr
                      key={String(deposit._id)}
                      className="hover:bg-white/[0.02]"
                    >

                      <td className="px-6 py-4">
                        <p className="font-bold">
                          {deposit.user?.name || "Unknown User"}
                        </p>

                        <p className="text-xs text-gray-500 mt-1">
                          {deposit.user?.email || "-"}
                        </p>
                      </td>

                      <td className="px-6 py-4 font-black">
                        {money(deposit.amount)}
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex px-3 py-1.5 rounded-full border text-xs font-bold uppercase ${statusClass(
                            deposit.status
                          )}`}
                        >
                          {deposit.status || "unknown"}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-sm text-gray-500">
                        {date(deposit.createdAt)}
                      </td>

                    </tr>
                  ))}

                </tbody>

              </table>

            </div>
          )}

        </section>

        {/* RECENT GAMES */}
        <section className="mt-6 rounded-3xl border border-white/10 bg-[#111827] overflow-hidden">

          <div className="p-6 border-b border-white/10 flex items-center justify-between">

            <div>
              <h2 className="text-xl font-black">
                Recent Games
              </h2>

              <p className="text-sm text-gray-500 mt-1">
                Latest CoinFlip rounds
              </p>
            </div>

            <Link
              href="/admin/games"
              className="text-yellow-400 text-sm font-bold hover:underline"
            >
              View All →
            </Link>

          </div>

          {recentGames.length === 0 ? (
            <div className="p-10 text-center text-gray-500">
              No games played yet.
            </div>
          ) : (
            <div className="divide-y divide-white/5">

              {recentGames.map((game) => (
                <div
                  key={String(game._id)}
                  className="p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 hover:bg-white/[0.02]"
                >

                  <div>
                    <p className="font-bold">
                      {game.user?.name || "Unknown User"}
                    </p>

                    <p className="text-xs text-gray-500 mt-1">
                      {game.user?.email || "-"}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-400">
                      Prediction:{" "}
                      <span className="text-white font-bold">
                        {game.prediction === "heads"
                          ? "HEAD"
                          : "TAIL"}
                      </span>
                    </p>

                    <p className="text-sm text-gray-400">
                      Result:{" "}
                      <span className="text-white font-bold">
                        {game.result === "heads"
                          ? "HEAD"
                          : "TAIL"}
                      </span>
                    </p>
                  </div>

                  <div className="sm:text-right">
                    <p className="font-black">
                      {money(game.entryFee)}
                    </p>

                    <span
                      className={`inline-flex mt-1 px-3 py-1 rounded-full border text-xs font-bold ${statusClass(
                        game.status
                      )}`}
                    >
                      {game.status || "-"}
                    </span>
                  </div>

                </div>
              ))}

            </div>
          )}

        </section>

      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  subtitle,
  icon,
  color,
}) {
  const colors = {
    blue: "text-sky-400 bg-sky-400/10 border-sky-400/20",
    green: "text-green-400 bg-green-400/10 border-green-400/20",
    yellow: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20",
    red: "text-red-400 bg-red-400/10 border-red-400/20",
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-[#111827] p-6">

      <div className="flex items-start justify-between gap-4">

        <div>
          <p className="text-sm text-gray-500">
            {title}
          </p>

          <p className="text-2xl xl:text-3xl font-black mt-2">
            {value}
          </p>

          <p className="text-xs text-gray-600 mt-2">
            {subtitle}
          </p>
        </div>

        <div
          className={`h-11 w-11 rounded-xl border flex items-center justify-center font-black ${colors[color]}`}
        >
          {icon}
        </div>

      </div>

    </div>
  );
}

function MiniCard({
  title,
  value,
  href,
  warning = false,
}) {
  return (
    <Link
      href={href}
      className={`rounded-2xl border p-5 transition ${
        warning
          ? "border-yellow-500/20 bg-yellow-500/5 hover:bg-yellow-500/10"
          : "border-white/10 bg-[#111827] hover:bg-white/[0.04]"
      }`}
    >
      <p className="text-sm text-gray-500">
        {title}
      </p>

      <p
        className={`text-2xl font-black mt-2 ${
          warning ? "text-yellow-400" : "text-white"
        }`}
      >
        {value}
      </p>

      <p className="text-xs text-gray-600 mt-2">
        Open →
      </p>
    </Link>
  );
}

function QuickAction({
  title,
  description,
  href,
}) {
  return (
    <Link
      href={href}
      className="rounded-2xl border border-white/10 bg-[#111827] p-5 hover:border-yellow-400/30 hover:bg-yellow-400/[0.03] transition"
    >
      <h3 className="font-black">
        {title}
      </h3>

      <p className="text-sm text-gray-500 mt-2">
        {description}
      </p>

      <p className="text-yellow-400 text-sm font-bold mt-4">
        Open →
      </p>
    </Link>
  );
}