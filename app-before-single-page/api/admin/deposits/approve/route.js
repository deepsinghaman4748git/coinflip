import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import connectDB from "../../../../lib/db";
import User from "../../../../models/User";
import Transaction from "../../../../models/Transaction";

export async function POST(request) {
  try {
    const token = request.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    if (decoded.role !== "admin") {
      return NextResponse.json(
        { success: false, message: "Admin access required" },
        { status: 403 }
      );
    }

    const { transactionId } = await request.json();

    if (!transactionId) {
      return NextResponse.json(
        { success: false, message: "Transaction ID is required" },
        { status: 400 }
      );
    }

    await connectDB();

    const transaction = await Transaction.findOne({
      _id: transactionId,
      type: "deposit",
    });

    if (!transaction) {
      return NextResponse.json(
        { success: false, message: "Deposit request not found" },
        { status: 404 }
      );
    }

    if (transaction.status !== "pending") {
      return NextResponse.json(
        {
          success: false,
          message: "This deposit has already been processed",
        },
        { status: 400 }
      );
    }

    const user = await User.findById(transaction.user);

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    user.walletBalance =
      Number(user.walletBalance || 0) +
      Number(transaction.amount);

    transaction.status = "approved";

    await user.save();
    await transaction.save();

    return NextResponse.json({
      success: true,
      message: "Deposit approved and wallet updated",
      walletBalance: user.walletBalance,
    });
  } catch (error) {
    console.error("Approve Deposit Error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to approve deposit",
        error: error.message,
      },
      { status: 500 }
    );
  }
}