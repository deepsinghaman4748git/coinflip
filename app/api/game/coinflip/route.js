import crypto from "crypto";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import connectDB from "../../../lib/db";
import mongoose from "mongoose";
import User from "../../../models/User";
import Transaction from "../../../models/Transaction";
import Game from "../../../models/Game";
import GameSettings from "../../../models/GameSettings";

const MAX_PAYOUT_MULTIPLIER = 10;

export async function POST(request) {
  let session;

  try {
    const token = request.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.json({ success: false, message: "Please login first" }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded.userId) {
      return NextResponse.json({ success: false, message: "Invalid authentication" }, { status: 401 });
    }

    const body = await request.json();
    const prediction = body.prediction;
    const entryFee = Number(body.entryFee);

    if (!["heads", "tails"].includes(prediction)) {
      return NextResponse.json({ success: false, message: "Invalid prediction" }, { status: 400 });
    }

    if (!Number.isFinite(entryFee) || entryFee <= 0) {
      return NextResponse.json({ success: false, message: "Invalid entry fee" }, { status: 400 });
    }

    await connectDB();

    const settings = await GameSettings.findOne();

    if (!settings) {
      return NextResponse.json({ success: false, message: "Game settings are not configured" }, { status: 503 });
    }

    const minBet = Number(settings.minBet ?? 10);
    const maxBet = Number(settings.maxBet ?? 10000);
    const payoutMultiplier = Number(settings.payoutMultiplier ?? 2);

    if (!Number.isFinite(minBet) || !Number.isFinite(maxBet) || minBet <= 0 || maxBet < minBet) {
      return NextResponse.json({ success: false, message: "Invalid game limits" }, { status: 500 });
    }

    if (!Number.isFinite(payoutMultiplier) || payoutMultiplier < 1 || payoutMultiplier > MAX_PAYOUT_MULTIPLIER) {
      return NextResponse.json({ success: false, message: "Invalid payout configuration" }, { status: 500 });
    }

    if (!settings.CoinFlipEnabled) {
      return NextResponse.json({ success: false, message: "CoinFlip game is currently disabled." }, { status: 403 });
    }

    if (settings.maintenanceMode) {
      return NextResponse.json({ success: false, message: "CoinFlip is currently under maintenance. Please try again later." }, { status: 503 });
    }

    if (entryFee < minBet) {
      return NextResponse.json({ success: false, message: `Minimum entry fee is ₹${minBet}` }, { status: 400 });
    }

    if (entryFee > maxBet) {
      return NextResponse.json({ success: false, message: `Maximum entry fee is ₹${maxBet}` }, { status: 400 });
    }

    const result = crypto.randomInt(0, 2) === 0 ? "heads" : "tails";
    const won = prediction === result;
    const winAmount = won ? entryFee * payoutMultiplier : 0;

    session = await mongoose.startSession();
    session.startTransaction();

    const users = await User.findOneAndUpdate(
      { _id: decoded.userId, walletBalance: { $gte: entryFee } },
      { $inc: { walletBalance: won ? winAmount - entryFee : -entryFee } },
      { new: true, session }
    );

    if (!users) {
      await session.abortTransaction();
      return NextResponse.json({ success: false, message: "Insufficient wallet balance" }, { status: 400 });
    }

    const [game] = await Game.create([{
      user: decoded.userId,
      gameType: "CoinFlip",
      prediction,
      result,
      entryFee,
      winAmount,
      status: won ? "won" : "lost",
    }], { session });

    await Transaction.create([{
      user: decoded.userId,
      type: "game_entry",
      amount: entryFee,
      status: "completed",
      paymentMethod: "wallet",
      note: "CoinFlip game entry",
    }], { session });

    if (won) {
      await Transaction.create([{
        user: decoded.userId,
        type: "game_win",
        amount: winAmount,
        status: "completed",
        paymentMethod: "wallet",
        note: "CoinFlip winning payout",
      }], { session });
    }

    await session.commitTransaction();

    return NextResponse.json({
      success: true,
      message: won ? "Congratulations! You won." : "You lost this round.",
      game: {
        id: game._id,
        prediction,
        result,
        entryFee,
        winAmount,
        status: game.status,
      },
      walletBalance: users.walletBalance,
    }, { status: 201 });
  } catch (error) {
    if (session?.inTransaction()) {
      await session.abortTransaction().catch(() => {});
    }

    console.error("CoinFlip Game Error:", error);

    return NextResponse.json({ success: false, message: "Unable to play CoinFlip" }, { status: 500 });
  } finally {
    await session?.endSession();
  }
}
