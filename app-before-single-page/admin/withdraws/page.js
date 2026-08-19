"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function AdminWithdrawsPage() {
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(null);

  async function loadWithdrawals() {
    try {
      setLoading(true);

      const response = await fetch("/api/admin/withdraws", {
        cache: "no-store",
      });

      const data = await response.json();

      if (data.success) {
        setWithdrawals(data.withdrawals || []);
      } else {
        alert(data.message || "Unable to load withdrawals");
      }
    } catch (error) {
      console.error("Withdrawal loading error:", error);
    } finally {
      setLoading(false);
    }
  }

  async function processWithdrawal(id, action) {
    const confirmed = window.confirm(
      action === "approve"
        ? "Approve this withdrawal?"
        : "Reject this withdrawal and refund the amount?"
    );

    if (!confirmed) return;

    try {
      setProcessing(id);

      const response = await fetch(
        `/api/admin/withdraws/${action}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ id }),
        }
      );

      const data = await response.json();

      if (!data.success) {
        alert(data.message || "Action failed");
        return;
      }

      alert(data.message);
      await loadWithdrawals();
    } catch (error) {
      console.error("Withdrawal action error:", error);
      alert("Something went wrong");
    } finally {
      setProcessing(null);
    }
  }

  useEffect(() => {
    loadWithdrawals();
  }, []);

  return (
    <div className="min-h-screen bg-[#0B1120] text-white flex">

      <aside className="w-72 bg-[#111827] border-r border-gray-700 p-6">

        <h1 className="text-3xl font-bold text-yellow-400 mb-10">
          Admin Panel
        </h1>

        <div className="space-y-4">

          <Link
            href="/admin/dashboard"
            className="block bg-[#1F2937] rounded-lg p-4 hover:bg-yellow-500 hover:text-black"
          >
            Dashboard
          </Link>

          <Link
            href="/admin/deposits"
            className="block bg-[#1F2937] rounded-lg p-4 hover:bg-yellow-500 hover:text-black"
          >
            Deposit Requests
          </Link>

          <Link
            href="/admin/withdraws"
            className="block bg-yellow-500 text-black rounded-lg p-4 font-bold"
          >
            Withdraw Requests
          </Link>

        </div>

      </aside>

      <main className="flex-1 p-8">

        <div className="flex justify-between items-center mb-8">

          <div>
            <h1 className="text-4xl font-bold text-yellow-400">
              Withdraw Requests
            </h1>

            <p className="text-gray-400 mt-2">
              Manage user withdrawal requests
            </p>
          </div>

          <button
            onClick={loadWithdrawals}
            className="bg-yellow-500 hover:bg-yellow-400 text-black px-5 py-3 rounded-lg font-bold"
          >
            Refresh
          </button>

        </div>

        {loading ? (
          <div className="bg-[#111827] rounded-xl p-8 text-center">
            Loading withdrawal requests...
          </div>
        ) : withdrawals.length === 0 ? (
          <div className="bg-[#111827] rounded-xl p-10 text-center">

            <div className="text-5xl mb-4">
              💸
            </div>

            <h2 className="text-2xl font-bold">
              No Withdrawal Requests
            </h2>

            <p className="text-gray-400 mt-2">
              New withdrawal requests will appear here.
            </p>

          </div>
        ) : (
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
                    UPI ID
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

                {withdrawals.map((withdrawal) => (

                  <tr
                    key={withdrawal._id}
                    className="border-b border-gray-800 hover:bg-[#172033]"
                  >

                    <td className="p-5">

                      <div className="font-semibold">
                        {withdrawal.user?.name || "Unknown User"}
                      </div>

                      <div className="text-sm text-gray-500">
                        {withdrawal.user?.email || "-"}
                      </div>

                    </td>

                    <td className="p-5">
                      <span className="text-red-400 font-bold">
                        ₹{Number(withdrawal.amount || 0).toFixed(2)}
                      </span>
                    </td>

                    <td className="p-5 text-gray-300">
                      {withdrawal.upiId || "-"}
                    </td>

                    <td className="p-5">

                      <span
                        className={`px-3 py-1 rounded-full text-sm font-semibold ${
                          withdrawal.status === "completed"
                            ? "bg-green-500/20 text-green-400"
                            : withdrawal.status === "rejected"
                            ? "bg-red-500/20 text-red-400"
                            : "bg-yellow-500/20 text-yellow-400"
                        }`}
                      >
                        {withdrawal.status}
                      </span>

                    </td>

                    <td className="p-5 text-gray-400">
                      {withdrawal.createdAt
                        ? new Date(
                            withdrawal.createdAt
                          ).toLocaleString()
                        : "-"}
                    </td>

                    <td className="p-5">

                      {withdrawal.status === "pending" ? (

                        <div className="flex gap-2">

                          <button
                            disabled={processing === withdrawal._id}
                            onClick={() =>
                              processWithdrawal(
                                withdrawal._id,
                                "approve"
                              )
                            }
                            className="bg-green-500 hover:bg-green-600 disabled:opacity-50 text-black px-4 py-2 rounded-lg font-bold"
                          >
                            Approve
                          </button>

                          <button
                            disabled={processing === withdrawal._id}
                            onClick={() =>
                              processWithdrawal(
                                withdrawal._id,
                                "reject"
                              )
                            }
                            className="bg-red-500 hover:bg-red-600 disabled:opacity-50 px-4 py-2 rounded-lg font-bold"
                          >
                            Reject
                          </button>

                        </div>

                      ) : (

                        <span className="text-gray-500">
                          Processed
                        </span>

                      )}

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>
        )}

      </main>

    </div>
  );
}