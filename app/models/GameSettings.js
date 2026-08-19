import mongoose from "mongoose";

const gameSettingsSchema = new mongoose.Schema(
  {
    // Game
    CoinFlipEnabled: {
      type: Boolean,
      default: true,
    },

    maintenanceMode: {
      type: Boolean,
      default: false,
    },

    maintenanceMessage: {
      type: String,
      default: "Game is temporarily under maintenance. Please try again later.",
    },

    // Betting
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

    // Wallet
    minDeposit: {
      type: Number,
      default: 10,
    },

    maxDeposit: {
      type: Number,
      default: 50000,
    },

    minWithdrawal: {
      type: Number,
      default: 100,
    },

    maxWithdrawal: {
      type: Number,
      default: 50000,
    },

    // Deposit
    depositEnabled: {
      type: Boolean,
      default: true,
    },

    upiId: {
      type: String,
      default: "",
    },

    qrCode: {
      type: String,
      default: "",
    },

    depositInstructions: {
      type: String,
      default: "Pay using the provided UPI QR and submit your UTR number.",
    },

    // Withdrawal
    withdrawalEnabled: {
      type: Boolean,
      default: true,
    },

    manualWithdrawalApproval: {
      type: Boolean,
      default: true,
    },

    withdrawalMessage: {
      type: String,
      default: "Withdrawal requests are processed manually.",
    },

    // Website
    announcementEnabled: {
      type: Boolean,
      default: false,
    },

    announcement: {
      type: String,
      default: "",
    },

    supportContact: {
      type: String,
      default: "",
    },

    supportLink: {
      type: String,
      default: "",
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

