"use client";

import { useEffect, useMemo, useState } from "react";

const RUPEE = "\u20B9";

export default function Home() {
  const [user, setUser] = useState(null);
  const [booting, setBooting] = useState(true);
  const [authMode, setAuthMode] = useState("login");
  const [section, setSection] = useState("home");

  async function loadUser() {
    try {
      const response = await fetch("/api/me", { cache: "no-store" });
      const data = await response.json();
      if (response.ok && data.success) {
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setBooting(false);
    }
  }

  useEffect(() => {
    loadUser();
  }, []);

  async function logout() {
    await fetch("/api/logout", { method: "POST" }).catch(() => {});
    setUser(null);
    setSection("home");
    setAuthMode("login");
  }

  if (booting) {
    return <LoadingScreen />;
  }

  if (!user) {
    return (
      <AuthScreen
        mode={authMode}
        onModeChange={setAuthMode}
        onLoggedIn={(loggedUser) => {
          setUser(loggedUser);
          setSection("home");
        }}
      />
    );
  }

  return (
    <AppShell
      user={user}
      section={section}
      setSection={setSection}
      logout={logout}
      refreshUser={loadUser}
    />
  );
}

function LoadingScreen() {
  return (
    <main className="min-h-screen bg-[#070B14] text-white flex items-center justify-center">
      <div className="text-center">
        <div className="mx-auto mb-4 h-14 w-14 rounded-2xl bg-yellow-400 text-black flex items-center justify-center text-xl font-black">
          CF
        </div>
        <p className="text-gray-400">Loading CoinFlip...</p>
      </div>
    </main>
  );
}

function AuthScreen({ mode, onModeChange, onLoggedIn }) {
  const isLogin = mode === "login";
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  function update(name, value) {
    setForm((old) => ({ ...old, [name]: value }));
    setError("");
  }

  async function submit(e) {
    e.preventDefault();
    setError("");

    if (!form.email || !form.password || (!isLogin && !form.name)) {
      setError("Please fill all required fields.");
      return;
    }

    if (!isLogin) {
      if (form.password.length < 6) {
        setError("Password must be at least 6 characters.");
        return;
      }
      if (form.password !== form.confirmPassword) {
        setError("Passwords do not match.");
        return;
      }
    }

    setBusy(true);

    try {
      const endpoint = isLogin ? "/api/login" : "/api/register";
      const body = isLogin
        ? { email: form.email, password: form.password }
        : {
            name: form.name,
            email: form.email,
            password: form.password,
          };

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.message || "Request failed.");
        return;
      }

      if (isLogin) {
        onLoggedIn(data.user);
      } else {
        setForm({
          name: "",
          email: form.email,
          password: "",
          confirmPassword: "",
        });
        onModeChange("login");
        setError("Account created. Please login.");
      }
    } catch (err) {
      console.error(err);
      setError("Unable to connect. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#070B14] text-white overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(234,179,8,0.16),transparent_35%),radial-gradient(circle_at_bottom_left,rgba(34,197,94,0.08),transparent_30%)]" />

      <div className="relative min-h-screen max-w-7xl mx-auto px-5 py-6 lg:px-8 flex flex-col">
        <header className="flex items-center justify-between">
          <button
            onClick={() => onModeChange("login")}
            className="flex items-center gap-3"
          >
            <span className="h-11 w-11 rounded-xl bg-yellow-400 text-black flex items-center justify-center font-black">
              CF
            </span>
            <span className="text-2xl font-black">CoinFlip</span>
          </button>

          <span className="hidden sm:block text-sm text-gray-500">
            Secure gaming wallet
          </span>
        </header>

        <div className="flex-1 grid lg:grid-cols-2 gap-10 items-center py-10">
          <section className="hidden lg:block">
            <p className="text-yellow-400 font-bold uppercase tracking-[0.25em] text-sm">
              Play. Predict. Win.
            </p>
            <h1 className="text-6xl font-black leading-tight mt-5">
              One account.
              <br />
              One wallet.
              <br />
              <span className="text-yellow-400">One CoinFlip.</span>
            </h1>
            <p className="text-gray-400 text-lg mt-6 max-w-xl">
              Login, manage your wallet and play CoinFlip from one clean
              dashboard. Your game result is generated by the server.
            </p>

            <div className="grid grid-cols-3 gap-3 mt-10 max-w-xl">
              {[
                ["01", "Wallet"],
                ["02", "CoinFlip"],
                ["03", "History"],
              ].map(([n, label]) => (
                <div
                  key={label}
                  className="rounded-2xl border border-white/10 bg-white/[0.03] p-4"
                >
                  <div className="text-yellow-400 font-black">{n}</div>
                  <div className="text-sm text-gray-400 mt-1">{label}</div>
                </div>
              ))}
            </div>
          </section>

          <section className="w-full max-w-md mx-auto">
            <div className="rounded-3xl border border-white/10 bg-[#111827]/95 shadow-2xl p-6 sm:p-8">
              <div className="flex bg-[#0B1120] rounded-xl p-1 mb-7">
                <button
                  onClick={() => onModeChange("login")}
                  className={`flex-1 py-2.5 rounded-lg font-bold text-sm ${
                    isLogin
                      ? "bg-yellow-400 text-black"
                      : "text-gray-400"
                  }`}
                >
                  Login
                </button>
                <button
                  onClick={() => onModeChange("register")}
                  className={`flex-1 py-2.5 rounded-lg font-bold text-sm ${
                    !isLogin
                      ? "bg-yellow-400 text-black"
                      : "text-gray-400"
                  }`}
                >
                  Register
                </button>
              </div>

              <h2 className="text-3xl font-black">
                {isLogin ? "Welcome back" : "Create account"}
              </h2>
              <p className="text-gray-500 mt-2 mb-6">
                {isLogin
                  ? "Login to continue to your CoinFlip dashboard."
                  : "Create your account to start using CoinFlip."}
              </p>

              <form onSubmit={submit} className="space-y-4">
                {!isLogin && (
                  <input
                    value={form.name}
                    onChange={(e) => update("name", e.target.value)}
                    placeholder="Full name"
                    autoComplete="name"
                    className={inputClass}
                  />
                )}

                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => update("email", e.target.value)}
                  placeholder="Email address"
                  autoComplete="email"
                  className={inputClass}
                />

                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => update("password", e.target.value)}
                  placeholder="Password"
                  autoComplete={isLogin ? "current-password" : "new-password"}
                  className={inputClass}
                />

                {!isLogin && (
                  <input
                    type="password"
                    value={form.confirmPassword}
                    onChange={(e) =>
                      update("confirmPassword", e.target.value)
                    }
                    placeholder="Confirm password"
                    autoComplete="new-password"
                    className={inputClass}
                  />
                )}

                {error && (
                  <div
                    className={`rounded-xl px-4 py-3 text-sm ${
                      error.startsWith("Account created")
                        ? "bg-green-500/10 border border-green-500/20 text-green-400"
                        : "bg-red-500/10 border border-red-500/20 text-red-400"
                    }`}
                  >
                    {error}
                  </div>
                )}

                <button
                  disabled={busy}
                  className="w-full rounded-xl bg-yellow-400 hover:bg-yellow-300 disabled:opacity-50 text-black font-black py-3.5 transition"
                >
                  {busy
                    ? "Please wait..."
                    : isLogin
                    ? "Login to CoinFlip"
                    : "Create Account"}
                </button>
              </form>

              <p className="text-center text-gray-500 text-sm mt-6">
                {isLogin ? "New to CoinFlip?" : "Already have an account?"}{" "}
                <button
                  onClick={() =>
                    onModeChange(isLogin ? "register" : "login")
                  }
                  className="text-yellow-400 font-bold hover:underline"
                >
                  {isLogin ? "Create account" : "Login"}
                </button>
              </p>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

const inputClass =
  "w-full rounded-xl bg-[#0B1120] border border-white/10 px-4 py-3.5 outline-none focus:border-yellow-400 text-white placeholder:text-gray-600";

function AppShell({ user, section, setSection, logout, refreshUser }) {
  const [mobileNav, setMobileNav] = useState(false);

  const nav = [
    { id: "home", label: "Dashboard" },
    { id: "game", label: "Play CoinFlip" },
    { id: "wallet", label: "Wallet" },
    { id: "history", label: "Game History" },
    { id: "profile", label: "Profile" },
  ];

  return (
    <main className="min-h-screen bg-[#070B14] text-white">
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#070B14]/90 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <button
            onClick={() => setSection("home")}
            className="flex items-center gap-3"
          >
            <span className="h-10 w-10 rounded-xl bg-yellow-400 text-black flex items-center justify-center font-black">
              CF
            </span>
            <span className="text-xl font-black">CoinFlip</span>
          </button>

          <div className="hidden md:flex items-center gap-2">
            {nav.map((item) => (
              <button
                key={item.id}
                onClick={() => setSection(item.id)}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition ${
                  section === item.id
                    ? "bg-yellow-400 text-black"
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden sm:block rounded-xl bg-green-500/10 border border-green-500/20 px-4 py-2">
              <span className="text-xs text-gray-500 mr-2">Balance</span>
              <span className="font-black text-green-400">
                {RUPEE}
                {Number(user.walletBalance || 0).toFixed(2)}
              </span>
            </div>
            <button
              onClick={() => setMobileNav((v) => !v)}
              className="md:hidden rounded-xl border border-white/10 px-3 py-2"
            >
              Menu
            </button>
            <button
              onClick={logout}
              className="hidden sm:block rounded-xl border border-red-500/20 text-red-400 px-4 py-2 text-sm font-bold hover:bg-red-500/10"
            >
              Logout
            </button>
          </div>
        </div>

        {mobileNav && (
          <div className="md:hidden border-t border-white/10 p-3 space-y-1 bg-[#0B1120]">
            {nav.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setSection(item.id);
                  setMobileNav(false);
                }}
                className={`w-full text-left px-4 py-3 rounded-xl font-bold ${
                  section === item.id
                    ? "bg-yellow-400 text-black"
                    : "text-gray-300"
                }`}
              >
                {item.label}
              </button>
            ))}
            <button
              onClick={logout}
              className="w-full text-left px-4 py-3 rounded-xl text-red-400 font-bold"
            >
              Logout
            </button>
          </div>
        )}
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-7">
        {section === "home" && (
          <DashboardView user={user} setSection={setSection} />
        )}
        {section === "game" && <GameView refreshUser={refreshUser} />}
        {section === "wallet" && <WalletView refreshUser={refreshUser} />}
        {section === "history" && <HistoryView />}
        {section === "profile" && <ProfileView user={user} />}
      </div>
    </main>
  );
}

function DashboardView({ user, setSection }) {
  return (
    <div className="space-y-7">
      <section className="rounded-3xl border border-yellow-500/10 bg-gradient-to-br from-yellow-500/10 via-[#111827] to-[#111827] p-6 md:p-9">
        <div className="max-w-3xl">
          <p className="text-yellow-400 text-sm font-black uppercase tracking-[0.2em]">
            CoinFlip Dashboard
          </p>
          <h1 className="text-4xl md:text-5xl font-black mt-3">
            Welcome, {user.name}
          </h1>
          <p className="text-gray-400 mt-3 max-w-2xl">
            Your complete CoinFlip account is now in one place. Manage your
            wallet, play a round and review your history without leaving the
            dashboard.
          </p>
          <div className="flex flex-wrap gap-3 mt-7">
            <button
              onClick={() => setSection("game")}
              className="bg-yellow-400 hover:bg-yellow-300 text-black font-black px-6 py-3 rounded-xl"
            >
              Play CoinFlip
            </button>
            <button
              onClick={() => setSection("wallet")}
              className="border border-white/10 hover:bg-white/5 font-bold px-6 py-3 rounded-xl"
            >
              Open Wallet
            </button>
          </div>
        </div>
      </section>

      <div className="grid md:grid-cols-3 gap-5">
        <StatCard
          title="Wallet Balance"
          value={`${RUPEE}${Number(user.walletBalance || 0).toFixed(2)}`}
          accent="green"
        />
        <StatCard title="Game" value="CoinFlip" accent="yellow" />
        <StatCard title="Account" value="Active" accent="blue" />
      </div>

      <section className="grid lg:grid-cols-2 gap-5">
        <ActionCard
          title="Play CoinFlip"
          description="Choose HEAD or TAIL, enter your stake and play."
          button="Play Now"
          onClick={() => setSection("game")}
        />
        <ActionCard
          title="Wallet"
          description="Add money, request withdrawal and view transactions."
          button="Manage Wallet"
          onClick={() => setSection("wallet")}
        />
      </section>
    </div>
  );
}

function StatCard({ title, value, accent }) {
  const classes = {
    green: "text-green-400",
    yellow: "text-yellow-400",
    blue: "text-sky-400",
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-[#111827] p-6">
      <p className="text-gray-500 text-sm">{title}</p>
      <p className={`text-2xl font-black mt-2 ${classes[accent]}`}>{value}</p>
    </div>
  );
}

function ActionCard({ title, description, button, onClick }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#111827] p-6">
      <div className="h-12 w-12 rounded-xl bg-yellow-400/10 border border-yellow-400/20 flex items-center justify-center text-yellow-400 font-black">
        CF
      </div>
      <h2 className="text-2xl font-black mt-5">{title}</h2>
      <p className="text-gray-500 mt-2">{description}</p>
      <button
        onClick={onClick}
        className="mt-5 bg-white/5 hover:bg-yellow-400 hover:text-black border border-white/10 px-5 py-2.5 rounded-xl font-bold"
      >
        {button}
      </button>
    </div>
  );
}

function GameView({ refreshUser }) {
  const [choice, setChoice] = useState("");
  const [bet, setBet] = useState("");
  const [result, setResult] = useState(null);
  const [coin, setCoin] = useState("?");
  const [walletBalance, setWalletBalance] = useState(0);
 const [settings, setSettings] = useState({
  coinflipEnabled: true,
  maintenanceMode: false,
  maintenanceMessage:
    "Game is temporarily under maintenance. Please try again later.",
  minBet: 10,
  maxBet: 10000,
  payoutMultiplier: 2,
});
  const [loading, setLoading] = useState(false);
  const [loadingPage, setLoadingPage] = useState(true);

  async function load() {
    try {
      const [meRes, settingsRes] = await Promise.all([
        fetch("/api/me", { cache: "no-store" }),
       fetch("/api/game/settings", { cache: "no-store" }),
      ]);
      const me = await meRes.json();
      const data = await settingsRes.json();

      if (me.success) setWalletBalance(Number(me.user.walletBalance || 0));
      if (data.success && data.settings) {
        setSettings({
          coinflipEnabled: Boolean(data.settings.coinflipEnabled),
          maintenanceMode: Boolean(data.settings.maintenanceMode),
          maintenanceMessage:
             data.settings.maintenanceMessage ||
            "Game is temporarily under maintenance. Please try again later.",
          minBet: Number(data.settings.minBet ?? 10),
          maxBet: Number(data.settings.maxBet ?? 10000),
          payoutMultiplier: Number(data.settings.payoutMultiplier ?? 2),
        });
      }
    } finally {
      setLoadingPage(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function play() {
    if (loading) return;

    if (!settings.coinflipEnabled) {
      alert("CoinFlip game is currently disabled.");
      return;
    }
    if (settings.maintenanceMode) {
      alert("CoinFlip is currently under maintenance.");
      return;
    }
    if (!choice) {
      alert("Please select HEAD or TAIL.");
      return;
    }

    const amount = Number(bet);
    if (!Number.isFinite(amount) || amount <= 0) {
      alert("Enter a valid entry fee.");
      return;
    }
    if (amount < settings.minBet) {
      alert(`Minimum entry fee is ${RUPEE}${settings.minBet}.`);
      return;
    }
    if (amount > settings.maxBet) {
      alert(`Maximum entry fee is ${RUPEE}${settings.maxBet}.`);
      return;
    }
    if (amount > walletBalance) {
      alert("Insufficient wallet balance.");
      return;
    }

    setLoading(true);
    setResult(null);
    setCoin("?");

    try {
      await new Promise((resolve) => setTimeout(resolve, 900));

      const response = await fetch("/api/game/coinflip", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prediction: choice === "HEAD" ? "heads" : "tails",
          entryFee: amount,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        alert(data.message || "Unable to play CoinFlip.");
        return;
      }

      const game = data.game;
      const finalResult = game.result === "heads" ? "HEAD" : "TAIL";

      setCoin(finalResult);
      setResult({
        won: game.status === "won",
        prediction: game.prediction === "heads" ? "HEAD" : "TAIL",
        result: finalResult,
        entryFee: Number(game.entryFee || 0),
        winAmount: Number(game.winAmount || 0),
      });
      setWalletBalance(Number(data.walletBalance || 0));
      setBet("");
      await refreshUser();
    } catch (error) {
      console.error(error);
      alert("Something went wrong. Please try again.");
      setCoin("?");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
        <div>
          <p className="text-yellow-400 text-sm font-black uppercase tracking-[0.2em]">
            Game
          </p>
          <h1 className="text-4xl font-black mt-2">CoinFlip</h1>
          <p className="text-gray-500 mt-1">
            Predict HEAD or TAIL and play from your wallet.
          </p>
        </div>
        <div className="rounded-2xl bg-green-500/10 border border-green-500/20 px-5 py-3">
          <p className="text-xs text-gray-500">Available balance</p>
          <p className="text-xl font-black text-green-400">
            {RUPEE}
            {walletBalance.toFixed(2)}
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1.1fr_.9fr] gap-5">
        <section className="rounded-3xl border border-white/10 bg-[#111827] p-6 md:p-8">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Current payout</p>
              <p className="text-2xl font-black text-yellow-400">
                {settings.payoutMultiplier}X
              </p>
            </div>
            <div className="text-right">
              <p className="text-gray-500 text-sm">Bet range</p>
              <p className="font-bold">
                {RUPEE}
                {settings.minBet} - {RUPEE}
                {settings.maxBet}
              </p>
            </div>
          </div>

          <div className="flex justify-center py-10">
            <div className="h-44 w-44 rounded-full bg-gradient-to-br from-yellow-200 via-yellow-400 to-yellow-700 border-8 border-yellow-200/20 shadow-[0_0_70px_rgba(234,179,8,.18)] flex items-center justify-center">
              <span className="text-5xl md:text-6xl font-black text-black">
                {coin}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {["HEAD", "TAIL"].map((item) => (
              <button
                key={item}
                disabled={loading}
                onClick={() => {
                  setChoice(item);
                  setResult(null);
                }}
                className={`rounded-2xl py-4 font-black border transition ${
                  choice === item
                    ? "bg-yellow-400 text-black border-yellow-400"
                    : "bg-[#0B1120] border-white/10 text-white hover:border-yellow-400/50"
                }`}
              >
                {item}
              </button>
            ))}
          </div>

          <div className="mt-5">
            <label className="text-sm text-gray-400">Entry fee</label>
            <div className="flex gap-2 mt-2">
              <span className="flex items-center px-4 rounded-xl bg-[#0B1120] border border-white/10 text-gray-400">
                {RUPEE}
              </span>
              <input
                type="number"
                min={settings.minBet}
                max={settings.maxBet}
                value={bet}
                onChange={(e) => setBet(e.target.value)}
                disabled={loading}
                placeholder={`Enter ${settings.minBet} - ${settings.maxBet}`}
                className="flex-1 bg-[#0B1120] border border-white/10 focus:border-yellow-400 rounded-xl px-4 py-3.5 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-4 gap-2 mt-3">
            {[10, 50, 100, 500].map((amount) => (
              <button
                key={amount}
                disabled={
                  loading || amount < settings.minBet || amount > settings.maxBet
                }
                onClick={() => setBet(String(amount))}
                className="py-2 rounded-xl bg-white/5 hover:bg-white/10 disabled:opacity-30 text-sm font-bold"
              >
                {RUPEE}
                {amount}
              </button>
            ))}
          </div>

          <button
            onClick={play}
            disabled={loading || loadingPage || !settings.coinflipEnabled}
            className="w-full mt-5 rounded-2xl bg-yellow-400 hover:bg-yellow-300 disabled:opacity-50 text-black font-black py-4"
          >
            {loading ? "Flipping..." : "Flip Coin"}
          </button>

          {result && (
            <div
              className={`mt-5 rounded-2xl p-5 border ${
                result.won
                  ? "bg-green-500/10 border-green-500/20"
                  : "bg-red-500/10 border-red-500/20"
              }`}
            >
              <p
                className={`text-xl font-black ${
                  result.won ? "text-green-400" : "text-red-400"
                }`}
              >
                {result.won ? "YOU WON" : "YOU LOST"}
              </p>
              <div className="grid grid-cols-2 gap-3 mt-3 text-sm">
                <p className="text-gray-400">
                  Prediction{" "}
                  <span className="text-white font-bold">
                    {result.prediction}
                  </span>
                </p>
                <p className="text-gray-400">
                  Result{" "}
                  <span className="text-white font-bold">{result.result}</span>
                </p>
                <p className="text-gray-400">
                  Entry{" "}
                  <span className="text-white font-bold">
                    {RUPEE}
                    {result.entryFee.toFixed(2)}
                  </span>
                </p>
                <p className="text-gray-400">
                  Payout{" "}
                  <span className="text-white font-bold">
                    {RUPEE}
                    {result.winAmount.toFixed(2)}
                  </span>
                </p>
              </div>
            </div>
          )}
        </section>

        <section className="rounded-3xl border border-white/10 bg-[#111827] p-6">
          <h2 className="text-xl font-black">How it works</h2>
          <div className="space-y-4 mt-5">
            {[
              ["01", "Choose HEAD or TAIL"],
              ["02", "Enter your entry fee"],
              ["03", "Flip the coin"],
              ["04", "Your server result decides the round"],
            ].map(([n, text]) => (
              <div key={n} className="flex gap-4">
                <span className="h-9 w-9 shrink-0 rounded-lg bg-yellow-400/10 text-yellow-400 flex items-center justify-center font-black">
                  {n}
                </span>
                <p className="text-gray-400 pt-1">{text}</p>
              </div>
            ))}
          </div>

          <div className="mt-7 rounded-2xl bg-white/[0.03] border border-white/10 p-5">
            <p className="text-sm text-gray-400">
              Game status
            </p>
            <p className="font-black mt-1">
              {settings.maintenanceMode
                ? "Maintenance"
                : settings.coinflipEnabled
                ? "Available"
                : "Disabled"}
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}

function HistoryView() {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const response = await fetch("/api/game/history", { cache: "no-store" });
      const data = await response.json();
      if (data.success) setGames(data.games || []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const stats = useMemo(() => {
    const wins = games.filter((g) => g.status === "won").length;
    const losses = games.filter((g) => g.status === "lost").length;
    return { wins, losses };
  }, [games]);

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-end justify-between gap-4 mb-6">
        <div>
          <p className="text-yellow-400 text-sm font-black uppercase tracking-[0.2em]">
            Activity
          </p>
          <h1 className="text-4xl font-black mt-2">Game History</h1>
        </div>
        <button
          onClick={load}
          className="border border-white/10 rounded-xl px-4 py-2 font-bold hover:bg-white/5"
        >
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-5">
        <StatCard title="Rounds" value={games.length} accent="yellow" />
        <StatCard title="Wins" value={stats.wins} accent="green" />
        <StatCard title="Losses" value={stats.losses} accent="blue" />
      </div>

      <div className="rounded-2xl border border-white/10 bg-[#111827] overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading history...</div>
        ) : games.length === 0 ? (
          <div className="p-10 text-center text-gray-500">
            No CoinFlip rounds yet.
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {games.map((game) => (
              <div
                key={String(game._id)}
                className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div>
                  <p className="font-black">
                    {game.prediction === "heads" ? "HEAD" : "TAIL"}{" "}
                    <span className="text-gray-600">Ã¢â€ â€™</span>{" "}
                    {game.result === "heads" ? "HEAD" : "TAIL"}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(game.createdAt).toLocaleString("en-IN")}
                  </p>
                </div>
                <div className="sm:text-right">
                  <p
                    className={`font-black ${
                      game.status === "won"
                        ? "text-green-400"
                        : "text-red-400"
                    }`}
                  >
                    {game.status === "won" ? "WON" : "LOST"}
                  </p>
                  <p className="text-sm text-gray-400 mt-1">
                    Entry {RUPEE}
                    {Number(game.entryFee || 0).toFixed(2)} Ã‚Â· Payout {RUPEE}
                    {Number(game.winAmount || 0).toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function WalletView({ refreshUser }) {
  const [user, setUser] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [amount, setAmount] = useState("");
  const [utr, setUtr] = useState("");
  const [upiId, setUpiId] = useState("");
  const [note, setNote] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawUpi, setWithdrawUpi] = useState("");
  const [busy, setBusy] = useState(false);

  async function load() {
    try {
      const [meRes, txRes] = await Promise.all([
        fetch("/api/me", { cache: "no-store" }),
        fetch("/api/wallet/transactions", { cache: "no-store" }),
      ]);
      const me = await meRes.json();
      const tx = await txRes.json();
      if (me.success) setUser(me.user);
      if (tx.success) setTransactions(tx.transactions || []);
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function deposit(e) {
    e.preventDefault();
    const value = Number(amount);

    if (!Number.isFinite(value) || value < 10 || !utr.trim()) {
      alert("Enter a valid amount and UTR number.");
      return;
    }

    setBusy(true);
    try {
      const response = await fetch("/api/wallet/deposit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: value,
          utr: utr.trim(),
          upiId: upiId.trim(),
          note: note.trim(),
        }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        alert(data.message || "Unable to submit deposit.");
        return;
      }
      alert("Deposit request submitted. Status: Pending.");
      setAmount("");
      setUtr("");
      setUpiId("");
      setNote("");
      await load();
      await refreshUser();
    } finally {
      setBusy(false);
    }
  }

  async function withdraw(e) {
    e.preventDefault();
    const value = Number(withdrawAmount);
    const balance = Number(user?.walletBalance || 0);

    if (!Number.isFinite(value) || value < 10 || value > balance || !withdrawUpi.trim()) {
      alert("Enter a valid withdrawal amount and UPI ID.");
      return;
    }

    setBusy(true);
    try {
      const response = await fetch("/api/withdraw", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: value, upiId: withdrawUpi.trim() }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        alert(data.message || "Unable to submit withdrawal.");
        return;
      }
      alert("Withdrawal request submitted. Status: Pending.");
      setWithdrawAmount("");
      setWithdrawUpi("");
      await load();
      await refreshUser();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <p className="text-yellow-400 text-sm font-black uppercase tracking-[0.2em]">
          Money
        </p>
        <h1 className="text-4xl font-black mt-2">Wallet</h1>
      </div>

      <div className="rounded-3xl bg-gradient-to-br from-green-500/10 to-[#111827] border border-green-500/20 p-7">
        <p className="text-gray-500">Available balance</p>
        <p className="text-5xl font-black text-green-400 mt-2">
          {RUPEE}
          {Number(user?.walletBalance || 0).toFixed(2)}
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-5 mt-5">
        <form
          onSubmit={deposit}
          className="rounded-2xl border border-white/10 bg-[#111827] p-6"
        >
          <h2 className="text-2xl font-black">Add Money</h2>
          <p className="text-gray-500 text-sm mt-1">
            Submit payment details for admin verification.
          </p>
          <input
            type="number"
            min="10"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Amount"
            className={inputClass + " mt-5"}
          />
          <input
            value={utr}
            onChange={(e) => setUtr(e.target.value)}
            placeholder="UTR number"
            className={inputClass + " mt-3"}
          />
          <input
            value={upiId}
            onChange={(e) => setUpiId(e.target.value)}
            placeholder="Your UPI ID (optional)"
            className={inputClass + " mt-3"}
          />
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Note (optional)"
            rows={3}
            className={inputClass + " mt-3 resize-none"}
          />
          <button
            disabled={busy}
            className="w-full mt-4 rounded-xl bg-yellow-400 text-black font-black py-3 disabled:opacity-50"
          >
            Submit Deposit Request
          </button>
        </form>

        <form
          onSubmit={withdraw}
          className="rounded-2xl border border-white/10 bg-[#111827] p-6"
        >
          <h2 className="text-2xl font-black">Withdraw</h2>
          <p className="text-gray-500 text-sm mt-1">
            Withdrawal requests are reviewed by admin.
          </p>
          <input
            type="number"
            min="10"
            value={withdrawAmount}
            onChange={(e) => setWithdrawAmount(e.target.value)}
            placeholder="Amount"
            className={inputClass + " mt-5"}
          />
          <input
            value={withdrawUpi}
            onChange={(e) => setWithdrawUpi(e.target.value)}
            placeholder="UPI ID"
            className={inputClass + " mt-3"}
          />
          <button
            disabled={busy}
            className="w-full mt-4 rounded-xl bg-white/10 hover:bg-white/15 font-black py-3 disabled:opacity-50"
          >
            Submit Withdrawal Request
          </button>
        </form>
      </div>

      <section className="rounded-2xl border border-white/10 bg-[#111827] mt-5 overflow-hidden">
        <div className="p-5 border-b border-white/10 flex items-center justify-between">
          <h2 className="font-black text-xl">Transactions</h2>
          <span className="text-xs text-gray-500">{transactions.length}</span>
        </div>
        {transactions.length === 0 ? (
          <p className="p-7 text-gray-500">No transactions yet.</p>
        ) : (
          <div className="divide-y divide-white/5">
            {transactions.slice(0, 20).map((tx) => (
              <div
                key={String(tx._id)}
                className="p-5 flex justify-between gap-4"
              >
                <div>
                  <p className="font-bold">{tx.type || "Transaction"}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {tx.createdAt
                      ? new Date(tx.createdAt).toLocaleString("en-IN")
                      : "-"}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-black">
                    {RUPEE}
                    {Number(tx.amount || 0).toFixed(2)}
                  </p>
                  <p className="text-xs text-gray-500">{tx.status || "-"}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function ProfileView({ user }) {
  return (
    <div className="max-w-3xl mx-auto">
      <p className="text-yellow-400 text-sm font-black uppercase tracking-[0.2em]">
        Account
      </p>
      <h1 className="text-4xl font-black mt-2 mb-6">Profile</h1>

      <div className="rounded-3xl border border-white/10 bg-[#111827] p-7">
        <div className="h-16 w-16 rounded-2xl bg-yellow-400 text-black flex items-center justify-center text-xl font-black">
          {(user.name || "U").slice(0, 1).toUpperCase()}
        </div>

        <div className="mt-7 space-y-5">
          <ProfileRow label="Name" value={user.name || "-"} />
          <ProfileRow label="Email" value={user.email || "-"} />
          <ProfileRow
            label="Wallet Balance"
            value={`${RUPEE}${Number(user.walletBalance || 0).toFixed(2)}`}
          />
          <ProfileRow label="Account Role" value={user.role || "user"} />
        </div>
      </div>
    </div>
  );
}

function ProfileRow({ label, value }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/5 pb-4 last:border-0 last:pb-0">
      <span className="text-gray-500">{label}</span>
      <span className="font-bold">{value}</span>
    </div>
  );
}



