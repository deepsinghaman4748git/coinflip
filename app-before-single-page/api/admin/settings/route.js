import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import connectDB from "../../../lib/db";
import GameSettings from "@/models/GameSettings";

async function checkAdmin(request) {
  try {
    const token = request.cookies.get("token")?.value;

    if (!token) {
      return null;
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    return decoded;
  } catch (error) {
    return null;
  }
}

export async function GET(request) {
  try {
    const decoded = await checkAdmin(request);

    if (!decoded) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 }
      );
    }

    await connectDB();

    let settings = await GameSettings.findOne();

    if (!settings) {
      settings = await GameSettings.create({});
    }

    return NextResponse.json({
      success: true,
      settings,
    });
  } catch (error) {
    console.error("Admin Settings GET Error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to load settings",
      },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    const decoded = await checkAdmin(request);

    if (!decoded) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 }
      );
    }

    await connectDB();

    const body = await request.json();

    const minBet = Number(body.minBet);
    const maxBet = Number(body.maxBet);
    const payoutMultiplier = Number(
      body.payoutMultiplier
    );

    if (
      !Number.isFinite(minBet) ||
      minBet < 1
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid minimum bet",
        },
        { status: 400 }
      );
    }

    if (
      !Number.isFinite(maxBet) ||
      maxBet < minBet
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Maximum bet must be greater than minimum bet",
        },
        { status: 400 }
      );
    }

    if (
      !Number.isFinite(payoutMultiplier) ||
      payoutMultiplier < 1
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid payout multiplier",
        },
        { status: 400 }
      );
    }

    const settings =
      await GameSettings.findOneAndUpdate(
        {},
        {
          CoinFlipEnabled:
            body.CoinFlipEnabled !== false,

          maintenanceMode:
            body.maintenanceMode === true,

          minBet,
          maxBet,
          payoutMultiplier,
        },
        {
          new: true,
          upsert: true,
        }
      );

    return NextResponse.json({
      success: true,
      message: "Settings saved successfully",
      settings,
    });
  } catch (error) {
    console.error("Admin Settings PUT Error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to save settings",
      },
      { status: 500 }
    );
  }
}



