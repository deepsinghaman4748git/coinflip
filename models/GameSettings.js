import mongoose from "mongoose";

const gameSettingsSchema = new mongoose.Schema(
  {
    CoinFlipEnabled: {
      type: Boolean,
      default: true,
    },

    maintenanceMode: {
      type: Boolean,
      default: false,
    },

    minBet: {
      type: Number,
      default: 10,
    },

    maxBet: {
      type: Number,
      default: 10000,
    },

    payoutMultiplier: {
      type: Number,
      default: 2,
    },
  },
  {
    timestamps: true,
  }
);

const GameSettings =
  mongoose.models.GameSettings ||
  mongoose.model("GameSettings", gameSettingsSchema);

export default GameSettings;
