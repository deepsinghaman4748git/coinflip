import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import connectDB from "../../../../lib/db";
import Transaction from "../../../../models/Transaction";
import User from "../../../../models/User";

export async function POST(request) {
  try {
    const token = request.cookies.get("token")?.value;
    if (!token) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

    let decoded;
    try { decoded = jwt.verify(token, process.env.JWT_SECRET); }
    catch { return NextResponse.json({ success: false, message: "Session expired" }, { status: 401 }); }
    if (decoded.role !== "admin") return NextResponse.json({ success: false, message: "Admin access required" }, { status: 403 });

    const { id } = await request.json();
    if (!id) return NextResponse.json({ success: false, message: "Withdrawal ID is required" }, { status: 400 });

    await connectDB();
    const session = await Transaction.startSession();
    try {
      let result;
      let walletBalance;
      await session.withTransaction(async () => {
        result = await Transaction.findOneAndUpdate(
          { _id: id, type: "withdraw", status: "pending" },
          { $set: { status: "rejected", processedBy: decoded.userId, adminNote: "Withdrawal rejected by admin - amount refunded to wallet" } },
          { new: true, session }
        );
        if (!result) {
          const existing = await Transaction.findOne({ _id: id, type: "withdraw" }).session(session);
          if (!existing) throw new Error("Withdrawal not found");
          throw new Error("This withdrawal has already been processed");
        }
        const user = await User.findByIdAndUpdate(
          result.user,
          { $inc: { walletBalance: Number(result.amount || 0) } },
          { new: true, session }
        );
        if (!user) throw new Error("User not found");
        walletBalance = user.walletBalance;
      });
      return NextResponse.json({ success: true, message: "Withdrawal rejected and amount refunded to wallet", withdrawal: result, walletBalance });
    } finally { await session.endSession(); }
  } catch (error) {
    console.error("Reject Withdrawal Error:", error);
    const message = ["Withdrawal not found", "This withdrawal has already been processed", "User not found"].includes(error.message) ? error.message : "Unable to reject withdrawal";
    return NextResponse.json({ success: false, message }, { status: message === "Unable to reject withdrawal" ? 500 : 400 });
  }
}
