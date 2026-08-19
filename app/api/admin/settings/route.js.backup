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

    return jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return null;
  }
}

export async function GET(request) {
  try {
    const decoded = await checkAdmin(request);

    if (!decoded || decoded.role !== "admin") {
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

    if (!decoded || decoded.role !== "admin") {
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
    const payoutMultiplier = Number(body.payoutMultiplier);

    const minDeposit = Number(body.minDeposit);
    const maxDeposit = Number(body.maxDeposit);
    const minWithdrawal = Number(body.minWithdrawal);
    const maxWithdrawal = Number(body.maxWithdrawal);

    if (!Number.isFinite(minBet) || minBet < 1) {
      return NextResponse.json(
        { success: false, message: "Minimum bet must be at least ₹1" },
        { status: 400 }
      );
    }

    if (!Number.isFinite(maxBet) || maxBet < minBet) {
      return NextResponse.json(
        {
          success: false,
          message: "Maximum bet must be greater than minimum bet",
        },
        { status: 400 }
      );
    }

    if (!Number.isFinite(payoutMultiplier) || payoutMultiplier < 1) {
      return NextResponse.json(
        {
          success: false,
          message: "Payout multiplier must be at least 1",
        },
        { status: 400 }
      );
    }

    if (!Number.isFinite(minDeposit) || minDeposit < 1) {
      return NextResponse.json(
        {
          success: false,
          message: "Minimum deposit must be at least ₹1",
        },
        { status: 400 }
      );
    }

    if (!Number.isFinite(maxDeposit) || maxDeposit < minDeposit) {
      return NextResponse.json(
        {
          success: false,
          message: "Maximum deposit must be greater than minimum deposit",
        },
        { status: 400 }
      );
    }

    if (!Number.isFinite(minWithdrawal) || minWithdrawal < 1) {
      return NextResponse.json(
        {
          success: false,
          message: "Minimum withdrawal must be at least ₹1",
        },
        { status: 400 }
      );
    }

    if (
      !Number.isFinite(maxWithdrawal) ||
      maxWithdrawal < minWithdrawal
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Maximum withdrawal must be greater than minimum withdrawal",
        },
        { status: 400 }
      );
    }

    const settings = await GameSettings.findOneAndUpdate(
      {},
      {
        CoinFlipEnabled: body.CoinFlipEnabled !== false,
        maintenanceMode: body.maintenanceMode === true,

        maintenanceMessage:
          body.maintenanceMessage ||
          "Game is temporarily under maintenance. Please try again later.",

        minBet,
        maxBet,
        payoutMultiplier,

        minDeposit,
        maxDeposit,
        minWithdrawal,
        maxWithdrawal,

        depositEnabled: body.depositEnabled !== false,

        upiId: String(body.upiId || ""),
        qrCode: String(body.qrCode || ""),
        depositInstructions: String(
          body.depositInstructions ||
            "Pay using the provided UPI QR and submit your UTR number."
        ),

        withdrawalEnabled: body.withdrawalEnabled !== false,

        manualWithdrawalApproval:
          body.manualWithdrawalApproval !== false,

        withdrawalMessage: String(
          body.withdrawalMessage ||
            "Withdrawal requests are processed manually."
        ),

        announcementEnabled:
          body.announcementEnabled === true,

        announcement: String(body.announcement || ""),

        supportContact: String(body.supportContact || ""),
        supportLink: String(body.supportLink || ""),
      },
      {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true,
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
        error: error.message,
      },
      { status: 500 }
    );
  }
}

