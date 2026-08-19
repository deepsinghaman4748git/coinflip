import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import connectDB from "../../../lib/db";
import GameSettings from "@/models/GameSettings";

const MAX_PAYOUT_MULTIPLIER = 10;

async function checkAuth(request) {
  try {
    const token = request.cookies.get("token")?.value;
    if (!token) return null;
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return null;
  }
}

function publicSettings(settings) {
  return {
    CoinFlipEnabled: Boolean(settings.CoinFlipEnabled),
    maintenanceMode: Boolean(settings.maintenanceMode),
    maintenanceMessage: String(settings.maintenanceMessage || ""),
    minBet: Number(settings.minBet ?? 10),
    maxBet: Number(settings.maxBet ?? 10000),
    payoutMultiplier: Number(settings.payoutMultiplier ?? 2),
  };
}

export async function GET(request) {
  try {
    const decoded = await checkAuth(request);

    if (!decoded) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    let settings = await GameSettings.findOne().lean();

    if (!settings) {
      settings = await GameSettings.create({});
      settings = settings.toObject();
    }

    // Players only receive settings required to render/play the game.
    if (decoded.role !== "admin") {
      return NextResponse.json({ success: true, settings: publicSettings(settings) });
    }

    return NextResponse.json({ success: true, settings });
  } catch (error) {
    console.error("Settings GET Error:", error);
    return NextResponse.json({ success: false, message: "Unable to load settings" }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const decoded = await checkAuth(request);

    if (!decoded || decoded.role !== "admin") {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
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

    if (!Number.isFinite(minBet) || minBet < 1 || !Number.isFinite(maxBet) || maxBet < minBet) {
      return NextResponse.json({ success: false, message: "Invalid bet limits" }, { status: 400 });
    }

    if (!Number.isFinite(payoutMultiplier) || payoutMultiplier < 1 || payoutMultiplier > MAX_PAYOUT_MULTIPLIER) {
      return NextResponse.json({ success: false, message: `Payout multiplier must be between 1 and ${MAX_PAYOUT_MULTIPLIER}` }, { status: 400 });
    }

    if (!Number.isFinite(minDeposit) || minDeposit < 1 || !Number.isFinite(maxDeposit) || maxDeposit < minDeposit) {
      return NextResponse.json({ success: false, message: "Invalid deposit limits" }, { status: 400 });
    }

    if (!Number.isFinite(minWithdrawal) || minWithdrawal < 1 || !Number.isFinite(maxWithdrawal) || maxWithdrawal < minWithdrawal) {
      return NextResponse.json({ success: false, message: "Invalid withdrawal limits" }, { status: 400 });
    }

    const settings = await GameSettings.findOneAndUpdate(
      {},
      {
        CoinFlipEnabled: body.CoinFlipEnabled !== false,
        maintenanceMode: body.maintenanceMode === true,
        maintenanceMessage: String(body.maintenanceMessage || "Game is temporarily under maintenance. Please try again later."),
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
        depositInstructions: String(body.depositInstructions || "Pay using the provided UPI QR and submit your UTR number."),
        withdrawalEnabled: body.withdrawalEnabled !== false,
        manualWithdrawalApproval: body.manualWithdrawalApproval !== false,
        withdrawalMessage: String(body.withdrawalMessage || "Withdrawal requests are processed manually."),
        announcementEnabled: body.announcementEnabled === true,
        announcement: String(body.announcement || ""),
        supportContact: String(body.supportContact || ""),
        supportLink: String(body.supportLink || ""),
      },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    return NextResponse.json({ success: true, message: "Settings saved successfully", settings });
  } catch (error) {
    console.error("Admin Settings PUT Error:", error);
    return NextResponse.json({ success: false, message: "Unable to save settings" }, { status: 500 });
  }
}
