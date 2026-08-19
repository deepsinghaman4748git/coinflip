"use client";

import { useEffect, useState } from "react";

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadUsers() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/admin/users");

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.message || "Unable to load users");
        return;
      }

      setUsers(data.users || []);
    } catch (err) {
      console.error("Users loading error:", err);
      setError("Unable to load users");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUsers();
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
    <div className="min-h-screen bg-[#0B1120] text-white p-6 md:p-8">

      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">

          <div>
            <h1 className="text-4xl font-bold text-yellow-400">
              Users
            </h1>

            <p className="text-gray-400 mt-2">
              Manage registered users and wallet balances
            </p>
          </div>

          <button
            onClick={loadUsers}
            disabled={loading}
            className="bg-yellow-500 hover:bg-yellow-400 disabled:bg-gray-600 text-black font-bold px-5 py-3 rounded-xl"
          >
            {loading ? "Loading..." : "Refresh"}
          </button>

        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">

          <div className="bg-[#111827] border border-gray-800 rounded-2xl p-6">
            <p className="text-gray-400">
              Total Users
            </p>

            <h2 className="text-3xl font-bold mt-2">
              {users.length}
            </h2>
          </div>

          <div className="bg-[#111827] border border-gray-800 rounded-2xl p-6">
            <p className="text-gray-400">
              Total Wallet Balance
            </p>

            <h2 className="text-3xl font-bold text-green-400 mt-2">
              ₹
              {users
                .reduce(
                  (total, user) =>
                    total + Number(user.walletBalance || 0),
                  0
                )
                .toFixed(2)}
            </h2>
          </div>

          <div className="bg-[#111827] border border-gray-800 rounded-2xl p-6">
            <p className="text-gray-400">
              Admin Accounts
            </p>

            <h2 className="text-3xl font-bold text-yellow-400 mt-2">
              {
                users.filter(
                  (user) => user.role === "admin"
                ).length
              }
            </h2>
          </div>

        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl p-4 mb-6">
            {error}
          </div>
        )}

        {/* Users Table */}
        <div className="bg-[#111827] border border-gray-800 rounded-2xl overflow-hidden">

          <div className="p-6 border-b border-gray-800">

            <h2 className="text-2xl font-bold text-yellow-400">
              Registered Users
            </h2>

          </div>

          {loading ? (
            <div className="text-center py-16 text-gray-400">
              Loading users...
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-16">

              <div className="text-5xl">
                👤
              </div>

              <p className="text-gray-400 mt-4">
                No users found
              </p>

            </div>
          ) : (
            <div className="overflow-x-auto">

              <table className="w-full min-w-[850px]">

                <thead>
                  <tr className="border-b border-gray-700 text-gray-400 text-sm">

                    <th className="text-left px-6 py-4">
                      #
                    </th>

                    <th className="text-left px-6 py-4">
                      User
                    </th>

                    <th className="text-left px-6 py-4">
                      Email
                    </th>

                    <th className="text-left px-6 py-4">
                      Role
                    </th>

                    <th className="text-left px-6 py-4">
                      Wallet
                    </th>

                    <th className="text-left px-6 py-4">
                      Joined
                    </th>

                  </tr>
                </thead>

                <tbody>

                  {users.map((user, index) => (

                    <tr
                      key={user._id}
                      className="border-b border-gray-800 hover:bg-[#1F2937] transition"
                    >

                      <td className="px-6 py-5 text-gray-500">
                        {index + 1}
                      </td>

                      <td className="px-6 py-5">

                        <div className="font-bold">
                          {user.name || "User"}
                        </div>

                        <div className="text-xs text-gray-500 mt-1">
                          ID: {user._id}
                        </div>

                      </td>

                      <td className="px-6 py-5 text-gray-300">
                        {user.email || "-"}
                      </td>

                      <td className="px-6 py-5">

                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold ${
                            user.role === "admin"
                              ? "bg-yellow-500/20 text-yellow-400"
                              : "bg-blue-500/20 text-blue-400"
                          }`}
                        >
                          {user.role || "user"}
                        </span>

                      </td>

                      <td className="px-6 py-5">

                        <span className="text-green-400 font-bold">
                          ₹
                          {Number(
                            user.walletBalance || 0
                          ).toFixed(2)}
                        </span>

                      </td>

                      <td className="px-6 py-5 text-gray-400 text-sm">
                        {formatDate(user.createdAt)}
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