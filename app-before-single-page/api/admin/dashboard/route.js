import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import connectDB from "../../../lib/db";
import User from "../../../models/User";
import Transaction from "../../../models/Transaction";
import Game from "../../../models/Game";

export async function GET(request) {
  try {
    const token = request.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 }
      );
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    if (decoded.role !== "admin") {
      return NextResponse.json(
        {
          success: false,
          message: "Admin access required",
        },
        { status: 403 }
      );
    }

    await connectDB();

    // Total users
    const totalUsers = await User.countDocuments();

    // Total deposits
    const depositResult = await Transaction.aggregate([
      {
        $match: {
          type: "deposit",
          status: "completed",
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$amount" },
        },
      },
    ]);

    // Total withdrawals
    const withdrawResult = await Transaction.aggregate([
      {
        $match: {
          type: "withdraw",
          status: "approved",
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$amount" },
        },
      },
    ]);

    // Total games
    const totalGames = await Game.countDocuments();

    // Recent deposits
    const recentDeposits = await Transaction.find({
      type: "deposit",
    })
      .populate("user", "name email")
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    return NextResponse.json({
      success: true,

      stats: {
        users: totalUsers,
        deposits: depositResult[0]?.total || 0,
        withdraws: withdrawResult[0]?.total || 0,
        games: totalGames,
      },

      recentDeposits,
    });
  } catch (error) {
    console.error("Admin Dashboard Error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to load dashboard",
        error: error.message,
      },
      { status: 500 }
    );
  }
}