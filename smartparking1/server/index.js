import bcrypt from "bcryptjs";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

import { requireAdmin, requireAuth } from "./middleware/auth.js";
import { Booking } from "./models/Booking.js";
import { Slot } from "./models/Slot.js";
import { User } from "./models/User.js";

dotenv.config();

if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = "dev-secret-change-me";
  console.warn("JWT_SECRET missing. Using development fallback secret.");
}

const app = express();
const PORT = Number(process.env.PORT || 5000);
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/smartparking";

app.use(cors());
app.use(express.json());

function signToken(user) {
  return jwt.sign({ sub: user._id.toString(), role: user.role }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });
}

function bookingStatus(booking) {
  if (booking.status === "cancelled") return "cancelled";
  const now = Date.now();
  if (now >= booking.startAt && now <= booking.endAt) return "active";
  if (now > booking.endAt) return "completed";
  return "upcoming";
}

function serializeBooking(booking) {
  return {
    id: booking.bookingCode,
    slotId: booking.slotId?._id?.toString() || booking.slotId?.toString(),
    slotName: booking.slotId?.name,
    slotAddress: booking.slotId?.address,
    floor: booking.slotId?.floor,
    vehicleType: booking.vehicleType,
    appointmentType: booking.appointmentType || "new",
    vehicleNo: booking.vehicleNo,
    date: booking.date,
    time: booking.time,
    duration: booking.duration,
    subtotal: booking.subtotal,
    serviceCharge: booking.serviceCharge,
    total: booking.total,
    paymentMethod: booking.paymentMethod,
    startAt: booking.startAt,
    endAt: booking.endAt,
    createdAt: booking.createdAt,
    status: bookingStatus(booking),
  };
}

function serializeSlot(slot) {
  return {
    id: slot._id.toString(),
    code: slot.code,
    name: slot.name,
    address: slot.address,
    city: slot.city,
    floor: slot.floor,
    distanceKm: Number(slot.distanceKm ?? 0),
    total: slot.total,
    free: slot.free,
    pricePerHour: slot.pricePerHour,
  };
}

async function seedDatabase() {
  const usersCount = await User.countDocuments();
  if (usersCount > 0) return;

  const adminPasswordHash = await bcrypt.hash("1234", 10);
  const userPasswordHash = await bcrypt.hash("1234", 10);

  const [adminUser, normalUser] = await User.create([
    {
      name: "Shimpi Admin",
      email: "admin@parkos.com",
      username: "admin",
      passwordHash: adminPasswordHash,
      role: "admin",
    },
    {
      name: "Shimpi",
      email: "shimpi@example.com",
      username: "shimpi",
      passwordHash: userPasswordHash,
      role: "user",
    },
  ]);

  const slots = await Slot.create([
    { code: "P1", name: "Downtown Plaza", address: "452 MG Road, Mumbai", city: "Mumbai", floor: "B1", distanceKm: 0.4, total: 24, free: 18, pricePerHour: 50 },
    { code: "P2", name: "Central Station", address: "12 Station Rd, Mumbai", city: "Mumbai", floor: "G", distanceKm: 1.2, total: 40, free: 31, pricePerHour: 35 },
    { code: "P3", name: "Skyline Mall", address: "89 Linking Rd, Mumbai", city: "Mumbai", floor: "L2", distanceKm: 0.8, total: 60, free: 2, pricePerHour: 40 },
    { code: "P4", name: "Green Park Deck", address: "102 FC Road, Pune", city: "Pune", floor: "G", distanceKm: 2.5, total: 30, free: 22, pricePerHour: 25 },
    { code: "P5", name: "Grand Hotel", address: "5 Juhu Ave, Mumbai", city: "Mumbai", floor: "B2", distanceKm: 0.2, total: 15, free: 9, pricePerHour: 80 },
    { code: "P6", name: "Arts District", address: "22 Hauz Khas, Delhi", city: "Delhi", floor: "L1", distanceKm: 1.5, total: 35, free: 19, pricePerHour: 45 },
    { code: "P7", name: "West End Point", address: "77 Anna Salai, Chennai", city: "Chennai", floor: "G", distanceKm: 0.9, total: 20, free: 1, pricePerHour: 60 },
    { code: "P8", name: "Library Plaza", address: "200 MG Road, Bengaluru", city: "Bengaluru", floor: "B1", distanceKm: 3.1, total: 45, free: 30, pricePerHour: 30 },
  ]);

  const slot = slots[0];
  const now = new Date();
  const date = now.toISOString().slice(0, 10);
  const time = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
  const startAt = now.getTime();
  const duration = 2;
  const endAt = startAt + duration * 60 * 60 * 1000;
  const subtotal = slot.pricePerHour * duration;
  const serviceCharge = Math.round(subtotal * 0.1);

  await Booking.create({
    bookingCode: `BK-${Date.now().toString().slice(-6)}`,
    userId: normalUser._id,
    slotId: slot._id,
    vehicleType: "car",
    appointmentType: "urgent",
    vehicleNo: "MH02-AB-1234",
    date,
    time,
    duration,
    subtotal,
    serviceCharge,
    total: subtotal + serviceCharge,
    paymentMethod: "upi",
    startAt,
    endAt,
    status: "upcoming",
  });

  slot.free = Math.max(slot.free - 1, 0);
  await slot.save();

  console.log("Database seeded with default users and slots");
  console.log("Admin login -> username: admin, password: 1234");
  console.log("User login  -> username: shimpi, password: 1234");
}

async function backfillSlotDistances() {
  const distanceByCode = {
    P1: 0.4,
    P2: 1.2,
    P3: 0.8,
    P4: 2.5,
    P5: 0.2,
    P6: 1.5,
    P7: 0.9,
    P8: 3.1,
  };

  const slots = await Slot.find();
  for (const slot of slots) {
    if (!slot.distanceKm || slot.distanceKm === 0) {
      const mapped = distanceByCode[slot.code];
      if (mapped !== undefined) {
        slot.distanceKm = mapped;
        await slot.save();
      }
    }
  }
}

app.get("/api/health", async (_req, res) => {
  const connected = mongoose.connection.readyState === 1;
  res.json({ ok: true, service: "smartparking-backend", database: connected ? "connected" : "disconnected" });
});

app.post("/api/auth/signup", async (req, res) => {
  try {
    const { name, email, username, password } = req.body || {};
    if (!name || !email || !username || !password) {
      return res.status(400).json({ message: "name, email, username, and password are required" });
    }

    const existing = await User.findOne({
      $or: [{ email: String(email).toLowerCase() }, { username: String(username) }],
    });

    if (existing) {
      return res.status(409).json({ message: "User with same email or username already exists" });
    }

    const passwordHash = await bcrypt.hash(String(password), 10);
    const user = await User.create({
      name: String(name).trim(),
      email: String(email).trim().toLowerCase(),
      username: String(username).trim(),
      passwordHash,
      role: "user",
    });

    const token = signToken(user);

    return res.status(201).json({
      token,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        username: user.username,
        role: user.role,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: "Signup failed", detail: error.message });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { username, password } = req.body || {};
    if (!username || !password) {
      return res.status(400).json({ message: "username and password are required" });
    }

    const user = await User.findOne({ username: String(username).trim() });
    if (!user) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    const matched = await bcrypt.compare(String(password), user.passwordHash);
    if (!matched) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    const token = signToken(user);

    return res.json({
      token,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        username: user.username,
        role: user.role,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: "Login failed", detail: error.message });
  }
});

app.get("/api/slots", requireAuth, async (req, res) => {
  const q = String(req.query.q || "").toLowerCase().trim();
  const city = String(req.query.city || "").toLowerCase().trim();

  const filter = {};
  if (city) filter.city = new RegExp(`^${city}$`, "i");

  const slots = await Slot.find(filter).sort({ createdAt: 1 });
  const list = slots
    .map(serializeSlot)
    .filter((slot) => {
      if (!q) return true;
      return (
        slot.code.toLowerCase().includes(q) ||
        slot.name.toLowerCase().includes(q) ||
        slot.address.toLowerCase().includes(q)
      );
    });

  return res.json({ slots: list });
});

app.get("/api/favorites", requireAuth, async (req, res) => {
  const user = await User.findById(req.user._id).populate("favoriteSlots");
  const slots = (user?.favoriteSlots || []).map(serializeSlot);
  const favoriteSlotIds = slots.map((slot) => slot.id);
  return res.json({ slots, favoriteSlotIds });
});

app.post("/api/favorites/:slotId", requireAuth, async (req, res) => {
  const { slotId } = req.params;
  const slot = await Slot.findById(slotId);
  if (!slot) {
    return res.status(404).json({ message: "Slot not found" });
  }

  const user = await User.findById(req.user._id);
  const exists = (user.favoriteSlots || []).some((id) => id.toString() === slotId);

  if (exists) {
    user.favoriteSlots = user.favoriteSlots.filter((id) => id.toString() !== slotId);
  } else {
    user.favoriteSlots.push(slot._id);
  }

  await user.save();
  await user.populate("favoriteSlots");

  const slots = (user.favoriteSlots || []).map(serializeSlot);
  const favoriteSlotIds = slots.map((item) => item.id);
  return res.json({
    favorited: !exists,
    slots,
    favoriteSlotIds,
  });
});

app.get("/api/recent-slots", requireAuth, async (req, res) => {
  const user = await User.findById(req.user._id).populate("recentSlotIds");
  const slots = (user?.recentSlotIds || []).map(serializeSlot);
  return res.json({ slots });
});

app.post("/api/recent-slots/:slotId", requireAuth, async (req, res) => {
  const { slotId } = req.params;
  const slot = await Slot.findById(slotId);
  if (!slot) {
    return res.status(404).json({ message: "Slot not found" });
  }

  const user = await User.findById(req.user._id);
  const existing = (user.recentSlotIds || []).filter((id) => id.toString() !== slotId);
  user.recentSlotIds = [slot._id, ...existing].slice(0, 8);
  await user.save();
  await user.populate("recentSlotIds");

  const slots = (user.recentSlotIds || []).map(serializeSlot);
  return res.json({ slots });
});

app.get("/api/bookings", requireAuth, async (req, res) => {
  const bookings = await Booking.find({ userId: req.user._id })
    .populate("slotId")
    .sort({ createdAt: -1 });

  return res.json({ bookings: bookings.map(serializeBooking) });
});

app.post("/api/bookings", requireAuth, async (req, res) => {
  try {
    const { slotId, vehicleType, appointmentType, vehicleNo, date, time, duration, paymentMethod } = req.body || {};
        const normalizedType = String(appointmentType || "new");
        if (!["new", "followup", "urgent", "lab"].includes(normalizedType)) {
          return res.status(400).json({ message: "appointmentType must be one of new, followup, urgent, lab" });
        }

    if (!slotId || !vehicleType || !vehicleNo || !date || !time || !duration || !paymentMethod) {
      return res.status(400).json({ message: "Missing required fields to create booking" });
    }

    const parsedDuration = Number(duration);
    if (Number.isNaN(parsedDuration) || parsedDuration < 1) {
      return res.status(400).json({ message: "duration must be a positive number" });
    }

    const startAt = new Date(`${date}T${time}:00`).getTime();
    if (Number.isNaN(startAt)) {
      return res.status(400).json({ message: "Invalid date or time" });
    }

    const slot = await Slot.findById(slotId);
    if (!slot) {
      return res.status(404).json({ message: "Slot not found" });
    }
    if (slot.free <= 0) {
      return res.status(409).json({ message: "No free space available in selected slot" });
    }

    const endAt = startAt + parsedDuration * 60 * 60 * 1000;
    const subtotal = slot.pricePerHour * parsedDuration;
    const serviceCharge = Math.round(subtotal * 0.1);

    const booking = await Booking.create({
      bookingCode: `BK-${Date.now().toString().slice(-6)}`,
      userId: req.user._id,
      slotId: slot._id,
      vehicleType,
      appointmentType: normalizedType,
      vehicleNo,
      date,
      time,
      duration: parsedDuration,
      subtotal,
      serviceCharge,
      total: subtotal + serviceCharge,
      paymentMethod,
      startAt,
      endAt,
      status: "upcoming",
    });

    slot.free = Math.max(slot.free - 1, 0);
    await slot.save();

    await booking.populate("slotId");

    return res.status(201).json({ booking: serializeBooking(booking) });
  } catch (error) {
    return res.status(500).json({ message: "Booking failed", detail: error.message });
  }
});

app.patch("/api/bookings/:bookingCode/extend", requireAuth, async (req, res) => {
  const extraHours = Number(req.body?.extraHours || 1);
  if (Number.isNaN(extraHours) || extraHours < 1) {
    return res.status(400).json({ message: "extraHours must be >= 1" });
  }

  const booking = await Booking.findOne({ bookingCode: req.params.bookingCode, userId: req.user._id }).populate("slotId");
  if (!booking) {
    return res.status(404).json({ message: "Booking not found" });
  }
  if (bookingStatus(booking) === "cancelled") {
    return res.status(409).json({ message: "Cannot extend a cancelled booking" });
  }

  booking.duration += extraHours;
  booking.endAt += extraHours * 60 * 60 * 1000;
  booking.subtotal += booking.slotId.pricePerHour * extraHours;
  const extraService = Math.round(booking.slotId.pricePerHour * extraHours * 0.1);
  booking.serviceCharge += extraService;
  booking.total += booking.slotId.pricePerHour * extraHours + extraService;
  await booking.save();

  return res.json({ booking: serializeBooking(booking) });
});

app.patch("/api/bookings/:bookingCode/cancel", requireAuth, async (req, res) => {
  const booking = await Booking.findOne({ bookingCode: req.params.bookingCode, userId: req.user._id }).populate("slotId");
  if (!booking) {
    return res.status(404).json({ message: "Booking not found" });
  }

  if (booking.status === "cancelled") {
    return res.status(409).json({ message: "Booking already cancelled" });
  }

  booking.status = "cancelled";
  await booking.save();

  if (booking.slotId) {
    booking.slotId.free = Math.min(booking.slotId.free + 1, booking.slotId.total);
    await booking.slotId.save();
  }

  return res.json({ booking: serializeBooking(booking) });
});

app.get("/api/dashboard", requireAuth, async (req, res) => {
  const bookings = await Booking.find({ userId: req.user._id }).populate("slotId").sort({ createdAt: -1 });

  const normalized = bookings.map(serializeBooking);
  const totalBookings = normalized.length;
  const activeBookings = normalized.filter((booking) => booking.status === "active").length;
  const totalSpent = normalized
    .filter((booking) => booking.status !== "cancelled")
    .reduce((sum, booking) => sum + booking.total, 0);

  const bySlot = normalized.reduce((acc, booking) => {
    const key = booking.slotName || "-";
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  const favouriteSlot = Object.entries(bySlot).sort((a, b) => b[1] - a[1])[0]?.[0] || "-";

  return res.json({
    stats: {
      totalBookings,
      activeBookings,
      totalSpent,
      favouriteSlot,
    },
    recentBookings: normalized.slice(0, 5),
  });
});

app.get("/api/admin/slots", requireAuth, requireAdmin, async (_req, res) => {
  const slots = await Slot.find().sort({ createdAt: 1 });
  res.json({ slots: slots.map(serializeSlot) });
});

app.post("/api/admin/slots", requireAuth, requireAdmin, async (req, res) => {
  try {
    const { code, name, address, city, floor, distanceKm, total, free, pricePerHour } = req.body || {};
    if (!code || !name || !address || !city || !floor || !total || free === undefined || !pricePerHour) {
      return res.status(400).json({ message: "All slot fields are required" });
    }

    const slot = await Slot.create({
      code: String(code).trim(),
      name: String(name).trim(),
      address: String(address).trim(),
      city: String(city).trim(),
      floor: String(floor).trim(),
      distanceKm: Number(distanceKm || 0),
      total: Number(total),
      free: Number(free),
      pricePerHour: Number(pricePerHour),
    });

    return res.status(201).json({ slot: serializeSlot(slot) });
  } catch (error) {
    return res.status(500).json({ message: "Could not create slot", detail: error.message });
  }
});

app.patch("/api/admin/slots/:id", requireAuth, requireAdmin, async (req, res) => {
  try {
    const allowed = ["code", "name", "address", "city", "floor", "distanceKm", "total", "free", "pricePerHour"];
    const patch = {};

    for (const key of allowed) {
      if (req.body[key] !== undefined) patch[key] = req.body[key];
    }

    if (patch.total !== undefined) patch.total = Number(patch.total);
    if (patch.free !== undefined) patch.free = Number(patch.free);
    if (patch.distanceKm !== undefined) patch.distanceKm = Number(patch.distanceKm);
    if (patch.pricePerHour !== undefined) patch.pricePerHour = Number(patch.pricePerHour);

    const slot = await Slot.findByIdAndUpdate(req.params.id, patch, { new: true, runValidators: true });
    if (!slot) return res.status(404).json({ message: "Slot not found" });

    if (slot.free > slot.total) {
      slot.free = slot.total;
      await slot.save();
    }

    return res.json({ slot: serializeSlot(slot) });
  } catch (error) {
    return res.status(500).json({ message: "Could not update slot", detail: error.message });
  }
});

app.delete("/api/admin/slots/:id", requireAuth, requireAdmin, async (req, res) => {
  const slot = await Slot.findById(req.params.id);
  if (!slot) return res.status(404).json({ message: "Slot not found" });

  const activeBooking = await Booking.findOne({ slotId: slot._id, status: { $in: ["active", "upcoming"] } });
  if (activeBooking) {
    return res.status(409).json({ message: "Cannot delete slot with active or upcoming booking" });
  }

  await Slot.findByIdAndDelete(req.params.id);
  return res.json({ message: "Slot deleted" });
});

app.get("/api/admin/schedule", requireAuth, requireAdmin, async (req, res) => {
  const weekOffset = Number(req.query.weekOffset || 0);
  const safeWeekOffset = Number.isNaN(weekOffset) ? 0 : weekOffset;

  const now = new Date();
  const day = now.getDay();
  const offsetToMonday = day === 0 ? -6 : 1 - day;
  const monday = new Date(now);
  monday.setHours(0, 0, 0, 0);
  monday.setDate(now.getDate() + offsetToMonday + safeWeekOffset * 7);

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 7);

  const startAt = monday.getTime();
  const endAt = sunday.getTime();

  const bookings = await Booking.find({
    startAt: { $gte: startAt, $lt: endAt },
    status: { $ne: "cancelled" },
  })
    .populate("slotId userId")
    .sort({ startAt: 1 });

  const appointments = bookings.map((booking) => {
    const start = new Date(booking.startAt);
    const weekday = start.toLocaleDateString("en-US", { weekday: "short" });
    const dayNum = String(start.getDate());
    const dayLabel = `${weekday} ${dayNum}`;
    const hh = String(start.getHours()).padStart(2, "0");
    const mm = String(start.getMinutes()).padStart(2, "0");
    const timeLabel = `${hh}:${mm}`;

    return {
      id: booking.bookingCode,
      dayLabel,
      timeLabel,
      patientName: booking.userId?.name || "User",
      type: booking.appointmentType || "new",
      status: bookingStatus(booking),
      slotName: booking.slotId?.name || "Unknown Slot",
      vehicleNo: booking.vehicleNo,
    };
  });

  return res.json({
    weekOffset: safeWeekOffset,
    rangeStartISO: monday.toISOString(),
    rangeEndISO: sunday.toISOString(),
    appointments,
  });
});

app.get("/api/admin/analytics", requireAuth, requireAdmin, async (_req, res) => {
  const [slots, bookings] = await Promise.all([
    Slot.find().sort({ code: 1 }),
    Booking.find({ status: { $ne: "cancelled" } }).populate("slotId"),
  ]);

  const totalCapacity = slots.reduce((sum, slot) => sum + slot.total, 0);
  const totalFree = slots.reduce((sum, slot) => sum + slot.free, 0);
  const totalUsed = Math.max(totalCapacity - totalFree, 0);
  const occupancyPct = totalCapacity > 0 ? Math.round((totalUsed / totalCapacity) * 100) : 0;

  const byType = bookings.reduce(
    (acc, booking) => {
      const key = booking.appointmentType || "new";
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    },
    { new: 0, followup: 0, urgent: 0, lab: 0 },
  );

  const byStatus = bookings.reduce((acc, booking) => {
    const status = bookingStatus(booking);
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {});

  const slotLoad = slots.map((slot) => ({
    slotCode: slot.code,
    slotName: slot.name,
    used: Math.max(slot.total - slot.free, 0),
    total: slot.total,
    occupancyPct: slot.total > 0 ? Math.round(((slot.total - slot.free) / slot.total) * 100) : 0,
  }));

  return res.json({
    occupancy: {
      totalCapacity,
      totalUsed,
      totalFree,
      occupancyPct,
    },
    byType,
    byStatus,
    slotLoad,
  });
});

app.get("/api/admin/bookings/:bookingCode", requireAuth, requireAdmin, async (req, res) => {
  const booking = await Booking.findOne({ bookingCode: req.params.bookingCode }).populate("slotId userId");
  if (!booking) {
    return res.status(404).json({ message: "Booking not found" });
  }

  return res.json({
    booking: {
      ...serializeBooking(booking),
      user: booking.userId
        ? {
            id: booking.userId._id.toString(),
            name: booking.userId.name,
            email: booking.userId.email,
            username: booking.userId.username,
          }
        : null,
    },
  });
});

async function start() {
  await mongoose.connect(MONGODB_URI);
  console.log(`MongoDB connected -> ${MONGODB_URI}`);

  await seedDatabase();
  await backfillSlotDistances();

  app.listen(PORT, () => {
    console.log(`SmartParking backend running on http://localhost:${PORT}`);
  });
}

start().catch((error) => {
  console.error("Startup failed:", error.message);
  process.exit(1);
});
