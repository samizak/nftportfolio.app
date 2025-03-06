import mongoose from "mongoose";

const eventSchema = new mongoose.Schema({
  id: { type: String, required: true },
  walletAddress: { type: String, required: true, index: true },
  event_type: String,
  created_date: String,
  transaction: mongoose.Schema.Types.Mixed,
  nft: {
    display_image_url: String,
    identifier: String,
    name: String,
    image_url: String,
    collection: String,
    contract: String,
  },
  payment: {
    quantity: String,
    token_address: String,
    decimals: String,
    symbol: String,
  },
  from_account: {
    address: String,
    user: {
      username: String,
    },
  },
  to_account: {
    address: String,
    user: {
      username: String,
    },
  },
  quantity: Number,
  timestamp: Date,
  updatedAt: { type: Date, default: Date.now },
});

// Create compound indexes for efficient querying
eventSchema.index({ walletAddress: 1, timestamp: -1 });
// Create a compound unique index on both id and walletAddress
eventSchema.index({ id: 1, walletAddress: 1 }, { unique: true });

mongoose.set("strictQuery", false);

const Event = mongoose.models.Event || mongoose.model("Event", eventSchema);

export default Event;
