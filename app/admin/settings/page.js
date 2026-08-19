"use client";

import { useEffect, useState } from "react";

const defaultSettings = {
  CoinFlipEnabled: true,
  maintenanceMode: false,
  maintenanceMessage:
    "Game is temporarily under maintenance. Please try again later.",

  minBet: 10,
  maxBet: 10000,
  payoutMultiplier: 2,

  minDeposit: 10,
  maxDeposit: 50000,

  depositEnabled: true,
  upiId: "",
  qrCode: "",
  depositInstructions:
    "Pay using the provided UPI QR and submit your UTR number.",

  minWithdrawal: 100,
  maxWithdrawal: 50000,
  withdrawalEnabled: true,
  manualWithdrawalApproval: true,
  withdrawalMessage: "Withdrawal requests are processed manually.",

  announcementEnabled: false,
  announcement: "",

  supportContact: "",
  supportLink: "",
};

function Toggle({ checked, onChange, label, description }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-4">
      <div>
        <p className="font-medium text-slate-900">{label}</p>
        {description && (
          <p className="mt-1 text-sm text-slate-500">{description}</p>
        )}
      </div>

      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative h-7 w-12 shrink-0 rounded-full transition ${
          checked ? "bg-blue-600" : "bg-slate-300"
        }`}
        aria-label={label}
      >
        <span
          className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition ${
            checked ? "left-6" : "left-1"
          }`}
        />
      </button>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  placeholder = "",
  min,
  step,
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-slate-700">
        {label}
      </label>

      <input
        type={type}
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        min={min}
        step={step}
        className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
      />
    </div>
  );
}

function TextArea({ label, value, onChange, placeholder = "", rows = 4 }) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-slate-700">
        {label}
      </label>

      <textarea
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className="w-full resize-y rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
      />
    </div>
  );
}

function Section({ icon, title, description, children }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 px-6 py-5">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-xl">
            {icon}
          </div>

          <div>
            <h2 className="text-lg font-bold text-slate-900">{title}</h2>
            <p className="mt-1 text-sm text-slate-500">{description}</p>
          </div>
        </div>
      </div>

      <div className="space-y-5 p-6">{children}</div>
    </section>
  );
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/admin/settings", {
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to load settings");
      }

      setSettings({
        ...defaultSettings,
        ...(data.settings || {}),
      });
    } catch (err) {
      setError(err.message || "Unable to load settings");
    } finally {
      setLoading(false);
    }
  }

  function update(key, value) {
    setSettings((current) => ({
      ...current,
      [key]: value,
    }));
  }

  function numberValue(value) {
    const number = Number(value);
    return Number.isFinite(number) ? number : 0;
  }

  async function saveSettings() {
    try {
      setSaving(true);
      setMessage("");
      setError("");

      const payload = {
        ...settings,

        minBet: numberValue(settings.minBet),
        maxBet: numberValue(settings.maxBet),
        payoutMultiplier: numberValue(settings.payoutMultiplier),

        minDeposit: numberValue(settings.minDeposit),
        maxDeposit: numberValue(settings.maxDeposit),

        minWithdrawal: numberValue(settings.minWithdrawal),
        maxWithdrawal: numberValue(settings.maxWithdrawal),
      };

      const response = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to save settings");
      }

      setSettings({
        ...defaultSettings,
        ...(data.settings || {}),
      });

      setMessage("Settings saved successfully.");
    } catch (err) {
      setError(err.message || "Unable to save settings");
    } finally {
      setSaving(false);
    }
  }

  function resetChanges() {
    loadSettings();
    setMessage("");
    setError("");
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 p-6">
        <div className="mx-auto max-w-6xl">
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
            <p className="text-sm text-slate-500">
              Loading settings...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="mx-auto max-w-6xl space-y-6 p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="rounded-2xl bg-slate-950 p-6 text-white shadow-sm">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <p className="text-sm font-medium text-blue-400">
                CoinFlip Admin
              </p>

              <h1 className="mt-1 text-2xl font-bold sm:text-3xl">
                Settings
              </h1>

              <p className="mt-2 text-sm text-slate-400">
                Manage game, wallet, deposits, withdrawals and website
                settings.
              </p>
            </div>

            <div className="rounded-xl bg-white/10 px-4 py-3 text-sm">
              <span className="text-slate-400">Status: </span>
              <span className="font-semibold text-emerald-400">
                Admin Control
              </span>
            </div>
          </div>
        </div>

        {/* Alerts */}
        {message && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
            ✓ {message}
          </div>
        )}

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {error}
          </div>
        )}

        {/* Game */}
        <Section
          icon="🎮"
          title="Game Settings"
          description="Control CoinFlip availability and maintenance mode."
        >
          <Toggle
            checked={settings.CoinFlipEnabled}
            onChange={(value) => update("CoinFlipEnabled", value)}
            label="CoinFlip Game"
            description="Allow users to play CoinFlip."
          />

          <Toggle
            checked={settings.maintenanceMode}
            onChange={(value) => update("maintenanceMode", value)}
            label="Maintenance Mode"
            description="Temporarily disable gameplay for maintenance."
          />

          <TextArea
            label="Maintenance Message"
            value={settings.maintenanceMessage}
            onChange={(value) => update("maintenanceMessage", value)}
            placeholder="Enter maintenance message"
            rows={3}
          />
        </Section>

        {/* Betting */}
        <Section
          icon="🎯"
          title="Betting Settings"
          description="Set minimum, maximum and payout rules."
        >
          <div className="grid gap-5 md:grid-cols-3">
            <Field
              label="Minimum Bet (₹)"
              type="number"
              min="1"
              value={settings.minBet}
              onChange={(value) => update("minBet", value)}
            />

            <Field
              label="Maximum Bet (₹)"
              type="number"
              min="1"
              value={settings.maxBet}
              onChange={(value) => update("maxBet", value)}
            />

            <Field
              label="Payout Multiplier"
              type="number"
              min="1"
              step="0.1"
              value={settings.payoutMultiplier}
              onChange={(value) =>
                update("payoutMultiplier", value)
              }
            />
          </div>

          <div className="rounded-xl bg-blue-50 p-4 text-sm text-blue-700">
            Example: With a 2x multiplier, a ₹100 winning bet returns
            ₹200 according to the game's payout logic.
          </div>
        </Section>

        {/* Deposits */}
        <Section
          icon="💰"
          title="Deposit Settings"
          description="Control deposits and the payment information shown to users."
        >
          <Toggle
            checked={settings.depositEnabled}
            onChange={(value) => update("depositEnabled", value)}
            label="Deposits Enabled"
            description="Allow users to submit deposit requests."
          />

          <div className="grid gap-5 md:grid-cols-2">
            <Field
              label="Minimum Deposit (₹)"
              type="number"
              min="1"
              value={settings.minDeposit}
              onChange={(value) => update("minDeposit", value)}
            />

            <Field
              label="Maximum Deposit (₹)"
              type="number"
              min="1"
              value={settings.maxDeposit}
              onChange={(value) => update("maxDeposit", value)}
            />
          </div>

          <Field
            label="UPI ID"
            value={settings.upiId}
            onChange={(value) => update("upiId", value)}
            placeholder="example@upi"
          />

          <Field
            label="QR Code"
            value={settings.qrCode}
            onChange={(value) => update("qrCode", value)}
            placeholder="QR image URL"
          />

          <TextArea
            label="Deposit Instructions"
            value={settings.depositInstructions}
            onChange={(value) =>
              update("depositInstructions", value)
            }
            placeholder="Instructions shown to users during deposit."
            rows={4}
          />
        </Section>

        {/* Withdrawals */}
        <Section
          icon="💸"
          title="Withdrawal Settings"
          description="Control withdrawal limits and approval behaviour."
        >
          <Toggle
            checked={settings.withdrawalEnabled}
            onChange={(value) =>
              update("withdrawalEnabled", value)
            }
            label="Withdrawals Enabled"
            description="Allow users to submit withdrawal requests."
          />

          <Toggle
            checked={settings.manualWithdrawalApproval}
            onChange={(value) =>
              update("manualWithdrawalApproval", value)
            }
            label="Manual Withdrawal Approval"
            description="Admin must approve withdrawal requests."
          />

          <div className="grid gap-5 md:grid-cols-2">
            <Field
              label="Minimum Withdrawal (₹)"
              type="number"
              min="1"
              value={settings.minWithdrawal}
              onChange={(value) =>
                update("minWithdrawal", value)
              }
            />

            <Field
              label="Maximum Withdrawal (₹)"
              type="number"
              min="1"
              value={settings.maxWithdrawal}
              onChange={(value) =>
                update("maxWithdrawal", value)
              }
            />
          </div>

          <TextArea
            label="Withdrawal Message"
            value={settings.withdrawalMessage}
            onChange={(value) =>
              update("withdrawalMessage", value)
            }
            placeholder="Message shown to users."
            rows={3}
          />
        </Section>

        {/* Announcement */}
        <Section
          icon="📢"
          title="Website Announcement"
          description="Show an announcement to users across the website."
        >
          <Toggle
            checked={settings.announcementEnabled}
            onChange={(value) =>
              update("announcementEnabled", value)
            }
            label="Enable Announcement"
            description="Turn the website announcement on or off."
          />

          <TextArea
            label="Announcement"
            value={settings.announcement}
            onChange={(value) =>
              update("announcement", value)
            }
            placeholder="Example: Weekend special offer..."
            rows={4}
          />
        </Section>

        {/* Support */}
        <Section
          icon="🆘"
          title="Support Settings"
          description="Configure the support information users can see."
        >
          <div className="grid gap-5 md:grid-cols-2">
            <Field
              label="Support Contact"
              value={settings.supportContact}
              onChange={(value) =>
                update("supportContact", value)
              }
              placeholder="WhatsApp / phone / email"
            />

            <Field
              label="Support Link"
              value={settings.supportLink}
              onChange={(value) =>
                update("supportLink", value)
              }
              placeholder="https://..."
            />
          </div>
        </Section>

        {/* Bottom actions */}
        <div className="sticky bottom-4 z-10 rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-lg backdrop-blur">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <p className="text-sm text-slate-500">
              Changes are applied after saving.
            </p>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={resetChanges}
                disabled={saving}
                className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Reset
              </button>

              <button
                type="button"
                onClick={saveSettings}
                disabled={saving}
                className="rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save Settings"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

