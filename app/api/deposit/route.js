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
    const utr = body.utr?.trim() || "";

    if (!amount || amount <= 0) {
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
          message: "Minimum deposit amount is ₹10",
        },
        { status: 400 }
      );
    }

    await connectDB();

    const user = await User.findById(decoded.userId);

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "User not found",
        },
        { status: 404 }
      );
    }

    const transaction = await Transaction.create({
      user: user._id,
      type: "deposit",
      amount,
      status: "pending",
      paymentMethod: "manual",
      utr,
      note: "Deposit request submitted by user",
    });

    return NextResponse.json(
      {
        success: true,
        message:
          "Deposit request submitted successfully. Waiting for admin approval.",
        transaction: {
          id: transaction._id,
          amount: transaction.amount,
          status: transaction.status,
          type: transaction.type,
          createdAt: transaction.createdAt,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Deposit Error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to create deposit request",
        error: error.message,
      },
      { status: 500 }
    );
  }
}