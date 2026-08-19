import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import connectDB from "../../lib/db";
import User from "../../models/User";

export async function POST(request) {
  try {
    const setupKey = request.headers.get("x-setup-key");

    if (!setupKey || !process.env.ADMIN_SETUP_KEY || setupKey !== process.env.ADMIN_SETUP_KEY) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    // This endpoint is intentionally one-time. Once an admin exists, use the
    // normal admin account/password reset process instead of this setup route.
    const existingAdmin = await User.exists({ role: "admin" });
    if (existingAdmin) {
      return NextResponse.json({ success: false, message: "Admin setup is already completed" }, { status: 410 });
    }

    const email = String(process.env.ADMIN_EMAIL || "").trim().toLowerCase();
    const password = String(process.env.ADMIN_PASSWORD || "");

    if (!email || !password || password.length < 12) {
      return NextResponse.json({ success: false, message: "Admin setup credentials are not configured securely" }, { status: 503 });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
      name: "CoinFlip Admin",
      email,
      password: hashedPassword,
      walletBalance: 0,
      role: "admin",
    });

    return NextResponse.json({
      success: true,
      message: "Admin account created successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    }, { status: 201 });
  } catch (error) {
    console.error("Setup Admin Error:", error);
    return NextResponse.json({ success: false, message: "Unable to setup admin" }, { status: 500 });
  }
}
