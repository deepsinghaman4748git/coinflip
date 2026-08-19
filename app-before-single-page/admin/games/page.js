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

      const response = await fetch(
        "/api/admin/games"
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        alert(
          data.message || "Unable to load games"
        );
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

        {/* Header */}
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
            className="bg-gray-700 hover:bg-gray-600 px-5 py-3 rounded-xl font-semibold"
          >
            Refresh
          </button>

        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">

          <div className="bg-[#111827] border border-gray-700 rounded-2xl p-5">
            <p className="text-gray-400 text-sm">
              Total Games
            </p>

            <p className="text-2xl font-bold mt-2">
              {stats.totalGames}
            </p>
          </div>

          <div className="bg-[#111827] border border-gray-700 rounded-2xl p-5">
            <p className="text-gray-400 text-sm">
              Won
            </p>

            <p className="text-2xl font-bold text-green-400 mt-2">
              {stats.wonGames}
            </p>
          </div>

          <div className="bg-[#111827] border border-gray-700 rounded-2xl p-5">
            <p className="text-gray-400 text-sm">
              Lost
            </p>

            <p className="text-2xl font-bold text-red-400 mt-2">
              {stats.lostGames}
            </p>
          </div>

          <div className="bg-[#111827] border border-gray-700 rounded-2xl p-5">
            <p className="text-gray-400 text-sm">
              Total Entry
            </p>

            <p className="text-2xl font-bold text-yellow-400 mt-2">
              â‚¹{stats.totalEntry.toFixed(2)}
            </p>
          </div>

          <div className="bg-[#111827] border border-gray-700 rounded-2xl p-5">
            <p className="text-gray-400 text-sm">
              Total Payout
            </p>

            <p className="text-2xl font-bold text-blue-400 mt-2">
              â‚¹{stats.totalPayout.toFixed(2)}
            </p>
          </div>

        </div>

        {/* Games */}
        <div className="bg-[#111827] border border-gray-700 rounded-2xl overflow-hidden">

          <div className="p-5 border-b border-gray-700">
            <h2 className="text-xl font-bold">
              Recent Games
            </h2>
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

                    const won =
                      game.status === "won";

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
                        className="border-t border-gray-700 hover:bg-[#182235]"
                      >

                        <td className="px-5 py-4">

                          <div className="font-semibold">
                            {game.user?.name ||
                              "Unknown User"}
                          </div>

                          <div className="text-gray-500 text-xs mt-1">
                            {game.user?.email ||
                              "-"}
                          </div>

                        </td>

                        <td className="px-5 py-4 font-bold">
                          {prediction}
                        </td>

                        <td className="px-5 py-4 text-yellow-400 font-bold">
                          {result}
                        </td>

                        <td className="px-5 py-4">
                          â‚¹
                          {Number(
                            game.entryFee || 0
                          ).toFixed(2)}
                        </td>

                        <td className="px-5 py-4 text-green-400 font-semibold">
                          â‚¹
                          {Number(
                            game.winAmount || 0
                          ).toFixed(2)}
                        </td>

                        <td className="px-5 py-4">

                          <span
                            className={`px-3 py-1 rounded-full text-xs font-bold ${
                              won
                                ? "bg-green-500/20 text-green-400"
                                : "bg-red-500/20 text-red-400"
                            }`}
                          >
                            {won
                              ? "WON"
                              : "LOST"}
                          </span>

                        </td>

                        <td className="px-5 py-4 text-gray-400 whitespace-nowrap">
                          {formatDate(
                            game.createdAt
                          )}
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
