"use client";

import { useEffect, useState } from "react";

export default function AdminGamesPage() {
  const [games, setGames] = useState([]);
  const [stats, setStats] = useState({
    totalGames: 0,
    wonGames: 0,
    lostGames: 0,
    totalEntry: 0,
    totalPayout: 0,
  });

  const [loading, setLoading] = useState(true);

  async function loadGames() {
    try {
      setLoading(true);

      const response = await fetch("/api/admin/games", {
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        alert(data.message || "Unable to load games");
        return;
      }

      setGames(data.games || []);

      setStats(
        data.stats || {
          totalGames: 0,
          wonGames: 0,
          lostGames: 0,
          totalEntry: 0,
          totalPayout: 0,
        }
      );
    } catch (error) {
      console.error("Admin games error:", error);
      alert("Unable to load games");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadGames();
  }, []);

  function formatMoney(amount) {
    return `\u20B9${Number(amount || 0).toLocaleString("en-IN", {
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
    <div className="min-h-screen bg-[#0B1120] text-white p-6">
      <div className="max-w-7xl mx-auto">

        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-yellow-400">
              Game Management
            </h1>

            <p className="text-gray-400 mt-1">
              Monitor all CoinFlip games
            </p>
          </div>

          <button
            onClick={loadGames}
            disabled={loading}
            className="
              bg-gray-700
              hover:bg-gray-600
              disabled:opacity-50
              px-5
              py-3
              rounded-xl
              font-semibold
              transition
            "
          >
            {loading ? "Loading..." : "Refresh"}
          </button>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">

          {/* TOTAL GAMES */}
          <div className="bg-[#111827] border border-gray-700 rounded-2xl p-5">
            <p className="text-gray-400 text-sm">
              Total Games
            </p>

            <p className="text-2xl font-bold mt-2">
              {stats.totalGames}
            </p>
          </div>

          {/* WON */}
          <div className="bg-[#111827] border border-gray-700 rounded-2xl p-5">
            <p className="text-gray-400 text-sm">
              Won
            </p>

            <p className="text-2xl font-bold text-green-400 mt-2">
              {stats.wonGames}
            </p>
          </div>

          {/* LOST */}
          <div className="bg-[#111827] border border-gray-700 rounded-2xl p-5">
            <p className="text-gray-400 text-sm">
              Lost
            </p>

            <p className="text-2xl font-bold text-red-400 mt-2">
              {stats.lostGames}
            </p>
          </div>

          {/* TOTAL ENTRY */}
          <div className="bg-[#111827] border border-gray-700 rounded-2xl p-5">
            <p className="text-gray-400 text-sm">
              Total Entry
            </p>

            <p className="text-2xl font-bold text-yellow-400 mt-2">
              {formatMoney(stats.totalEntry)}
            </p>
          </div>

          {/* TOTAL PAYOUT */}
          <div className="bg-[#111827] border border-gray-700 rounded-2xl p-5">
            <p className="text-gray-400 text-sm">
              Total Payout
            </p>

            <p className="text-2xl font-bold text-blue-400 mt-2">
              {formatMoney(stats.totalPayout)}
            </p>
          </div>
        </div>

        {/* GAMES TABLE */}
        <div className="bg-[#111827] border border-gray-700 rounded-2xl overflow-hidden">

          <div className="p-5 border-b border-gray-700">
            <h2 className="text-xl font-bold">
              Recent Games
            </h2>

            <p className="text-gray-500 text-sm mt-1">
              Latest CoinFlip game activity
            </p>
          </div>

          {loading ? (
            <div className="text-center py-16 text-gray-400">
              Loading games...
            </div>
          ) : games.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              No games found
            </div>
          ) : (
            <div className="overflow-x-auto">

              <table className="w-full text-sm">

                <thead className="bg-[#1F2937]">
                  <tr>

                    <th className="text-left px-5 py-4">
                      User
                    </th>

                    <th className="text-left px-5 py-4">
                      Prediction
                    </th>

                    <th className="text-left px-5 py-4">
                      Result
                    </th>

                    <th className="text-left px-5 py-4">
                      Entry
                    </th>

                    <th className="text-left px-5 py-4">
                      Payout
                    </th>

                    <th className="text-left px-5 py-4">
                      Status
                    </th>

                    <th className="text-left px-5 py-4">
                      Date
                    </th>

                  </tr>
                </thead>

                <tbody>

                  {games.map((game) => {
                    const won = game.status === "won";

                    const prediction =
                      game.prediction === "heads"
                        ? "HEAD"
                        : "TAIL";

                    const result =
                      game.result === "heads"
                        ? "HEAD"
                        : "TAIL";

                    return (
                      <tr
                        key={game._id}
                        className="
                          border-t
                          border-gray-700
                          hover:bg-[#182235]
                          transition
                        "
                      >

                        {/* USER */}
                        <td className="px-5 py-4">

                          <div className="font-semibold">
                            {game.user?.name || "Unknown User"}
                          </div>

                          <div className="text-gray-500 text-xs mt-1">
                            {game.user?.email || "-"}
                          </div>

                        </td>

                        {/* PREDICTION */}
                        <td className="px-5 py-4">

                          <span
                            className={`
                              inline-flex
                              px-3
                              py-1
                              rounded-full
                              text-xs
                              font-bold
                              ${
                                prediction === "HEAD"
                                  ? "bg-blue-500/15 text-blue-400"
                                  : "bg-purple-500/15 text-purple-400"
                              }
                            `}
                          >
                            {prediction}
                          </span>

                        </td>

                        {/* RESULT */}
                        <td className="px-5 py-4">

                          <span
                            className={`
                              inline-flex
                              px-3
                              py-1
                              rounded-full
                              text-xs
                              font-bold
                              ${
                                result === "HEAD"
                                  ? "bg-yellow-500/15 text-yellow-400"
                                  : "bg-orange-500/15 text-orange-400"
                              }
                            `}
                          >
                            {result}
                          </span>

                        </td>

                        {/* ENTRY */}
                        <td className="px-5 py-4 font-semibold">
                          {formatMoney(game.entryFee)}
                        </td>

                        {/* PAYOUT */}
                        <td className="px-5 py-4 text-green-400 font-semibold">
                          {formatMoney(game.winAmount)}
                        </td>

                        {/* STATUS */}
                        <td className="px-5 py-4">

                          <span
                            className={`
                              inline-flex
                              px-3
                              py-1
                              rounded-full
                              text-xs
                              font-bold
                              ${
                                won
                                  ? "bg-green-500/20 text-green-400"
                                  : "bg-red-500/20 text-red-400"
                              }
                            `}
                          >
                            {won ? "WON" : "LOST"}
                          </span>

                        </td>

                        {/* DATE */}
                        <td className="px-5 py-4 text-gray-400 whitespace-nowrap">
                          {formatDate(game.createdAt)}
                        </td>

                      </tr>
                    );
                  })}

                </tbody>

              </table>

            </div>
          )}

        </div>

      </div>
    </div>
  );
}