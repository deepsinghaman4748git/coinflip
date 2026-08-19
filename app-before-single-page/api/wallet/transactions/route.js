import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import connectDB from "../../../lib/db";
import Transaction from "../../../models/Transaction";

export async function GET(request) {
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

    await connectDB();

    // Get user's transactions
    const transactions = await Transaction.find({
      user: decoded.userId,
    })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    return NextResponse.json(
      {
        success: true,
        transactions,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Transaction API Error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to load transactions",
        error: error.message,
      },
      { status: 500 }
    );
  }
}