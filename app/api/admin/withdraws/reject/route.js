import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import connectDB from "../../../../lib/db";
import Transaction from "../../../../models/Transaction";
import User from "../../../../models/User";

export async function POST(request) {
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

    let decoded;

    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
      return NextResponse.json(
        {
          success: false,
          message: "Session expired",
        },
        { status: 401 }
      );
    }

    if (decoded.role !== "admin") {
      return NextResponse.json(
        {
          success: false,
          message: "Admin access required",
        },
        { status: 403 }
      );
    }

    const { id } = await request.json();

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message: "Withdrawal ID is required",
        },
        { status: 400 }
      );
    }

    await connectDB();

    const withdrawal = await Transaction.findOne({
      _id: id,
      type: "withdraw",
    });

    if (!withdrawal) {
      return NextResponse.json(
        {
          success: false,
          message: "Withdrawal not found",
        },
        { status: 404 }
      );
    }

    if (withdrawal.status !== "pending") {
      return NextResponse.json(
        {
          success: false,
          message: "This withdrawal has already been processed",
        },
        { status: 400 }
      );
    }

    // Refund reserved amount
    const user = await User.findById(withdrawal.user);

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "User not found",
        },
        { status: 404 }
      );
    }

    user.walletBalance =
      Number(user.walletBalance || 0) +
      Number(withdrawal.amount || 0);

    await user.save();

    withdrawal.status = "rejected";
    withdrawal.processedBy = decoded.userId;
    withdrawal.adminNote =
      "Withdrawal rejected by admin - amount refunded to wallet";

    await withdrawal.save();

    return NextResponse.json({
      success: true,
      message:
        "Withdrawal rejected and amount refunded to wallet",
      withdrawal,
      walletBalance: user.walletBalance,
    });
  } catch (error) {
    console.error("Reject Withdrawal Error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to reject withdrawal",
        error: error.message,
      },
      { status: 500 }
    );
  }
}