import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import connectDB from "../../lib/db";
import User from "../../models/User";

export async function GET(request) {
  try {
    const token = request.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          message: "Not authenticated",
        },
        { status: 401 }
      );
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    await connectDB();

    const user = await User.findById(decoded.userId).select(
      "-password"
    );

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "User not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        walletBalance: user.walletBalance,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Me API Error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Invalid or expired session",
      },
      { status: 401 }
    );
  }
}