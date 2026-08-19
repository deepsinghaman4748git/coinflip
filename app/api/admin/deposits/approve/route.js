import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import connectDB from "../../../../lib/db";
import User from "../../../../models/User";
import Transaction from "../../../../models/Transaction";

export async function POST(request) {
  try {
    const token = request.cookies.get("token")?.value;
    if (!token) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
      return NextResponse.json({ success: false, message: "Session expired" }, { status: 401 });
    }
    if (decoded.role !== "admin") return NextResponse.json({ success: false, message: "Admin access required" }, { status: 403 });

    const { transactionId } = await request.json();
    if (!transactionId) return NextResponse.json({ success: false, message: "Transaction ID is required" }, { status: 400 });

    await connectDB();
    const session = await Transaction.startSession();

    try {
      let walletBalance;
      await session.withTransaction(async () => {
        const transaction = await Transaction.findOneAndUpdate(
          { _id: transactionId, type: "deposit", status: "pending" },
          { $set: { status: "approved", processedBy: decoded.userId } },
          { new: true, session }
        );

        if (!transaction) {
          const existing = await Transaction.findById(transactionId).session(session);
          if (!existing) throw new Error("Deposit request not found");
          throw new Error("This deposit has already been processed");
        }

        const user = await User.findByIdAndUpdate(
          transaction.user,
          { $inc: { walletBalance: Number(transaction.amount) } },
          { new: true, session }
        );

        if (!user) throw new Error("User not found");
        walletBalance = user.walletBalance;
      });

      return NextResponse.json({ success: true, message: "Deposit approved and wallet updated", walletBalance });
    } finally {
      await session.endSession();
    }
  } catch (error) {
    console.error("Approve Deposit Error:", error);
    const message = ["Deposit request not found", "This deposit has already been processed", "User not found"].includes(error.message)
      ? error.message
      : "Unable to approve deposit";
    return NextResponse.json({ success: false, message }, { status: message === "Unable to approve deposit" ? 500 : 400 });
  }
}
