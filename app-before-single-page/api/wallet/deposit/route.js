import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import connectDB from "../../../lib/db";
import User from "../../../models/User";
import Transaction from "../../../models/Transaction";

export async function POST(request) {
  try {
    // Check login token
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

    // Verify token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    if (!decoded.userId) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid authentication",
        },
        { status: 401 }
      );
    }

    const body = await request.json();

    const {
      amount,
      utr,
      upiId,
      note,
    } = body;

    // Validate amount
    const depositAmount = Number(amount);

    if (!depositAmount || depositAmount <= 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Please enter a valid amount",
        },
        { status: 400 }
      );
    }

    // Minimum deposit
    if (depositAmount < 10) {
      return NextResponse.json(
        {
          success: false,
          message: "Minimum deposit amount is ₹10",
        },
        { status: 400 }
      );
    }

    await connectDB();

    // Check user
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

    // Create pending transaction
    const transaction = await Transaction.create({
      user: user._id,
      type: "deposit",
      amount: depositAmount,
      status: "pending",
      paymentMethod: "manual",
      utr: utr?.trim() || "",
      upiId: upiId?.trim() || "",
      note: note?.trim() || "",
    });

    return NextResponse.json(
      {
        success: true,
        message: "Deposit request submitted successfully",
        transaction: {
          id: transaction._id,
          amount: transaction.amount,
          status: transaction.status,
          utr: transaction.utr,
          createdAt: transaction.createdAt,
        },
      },
      { status: 201 }
    );

  } catch (error) {
    console.error("Deposit Request Error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to submit deposit request",
        error: error.message,
      },
      { status: 500 }
    );
  }
}