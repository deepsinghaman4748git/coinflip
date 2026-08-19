import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import connectDB from "../../lib/db";
import User from "../../models/User";
import Transaction from "../../models/Transaction";

export async function POST(request) {
  try {
    const token = request.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          message: "Please login first",
        },
        { status: 401 }
      );
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    const body = await request.json();

    const amount = Number(body.amount);
    const upiId = body.upiId?.trim() || "";

    if (!Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Please enter a valid amount",
        },
        { status: 400 }
      );
    }

    if (amount < 10) {
      return NextResponse.json(
        {
          success: false,
          message: "Minimum withdrawal amount is ₹10",
        },
        { status: 400 }
      );
    }

    if (!upiId) {
      return NextResponse.json(
        {
          success: false,
          message: "UPI ID is required",
        },
        { status: 400 }
      );
    }

    await connectDB();

    // Check pending withdrawal first
    const pendingWithdrawal = await Transaction.findOne({
      user: decoded.userId,
      type: "withdraw",
      status: "pending",
    });

    if (pendingWithdrawal) {
      return NextResponse.json(
        {
          success: false,
          message:
            "You already have a pending withdrawal request",
        },
        { status: 400 }
      );
    }

    // Atomically deduct wallet balance
    const user = await User.findOneAndUpdate(
      {
        _id: decoded.userId,
        walletBalance: { $gte: amount },
      },
      {
        $inc: {
          walletBalance: -amount,
        },
      },
      {
        new: true,
      }
    );

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Insufficient wallet balance",
        },
        { status: 400 }
      );
    }

    // Create withdrawal transaction
    const transaction = await Transaction.create({
      user: user._id,
      type: "withdraw",
      amount,
      status: "pending",
      paymentMethod: "UPI",
      upiId,
      note: "Withdrawal request submitted by user",
    });

    return NextResponse.json(
      {
        success: true,
        message:
          "Withdrawal request submitted successfully. Waiting for admin approval.",
        transaction: {
          id: transaction._id,
          amount: transaction.amount,
          status: transaction.status,
          type: transaction.type,
          upiId: transaction.upiId,
          createdAt: transaction.createdAt,
        },
        walletBalance: user.walletBalance,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Withdrawal Error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to create withdrawal request",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
