import mongoose from "mongoose";

const slotSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, trim: true },
    name: { type: String, required: true, trim: true },
    address: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    floor: { type: String, required: true, trim: true },
    distanceKm: { type: Number, default: 0, min: 0 },
    total: { type: Number, required: true, min: 1 },
    free: { type: Number, required: true, min: 0 },
    pricePerHour: { type: Number, required: true, min: 1 },
  },
  { timestamps: true },
);

export const Slot = mongoose.model("Slot", slotSchema);
