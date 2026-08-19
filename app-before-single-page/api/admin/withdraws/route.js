import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import connectDB from "../../../lib/db";
import Transaction from "../../../models/Transaction";

export async function GET(request) {
  try {
    const token = request.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.role !== "admin") {
      return NextResponse.json(
        { success: false, message: "Admin access required" },
        { status: 403 }
      );
    }

    await connectDB();

    const withdrawals = await Transaction.find({
      type: "withdraw",
    })
      .populate("user", "name email walletBalance")
      .sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      withdrawals,
    });
  } catch (error) {
    console.error("Admin Withdraw List Error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to load withdrawals",
        error: error.message,
      },
      { status: 500 }
    );
  }
}