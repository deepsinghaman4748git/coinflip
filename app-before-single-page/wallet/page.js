"use client";

import { useEffect, useState } from "react";
import Sidebar from "../../components/Sidebar";

export default function WalletPage() {
  const [user, setUser] = useState(null);
  const [transactions, setTransactions] = useState([]);

  const [amount, setAmount] = useState("");
  const [utr, setUtr] = useState("");
  const [upiId, setUpiId] = useState("");
  const [note, setNote] = useState("");

  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawUpi, setWithdrawUpi] = useState("");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [withdrawing, setWithdrawing] = useState(false);

  async function loadWallet() {
    try {
      const response = await fetch("/api/me", {
        cache: "no-store",
      });

      const data = await response.json();

      if (data.success) {
        setUser(data.user);
      }
    } catch (error) {
      console.error("Wallet loading error:", error);
    } finally {
      setLoading(false);
    }
  }

  async function loadTransactions() {
    try {
      const response = await fetch("/api/wallet/transactions", {
        cache: "no-store",
      });

      const data = await response.json();

      if (data.success) {
        setTransactions(data.transactions || []);
      }
    } catch (error) {
      console.error("Transaction loading error:", error);
    }
  }

  useEffect(() => {
    loadWallet();
    loadTransactions();
  }, []);

  async function submitDeposit(e) {
    e.preventDefault();

    if (!amount) {
      alert("Please enter amount.");
      return;
    }

    if (Number(amount) < 10) {
      alert("Minimum deposit amount is ₹10.");
      return;
    }

    if (!utr.trim()) {
      alert("Please enter UTR Number.");
      return;
    }

    try {
      setSubmitting(true);

      const response = await fetch("/api/wallet/deposit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: Number(amount),
          utr: utr.trim(),
          upiId: upiId.trim(),
          note: note.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        alert(data.message || "Unable to submit deposit request.");
        return;
      }

      alert(
        `Deposit request submitted successfully!\n\nAmount: ₹${Number(
          amount
        ).toFixed(2)}\nStatus: Pending`
      );

      setAmount("");
      setUtr("");
      setUpiId("");
      setNote("");

      await loadTransactions();
      await loadWallet();
    } catch (error) {
      console.error("Deposit submit error:", error);
      alert("Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  async function submitWithdrawal(e) {
    e.preventDefault();

    const amountNumber = Number(withdrawAmount);
    const balance = Number(user?.walletBalance || 0);

    if (!withdrawAmount) {
      alert("Please enter withdrawal amount.");
      return;
    }

    if (amountNumber < 10) {
      alert("Minimum withdrawal amount is ₹10.");
      return;
    }

    if (amountNumber > balance) {
      alert("Insufficient wallet balance.");
      return;
    }

    if (!withdrawUpi.trim()) {
      alert("Please enter your UPI ID.");
      return;
    }

    try {
      setWithdrawing(true);

      const response = await fetch("/api/withdraw", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: amountNumber,
          upiId: withdrawUpi.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        alert(data.message || "Unable to submit withdrawal request.");
        return;
      }

      alert(
        `Withdrawal request submitted successfully!\n\nAmount: ₹${amountNumber.toFixed(
          2
        )}\nUPI: ${withdrawUpi.trim()}\nStatus: Pending`
      );

      setWithdrawAmount("");
      setWithdrawUpi("");

      await loadTransactions();
      await loadWallet();
    } catch (error) {
      console.error("Withdrawal submit error:", error);
      alert("Something went wrong.");
    } finally {
      setWithdrawing(false);
    }
  }

  function formatDate(date) {
    if (!date) return "-";

    return new Date(date).toLocaleString("en-IN");
  }

  function statusClass(status) {
    if (status === "approved" || status === "completed") {
      return "text-green-400";
    }

    if (status === "rejected") {
      return "text-red-400";
    }

    return "text-yellow-400";
  }

  return (
    <div className="flex min-h-screen bg-[#0B1120] text-white">

      <Sidebar />

      <div className="flex-1 p-8">

        <h1 className="text-4xl font-bold text-yellow-400 mb-8">
          Wallet
        </h1>

        {/* Wallet Balance */}
        <div className="bg-[#111827] rounded-2xl p-6 border border-yellow-500/20">

          <p className="text-gray-400">
            Available Balance
          </p>

          <h2 className="text-5xl font-bold text-green-400 mt-3">
            ₹
            {loading
              ? "..."
              : Number(user?.walletBalance || 0).toFixed(2)}
          </h2>

        </div>

        {/* Deposit */}
        <form
          onSubmit={submitDeposit}
          className="bg-[#111827] rounded-2xl p-6 border border-yellow-500/20 mt-8"
        >

          <h2 className="text-2xl font-bold text-yellow-400">
            Deposit Money
          </h2>

          <p className="text-gray-400 mt-2">
            Submit your payment details for admin verification.
          </p>

          <label className="block text-gray-300 font-semibold mt-6 mb-2">
            Amount
          </label>

          <input
            type="number"
            min="10"
            step="1"
            placeholder="Enter Amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full bg-[#1F2937] rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-yellow-400"
          />

          <p className="text-xs text-gray-500 mt-2">
            Minimum deposit: ₹10
          </p>

          <div className="mt-6 border-2 border-dashed border-gray-600 rounded-xl h-64 flex items-center justify-center">

            <div className="text-center">

              <div className="text-7xl">
                📷
              </div>

              <p className="text-gray-400 mt-3">
                QR Code will be added here
              </p>

            </div>

          </div>

          <label className="block text-gray-300 font-semibold mt-6 mb-2">
            UTR Number
          </label>

          <input
            type="text"
            placeholder="Enter UTR Number"
            value={utr}
            onChange={(e) => setUtr(e.target.value)}
            className="w-full bg-[#1F2937] rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-yellow-400"
          />

          <label className="block text-gray-300 font-semibold mt-5 mb-2">
            UPI ID
          </label>

          <input
            type="text"
            placeholder="Enter UPI ID"
            value={upiId}
            onChange={(e) => setUpiId(e.target.value)}
            className="w-full bg-[#1F2937] rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-yellow-400"
          />

          <label className="block text-gray-300 font-semibold mt-5 mb-2">
            Payment Screenshot
          </label>

          <input
            type="file"
            accept="image/*"
            className="w-full bg-[#1F2937] rounded-lg px-4 py-3"
          />

          <p className="text-xs text-gray-500 mt-2">
            Screenshot upload UI added. Actual file storage will be connected next.
          </p>

          <label className="block text-gray-300 font-semibold mt-5 mb-2">
            Note
          </label>

          <textarea
            placeholder="Optional note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows="3"
            className="w-full bg-[#1F2937] rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-yellow-400 resize-none"
          />

          <button
            type="submit"
            disabled={submitting}
            className="w-full mt-6 bg-green-500 hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed py-4 rounded-xl font-bold text-black"
          >
            {submitting
              ? "Submitting..."
              : "Submit Deposit Request"}
          </button>

        </form>

        {/* Withdraw */}
        <form
          onSubmit={submitWithdrawal}
          className="bg-[#111827] rounded-2xl p-6 border border-red-500/20 mt-8"
        >

          <h2 className="text-2xl font-bold text-red-400">
            Withdraw Money
          </h2>

          <p className="text-gray-400 mt-2">
            Withdraw your available wallet balance to your UPI ID.
          </p>

          <div className="mt-5 bg-[#1F2937] rounded-xl p-4">
            <p className="text-gray-400 text-sm">
              Available Balance
            </p>

            <p className="text-2xl font-bold text-green-400 mt-1">
              ₹{Number(user?.walletBalance || 0).toFixed(2)}
            </p>
          </div>

          <label className="block text-gray-300 font-semibold mt-6 mb-2">
            Withdrawal Amount
          </label>

          <input
            type="number"
            min="10"
            step="1"
            placeholder="Enter Amount"
            value={withdrawAmount}
            onChange={(e) => setWithdrawAmount(e.target.value)}
            className="w-full bg-[#1F2937] rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-red-400"
          />

          <p className="text-xs text-gray-500 mt-2">
            Minimum withdrawal: ₹10
          </p>

          <label className="block text-gray-300 font-semibold mt-5 mb-2">
            UPI ID
          </label>

          <input
            type="text"
            placeholder="example@upi"
            value={withdrawUpi}
            onChange={(e) => setWithdrawUpi(e.target.value)}
            className="w-full bg-[#1F2937] rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-red-400"
          />

          <button
            type="submit"
            disabled={withdrawing}
            className="w-full mt-6 bg-red-500 hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed py-4 rounded-xl font-bold text-white"
          >
            {withdrawing
              ? "Submitting..."
              : "Submit Withdrawal Request"}
          </button>

        </form>

        {/* Transactions */}
        <div className="bg-[#111827] rounded-2xl p-6 border border-yellow-500/20 mt-8">

          <div className="flex items-center justify-between mb-5">

            <h2 className="text-2xl font-bold text-yellow-400">
              Recent Transactions
            </h2>

            <button
              onClick={loadTransactions}
              className="text-sm bg-[#1F2937] hover:bg-yellow-500 hover:text-black px-4 py-2 rounded-lg"
            >
              Refresh
            </button>

          </div>

          {transactions.length === 0 ? (

            <div className="text-gray-500 py-6">
              No Transactions
            </div>

          ) : (

            <div className="overflow-x-auto">

              <table className="w-full">

                <thead>

                  <tr className="text-gray-400 border-b border-gray-700">

                    <th className="text-left py-3">
                      Date
                    </th>

                    <th className="text-left">
                      Amount
                    </th>

                    <th className="text-left">
                      Type
                    </th>

                    <th className="text-left">
                      Status
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {transactions.map((transaction) => (

                    <tr
                      key={transaction._id}
                      className="border-b border-gray-800"
                    >

                      <td className="py-4 text-gray-400">
                        {formatDate(transaction.createdAt)}
                      </td>

                      <td className="font-semibold">
                        ₹
                        {Number(
                          transaction.amount || 0
                        ).toFixed(2)}
                      </td>

                      <td className="capitalize">
                        {transaction.type?.replace(
                          "_",
                          " "
                        )}
                      </td>

                      <td
                        className={`font-bold capitalize ${statusClass(
                          transaction.status
                        )}`}
                      >
                        {transaction.status}
                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>

          )}

        </div>

      </div>

    </div>
  );
}
