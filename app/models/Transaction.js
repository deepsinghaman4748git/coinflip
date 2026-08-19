import mongoose from "mongoose";

const TransactionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: ["deposit", "withdraw", "game_entry", "game_win", "game_loss", "refund"],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "completed"],
      default: "pending",
    },
    paymentMethod: {
      type: String,
      default: "manual",
      trim: true,
    },
    utr: {
      type: String,
      default: "",
      trim: true,
    },
    upiId: {
      type: String,
      default: "",
      trim: true,
    },
    note: {
      type: String,
      default: "",
      trim: true,
    },
    processedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    adminNote: {
      type: String,
      default: "",
      trim: true,
    },
  },
  { timestamps: true }
);

// A real UTR may only be used once. Empty UTRs are excluded so other
// transaction types/legacy rows with no UTR do not conflict.
TransactionSchema.index(
  { utr: 1 },
  {
    unique: true,
    partialFilterExpression: {
      utr: { $type: "string", $ne: "" },
    },
  }
);

export default mongoose.models.Transaction ||
  mongoose.model("Transaction", TransactionSchema);
