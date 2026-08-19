"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function AdminDepositsPage() {
  const [deposits, setDeposits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);

  async function loadDeposits() {
    try {
      setLoading(true);

      const response = await fetch("/api/admin/deposits", {
        cache: "no-store",
      });

      const data = await response.json();

      if (data.success) {
        setDeposits(data.deposits || []);
      } else {
        console.error(data.message);
      }
    } catch (error) {
      console.error("Deposit loading error:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDeposits();
  }, []);

  // APPROVE DEPOSIT
  async function approveDeposit(transactionId) {
    const confirmApprove = window.confirm(
      "Are you sure you want to approve this deposit?"
    );

    if (!confirmApprove) return;

    try {
      setProcessingId(transactionId);

      const response = await fetch(
        "/api/admin/deposits/approve",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            transactionId,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        alert(data.message || "Unable to approve deposit");
        return;
      }

      alert(
        `Deposit approved successfully.\nWallet Balance: ₹${Number(
          data.walletBalance || 0
        ).toFixed(2)}`
      );

      await loadDeposits();
    } catch (error) {
      console.error("Approve deposit error:", error);
      alert("Something went wrong while approving deposit.");
    } finally {
      setProcessingId(null);
    }
  }

  // REJECT DEPOSIT
  async function rejectDeposit(transactionId) {
    const confirmReject = window.confirm(
      "Are you sure you want to reject this deposit?"
    );

    if (!confirmReject) return;

    try {
      setProcessingId(transactionId);

      const response = await fetch(
        "/api/admin/deposits/reject",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            transactionId,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        alert(data.message || "Unable to reject deposit");
        return;
      }

      alert("Deposit rejected successfully.");

      await loadDeposits();
    } catch (error) {
      console.error("Reject deposit error:", error);
      alert("Something went wrong while rejecting deposit.");
    } finally {
      setProcessingId(null);
    }
  }

  return (
    <div className="min-h-screen bg-[#0B1120] text-white flex">

      {/* Sidebar */}
      <aside className="w-72 bg-[#111827] border-r border-gray-700 p-6">

        <h1 className="text-3xl font-bold text-yellow-400 mb-10">
          Admin Panel
        </h1>

        <div className="space-y-4">

          <Link
            href="/admin/dashboard"
            className="block bg-[#1F2937] rounded-lg p-4 hover:bg-yellow-500 hover:text-black transition"
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
            className="block bg-yellow-500 text-black rounded-lg p-4 font-bold"
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

      {/* Main */}
      <main className="flex-1 p-8">

        <div className="flex items-center justify-between mb-8">

          <div>
            <h1 className="text-4xl font-bold text-yellow-400">
              Deposit Requests
            </h1>

            <p className="text-gray-400 mt-2">
              Manage user deposit requests
            </p>
          </div>

          <button
            onClick={loadDeposits}
            disabled={loading}
            className="bg-yellow-500 hover:bg-yellow-400 disabled:opacity-50 text-black px-5 py-3 rounded-lg font-bold"
          >
            {loading ? "Loading..." : "Refresh"}
          </button>

        </div>

        {/* Loading */}
        {loading && (
          <div className="bg-[#111827] rounded-xl p-8 text-center">
            <p className="text-gray-400">
              Loading deposit requests...
            </p>
          </div>
        )}

        {/* No Data */}
        {!loading && deposits.length === 0 && (
          <div className="bg-[#111827] border border-gray-800 rounded-xl p-10 text-center">

            <div className="text-5xl mb-4">
              💰
            </div>

            <h2 className="text-2xl font-bold">
              No Deposit Requests
            </h2>

            <p className="text-gray-400 mt-2">
              New deposit requests will appear here.
            </p>

          </div>
        )}

        {/* Deposit Table */}
        {!loading && deposits.length > 0 && (
          <div className="bg-[#111827] rounded-xl border border-gray-800 overflow-x-auto">

            <table className="w-full">

              <thead>
                <tr className="border-b border-gray-700 text-gray-400">

                  <th className="text-left p-5">
                    User
                  </th>

                  <th className="text-left p-5">
                    Amount
                  </th>

                  <th className="text-left p-5">
                    UTR
                  </th>

                  <th className="text-left p-5">
                    Status
                  </th>

                  <th className="text-left p-5">
                    Date
                  </th>

                  <th className="text-left p-5">
                    Action
                  </th>

                </tr>
              </thead>

              <tbody>

                {deposits.map((deposit) => {

                  const isProcessing =
                    processingId === deposit._id;

                  return (
                    <tr
                      key={deposit._id}
                      className="border-b border-gray-800 hover:bg-[#172033]"
                    >

                      {/* USER */}
                      <td className="p-5">

                        <div className="font-semibold">
                          {deposit.user?.name || "Unknown User"}
                        </div>

                        <div className="text-sm text-gray-500">
                          {deposit.user?.email || "-"}
                        </div>

                      </td>

                      {/* AMOUNT */}
                      <td className="p-5">

                        <span className="text-green-400 font-bold">
                          ₹
                          {Number(
                            deposit.amount || 0
                          ).toFixed(2)}
                        </span>

                      </td>

                      {/* UTR */}
                      <td className="p-5 text-gray-300">
                        {deposit.utr || "-"}
                      </td>

                      {/* STATUS */}
                      <td className="p-5">

                        <span
                          className={`px-3 py-1 rounded-full text-sm font-semibold ${
                            deposit.status === "approved"
                              ? "bg-green-500/20 text-green-400"
                              : deposit.status === "rejected"
                              ? "bg-red-500/20 text-red-400"
                              : "bg-yellow-500/20 text-yellow-400"
                          }`}
                        >
                          {deposit.status}
                        </span>

                      </td>

                      {/* DATE */}
                      <td className="p-5 text-gray-400">
                        {deposit.createdAt
                          ? new Date(
                              deposit.createdAt
                            ).toLocaleString()
                          : "-"}
                      </td>

                      {/* ACTION */}
                      <td className="p-5">

                        {deposit.status === "pending" ? (

                          <div className="flex gap-2">

                            <button
                              onClick={() =>
                                approveDeposit(
                                  deposit._id
                                )
                              }
                              disabled={isProcessing}
                              className="bg-green-500 hover:bg-green-600 disabled:opacity-50 text-black px-4 py-2 rounded-lg font-bold"
                            >
                              {isProcessing
                                ? "Processing..."
                                : "Approve"}
                            </button>

                            <button
                              onClick={() =>
                                rejectDeposit(
                                  deposit._id
                                )
                              }
                              disabled={isProcessing}
                              className="bg-red-500 hover:bg-red-600 disabled:opacity-50 px-4 py-2 rounded-lg font-bold"
                            >
                              {isProcessing
                                ? "Processing..."
                                : "Reject"}
                            </button>

                          </div>

                        ) : (

                          <span className="text-gray-500">
                            Processed
                          </span>

                        )}

                      </td>

                    </tr>
                  );

                })}

              </tbody>

            </table>

          </div>
        )}

      </main>

    </div>
  );
}