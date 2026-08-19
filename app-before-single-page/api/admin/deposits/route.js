import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import connectDB from "../../../lib/db";
import Transaction from "../../../models/Transaction";

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

    await connectDB();

    // Temporary admin check.
    // User model ke role ko verify karenge.
    if (decoded.role !== "admin") {
      return NextResponse.json(
        {
          success: false,
          message: "Admin access required",
        },
        { status: 403 }
      );
    }

    const deposits = await Transaction.find({
      type: "deposit",
    })
      .populate("user", "name email")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      deposits,
    });
  } catch (error) {
    console.error("Admin Deposits Error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to load deposit requests",
        error: error.message,
      },
      { status: 500 }
    );
  }
}