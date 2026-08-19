import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import connectDB from "../../../lib/db";
import Game from "../../../models/Game";

export async function GET(request) {
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

    const games = await Game.find({
      user: decoded.userId,
    })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    return NextResponse.json({
      success: true,
      games,
    });
  } catch (error) {
    console.error("Game History Error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to load game history",
        error: error.message,
      },
      { status: 500 }
    );
  }
}