import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import connectDB from "../../../lib/db";
import User from "../../../models/User";

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

    const users = await User.find({})
      .select("-password")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      users,
    });
  } catch (error) {
    console.error("Admin Users Error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to load users",
        error: error.message,
      },
      { status: 500 }
    );
  }
}