import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    bookingCode: { type: String, required: true, unique: true, trim: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    slotId: { type: mongoose.Schema.Types.ObjectId, ref: "Slot", required: true },
    vehicleType: { type: String, enum: ["car", "bike"], required: true },
    appointmentType: { type: String, enum: ["new", "followup", "urgent", "lab"], default: "new" },
    vehicleNo: { type: String, required: true, trim: true },
    date: { type: String, required: true },
    time: { type: String, required: true },
    duration: { type: Number, required: true, min: 1 },
    subtotal: { type: Number, required: true },
    serviceCharge: { type: Number, required: true },
    total: { type: Number, required: true },
    paymentMethod: { type: String, enum: ["upi", "card", "cash"], required: true },
    startAt: { type: Number, required: true },
    endAt: { type: Number, required: true },
    status: { type: String, enum: ["upcoming", "active", "completed", "cancelled"], default: "upcoming" },
  },
  { timestamps: true },
);

export const Booking = mongoose.model("Booking", bookingSchema);
