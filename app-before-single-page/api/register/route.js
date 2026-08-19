import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import connectDB from "../../lib/db";
import User from "../../models/User";

export async function POST(request) {
  try {
    const body = await request.json();

    const { name, email, password } = body;

    // Validate fields
    if (!name || !email || !password) {
      return NextResponse.json(
        {
          success: false,
          message: "Name, email and password are required",
        },
        { status: 400 }
      );
    }

    // Password length
    if (password.length < 6) {
      return NextResponse.json(
        {
          success: false,
          message: "Password must be at least 6 characters",
        },
        { status: 400 }
      );
    }

    // Connect MongoDB
    await connectDB();

    // Check existing user
    const existingUser = await User.findOne({
      email: email.toLowerCase(),
    });

    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          message: "User already exists",
        },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      walletBalance: 0,
      role: "user",
    });

    return NextResponse.json(
      {
        success: true,
        message: "Registration successful",
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          walletBalance: user.walletBalance,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Register Error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Registration failed",
        error: error.message,
      },
      { status: 500 }
    );
  }
}