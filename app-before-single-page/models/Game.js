import mongoose from "mongoose";

const GameSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    gameType: {
      type: String,
      enum: ["CoinFlip"],
      required: true,
    },

    prediction: {
      type: String,
      enum: ["heads", "tails"],
      required: true,
    },

    result: {
      type: String,
      enum: ["heads", "tails"],
      required: true,
    },

    entryFee: {
      type: Number,
      required: true,
      min: 0,
    },

    winAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    status: {
      type: String,
      enum: ["won", "lost"],
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Game ||
  mongoose.model("Game", GameSchema);
