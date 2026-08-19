import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import connectDB from "../../../../lib/db";
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

    const { id } = await request.json();
    if (!id) return NextResponse.json({ success: false, message: "Withdrawal ID is required" }, { status: 400 });

    await connectDB();
    const withdrawal = await Transaction.findOneAndUpdate(
      { _id: id, type: "withdraw", status: "pending" },
      { $set: { status: "completed", processedBy: decoded.userId, adminNote: "Withdrawal approved by admin" } },
      { new: true }
    );

    if (!withdrawal) {
      const existing = await Transaction.findOne({ _id: id, type: "withdraw" });
      if (!existing) return NextResponse.json({ success: false, message: "Withdrawal not found" }, { status: 404 });
      return NextResponse.json({ success: false, message: "This withdrawal has already been processed" }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: "Withdrawal approved successfully", withdrawal });
  } catch (error) {
    console.error("Approve Withdrawal Error:", error);
    return NextResponse.json({ success: false, message: "Unable to approve withdrawal" }, { status: 500 });
  }
}
