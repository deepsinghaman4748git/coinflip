import { NextResponse } from "next/server";
import connectDB from "../../../lib/db";
import GameSettings from "@/models/GameSettings";

export async function GET() {
  try {
    await connectDB();

    let settings = await GameSettings.findOne().lean();

    if (!settings) {
      settings = await GameSettings.create({});
      settings = settings.toObject();
    }

    return NextResponse.json(
      {
        success: true,
        settings: {
          CoinFlipEnabled:
            settings.CoinFlipEnabled !== false,

          maintenanceMode:
            settings.maintenanceMode === true,

          maintenanceMessage:
            settings.maintenanceMessage ||
            "Game is temporarily under maintenance. Please try again later.",

          minBet: Number(settings.minBet ?? 10),

          maxBet: Number(settings.maxBet ?? 10000),

          payoutMultiplier:
            Number(settings.payoutMultiplier ?? 2),
        },
      },
      {
        status: 200,
        headers: {
          "Cache-Control":
            "no-store, max-age=0",
        },
      }
    );
  } catch (error) {
    console.error(
      "Game Settings GET Error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Unable to load game settings",
      },
      { status: 500 }
    );
  }
}