"use client";

import { useEffect, useState } from "react";

const QUICK_BETS = [10, 50, 100, 500];

export default function GamePage() {
  const [choice, setChoice] = useState("");
  const [result, setResult] = useState(null);
  const [coin, setCoin] = useState("🪙");

  const [loading, setLoading] = useState(false);
  const [flipping, setFlipping] = useState(false);

  const [bet, setBet] = useState("");
  const [walletBalance, setWalletBalance] = useState(0);

  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);

  const [gameEnabled, setGameEnabled] = useState(true);
  const [maintenance, setMaintenance] = useState(false);

  const [minBet, setMinBet] = useState(10);
  const [maxBet, setMaxBet] = useState(10000);
  const [payoutMultiplier, setPayoutMultiplier] = useState(2);

  const [settingsLoading, setSettingsLoading] = useState(true);

  async function loadSettings() {
    try {
      setSettingsLoading(true);

      const response = await fetch("/api/admin/settings", {
        cache: "no-store",
      });

      const data = await response.json();

      if (data.success && data.settings) {
        setGameEnabled(Boolean(data.settings.CoinFlipEnabled));
        setMaintenance(Boolean(data.settings.maintenanceMode));

        setMinBet(Number(data.settings.minBet ?? 10));
        setMaxBet(Number(data.settings.maxBet ?? 10000));
        setPayoutMultiplier(
          Number(data.settings.payoutMultiplier ?? 2)
        );
      }
    } catch (error) {
      console.error("Settings error:", error);
    } finally {
      setSettingsLoading(false);
    }
  }

  async function loadWallet() {
    try {
      const response = await fetch("/api/me", {
        cache: "no-store",
      });

      const data = await response.json();

      if (data.success && data.user) {
        setWalletBalance(
          Number(data.user.walletBalance || 0)
        );
      }
    } catch (error) {
      console.error("Wallet error:", error);
    }
  }

  async function loadHistory() {
    try {
      setHistoryLoading(true);

      const response = await fetch(
        "/api/game/history",
        {
          cache: "no-store",
        }
      );

      const data = await response.json();

      if (data.success) {
        setHistory(data.games || []);
      }
    } catch (error) {
      console.error("History error:", error);
    } finally {
      setHistoryLoading(false);
    }
  }

  useEffect(() => {
    loadSettings();
    loadWallet();
    loadHistory();
  }, []);

  function selectBet(amount) {
    if (loading) return;

    setBet(String(amount));
    setResult(null);
  }

  async function flipCoin() {
    if (loading) return;

    if (!choice) {
      alert("Please select HEAD or TAIL");
      return;
    }

    if (!gameEnabled) {
      alert("CoinFlip game is currently disabled.");
      return;
    }

    if (maintenance) {
      alert("CoinFlip is currently under maintenance.");
      return;
    }

    const amount = Number(bet);

    if (!Number.isFinite(amount) || amount <= 0) {
      alert("Enter a valid bet amount");
      return;
    }

    if (amount < minBet) {
      alert(`Minimum entry fee is Rs.${minBet}`);
      return;
    }

    if (amount > maxBet) {
      alert(`Maximum entry fee is Rs.${maxBet}`);
      return;
    }

    if (amount > walletBalance) {
      alert("Insufficient wallet balance");
      return;
    }

    setLoading(true);
    setFlipping(true);
    setResult(null);
    setCoin("🪙");

    try {
      await new Promise((resolve) =>
        setTimeout(resolve, 1800)
      );

      const response = await fetch(
        "/api/game/coinflip",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            prediction:
              choice === "Head"
                ? "heads"
                : "tails",
            entryFee: amount,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        alert(
          data.message ||
            "Unable to play game"
        );

        setCoin("🪙");
        return;
      }

      const game = data.game;

      const finalResult =
        game.result === "heads"
          ? "HEAD"
          : "TAIL";

      setCoin(
        finalResult === "HEAD"
          ? "🙂"
          : "🦅"
      );

      setResult({
        won: game.status === "won",

        prediction:
          game.prediction === "heads"
            ? "HEAD"
            : "TAIL",

        result: finalResult,

        entryFee: Number(
          game.entryFee || 0
        ),

        winAmount: Number(
          game.winAmount || 0
        ),
      });

      setWalletBalance(
        Number(data.walletBalance || 0)
      );

      setBet("");

      await Promise.all([
        loadHistory(),
        loadWallet(),
      ]);
    } catch (error) {
      console.error(
        "CoinFlip error:",
        error
      );

      alert(
        "Something went wrong. Please try again."
      );

      setCoin("🪙");
    } finally {
      setFlipping(false);
      setLoading(false);
    }
  }

  function resetGame() {
    if (loading) return;

    setChoice("");
    setResult(null);
    setCoin("🪙");
    setBet("");
  }

  function formatDate(date) {
    if (!date) return "-";

    return new Date(date).toLocaleString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  }

  return (
    <main className="min-h-screen bg-[#060A12] text-white">

      {/* ================= TOP NAV ================= */}

      <header className="sticky top-0 z-40 border-b border-white/5 bg-[#060A12]/90 backdrop-blur-xl">

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">

          <div className="flex items-center justify-between gap-4">

            {/* BRAND */}

            <div className="flex items-center gap-3">

              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-yellow-300 via-yellow-500 to-orange-600 flex items-center justify-center text-2xl shadow-lg shadow-yellow-500/20">
                🪙
              </div>

              <div>
                <h1 className="font-black text-xl tracking-tight">
                  CoinFlip
                </h1>

                <p className="text-[11px] text-gray-500 uppercase tracking-[0.2em]">
                  Play • Predict • Win
                </p>
              </div>

            </div>

            {/* WALLET */}

            <div className="flex items-center gap-2">

              <div className="hidden sm:block">

                <p className="text-[10px] text-gray-500 uppercase tracking-wider text-right">
                  Available Balance
                </p>

                <p className="font-black text-green-400 text-lg text-right">
                  Rs.{walletBalance.toFixed(2)}
                </p>

              </div>

              <div className="w-11 h-11 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center text-green-400 text-lg">
                ₹
              </div>

            </div>

          </div>

        </div>

      </header>

      {/* ================= CONTENT ================= */}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 md:py-10">

        {/* STATUS */}

        <div className="mb-6">

          {maintenance ? (
            <div className="rounded-2xl border border-orange-500/20 bg-orange-500/5 px-4 py-3 text-sm text-orange-300">
              ⚠️ CoinFlip is currently under maintenance.
            </div>
          ) : !gameEnabled ? (
            <div className="rounded-2xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-300">
              🔴 CoinFlip is currently unavailable.
            </div>
          ) : (
            <div className="rounded-2xl border border-green-500/10 bg-green-500/5 px-4 py-3 flex items-center justify-between">

              <div className="flex items-center gap-2 text-sm text-gray-300">
                <span className="w-2 h-2 rounded-full bg-green-400 shadow-lg shadow-green-400/50" />
                Game is live
              </div>

              <div className="text-xs text-gray-500">
                {payoutMultiplier}X payout
              </div>

            </div>
          )}

        </div>

        {/* ================= DASHBOARD GRID ================= */}

        <div className="grid xl:grid-cols-[1.25fr_0.75fr] gap-6">

          {/* ================= GAME CARD ================= */}

          <section className="rounded-[2rem] border border-white/5 bg-gradient-to-b from-[#111827] to-[#0B1120] shadow-2xl overflow-hidden">

            {/* GAME HEADER */}

            <div className="px-5 sm:px-8 pt-7 pb-5 border-b border-white/5">

              <div className="flex items-start justify-between gap-4">

                <div>

                  <p className="text-yellow-400 text-xs font-black uppercase tracking-[0.2em]">
                    Coin Toss
                  </p>

                  <h2 className="text-2xl sm:text-3xl font-black mt-2">
                    Predict the outcome
                  </h2>

                  <p className="text-gray-500 text-sm mt-1">
                    Pick your side and place your entry.
                  </p>

                </div>

                <div className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/5">

                  <span className="text-green-400">
                    ●
                  </span>

                  <span className="text-xs text-gray-400">
                    LIVE
                  </span>

                </div>

              </div>

            </div>

            <div className="p-5 sm:p-8">

              {/* COIN */}

              <div className="relative flex justify-center py-5">

                <div className="absolute w-48 h-48 sm:w-64 sm:h-64 rounded-full bg-yellow-500/10 blur-3xl" />

                <div
                  className={`relative w-40 h-40 sm:w-52 sm:h-52 rounded-full bg-gradient-to-br from-yellow-200 via-yellow-500 to-orange-700 border-[10px] border-yellow-100/10 shadow-[0_0_80px_rgba(234,179,8,0.18)] flex items-center justify-center ${
                    flipping
                      ? "animate-spin"
                      : ""
                  }`}
                >

                  <div className="w-[82%] h-[82%] rounded-full border-2 border-yellow-100/20 flex items-center justify-center bg-black/10">

                    <span className="text-7xl sm:text-8xl drop-shadow-xl">
                      {coin}
                    </span>

                  </div>

                </div>

              </div>

              <div className="text-center mb-7">

                <p className="text-sm text-gray-400">
                  {loading
                    ? "Flipping the coin..."
                    : result
                    ? "Round completed"
                    : "Choose HEAD or TAIL"}
                </p>

              </div>

              {/* BET */}

              <div>

                <div className="flex items-center justify-between mb-2">

                  <label className="text-sm font-bold text-gray-300">
                    Entry Amount
                  </label>

                  <span className="text-xs text-gray-600">
                    Rs.{minBet} - Rs.{maxBet}
                  </span>

                </div>

                <div className="relative">

                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">
                    Rs.
                  </span>

                  <input
                    type="number"
                    min={minBet}
                    max={maxBet}
                    placeholder="Enter amount"
                    value={bet}
                    disabled={loading}
                    onChange={(e) =>
                      setBet(e.target.value)
                    }
                    className="w-full h-14 rounded-2xl bg-[#070B14] border border-white/10 focus:border-yellow-500/60 focus:ring-2 focus:ring-yellow-500/10 outline-none pl-12 pr-4 text-lg font-bold transition"
                  />

                </div>

                {/* QUICK BET */}

                <div className="grid grid-cols-4 gap-2 mt-3">

                  {QUICK_BETS.map(
                    (amount) => (
                      <button
                        key={amount}
                        type="button"
                        disabled={
                          loading ||
                          amount < minBet ||
                          amount > maxBet
                        }
                        onClick={() =>
                          selectBet(amount)
                        }
                        className={`h-10 rounded-xl text-xs sm:text-sm font-black transition ${
                          Number(bet) === amount
                            ? "bg-yellow-500 text-black"
                            : "bg-white/5 text-gray-400 hover:bg-white/10"
                        } disabled:opacity-30`}
                      >
                        Rs.{amount}
                      </button>
                    )
                  )}

                </div>

              </div>

              {/* CHOICE */}

              <div className="grid grid-cols-2 gap-3 mt-6">

                <button
                  type="button"
                  disabled={loading}
                  onClick={() =>
                    setChoice("Head")
                  }
                  className={`relative overflow-hidden rounded-2xl border p-4 sm:p-5 transition ${
                    choice === "Head"
                      ? "bg-yellow-500 text-black border-yellow-300 shadow-xl shadow-yellow-500/20"
                      : "bg-white/[0.03] border-white/10 hover:bg-white/[0.07]"
                  }`}
                >

                  <div className="text-3xl">
                    🙂
                  </div>

                  <div className="font-black text-lg mt-2">
                    HEAD
                  </div>

                  <div
                    className={`text-[10px] mt-1 ${
                      choice === "Head"
                        ? "text-black/60"
                        : "text-gray-600"
                    }`}
                  >
                    MY PICK
                  </div>

                </button>

                <button
                  type="button"
                  disabled={loading}
                  onClick={() =>
                    setChoice("Tail")
                  }
                  className={`relative overflow-hidden rounded-2xl border p-4 sm:p-5 transition ${
                    choice === "Tail"
                      ? "bg-yellow-500 text-black border-yellow-300 shadow-xl shadow-yellow-500/20"
                      : "bg-white/[0.03] border-white/10 hover:bg-white/[0.07]"
                  }`}
                >

                  <div className="text-3xl">
                    🦅
                  </div>

                  <div className="font-black text-lg mt-2">
                    TAIL
                  </div>

                  <div
                    className={`text-[10px] mt-1 ${
                      choice === "Tail"
                        ? "text-black/60"
                        : "text-gray-600"
                    }`}
                  >
                    MY PICK
                  </div>

                </button>

              </div>

              {/* PLAY */}

              <button
                type="button"
                disabled={
                  loading ||
                  settingsLoading ||
                  !gameEnabled ||
                  maintenance
                }
                onClick={flipCoin}
                className="w-full mt-5 h-14 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400 text-black font-black text-lg shadow-xl shadow-green-500/10 transition disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {loading
                  ? "🪙  FLIPPING..."
                  : "🎯  FLIP COIN"}
              </button>

              {/* RESULT */}

              {result && (
                <div
                  className={`mt-5 rounded-2xl border p-5 ${
                    result.won
                      ? "bg-green-500/5 border-green-500/20"
                      : "bg-red-500/5 border-red-500/20"
                  }`}
                >

                  <div className="text-center">

                    <div className="text-3xl font-black">
                      {result.won
                        ? "🎉 YOU WON!"
                        : "😔 YOU LOST"}
                    </div>

                    <p className="text-sm text-gray-500 mt-1">
                      {result.won
                        ? `You received Rs.${result.winAmount.toFixed(
                            2
                          )}`
                        : `Your entry of Rs.${result.entryFee.toFixed(
                            2
                          )} was lost`}
                    </p>

                  </div>

                  <div className="grid grid-cols-3 gap-2 mt-5">

                    <div className="rounded-xl bg-black/20 p-3 text-center">
                      <p className="text-[10px] text-gray-600 uppercase">
                        Pick
                      </p>

                      <p className="font-black mt-1">
                        {result.prediction}
                      </p>
                    </div>

                    <div className="rounded-xl bg-black/20 p-3 text-center">
                      <p className="text-[10px] text-gray-600 uppercase">
                        Result
                      </p>

                      <p className="font-black text-yellow-400 mt-1">
                        {result.result}
                      </p>
                    </div>

                    <div className="rounded-xl bg-black/20 p-3 text-center">
                      <p className="text-[10px] text-gray-600 uppercase">
                        Payout
                      </p>

                      <p
                        className={`font-black mt-1 ${
                          result.won
                            ? "text-green-400"
                            : "text-gray-500"
                        }`}
                      >
                        Rs.
                        {result.winAmount.toFixed(
                          2
                        )}
                      </p>
                    </div>

                  </div>

                  <button
                    type="button"
                    onClick={resetGame}
                    className="w-full mt-4 h-11 rounded-xl bg-white/5 hover:bg-white/10 text-sm font-bold"
                  >
                    Play Again
                  </button>

                </div>
              )}

            </div>

          </section>

          {/* ================= HISTORY ================= */}

          <section className="rounded-[2rem] border border-white/5 bg-[#0D1422] shadow-2xl overflow-hidden">

            <div className="px-5 sm:px-7 py-6 border-b border-white/5">

              <div className="flex items-center justify-between gap-3">

                <div>

                  <p className="text-yellow-400 text-xs font-black uppercase tracking-[0.2em]">
                    Activity
                  </p>

                  <h2 className="text-2xl font-black mt-1">
                    Game History
                  </h2>

                </div>

                <button
                  type="button"
                  disabled={historyLoading}
                  onClick={() => {
                    loadHistory();
                    loadWallet();
                  }}
                  className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold text-gray-400"
                >
                  ↻ Refresh
                </button>

              </div>

            </div>

            <div className="p-4 sm:p-5">

              {historyLoading ? (

                <div className="py-20 text-center">

                  <div className="w-10 h-10 mx-auto rounded-full border-2 border-yellow-500/20 border-t-yellow-500 animate-spin" />

                  <p className="text-gray-600 text-sm mt-4">
                    Loading history...
                  </p>

                </div>

              ) : history.length === 0 ? (

                <div className="py-20 text-center">

                  <div className="text-5xl">
                    🎮
                  </div>

                  <h3 className="font-bold mt-4">
                    No games yet
                  </h3>

                  <p className="text-gray-600 text-sm mt-1">
                    Your played rounds will appear here.
                  </p>

                </div>

              ) : (

                <div className="space-y-2 max-h-[720px] overflow-y-auto pr-1">

                  {history.map(
                    (game) => {

                      const won =
                        game.status ===
                        "won";

                      const prediction =
                        game.prediction ===
                        "heads"
                          ? "HEAD"
                          : "TAIL";

                      const gameResult =
                        game.result ===
                        "heads"
                          ? "HEAD"
                          : "TAIL";

                      return (
                        <div
                          key={
                            game._id
                          }
                          className="rounded-2xl bg-[#070B14] border border-white/5 p-4 hover:border-white/10 transition"
                        >

                          <div className="flex items-center justify-between gap-3">

                            <div className="flex items-center gap-3">

                              <div
                                className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${
                                  won
                                    ? "bg-green-500/10"
                                    : "bg-red-500/10"
                                }`}
                              >
                                {won
                                  ? "✓"
                                  : "×"}
                              </div>

                              <div>

                                <div className="flex items-center gap-2">

                                  <span className="font-black text-sm">
                                    {prediction}
                                  </span>

                                  <span className="text-gray-700">
                                    →
                                  </span>

                                  <span className="font-black text-sm text-yellow-400">
                                    {gameResult}
                                  </span>

                                </div>

                                <p className="text-[11px] text-gray-600 mt-1">
                                  {formatDate(
                                    game.createdAt
                                  )}
                                </p>

                              </div>

                            </div>

                            <div className="text-right">

                              <span
                                className={`text-[10px] font-black px-2 py-1 rounded-lg ${
                                  won
                                    ? "bg-green-500/10 text-green-400"
                                    : "bg-red-500/10 text-red-400"
                                }`}
                              >
                                {won
                                  ? "WON"
                                  : "LOST"}
                              </span>

                              <p className="text-xs text-gray-500 mt-2">
                                Rs.
                                {Number(
                                  game.entryFee ||
                                    0
                                ).toFixed(
                                  2
                                )}
                              </p>

                            </div>

                          </div>

                          <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between">

                            <span className="text-xs text-gray-600">
                              Payout
                            </span>

                            <span
                              className={`text-sm font-black ${
                                won
                                  ? "text-green-400"
                                  : "text-gray-600"
                              }`}
                            >
                              Rs.
                              {Number(
                                game.winAmount ||
                                  0
                              ).toFixed(
                                2
                              )}
                            </span>

                          </div>

                        </div>
                      );
                    }
                  )}

                </div>

              )}

            </div>

          </section>

        </div>

        {/* ================= BOTTOM INFO ================= */}

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">

          <div className="rounded-2xl bg-[#0D1422] border border-white/5 p-4">
            <p className="text-[10px] text-gray-600 uppercase">
              Min Entry
            </p>

            <p className="font-black text-yellow-400 mt-1">
              Rs.{minBet}
            </p>
          </div>

          <div className="rounded-2xl bg-[#0D1422] border border-white/5 p-4">
            <p className="text-[10px] text-gray-600 uppercase">
              Max Entry
            </p>

            <p className="font-black text-yellow-400 mt-1">
              Rs.{maxBet}
            </p>
          </div>

          <div className="rounded-2xl bg-[#0D1422] border border-white/5 p-4">
            <p className="text-[10px] text-gray-600 uppercase">
              Payout
            </p>

            <p className="font-black text-green-400 mt-1">
              {payoutMultiplier}X
            </p>
          </div>

          <div className="rounded-2xl bg-[#0D1422] border border-white/5 p-4">
            <p className="text-[10px] text-gray-600 uppercase">
              Status
            </p>

            <p className="font-black text-green-400 mt-1">
              {maintenance
                ? "Maintenance"
                : gameEnabled
                ? "Online"
                : "Disabled"}
            </p>
          </div>

        </div>

        <p className="text-center text-[11px] text-gray-700 mt-7">
          CoinFlip • Play responsibly • All game results are
          generated by the server.
        </p>

      </div>

    </main>
  );
}