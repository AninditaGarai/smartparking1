import { useCallback, useEffect, useMemo, useState } from "react";
import ScheduleLayoutPrototype from "./prototypes/ScheduleLayoutPrototype";
import AdminScheduleBoard from "./components/schedule/AdminScheduleBoard";
import SlotMapView, { MiniMapPreview } from "./components/map/SlotMapView";
import "./assets/advanced-ui.css";

const styleId = "smartparking-styles";
if (!document.getElementById(styleId)) {
  const style = document.createElement("style");
  style.id = styleId;
  style.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&family=Rajdhani:wght@600;700&family=JetBrains+Mono:wght@400;600&display=swap');

    :root {
      --bg: #f6efe7;
      --bg-panel: #ffffff;
      --bg-soft: #f3e7d8;
      --line: #d6bfaa;
      --text: #251d18;
      --text-soft: #735f51;
      --brand: #2f8f6c;
      --brand-alt: #5e8d3a;
      --page-grad-a: #dff2e7;
      --page-grad-b: #eaf1db;
      --card-bg: linear-gradient(180deg, #fff9f2, #fff4e8);
      --topbar-bg: rgba(255, 248, 240, 0.9);
      --topbar-line: var(--line);
      --input-bg: #fffaf5;
      --input-line: #d8c5b3;
      --shadow-card: 0 10px 28px rgba(24, 54, 41, 0.14);
      --shadow-soft: 0 5px 18px rgba(24, 54, 41, 0.12);
      --space-1: 6px;
      --space-2: 10px;
      --space-3: 14px;
      --space-4: 18px;
      --space-5: 24px;
      --warn: #9a8a2f;
      --danger: #705c2f;
      --radius: 14px;
    }

    * { box-sizing: border-box; }
    body {
      margin: 0;
      color: var(--text);
      font-family: 'Outfit', system-ui, sans-serif;
      line-height: 1.45;
      position: relative;
      background:
                  radial-gradient(circle at 8% -10%, var(--page-grad-a) 0, var(--bg) 45%),
                  radial-gradient(circle at 100% 0, var(--page-grad-b) 0, transparent 32%),
                  radial-gradient(circle at 20% 78%, rgba(74, 143, 108, 0.24), transparent 35%),
                  linear-gradient(145deg, rgba(235, 249, 241, 0.42), rgba(221, 235, 211, 0.34)),
                  repeating-linear-gradient(100deg, rgba(47, 143, 108, 0.07) 0 8px, transparent 8px 22px),
                  var(--bg);
      background-attachment: fixed;
      min-height: 100vh;
      overflow-x: hidden;
    }

    body::before,
    body::after {
      content: "";
      position: fixed;
      pointer-events: none;
      z-index: -1;
    }

    body::before {
      inset: 0;
      background:
        repeating-linear-gradient(
          90deg,
          rgba(255, 255, 255, 0.2) 0 2px,
          transparent 2px 56px
        ),
        repeating-linear-gradient(
          0deg,
          rgba(255, 255, 255, 0.12) 0 2px,
          transparent 2px 70px
        );
      opacity: 0.25;
      transform: perspective(900px) rotateX(62deg) translateY(42vh) scale(1.45);
      transform-origin: bottom center;
      animation: parkingGridMove 14s linear infinite;
    }

    body::after {
      right: -120px;
      bottom: -120px;
      width: 420px;
      height: 420px;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(47, 143, 108, 0.28), transparent 68%);
      filter: blur(6px);
      animation: backgroundOrbFloat 12s ease-in-out infinite;
    }

    @keyframes parkingGridMove {
      0% {
        background-position: 0 0, 0 0;
        transform: perspective(900px) rotateX(62deg) translateY(42vh) scale(1.45);
      }
      50% {
        background-position: 30px 0, 0 38px;
        transform: perspective(900px) rotateX(62deg) translateY(41vh) scale(1.48);
      }
      100% {
        background-position: 60px 0, 0 76px;
        transform: perspective(900px) rotateX(62deg) translateY(42vh) scale(1.45);
      }
    }

    @keyframes backgroundOrbFloat {
      0%,
      100% {
        transform: translate3d(0, 0, 0) scale(1);
      }
      50% {
        transform: translate3d(-24px, -22px, 0) scale(1.06);
      }
    }

    h1, h2, h3, h4 {
      margin: 0;
      letter-spacing: -0.01em;
      line-height: 1.2;
      color: var(--text);
    }

    h1 { font-size: 28px; font-weight: 800; }
    h2 { font-size: 34px; font-weight: 800; }
    h3 { font-size: 22px; font-weight: 700; }

    p {
      margin: 0;
      color: var(--text-soft);
    }

    button, input, select { font-family: inherit; }

    .mono { font-family: 'JetBrains Mono', monospace; }
    .container {
      max-width: 1180px;
      margin: 0 auto;
      padding: 28px 24px;
    }

    .topbar {
      position: sticky;
      top: 0;
      z-index: 100;
      background: var(--topbar-bg);
      backdrop-filter: blur(8px);
      border-bottom: 1px solid var(--topbar-line);
    }

    .topbar-inner {
      max-width: 1180px;
      margin: 0 auto;
      min-height: 64px;
      padding: 10px 24px;
      display: flex;
      align-items: center;
      gap: var(--space-3);
    }

    .brand {
      font-size: 30px;
      font-weight: 700;
      letter-spacing: 0.02em;
      font-family: 'Rajdhani', 'Outfit', sans-serif;
      color: #245a44;
      cursor: pointer;
      text-transform: uppercase;
    }

    .tabs {
      display: flex;
      gap: var(--space-1);
      flex-wrap: nowrap;
      overflow-x: auto;
      padding-bottom: 2px;
      scrollbar-width: none;
    }

    .tabs::-webkit-scrollbar { display: none; }

    .tab {
      border: 1px solid #dbc6b2;
      background: rgba(255, 251, 245, 0.85);
      color: var(--text-soft);
      border-radius: 10px;
      padding: 8px 14px;
      font-size: 13px;
      white-space: nowrap;
      cursor: pointer;
      transition: all 0.18s ease;
    }

    .tab:hover {
      border-color: #8bb89f;
      color: #2f6a51;
      background: #eef9f3;
    }

    .tab.active {
      background: #e4f4ea;
      border-color: #78a98f;
      color: #25543f;
      box-shadow: inset 0 0 0 1px rgba(47, 143, 108, 0.14);
    }

    .push-right { margin-left: auto; }

    .btn {
      position: relative;
      border: 1px solid var(--line);
      background: var(--bg-soft);
      color: var(--text);
      border-radius: 12px;
      padding: 9px 14px;
      min-height: 38px;
      cursor: pointer;
      font-weight: 500;
      transition: transform 0.16s ease, box-shadow 0.18s ease, background 0.18s ease, border-color 0.18s ease;
      overflow: hidden;
    }

    .btn:hover:not(:disabled) {
      transform: translateY(-1px);
      box-shadow: var(--shadow-soft);
      background: #eef8f2;
      border-color: #86b39a;
    }

    .btn:active:not(:disabled) {
      transform: translateY(0);
    }

    .btn.primary {
      background: linear-gradient(90deg, #2f8f6c, #4fa97f);
      border-color: #4fa97f;
      color: white;
    }

    .btn.primary:hover:not(:disabled) {
      background: linear-gradient(90deg, #267457, #3d906b);
      box-shadow: 0 8px 16px rgba(47, 143, 108, 0.34);
      transform: translateY(-2px);
      border-color: #3d906b;
    }

    .btn.danger {
      background: #3d3a23;
      border-color: #7f7a4f;
      color: #e9e5be;
    }

    .btn.danger:hover:not(:disabled) {
      background: #534f2f;
      border-color: #a49d65;
      color: #f4f0ca;
    }

    .btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .card {
      background: var(--card-bg);
      border: 1px solid #e2cdb9;
      border-radius: 18px;
      padding: 20px;
      box-shadow: var(--shadow-card);
    }

    .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
    .grid-4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; }

    .row { display: flex; gap: 12px; align-items: center; }

    .input {
      width: 100%;
      border: 1px solid var(--input-line);
      background: var(--input-bg);
      border-radius: 12px;
      color: var(--text);
      padding: 10px 12px;
      min-height: 40px;
      transition: border-color 0.18s ease, box-shadow 0.18s ease;
    }

    .input:focus {
      outline: none;
      border-color: #5a9f7f;
      box-shadow: 0 0 0 3px rgba(47, 143, 108, 0.18);
    }

    .label {
      display: block;
      margin-bottom: 5px;
      color: var(--text-soft);
      font-size: 13px;
      font-weight: 500;
    }

    .divider {
      height: 1px;
      background: linear-gradient(90deg, transparent, var(--line), transparent);
      margin: 14px 0;
    }

    .section-head {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: 10px;
      border-bottom: 1px solid var(--line);
      margin-bottom: 14px;
    }

    .section-head strong {
      font-size: 16px;
    }

    .table { width: 100%; border-collapse: collapse; font-size: 14px; }
    
    .table th, .table td {
      text-align: left;
      padding: 12px 10px;
      border-bottom: 1px solid #e6d2bf;
      vertical-align: top;
    }

    .table th { 
      color: var(--text-soft); 
      font-size: 12px; 
      text-transform: uppercase;
      font-weight: 600;
      background: rgba(47, 143, 108, 0.08);
      letter-spacing: 0.05em;
    }

    .table tbody tr {
      transition: background 0.16s ease, box-shadow 0.16s ease;
    }

    .table tbody tr:hover {
      background: rgba(47, 143, 108, 0.08);
      box-shadow: inset 0 0 0 1px rgba(47, 143, 108, 0.12);
    }

    .table tbody tr:nth-child(even) {
      background: rgba(47, 143, 108, 0.03);
    }

    .badge {
      display: inline-flex;
      align-items: center;
      border-radius: 999px;
      font-size: 11px;
      padding: 4px 12px;
      border: 1px solid transparent;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      transition: all 0.2s ease;
    }

    .badge:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    }

    .badge.active { 
      color: #127d58; 
      background: linear-gradient(135deg, #e5f8f1, #d1f4e9);
      border-color: #8ad3ba; 
    }
    
    .badge.completed { 
      color: #4e6f2a; 
      background: linear-gradient(135deg, #eef8df, #deefc2);
      border-color: #b8d58a; 
    }
    
    .badge.cancelled { 
      color: #6b5e43; 
      background: linear-gradient(135deg, #f5f0e7, #ece4d7);
      border-color: #d2c4ae; 
    }
    
    .badge.upcoming { 
      color: #8a5a0f; 
      background: linear-gradient(135deg, #fff4e3, #fff0d4);
      border-color: #f0cf95; 
    }

    .notice {
      position: fixed;
      bottom: 18px;
      right: 18px;
      background: #ffffff;
      border: 1px solid #95bba7;
      color: #224537;
      padding: 10px 14px;
      border-radius: 10px;
      max-width: 340px;
      z-index: 500;
    }

    .slider {
      width: 160px;
      accent-color: var(--brand);
    }

    body[data-theme="dark"] {
      --bg: #1b1612;
      --bg-panel: #2a221b;
      --bg-soft: #342920;
      --line: #5f4b3b;
      --text: #f9ece0;
      --text-soft: #ceb4a1;
      --brand: #58b28b;
      --brand-alt: #9bcf6a;
      --page-grad-a: #214235;
      --page-grad-b: #344a25;
      --card-bg: linear-gradient(180deg, rgba(31, 50, 42, 0.9), rgba(24, 36, 31, 0.94));
      --topbar-bg: rgba(23, 35, 30, 0.84);
      --topbar-line: #486354;
      --input-bg: #30463b;
      --input-line: #5f8270;
      --shadow-card: 0 8px 24px rgba(2, 8, 18, 0.35);
      --shadow-soft: 0 4px 16px rgba(2, 8, 18, 0.28);
    }

    body[data-theme="dark"]::before {
      background:
        repeating-linear-gradient(
          90deg,
          rgba(212, 236, 224, 0.14) 0 2px,
          transparent 2px 56px
        ),
        repeating-linear-gradient(
          0deg,
          rgba(212, 236, 224, 0.09) 0 2px,
          transparent 2px 70px
        );
      opacity: 0.22;
    }

    body[data-theme="dark"]::after {
      background: radial-gradient(circle, rgba(88, 178, 139, 0.24), transparent 70%);
    }

    body[data-theme="dark"] .brand { color: #cbf3df; }

    body[data-theme="dark"] .tab.active {
      background: #335a48;
      border-color: #5f947b;
      color: #dff8eb;
    }

    body[data-theme="dark"] .tab {
      border-color: #547260;
      background: rgba(30, 43, 36, 0.82);
    }

    body[data-theme="dark"] .tab:hover {
      border-color: #7faf95;
      color: #e7fff4;
      background: #355847;
    }

    body[data-theme="dark"] .card { border-color: #4f695a; }

    body[data-theme="dark"] .table th,
    body[data-theme="dark"] .table td {
      border-bottom-color: #4f675a;
    }

    body[data-theme="dark"] .table tbody tr:hover {
      background: rgba(88, 178, 139, 0.16);
    }

    body[data-theme="dark"] .notice {
      background: #274437;
      border-color: #5a896f;
      color: #ddf8ea;
    }

    @media (max-width: 1100px) {
      .grid-4 { grid-template-columns: repeat(2, 1fr); }
      .grid-3 { grid-template-columns: repeat(2, 1fr); }
    }

    @media (max-width: 900px) {
      .grid-4, .grid-3, .grid-2 { grid-template-columns: 1fr; }
      .table-wrap { overflow-x: auto; }
      .topbar-inner { flex-wrap: wrap; }
      .push-right { margin-left: 0; }
      .container { padding: 18px 14px; }
      h2 { font-size: 28px; }
      h3 { font-size: 19px; }
      .card { padding: 16px; }
      .btn { width: auto; }
    }
  `;
  document.head.appendChild(style);
}

const USER_KEY = "smartparking_user";
const TOKEN_KEY = "smartparking_token";
const PREFS_PREFIX = "smartparking_prefs_";

function getAdminBookingCodeFromHash() {
  const hash = window.location.hash || "";
  const prefix = "#admin-booking/";
  if (!hash.startsWith(prefix)) return null;
  const code = decodeURIComponent(hash.slice(prefix.length));
  return code || null;
}

function getPrefsStorageKey(userPreferenceKey) {
  return userPreferenceKey ? `${PREFS_PREFIX}${userPreferenceKey}` : null;
}

function readSectionPrefs(userPreferenceKey, section, defaults) {
  const storageKey = getPrefsStorageKey(userPreferenceKey);
  if (!storageKey) return defaults;
  try {
    const all = JSON.parse(localStorage.getItem(storageKey) || "{}");
    return { ...defaults, ...(all[section] || {}) };
  } catch {
    return defaults;
  }
}

function writeSectionPrefs(userPreferenceKey, section, value) {
  const storageKey = getPrefsStorageKey(userPreferenceKey);
  if (!storageKey) return;
  try {
    const all = JSON.parse(localStorage.getItem(storageKey) || "{}");
    all[section] = value;
    localStorage.setItem(storageKey, JSON.stringify(all));
  } catch {
    // Ignore preference storage failures.
  }
}

async function api(path, options = {}) {
  const token = localStorage.getItem(TOKEN_KEY);
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers ?? {}),
  };

  const response = await fetch(`/api${path}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || "Request failed");
  }
  return data;
}

function statusClass(status) {
  if (status === "active") return "active";
  if (status === "completed") return "completed";
  if (status === "cancelled") return "cancelled";
  return "upcoming";
}

function formatDateTime(date, time) {
  if (!date || !time) return "-";
  return `${date} ${time}`;
}

function toCurrency(value) {
  return `Rs ${Number(value || 0).toLocaleString("en-IN")}`;
}

function slotMeta(slot) {
  const premium = slot.pricePerHour >= 70;
  const lowAvailability = slot.free <= 3;
  const near = (slot.distanceKm ?? 99) <= 1;
  return {
    premium,
    lowAvailability,
    near,
    covered: slot.floor?.toUpperCase().startsWith("B") || slot.floor?.toUpperCase().startsWith("L"),
    evReady: /mall|hotel|plaza/i.test(slot.name),
  };
}

function smartScore(slot, isFavorite) {
  const availabilityWeight = Math.min(slot.free / Math.max(slot.total, 1), 1) * 45;
  const distanceWeight = Math.max(0, 25 - (slot.distanceKm ?? 5) * 8);
  const priceWeight = Math.max(0, 25 - slot.pricePerHour / 3);
  const favoriteWeight = isFavorite ? 12 : 0;
  return Math.max(1, Math.round(availabilityWeight + distanceWeight + priceWeight + favoriteWeight));
}

function downloadCsv(filename, rows) {
  if (!rows.length) return;
  const headers = Object.keys(rows[0]);
  const escape = (value) => `"${String(value ?? "").replaceAll('"', '""')}"`;
  const csv = [headers.join(","), ...rows.map((row) => headers.map((key) => escape(row[key])).join(","))].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

function CarIllustration({ color }) {
  return (
    <svg viewBox="0 0 220 92" width="100%" height="74" aria-hidden="true">
      <defs>
        <linearGradient id={`car-grad-${color.replace("#", "")}`} x1="0" x2="1">
          <stop offset="0%" stopColor={color} />
          <stop offset="100%" stopColor="#12283e" />
        </linearGradient>
      </defs>
      <rect x="8" y="66" width="204" height="6" rx="3" fill="rgba(22,50,79,0.18)" />
      <path d="M34 52h144l-8-20c-2-6-7-10-13-10H70c-6 0-11 4-13 10l-10 20z" fill={`url(#car-grad-${color.replace("#", "")})`} />
      <rect x="52" y="28" width="44" height="17" rx="5" fill="rgba(226,246,255,0.78)" />
      <rect x="104" y="28" width="48" height="17" rx="5" fill="rgba(226,246,255,0.78)" />
      <circle cx="66" cy="58" r="12" fill="#0d1f31" />
      <circle cx="66" cy="58" r="5" fill="#c6d8ed" />
      <circle cx="154" cy="58" r="12" fill="#0d1f31" />
      <circle cx="154" cy="58" r="5" fill="#c6d8ed" />
      <rect x="30" y="47" width="12" height="6" rx="3" fill="#ffd57b" />
      <rect x="178" y="47" width="12" height="6" rx="3" fill="#ffd57b" />
    </svg>
  );
}

function LoadingState({ label }) {
  return (
    <div className="card">
      <div style={{ display: "grid", gap: 12 }}>
        <div className="skeleton skeleton-text" style={{ height: 20, width: "60%" }} />
        <div className="skeleton skeleton-card" />
        <div className="skeleton skeleton-card" />
        <div className="skeleton skeleton-card" />
      </div>
    </div>
  );
}

function EmptyState({ icon, title, description, action, actionLabel }) {
  return (
    <div className="card">
      <div className="empty-state">
        <div className="empty-state-icon">{icon}</div>
        <h4>{title}</h4>
        <p style={{ fontSize: 14, margin: "0 0 16px" }}>{description}</p>
        {action && <button className="btn primary" onClick={action}>{actionLabel}</button>}
      </div>
    </div>
  );
}

function AvailabilityIndicator({ free, total }) {
  const percentage = total > 0 ? Math.round((free / total) * 100) : 0;
  let status = "high";
  if (percentage <= 25) status = "low";
  else if (percentage <= 50) status = "medium";
  return (
    <span className={`availability-indicator ${status}`}>
      <span className="status-dot" style={{ background: status === "high" ? "#2c8f6a" : status === "medium" ? "#8a9a3a" : "#6c6a3d" }} />
      {free} of {total}
    </span>
  );
}

function CarShowcase({ slots, onBookNow }) {
  const featured = useMemo(() => {
    const byBudget = [...slots].sort((a, b) => a.pricePerHour - b.pricePerHour)[0];
    const byComfort = [...slots].sort((a, b) => b.free - a.free)[0];
    const byPremium = [...slots].sort((a, b) => b.pricePerHour - a.pricePerHour)[0];

    return [
      { id: "city", label: "City Sprint", tone: "Budget", color: "#2bb9b3", slot: byBudget },
      { id: "family", label: "Family Cruiser", tone: "Comfort", color: "#0f8c83", slot: byComfort },
      { id: "lux", label: "Executive EV", tone: "Premium", color: "#6e9a45", slot: byPremium },
    ];
  }, [slots]);

  return (
    <div className="card car-showcase">
      <div className="section-head">
        <div>
          <h3 style={{ marginTop: 0 }}>Drive Styles</h3>
          <p style={{ color: "var(--text-soft)" }}>Choose a vibe, then jump straight into the best matched slot.</p>
        </div>
      </div>
      <div className="car-lane" aria-hidden="true">
        <div className="lane-dashes" />
      </div>
      <div className="car-grid">
        {featured.map((item) => (
          <div className="car-card" key={item.id}>
            <div className="row" style={{ justifyContent: "space-between" }}>
              <strong>{item.label}</strong>
              <span className="badge upcoming">{item.tone}</span>
            </div>
            <div className="car-figure">
              <CarIllustration color={item.color} />
            </div>
            <div style={{ fontSize: 13, color: "var(--text-soft)", marginTop: 6 }}>
              {item.slot ? `${item.slot.name} · ${toCurrency(item.slot.pricePerHour)}/h` : "No slot data yet"}
            </div>
            <button className="btn" style={{ marginTop: 8, width: "100%" }} onClick={() => onBookNow(item.slot)} disabled={!item.slot || item.slot.free <= 0}>
              {item.slot?.free > 0 ? "Book This Style" : "Unavailable"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function RoadParkingTheme({ slots, onBookNow }) {
  const quickStats = useMemo(() => {
    const total = slots.length;
    const totalFree = slots.reduce((sum, slot) => sum + (slot.free || 0), 0);
    const avgPrice = total ? Math.round(slots.reduce((sum, slot) => sum + (slot.pricePerHour || 0), 0) / total) : 0;
    const fastest = [...slots].sort((a, b) => (a.distanceKm ?? 99) - (b.distanceKm ?? 99))[0];
    return { totalFree, avgPrice, fastest };
  }, [slots]);

  return (
    <div className="card road-panel">
      <div className="section-head" style={{ borderBottom: "none", marginBottom: 8, paddingBottom: 0 }}>
        <div>
          <h3 style={{ marginTop: 0 }}>Roadside Parking Pulse</h3>
          <p>Traffic-style lane intel for quick parking decisions.</p>
        </div>
      </div>
      <div className="road-strip" aria-hidden="true">
        <div className="road-divider" />
      </div>
      <div className="parking-zones-grid">
        <div className="parking-zone-card">
          <div className="zone-icon">P</div>
          <div>
            <div className="zone-title">Live Free Bays</div>
            <div className="zone-value mono">{quickStats.totalFree}</div>
          </div>
        </div>
        <div className="parking-zone-card">
          <div className="zone-icon">Rs</div>
          <div>
            <div className="zone-title">Avg Hourly Rate</div>
            <div className="zone-value mono">{toCurrency(quickStats.avgPrice)}</div>
          </div>
        </div>
        <div className="parking-zone-card">
          <div className="zone-icon">ETA</div>
          <div>
            <div className="zone-title">Nearest Access</div>
            <div className="zone-value">{quickStats.fastest ? `${quickStats.fastest.name} · ${quickStats.fastest.distanceKm ?? "--"} km` : "No live data"}</div>
          </div>
        </div>
      </div>
      <div className="road-actions">
        <button className="btn primary" onClick={() => onBookNow(quickStats.fastest)} disabled={!quickStats.fastest || quickStats.fastest.free <= 0}>
          Book Nearest Spot
        </button>
        <span className="road-note">Signal: {slots.length} active parking zones online</span>
      </div>
    </div>
  );
}

function Topbar({ user, page, setPage, onLogout, theme, onToggleTheme, onOpenCommand }) {
  const tabs = [
    { id: "dashboard", label: "Dashboard" },
    { id: "slots", label: "Find Parking" },
    { id: "map", label: "Map" },
    { id: "insights", label: "Insights" },
    { id: "favorites", label: "Favorites" },
    { id: "bookings", label: "My Bookings" },
    ...(user?.role === "admin" ? [{ id: "admin", label: "Admin" }] : []),
  ];

  return (
    <header className="topbar">
      <div className="topbar-inner">
        <div className="brand" onClick={() => setPage(user ? "dashboard" : "login")}>ParkOS</div>
        {user && (
          <div className="tabs">
            {tabs.map((tab) => (
              <button key={tab.id} className={`tab ${page === tab.id ? "active" : ""}`} onClick={() => setPage(tab.id)}>
                {tab.label}
              </button>
            ))}
          </div>
        )}
        <div className="push-right row">
          {user && <button className="btn" onClick={onOpenCommand} title="Quick actions">Quick Menu (Ctrl+K)</button>}
          <button className="btn" onClick={onToggleTheme} title="Toggle theme">
            {theme === "dark" ? "Light" : "Dark"}
          </button>
          {user ? (
            <>
              <span style={{ color: "var(--text-soft)", fontSize: 13 }}>
                {user.name} ({user.role})
              </span>
              <button className="btn" onClick={onLogout}>Sign out</button>
            </>
          ) : (
            <>
              <button className="btn" onClick={() => setPage("login")}>Sign in</button>
              <button className="btn primary" onClick={() => setPage("signup")}>Create account</button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

function Login({ onSuccess, gotoSignup }) {
  const [username, setUsername] = useState("shimpi");
  const [password, setPassword] = useState("1234");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { user, token } = await api("/auth/login", {
        method: "POST",
        body: JSON.stringify({ username, password }),
      });
      onSuccess(user, token);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: 460 }}>
      <div className="card">
        <h1 style={{ marginTop: 0 }}>Sign in</h1>
        <p style={{ color: "var(--text-soft)", marginTop: 0 }}>Use your ParkOS account to manage parking.</p>
        <div className="row" style={{ marginBottom: 10, flexWrap: "wrap" }}>
          <button
            type="button"
            className="btn"
            style={{ padding: "6px 10px" }}
            onClick={() => {
              setUsername("admin");
              setPassword("1234");
            }}
          >
            Use Admin Demo
          </button>
          <button
            type="button"
            className="btn"
            style={{ padding: "6px 10px" }}
            onClick={() => {
              setUsername("shimpi");
              setPassword("1234");
            }}
          >
            Use User Demo
          </button>
        </div>
        <form onSubmit={submit}>
          <label className="label">Username</label>
          <input className="input" value={username} onChange={(e) => setUsername(e.target.value)} />
          <label className="label" style={{ marginTop: 12 }}>Password</label>
          <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          {error && <p style={{ color: "#9f9154", marginBottom: 0 }}>{error}</p>}
          <button className="btn primary" style={{ width: "100%", marginTop: 14 }} disabled={loading}>
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>
        <p style={{ color: "var(--text-soft)", fontSize: 14 }}>
          No account? <button className="btn" style={{ padding: "4px 8px" }} onClick={gotoSignup}>Create one</button>
        </p>
      </div>
    </div>
  );
}

function Signup({ onSuccess, gotoLogin }) {
  const [form, setForm] = useState({ name: "", email: "", username: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { user, token } = await api("/auth/signup", {
        method: "POST",
        body: JSON.stringify(form),
      });
      onSuccess(user, token);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: 540 }}>
      <div className="card">
        <h1 style={{ marginTop: 0 }}>Create account</h1>
        <form onSubmit={submit}>
          <div className="grid-2">
            <div>
              <label className="label">Full name</label>
              <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div>
              <label className="label">Email</label>
              <input className="input" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
          </div>
          <div className="grid-2" style={{ marginTop: 12 }}>
            <div>
              <label className="label">Username</label>
              <input className="input" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} />
            </div>
            <div>
              <label className="label">Password</label>
              <input className="input" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
            </div>
          </div>
          {error && <p style={{ color: "#9f9154", marginBottom: 0 }}>{error}</p>}
          <button className="btn primary" style={{ width: "100%", marginTop: 14 }} disabled={loading}>
            {loading ? "Creating..." : "Create account"}
          </button>
        </form>
        <p style={{ color: "var(--text-soft)", fontSize: 14 }}>
          Have an account? <button className="btn" style={{ padding: "4px 8px" }} onClick={gotoLogin}>Sign in</button>
        </p>
      </div>
    </div>
  );
}

function Dashboard({ stats, recentBookings, slots, recentViewedSlots, onBookNow, favoriteSlotIds, onToggleFavorite, alerts, onGoInsights, onGoMap }) {
  return (
    <div className="container">
      <div className="card hero-shell">
        <div className="section-head">
          <div>
            <h2 style={{ marginBottom: 4 }}>Parking Command Center</h2>
            <p style={{ marginTop: 0, color: "var(--text-soft)" }}>Live performance across bookings, spend, and availability.</p>
          </div>
          <div className="row">
            <button className="btn" onClick={onGoInsights}>Open Insights</button>
            <button className="btn" onClick={onGoMap}>Open Map Explorer</button>
            <button className="btn primary" onClick={onBookNow}>New booking</button>
          </div>
        </div>
        <div className="quick-kpis">
          <div className="kpi-chip"><div className="meta">Total bookings</div><div className="value mono">{stats.totalBookings}</div></div>
          <div className="kpi-chip"><div className="meta">Active now</div><div className="value mono">{stats.activeBookings}</div></div>
          <div className="kpi-chip"><div className="meta">Total spent</div><div className="value mono">{toCurrency(stats.totalSpent)}</div></div>
          <div className="kpi-chip"><div className="meta">Favourite spot</div><div className="value" style={{ fontSize: 18 }}>{stats.favouriteSlot || "-"}</div></div>
        </div>
        {alerts.length > 0 && (
          <div className="alert-strip">
            {alerts.slice(0, 4).map((alert) => (
              <div key={alert} className="alert-pill">{alert}</div>
            ))}
          </div>
        )}
      </div>

      <CarShowcase slots={slots} onBookNow={onBookNow} />
      <RoadParkingTheme slots={slots} onBookNow={onBookNow} />

      <div className="card" style={{ marginTop: 14 }}>
        <div className="section-head">
          <div>
            <h3 style={{ marginTop: 0 }}>Map Explorer</h3>
            <p style={{ marginTop: 0, color: "var(--text-soft)" }}>Open the live map to see your position, parking markers, and ETA sorting.</p>
          </div>
          <button className="btn primary" onClick={onGoMap}>Open Map</button>
        </div>
        <div className="grid-3">
          {slots.slice(0, 3).map((slot) => (
            <div key={slot.id} className="map-slot-row">
              <div className="section-head">
                <strong>{slot.name}</strong>
                <span className="mono">{slot.city}</span>
              </div>
              <div style={{ color: "var(--text-soft)", fontSize: 13 }}>{slot.address}</div>
              <div className="row" style={{ justifyContent: "space-between", marginTop: 8 }}>
                <span>Free {slot.free}/{slot.total}</span>
                <span className="mono">Rs {slot.pricePerHour}/h</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginTop: 14 }}>
        <MiniMapPreview slots={slots} />
      </div>

      <div className="row" style={{ justifyContent: "space-between", marginTop: 14 }}>
        <div>
          <h2 style={{ marginBottom: 4 }}>Daily Activity</h2>
          <p style={{ marginTop: 0, color: "var(--text-soft)" }}>Your parking activity at a glance.</p>
        </div>
      </div>

      <div className="grid-4">
        <div className="card"><div style={{ color: "var(--text-soft)", fontSize: 13 }}>Total bookings</div><div className="mono" style={{ fontSize: 28 }}>{stats.totalBookings}</div></div>
        <div className="card"><div style={{ color: "var(--text-soft)", fontSize: 13 }}>Active now</div><div className="mono" style={{ fontSize: 28 }}>{stats.activeBookings}</div></div>
        <div className="card"><div style={{ color: "var(--text-soft)", fontSize: 13 }}>Total spent</div><div className="mono" style={{ fontSize: 28 }}>{toCurrency(stats.totalSpent)}</div></div>
        <div className="card"><div style={{ color: "var(--text-soft)", fontSize: 13 }}>Favourite spot</div><div style={{ fontSize: 22 }}>{stats.favouriteSlot || "-"}</div></div>
      </div>

      <div className="grid-2" style={{ marginTop: 14 }}>
        <div className="card table-wrap">
          <h3 style={{ marginTop: 0 }}>Recent bookings</h3>
          <table className="table">
            <thead>
              <tr><th>ID</th><th>Location</th><th>Date/Time</th><th>Status</th><th>Total</th></tr>
            </thead>
            <tbody>
              {recentBookings.length === 0 && <tr><td colSpan="5">No bookings yet</td></tr>}
              {recentBookings.map((booking) => (
                <tr key={booking.id}>
                  <td className="mono">{booking.id}</td>
                  <td>{booking.slotName}</td>
                  <td>{formatDateTime(booking.date, booking.time)}</td>
                  <td><span className={`badge ${statusClass(booking.status)}`}>{booking.status}</span></td>
                  <td className="mono">Rs {booking.total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="card">
          <h3 style={{ marginTop: 0 }}>Nearby slots</h3>
          <div style={{ display: "grid", gap: 9 }}>
            {slots.slice(0, 5).map((slot) => (
              <div key={slot.id} className="card" style={{ padding: 12 }}>
                <div className="row" style={{ justifyContent: "space-between" }}>
                  <strong>{slot.name}</strong>
                  <div className="row">
                    <button className="btn" style={{ padding: "4px 8px" }} onClick={() => onToggleFavorite(slot.id)}>
                      {favoriteSlotIds.includes(slot.id) ? "★" : "☆"}
                    </button>
                    <span className="mono">Rs {slot.pricePerHour}/h</span>
                  </div>
                </div>
                <div style={{ fontSize: 13, color: "var(--text-soft)", marginTop: 4 }}>{slot.address}</div>
                <div style={{ fontSize: 13, marginTop: 6 }}>Free: {slot.free}/{slot.total}</div>
                <button className="btn" style={{ marginTop: 8 }} onClick={() => onBookNow(slot)} disabled={slot.free <= 0}>Book this</button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card" style={{ marginTop: 14 }}>
        <div className="row" style={{ justifyContent: "space-between" }}>
          <h3 style={{ marginTop: 0 }}>Recently Viewed Slots</h3>
          <span className="mono" style={{ color: "var(--text-soft)" }}>{recentViewedSlots.length} items</span>
        </div>
        {recentViewedSlots.length === 0 ? (
          <div style={{ color: "var(--text-soft)" }}>No recently viewed slots yet. Open a slot to see it here.</div>
        ) : (
          <div className="grid-3">
            {recentViewedSlots.slice(0, 6).map((slot) => (
              <div key={slot.id} className="card" style={{ padding: 12 }}>
                <div className="row" style={{ justifyContent: "space-between" }}>
                  <strong>{slot.name}</strong>
                  <span className="mono">Rs {slot.pricePerHour}/h</span>
                </div>
                <div style={{ fontSize: 13, color: "var(--text-soft)", marginTop: 4 }}>{slot.city} · {slot.floor}</div>
                <div style={{ fontSize: 13, marginTop: 6 }}>Free: {slot.free}/{slot.total}</div>
                <div className="row" style={{ marginTop: 8 }}>
                  <button className="btn" onClick={() => onToggleFavorite(slot.id)}>
                    {favoriteSlotIds.includes(slot.id) ? "★" : "☆"}
                  </button>
                  <button className="btn" onClick={() => onBookNow(slot)} disabled={slot.free <= 0}>Book</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function SlotsPage({ slots, onSelectSlot, favoriteSlotIds, onToggleFavorite, userPreferenceKey, compareSlotIds, onToggleCompare }) {
  const slotDefaults = useMemo(
    () => readSectionPrefs(userPreferenceKey, "slots", {
      search: "",
      favoriteOnly: false,
      sortBy: "priceAsc",
      priceMin: 0,
      priceMax: 120,
    }),
    [userPreferenceKey],
  );

  const [search, setSearch] = useState(slotDefaults.search);
  const [favoriteOnly, setFavoriteOnly] = useState(slotDefaults.favoriteOnly);
  const [sortBy, setSortBy] = useState(slotDefaults.sortBy);
  const [priceMin, setPriceMin] = useState(slotDefaults.priceMin);
  const [priceMax, setPriceMax] = useState(slotDefaults.priceMax);

  const maxPriceInData = useMemo(() => {
    const max = Math.max(...slots.map((slot) => slot.pricePerHour || 0), 100);
    return Math.max(max, 100);
  }, [slots]);

  useEffect(() => {
    if (priceMax > maxPriceInData) {
      setPriceMax(maxPriceInData);
    }
  }, [maxPriceInData, priceMax]);

  useEffect(() => {
    writeSectionPrefs(userPreferenceKey, "slots", {
      search,
      favoriteOnly,
      sortBy,
      priceMin,
      priceMax,
    });
  }, [userPreferenceKey, search, favoriteOnly, sortBy, priceMin, priceMax]);

  const filtered = useMemo(() => {
    const value = search.trim().toLowerCase();
    const list = slots.filter((slot) => {
      if (favoriteOnly && !favoriteSlotIds.includes(slot.id)) {
        return false;
      }
      if (slot.pricePerHour < priceMin || slot.pricePerHour > priceMax) {
        return false;
      }
      if (!value) return true;
      return (
        slot.name.toLowerCase().includes(value) ||
        slot.address.toLowerCase().includes(value) ||
        slot.code.toLowerCase().includes(value)
      );
    });

    const sorted = [...list];
    if (sortBy === "priceAsc") sorted.sort((a, b) => a.pricePerHour - b.pricePerHour);
    if (sortBy === "priceDesc") sorted.sort((a, b) => b.pricePerHour - a.pricePerHour);
    if (sortBy === "freeDesc") sorted.sort((a, b) => b.free - a.free);
    if (sortBy === "distanceAsc") sorted.sort((a, b) => (a.distanceKm ?? 9999) - (b.distanceKm ?? 9999));
    if (sortBy === "name") sorted.sort((a, b) => a.name.localeCompare(b.name));
    return sorted;
  }, [search, slots, favoriteOnly, favoriteSlotIds, priceMin, priceMax, sortBy]);

  return (
    <div className="container">
      <RoadParkingTheme slots={slots} onBookNow={onSelectSlot} />
      <div className="row" style={{ justifyContent: "space-between", flexWrap: "wrap" }}>
        <h2>Find Parking</h2>
        <div className="row" style={{ flexWrap: "wrap" }}>
          <label className="row" style={{ fontSize: 13, color: "var(--text-soft)" }}>
            <input type="checkbox" checked={favoriteOnly} onChange={(e) => setFavoriteOnly(e.target.checked)} />
            Favorite only
          </label>
          <select className="input" style={{ width: 180 }} value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="priceAsc">Price low-high</option>
            <option value="priceDesc">Price high-low</option>
            <option value="freeDesc">Most free slots</option>
            <option value="distanceAsc">Nearest first</option>
            <option value="name">Name A-Z</option>
          </select>
          <label className="row" style={{ fontSize: 12, color: "var(--text-soft)" }}>
            Min Rs {priceMin}
            <input className="slider" type="range" min="0" max={maxPriceInData} step="5" value={priceMin} onChange={(e) => setPriceMin(Math.min(Number(e.target.value), priceMax))} />
          </label>
          <label className="row" style={{ fontSize: 12, color: "var(--text-soft)" }}>
            Max Rs {priceMax}
            <input className="slider" type="range" min="0" max={maxPriceInData} step="5" value={priceMax} onChange={(e) => setPriceMax(Math.max(Number(e.target.value), priceMin))} />
          </label>
          <input className="input" style={{ maxWidth: 260 }} placeholder="Search by name, code or address" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>
      <div className="grid-3">
        {filtered.length === 0 ? (
          <div style={{ gridColumn: "1 / -1" }}>
            <EmptyState icon="🅿️" title="No Slots Found" description="Try adjusting your search filters or price range." action={() => setSearch("")} actionLabel="Clear Filters" />
          </div>
        ) : (
          filtered.map((slot) => (
            <div className="slot-card-premium" key={slot.id}>
              <div className="row" style={{ justifyContent: "space-between" }}>
                <strong>{slot.name}</strong>
                <button className="btn" style={{ padding: "4px 8px" }} onClick={() => onToggleFavorite(slot.id)}>
                  {favoriteSlotIds.includes(slot.id) ? "★" : "☆"}
                </button>
              </div>
              <div style={{ color: "var(--text-soft)", marginTop: 6, fontSize: 13 }}>{slot.address}</div>
              <div className="slot-meta">
                <span className="meta-pill">Floor {slot.floor}</span>
                <span className="meta-pill">{slot.distanceKm ?? "--"} km away</span>
                <span className="meta-pill">{toCurrency(slot.pricePerHour)}/h</span>
              </div>
              <div style={{ marginTop: 10 }}>
                <AvailabilityIndicator free={slot.free} total={slot.total} />
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${Math.max(10, (slot.free / slot.total) * 100)}%` }} />
                </div>
              </div>
              <div style={{ marginTop: 10, fontSize: 12, color: "var(--text-soft)" }}>
                Match score: <strong style={{ color: "var(--text)" }}>{smartScore(slot, favoriteSlotIds.includes(slot.id))}/100</strong>
              </div>
              <div className="row" style={{ marginTop: 12 }}>
                <button className="btn" onClick={() => onToggleCompare(slot.id)}>
                  {compareSlotIds.includes(slot.id) ? "✓ Compare" : "Compare"}
                </button>
                <button className="btn primary" style={{ width: "100%" }} onClick={() => onSelectSlot(slot)} disabled={slot.free <= 0}>
                  {slot.free <= 0 ? "Full" : "Book slot"}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function BookingForm({ selectedSlot, bookingDraft, setBookingDraft, onProceed }) {
  if (!selectedSlot) {
    return <div className="container"><div className="card">Select a slot from Find Parking first.</div></div>;
  }

  const subtotal = selectedSlot.pricePerHour * Number(bookingDraft.duration || 1);
  const service = Math.round(subtotal * 0.1);
  const total = subtotal + service;

  return (
    <div className="container">
      <h2>Reservation Details</h2>
      <div className="grid-2">
        <div className="card">
          <h3 style={{ marginTop: 0 }}>{selectedSlot.name}</h3>
          <p style={{ color: "var(--text-soft)" }}>{selectedSlot.address}</p>
          <div className="grid-2">
            <div>
              <label className="label">Vehicle type</label>
              <select className="input" value={bookingDraft.vehicleType} onChange={(e) => setBookingDraft((prev) => ({ ...prev, vehicleType: e.target.value }))}>
                <option value="car">Car</option>
                <option value="bike">Bike</option>
              </select>
            </div>
            <div>
              <label className="label">Vehicle number</label>
              <input className="input mono" value={bookingDraft.vehicleNo} onChange={(e) => setBookingDraft((prev) => ({ ...prev, vehicleNo: e.target.value }))} />
            </div>
          </div>
          <div className="grid-2" style={{ marginTop: 12 }}>
            <div>
              <label className="label">Date</label>
              <input className="input" type="date" value={bookingDraft.date} onChange={(e) => setBookingDraft((prev) => ({ ...prev, date: e.target.value }))} />
            </div>
            <div>
              <label className="label">Time</label>
              <input className="input" type="time" value={bookingDraft.time} onChange={(e) => setBookingDraft((prev) => ({ ...prev, time: e.target.value }))} />
            </div>
          </div>
          <div style={{ marginTop: 12 }}>
            <label className="label">Appointment Type</label>
            <select className="input" value={bookingDraft.appointmentType} onChange={(e) => setBookingDraft((prev) => ({ ...prev, appointmentType: e.target.value }))}>
              <option value="new">New</option>
              <option value="followup">Follow-up</option>
              <option value="urgent">Urgent</option>
              <option value="lab">Lab</option>
            </select>
          </div>
          <div style={{ marginTop: 12 }}>
            <label className="label">Duration (hours)</label>
            <input className="input" type="number" min="1" max="24" value={bookingDraft.duration} onChange={(e) => setBookingDraft((prev) => ({ ...prev, duration: Number(e.target.value) }))} />
          </div>
        </div>
        <div className="card">
          <h3 style={{ marginTop: 0 }}>Order Summary</h3>
          <p>Parking fee: <span className="mono">Rs {subtotal}</span></p>
          <p>Service charge: <span className="mono">Rs {service}</span></p>
          <p><strong>Total:</strong> <strong className="mono">Rs {total}</strong></p>
          <button className="btn primary" style={{ width: "100%", marginTop: 14 }} onClick={onProceed}>Proceed to payment</button>
        </div>
      </div>
    </div>
  );
}

function Payment({ total, onPay, paying }) {
  const [method, setMethod] = useState("upi");

  return (
    <div className="container" style={{ maxWidth: 720 }}>
      <div className="card">
        <h2 style={{ marginTop: 0 }}>Payment</h2>
        <label className="label">Payment method</label>
        <select className="input" value={method} onChange={(e) => setMethod(e.target.value)}>
          <option value="upi">UPI</option>
          <option value="card">Card</option>
          <option value="cash">Pay at location</option>
        </select>
        <button className="btn primary" style={{ width: "100%", marginTop: 14 }} disabled={paying} onClick={() => onPay(method)}>
          {paying ? "Processing..." : `Pay Rs ${total}`}
        </button>
      </div>
    </div>
  );
}

function Confirmation({ booking, onBackToDashboard, onBookAgain }) {
  if (!booking) {
    return <div className="container"><div className="card">No booking selected.</div></div>;
  }

  return (
    <div className="container" style={{ maxWidth: 780 }}>
      <div className="card">
        <h2 style={{ marginTop: 0 }}>Booking Confirmed</h2>
        <p style={{ color: "var(--text-soft)" }}>Your slot has been reserved successfully.</p>
        <div className="grid-2">
          <div>
            <p><strong>ID:</strong> <span className="mono">{booking.id}</span></p>
            <p><strong>Location:</strong> {booking.slotName}</p>
            <p><strong>Vehicle:</strong> <span className="mono">{booking.vehicleNo}</span></p>
            <p><strong>Date/Time:</strong> {formatDateTime(booking.date, booking.time)}</p>
            <p><strong>Duration:</strong> {booking.duration}h</p>
          </div>
          <div>
            <p><strong>Parking fee:</strong> <span className="mono">Rs {booking.subtotal}</span></p>
            <p><strong>Service:</strong> <span className="mono">Rs {booking.serviceCharge}</span></p>
            <p><strong>Total paid:</strong> <span className="mono">Rs {booking.total}</span></p>
            <p><strong>Status:</strong> <span className={`badge ${statusClass(booking.status)}`}>{booking.status}</span></p>
          </div>
        </div>
        <div className="row" style={{ marginTop: 12 }}>
          <button className="btn" onClick={onBackToDashboard}>Back to dashboard</button>
          <button className="btn primary" onClick={onBookAgain}>Book another</button>
        </div>
      </div>
    </div>
  );
}

function BookingsPage({ bookings, onExtend, onCancel, busyBookingId }) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const totalSpent = bookings
    .filter((booking) => booking.status !== "cancelled")
    .reduce((sum, booking) => sum + booking.total, 0);

  const visibleBookings = useMemo(() => {
    const value = search.trim().toLowerCase();
    return bookings.filter((booking) => {
      if (statusFilter !== "all" && booking.status !== statusFilter) return false;
      if (!value) return true;
      return (
        booking.id.toLowerCase().includes(value) ||
        booking.slotName.toLowerCase().includes(value) ||
        booking.vehicleNo.toLowerCase().includes(value)
      );
    });
  }, [bookings, search, statusFilter]);

  const exportBookings = () => {
    downloadCsv("my-bookings.csv", visibleBookings.map((booking) => ({
      id: booking.id,
      location: booking.slotName,
      vehicle: booking.vehicleNo,
      date: booking.date,
      time: booking.time,
      durationHours: booking.duration,
      status: booking.status,
      total: booking.total,
    })));
  };

  return (
    <div className="container">
      <div className="row" style={{ justifyContent: "space-between", flexWrap: "wrap" }}>
        <h2>My Bookings</h2>
        <div className="row" style={{ flexWrap: "wrap" }}>
          <input className="input" style={{ width: 220 }} placeholder="Search booking, slot, vehicle" value={search} onChange={(e) => setSearch(e.target.value)} />
          <select className="input" style={{ width: 140 }} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="all">All status</option>
            <option value="upcoming">Upcoming</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <button className="btn" onClick={exportBookings} disabled={visibleBookings.length === 0}>Export CSV</button>
          <div className="mono">Total spent: {toCurrency(totalSpent)}</div>
        </div>
      </div>
      <div className="card table-wrap">
        {visibleBookings.length === 0 ? (
          <EmptyState 
            icon="📅" 
            title="No Bookings Yet" 
            description="Book a parking slot to get started. Your reservation details will appear here."
            action={() => {}}
            actionLabel=""
          />
        ) : (
          <table className="table">
            <thead>
              <tr><th>ID</th><th>Location</th><th>Vehicle</th><th>Date/Time</th><th>Duration</th><th>Total</th><th>Status</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {visibleBookings.map((booking) => (
                <tr key={booking.id}>
                  <td className="mono">{booking.id}</td>
                  <td>{booking.slotName}</td>
                  <td className="mono">{booking.vehicleNo}</td>
                  <td>{formatDateTime(booking.date, booking.time)}</td>
                  <td className="mono">{booking.duration}h</td>
                  <td className="mono">Rs {booking.total}</td>
                  <td><span className={`badge ${statusClass(booking.status)}`}>{booking.status}</span></td>
                  <td>
                    <div className="row">
                      <button className="btn" disabled={busyBookingId === booking.id || booking.status === "cancelled"} onClick={() => onExtend(booking.id)}>+1h</button>
                      <button className="btn danger" disabled={busyBookingId === booking.id || booking.status === "cancelled"} onClick={() => onCancel(booking.id)}>Cancel</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function FavoritesPage({ favorites, onSelectSlot, onToggleFavorite, userPreferenceKey }) {
  const favoriteDefaults = useMemo(
    () => readSectionPrefs(userPreferenceKey, "favorites", {
      city: "all",
      availability: "all",
      sortBy: "priceAsc",
      priceMin: 0,
      priceMax: 120,
    }),
    [userPreferenceKey],
  );

  const [city, setCity] = useState(favoriteDefaults.city);
  const [availability, setAvailability] = useState(favoriteDefaults.availability);
  const [sortBy, setSortBy] = useState(favoriteDefaults.sortBy);
  const [priceMin, setPriceMin] = useState(favoriteDefaults.priceMin);
  const [priceMax, setPriceMax] = useState(favoriteDefaults.priceMax);

  const maxPriceInData = useMemo(() => {
    const max = Math.max(...favorites.map((slot) => slot.pricePerHour || 0), 100);
    return Math.max(max, 100);
  }, [favorites]);

  useEffect(() => {
    if (priceMax > maxPriceInData) {
      setPriceMax(maxPriceInData);
    }
  }, [maxPriceInData, priceMax]);

  useEffect(() => {
    writeSectionPrefs(userPreferenceKey, "favorites", {
      city,
      availability,
      sortBy,
      priceMin,
      priceMax,
    });
  }, [userPreferenceKey, city, availability, sortBy, priceMin, priceMax]);

  const cityOptions = useMemo(() => {
    const unique = Array.from(new Set(favorites.map((slot) => slot.city).filter(Boolean)));
    return ["all", ...unique];
  }, [favorites]);

  const visibleFavorites = useMemo(() => {
    const list = favorites.filter((slot) => {
      if (city !== "all" && slot.city !== city) {
        return false;
      }
      if (availability === "available" && slot.free <= 0) {
        return false;
      }
      if (availability === "low" && slot.free > 3) {
        return false;
      }
      if (slot.pricePerHour < priceMin || slot.pricePerHour > priceMax) {
        return false;
      }
      return true;
    });

    const sorted = [...list];
    if (sortBy === "priceAsc") sorted.sort((a, b) => a.pricePerHour - b.pricePerHour);
    if (sortBy === "priceDesc") sorted.sort((a, b) => b.pricePerHour - a.pricePerHour);
    if (sortBy === "freeDesc") sorted.sort((a, b) => b.free - a.free);
    if (sortBy === "distanceAsc") sorted.sort((a, b) => (a.distanceKm ?? 9999) - (b.distanceKm ?? 9999));
    if (sortBy === "name") sorted.sort((a, b) => a.name.localeCompare(b.name));
    return sorted;
  }, [favorites, city, availability, sortBy, priceMin, priceMax]);

  return (
    <div className="container">
      <div className="row" style={{ justifyContent: "space-between", flexWrap: "wrap" }}>
        <h2>Favorite Slots</h2>
        <div className="row" style={{ flexWrap: "wrap" }}>
          <select className="input" style={{ width: 150 }} value={city} onChange={(e) => setCity(e.target.value)}>
            {cityOptions.map((option) => (
              <option key={option} value={option}>{option === "all" ? "All cities" : option}</option>
            ))}
          </select>
          <select className="input" style={{ width: 160 }} value={availability} onChange={(e) => setAvailability(e.target.value)}>
            <option value="all">All availability</option>
            <option value="available">Available only</option>
            <option value="low">Low stock ({"<=3"})</option>
          </select>
          <select className="input" style={{ width: 150 }} value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="priceAsc">Price low-high</option>
            <option value="priceDesc">Price high-low</option>
            <option value="freeDesc">Most free slots</option>
            <option value="distanceAsc">Nearest first</option>
            <option value="name">Name A-Z</option>
          </select>
          <label className="row" style={{ fontSize: 12, color: "var(--text-soft)" }}>
            Min Rs {priceMin}
            <input className="slider" type="range" min="0" max={maxPriceInData} step="5" value={priceMin} onChange={(e) => setPriceMin(Math.min(Number(e.target.value), priceMax))} />
          </label>
          <label className="row" style={{ fontSize: 12, color: "var(--text-soft)" }}>
            Max Rs {priceMax}
            <input className="slider" type="range" min="0" max={maxPriceInData} step="5" value={priceMax} onChange={(e) => setPriceMax(Math.max(Number(e.target.value), priceMin))} />
          </label>
          <div className="mono" style={{ color: "var(--text-soft)" }}>Saved: {favorites.length}</div>
        </div>
      </div>

      {visibleFavorites.length === 0 ? (
        <EmptyState 
          icon="⭐" 
          title="No Favorite Slots" 
          description="Save your favorite parking slots to access them quickly. Click the star icon to add favorites."
        />
      ) : (
        <div className="grid-3">
          {visibleFavorites.map((slot) => (
            <div className="slot-card-premium" key={slot.id}>
              <div className="row" style={{ justifyContent: "space-between" }}>
                <strong>{slot.name}</strong>
                <button className="btn" style={{ padding: "4px 8px" }} onClick={() => onToggleFavorite(slot.id)}>★</button>
              </div>
              <div style={{ color: "var(--text-soft)", marginTop: 6, fontSize: 13 }}>{slot.address}</div>
              <div className="slot-meta">
                <span className="meta-pill">Floor {slot.floor}</span>
                <span className="meta-pill">{slot.distanceKm ?? "--"} km away</span>
                <span className="meta-pill">Rs {slot.pricePerHour}/h</span>
              </div>
              <div style={{ marginTop: 10 }}>
                <AvailabilityIndicator free={slot.free} total={slot.total} />
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${Math.max(10, (slot.free / slot.total) * 100)}%` }} />
                </div>
              </div>
              <button className="btn primary" style={{ width: "100%", marginTop: 12 }} onClick={() => onSelectSlot(slot)} disabled={slot.free <= 0}>
                {slot.free <= 0 ? "Full" : "Book slot"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function InsightsPage({ bookings, slots, favoriteSlotIds, onBookNow }) {
  const statusCounts = useMemo(() => {
    const initial = { active: 0, completed: 0, cancelled: 0, upcoming: 0 };
    bookings.forEach((booking) => {
      initial[booking.status] = (initial[booking.status] || 0) + 1;
    });
    return initial;
  }, [bookings]);

  const total = Math.max(bookings.length, 1);
  const activePct = Math.round((statusCounts.active / total) * 100);
  const completedPct = Math.min(100, activePct + Math.round((statusCounts.completed / total) * 100));
  const cancelledPct = Math.min(100, completedPct + Math.round((statusCounts.cancelled / total) * 100));

  const topRecommendations = useMemo(() => {
    return [...slots]
      .sort((a, b) => smartScore(b, favoriteSlotIds.includes(b.id)) - smartScore(a, favoriteSlotIds.includes(a.id)))
      .slice(0, 3);
  }, [slots, favoriteSlotIds]);

  const hourlyDemand = useMemo(() => {
    const map = new Map();
    for (let h = 6; h <= 22; h += 2) map.set(h, 0);
    bookings.forEach((booking) => {
      const hour = Number((booking.time || "00:00").split(":")[0]);
      const bucket = hour % 2 === 0 ? hour : hour - 1;
      if (map.has(bucket)) map.set(bucket, map.get(bucket) + 1);
    });
    const max = Math.max(...map.values(), 1);
    return Array.from(map.entries()).map(([hour, value]) => ({
      hour,
      value,
      pct: Math.round((value / max) * 100),
    }));
  }, [bookings]);

  return (
    <div className="container">
      <div className="section-head" style={{ marginBottom: 12 }}>
        <h2>Insights</h2>
        <button className="btn primary" onClick={() => onBookNow()}>Book from recommendation</button>
      </div>
      <div className="insight-grid">
        <div className="card">
          <h3 style={{ marginTop: 0 }}>Booking Health</h3>
          <p style={{ color: "var(--text-soft)" }}>Status split for your complete booking history.</p>
          <div className="ring-chart" style={{ "--status-active": `${activePct}%`, "--status-completed": `${completedPct}%`, "--status-cancelled": `${cancelledPct}%` }} />
          <div className="insight-list" style={{ marginTop: 10 }}>
            <div className="insight-row"><span>Active</span><strong>{statusCounts.active}</strong></div>
            <div className="insight-row"><span>Completed</span><strong>{statusCounts.completed}</strong></div>
            <div className="insight-row"><span>Upcoming</span><strong>{statusCounts.upcoming}</strong></div>
            <div className="insight-row"><span>Cancelled</span><strong>{statusCounts.cancelled}</strong></div>
          </div>
        </div>

        <div className="card">
          <h3 style={{ marginTop: 0 }}>Demand Forecast</h3>
          <p style={{ color: "var(--text-soft)" }}>Peak booking windows based on your historical start times.</p>
          <div className="forecast-grid" style={{ marginTop: 10 }}>
            {hourlyDemand.map((item) => (
              <div className="forecast-bar" key={item.hour}>
                <span className="mono">{String(item.hour).padStart(2, "0")}:00</span>
                <div className="forecast-track"><div className="forecast-fill" style={{ width: `${item.pct}%` }} /></div>
                <span>{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card" style={{ marginTop: 14 }}>
        <h3 style={{ marginTop: 0 }}>Smart Recommendations</h3>
        <div className="grid-3">
          {topRecommendations.map((slot) => {
            const meta = slotMeta(slot);
            return (
              <div className="card" key={slot.id} style={{ padding: 12 }}>
                <div className="row" style={{ justifyContent: "space-between" }}>
                  <strong>{slot.name}</strong>
                  <span className="mono">{smartScore(slot, favoriteSlotIds.includes(slot.id))}/100</span>
                </div>
                <div style={{ fontSize: 13, color: "var(--text-soft)", marginTop: 6 }}>{slot.city} · {slot.distanceKm ?? "--"} km</div>
                <div className="row" style={{ marginTop: 8, flexWrap: "wrap" }}>
                  {meta.covered && <span className="badge completed">Covered</span>}
                  {meta.evReady && <span className="badge active">EV-ready</span>}
                  {meta.lowAvailability && <span className="badge cancelled">Low stock</span>}
                  {meta.premium && <span className="badge upcoming">Premium</span>}
                </div>
                <button className="btn" style={{ marginTop: 10, width: "100%" }} onClick={() => onBookNow(slot)}>Book this spot</button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function SlotCompareTray({ selectedSlots, onRemove, onBook, onClear }) {
  if (!selectedSlots.length) return null;
  return (
    <div className="compare-tray">
      <div className="section-head">
        <strong>Comparing {selectedSlots.length} slots</strong>
        <button className="btn" onClick={onClear}>Clear all</button>
      </div>
      <div className="compare-grid" style={{ marginTop: 10 }}>
        {selectedSlots.map((slot) => (
          <div className="slot-card-premium" key={slot.id}>
            <div className="row" style={{ justifyContent: "space-between" }}>
              <strong>{slot.name}</strong>
              <button className="btn" style={{ padding: "4px 7px", color: "var(--text-soft)" }} onClick={() => onRemove(slot.id)}>✕</button>
            </div>
            <div className="slot-meta" style={{ marginTop: 8 }}>
              <span className="meta-pill">{toCurrency(slot.pricePerHour)}/h</span>
              <span className="meta-pill">{slot.distanceKm ?? "--"} km</span>
            </div>
            <div style={{ marginTop: 10 }}>
              <AvailabilityIndicator free={slot.free} total={slot.total} />
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${Math.max(10, (slot.free / slot.total) * 100)}%` }} />
              </div>
            </div>
            <button className="btn primary" style={{ marginTop: 10, width: "100%" }} onClick={() => onBook(slot)}>Book</button>
          </div>
        ))}
      </div>
    </div>
  );
}

function CommandPalette({ open, onClose, items, onRun }) {
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (!open) setQuery("");
  }, [open]);

  const visible = useMemo(() => {
    const value = query.trim().toLowerCase();
    if (!value) return items;
    return items.filter((item) => item.label.toLowerCase().includes(value));
  }, [items, query]);

  if (!open) return null;

  return (
    <div className="command-overlay" onClick={onClose}>
      <div className="command-panel" onClick={(e) => e.stopPropagation()}>
        <input className="input" autoFocus placeholder="Type an action..." value={query} onChange={(e) => setQuery(e.target.value)} />
        {visible.map((item) => (
          <button key={item.id} className="command-result" onClick={() => { onRun(item.id); onClose(); }}>
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function AdminAccessRequired({ onGoDashboard, onLogout }) {
  return (
    <div className="container" style={{ maxWidth: 720 }}>
      <div className="card">
        <h2 style={{ marginTop: 0 }}>Admin Access Required</h2>
        <p style={{ color: "var(--text-soft)", marginTop: 0 }}>
          This page is available only for admin accounts. Sign in with <span className="mono">admin / 1234</span> to view schedule routing and booking record deep links.
        </p>
        <div className="row">
          <button className="btn" onClick={onGoDashboard}>Back to Dashboard</button>
          <button className="btn primary" onClick={onLogout}>Sign out</button>
        </div>
      </div>
    </div>
  );
}

function AdminPage({ slots, loadSlots, showNotice, apiClient, onNavigateBooking }) {
  const emptyForm = {
    id: "",
    code: "",
    name: "",
    address: "",
    city: "",
    floor: "",
    total: 10,
    free: 10,
    pricePerHour: 40,
  };

  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState("");

  const editSlot = (slot) => {
    setForm({ ...slot });
  };

  const reset = () => {
    setForm(emptyForm);
  };

  const save = async () => {
    setSaving(true);
    try {
      if (form.id) {
        await api(`/admin/slots/${form.id}`, {
          method: "PATCH",
          body: JSON.stringify({
            code: form.code,
            name: form.name,
            address: form.address,
            city: form.city,
            floor: form.floor,
            total: Number(form.total),
            free: Number(form.free),
            pricePerHour: Number(form.pricePerHour),
          }),
        });
        showNotice("Slot updated");
      } else {
        await api("/admin/slots", {
          method: "POST",
          body: JSON.stringify({
            code: form.code,
            name: form.name,
            address: form.address,
            city: form.city,
            floor: form.floor,
            total: Number(form.total),
            free: Number(form.free),
            pricePerHour: Number(form.pricePerHour),
          }),
        });
        showNotice("Slot created");
      }
      reset();
      await loadSlots();
    } catch (error) {
      showNotice(error.message);
    } finally {
      setSaving(false);
    }
  };

  const removeSlot = async (id) => {
    setDeletingId(id);
    try {
      await api(`/admin/slots/${id}`, { method: "DELETE" });
      showNotice("Slot deleted");
      if (form.id === id) reset();
      await loadSlots();
    } catch (error) {
      showNotice(error.message);
    } finally {
      setDeletingId("");
    }
  };

  return (
    <div className="container">
      <h2>Admin Slot Management</h2>
      <div className="grid-2">
        <div className="card">
          <h3 style={{ marginTop: 0 }}>{form.id ? "Edit Slot" : "Create New Slot"}</h3>
          <div className="grid-2">
            <div>
              <label className="label">Code</label>
              <input className="input" value={form.code} onChange={(e) => setForm((prev) => ({ ...prev, code: e.target.value }))} />
            </div>
            <div>
              <label className="label">Name</label>
              <input className="input" value={form.name} onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))} />
            </div>
          </div>
          <div style={{ marginTop: 10 }}>
            <label className="label">Address</label>
            <input className="input" value={form.address} onChange={(e) => setForm((prev) => ({ ...prev, address: e.target.value }))} />
          </div>
          <div className="grid-2" style={{ marginTop: 10 }}>
            <div>
              <label className="label">City</label>
              <input className="input" value={form.city} onChange={(e) => setForm((prev) => ({ ...prev, city: e.target.value }))} />
            </div>
            <div>
              <label className="label">Floor</label>
              <input className="input" value={form.floor} onChange={(e) => setForm((prev) => ({ ...prev, floor: e.target.value }))} />
            </div>
          </div>
          <div className="grid-3" style={{ marginTop: 10 }}>
            <div>
              <label className="label">Total</label>
              <input className="input" type="number" min="1" value={form.total} onChange={(e) => setForm((prev) => ({ ...prev, total: Number(e.target.value) }))} />
            </div>
            <div>
              <label className="label">Free</label>
              <input className="input" type="number" min="0" value={form.free} onChange={(e) => setForm((prev) => ({ ...prev, free: Number(e.target.value) }))} />
            </div>
            <div>
              <label className="label">Price/hour</label>
              <input className="input" type="number" min="1" value={form.pricePerHour} onChange={(e) => setForm((prev) => ({ ...prev, pricePerHour: Number(e.target.value) }))} />
            </div>
          </div>
          <div className="row" style={{ marginTop: 12 }}>
            <button className="btn primary" disabled={saving} onClick={save}>{saving ? "Saving..." : form.id ? "Update slot" : "Create slot"}</button>
            <button className="btn" onClick={reset}>Reset</button>
          </div>
        </div>

        <div className="card table-wrap">
          <h3 style={{ marginTop: 0 }}>All Slots ({slots.length})</h3>
          <table className="table">
            <thead>
              <tr><th>Code</th><th>Name</th><th>Free/Total</th><th>Rate</th><th>Action</th></tr>
            </thead>
            <tbody>
              {slots.map((slot) => (
                <tr key={slot.id}>
                  <td className="mono">{slot.code}</td>
                  <td>{slot.name}</td>
                  <td>{slot.free}/{slot.total}</td>
                  <td className="mono">Rs {slot.pricePerHour}</td>
                  <td>
                    <div className="row">
                      <button className="btn" onClick={() => editSlot(slot)}>Edit</button>
                      <button className="btn danger" disabled={deletingId === slot.id} onClick={() => removeSlot(slot.id)}>
                        {deletingId === slot.id ? "Deleting..." : "Delete"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <AdminScheduleBoard api={apiClient} showNotice={showNotice} onNavigateBooking={onNavigateBooking} />
    </div>
  );
}

function AdminBookingRecordPage({ bookingCode, apiClient, onBack, showNotice }) {
  const [loading, setLoading] = useState(true);
  const [record, setRecord] = useState(null);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      setLoading(true);
      try {
        const data = await apiClient(`/admin/bookings/${bookingCode}`);
        if (mounted) setRecord(data.booking);
      } catch (error) {
        showNotice(error.message);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    if (bookingCode) {
      load();
    }

    return () => {
      mounted = false;
    };
  }, [apiClient, bookingCode, showNotice]);

  return (
    <div className="container">
      <div className="row" style={{ justifyContent: "space-between", marginBottom: 12 }}>
        <h2 style={{ margin: 0 }}>Booking Record</h2>
        <button className="btn" onClick={onBack}>Back to Admin</button>
      </div>

      <div className="card">
        {loading && <div>Loading booking record...</div>}

        {!loading && !record && <div>Booking record not found.</div>}

        {!loading && record && (
          <div className="grid-2">
            <div>
              <p><strong>ID:</strong> <span className="mono">{record.id}</span></p>
              <p><strong>User:</strong> {record.user?.name} ({record.user?.username})</p>
              <p><strong>Email:</strong> {record.user?.email}</p>
              <p><strong>Location:</strong> {record.slotName}</p>
              <p><strong>Address:</strong> {record.slotAddress}</p>
              <p><strong>Floor:</strong> {record.floor}</p>
            </div>
            <div>
              <p><strong>Date:</strong> {record.date}</p>
              <p><strong>Time:</strong> {record.time}</p>
              <p><strong>Duration:</strong> {record.duration}h</p>
              <p><strong>Vehicle:</strong> <span className="mono">{record.vehicleNo}</span></p>
              <p><strong>Type:</strong> {record.appointmentType}</p>
              <p><strong>Status:</strong> <span className={`badge ${statusClass(record.status)}`}>{record.status}</span></p>
              <p><strong>Total:</strong> <span className="mono">Rs {record.total}</span></p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function defaultDraft() {
  const now = new Date();
  const date = now.toISOString().split("T")[0];
  const hour = String(now.getHours()).padStart(2, "0");
  const minute = String(now.getMinutes()).padStart(2, "0");
  return {
    vehicleType: "car",
    appointmentType: "new",
    vehicleNo: "MH02-AB-1234",
    date,
    time: `${hour}:${minute}`,
    duration: 2,
  };
}

export default function App() {
  if (window.location.hash === "#schedule-prototype") {
    return <ScheduleLayoutPrototype />;
  }

  const initialAdminBookingCode = getAdminBookingCodeFromHash();

  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(USER_KEY) || "null");
    } catch {
      return null;
    }
  });

  const [page, setPage] = useState(user ? (initialAdminBookingCode ? "admin-booking" : "dashboard") : "login");
  const userPreferenceKey = user?.id || "guest";
  const themeDefaults = readSectionPrefs(userPreferenceKey, "theme", { mode: "light" });
  const [theme, setTheme] = useState(themeDefaults.mode);
  const [adminBookingCode, setAdminBookingCode] = useState(initialAdminBookingCode);
  const [slots, setSlots] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [favoriteSlotIds, setFavoriteSlotIds] = useState([]);
  const [recentViewedSlots, setRecentViewedSlots] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [stats, setStats] = useState({ totalBookings: 0, activeBookings: 0, totalSpent: 0, favouriteSlot: "-" });
  const [recentBookings, setRecentBookings] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [bookingDraft, setBookingDraft] = useState(defaultDraft);
  const [lastBooking, setLastBooking] = useState(null);
  const [notice, setNotice] = useState("");
  const [paying, setPaying] = useState(false);
  const [busyBookingId, setBusyBookingId] = useState("");
  const [compareSlotIds, setCompareSlotIds] = useState([]);
  const [commandOpen, setCommandOpen] = useState(false);

  useEffect(() => {
    if (notice) {
      const id = setTimeout(() => setNotice(""), 3000);
      return () => clearTimeout(id);
    }
    return undefined;
  }, [notice]);

  const showNotice = useCallback((value) => setNotice(value), []);

  useEffect(() => {
    document.body.setAttribute("data-theme", theme);
    writeSectionPrefs(userPreferenceKey, "theme", { mode: theme });
  }, [theme, userPreferenceKey]);

  useEffect(() => {
    const syncFromHash = () => {
      const code = getAdminBookingCodeFromHash();
      setAdminBookingCode(code);
      if (code && user?.role === "admin") {
        setPage("admin-booking");
      }
    };

    window.addEventListener("hashchange", syncFromHash);
    return () => window.removeEventListener("hashchange", syncFromHash);
  }, [user]);

  useEffect(() => {
    const onKey = (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setCommandOpen(true);
      }
      if (event.key === "Escape") {
        setCommandOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const loadSlots = useCallback(async () => {
    if (!user) return;
    const data = await api("/slots");
    setSlots(data.slots);
  }, [user]);

  const loadFavorites = useCallback(async () => {
    if (!user) return;
    const data = await api("/favorites");
    setFavorites(data.slots || []);
    setFavoriteSlotIds(data.favoriteSlotIds || []);
  }, [user]);

  const loadRecentViewed = useCallback(async () => {
    if (!user) return;
    const data = await api("/recent-slots");
    setRecentViewedSlots(data.slots || []);
  }, [user]);

  const loadUserData = useCallback(async () => {
    if (!user) return;
    const [dashboardData, bookingsData] = await Promise.all([
      api("/dashboard"),
      api("/bookings"),
    ]);

    setStats(dashboardData.stats);
    setRecentBookings(dashboardData.recentBookings);
    setBookings(bookingsData.bookings);
  }, [user]);

  const refreshAll = useCallback(async () => {
    if (!user) return;
    await Promise.all([loadSlots(), loadUserData(), loadFavorites(), loadRecentViewed()]);
  }, [loadSlots, loadUserData, loadFavorites, loadRecentViewed, user]);

  useEffect(() => {
    if (!user) return;
    refreshAll().catch((err) => setNotice(err.message));
  }, [refreshAll, user]);

  const onAuthSuccess = (safeUser, token) => {
    localStorage.setItem(USER_KEY, JSON.stringify(safeUser));
    localStorage.setItem(TOKEN_KEY, token);
    setUser(safeUser);
    const savedTheme = readSectionPrefs(safeUser.id, "theme", { mode: "light" }).mode;
    setTheme(savedTheme);
    const code = getAdminBookingCodeFromHash();
    if (code && safeUser.role === "admin") {
      setAdminBookingCode(code);
      setPage("admin-booking");
    } else {
      setPage("dashboard");
    }
    setNotice("Welcome to ParkOS");
  };

  const onLogout = () => {
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
    setPage("login");
    setSelectedSlot(null);
    setBookings([]);
    setSlots([]);
    setFavorites([]);
    setFavoriteSlotIds([]);
    setRecentViewedSlots([]);
    setAdminBookingCode(null);
    setTheme("light");
    setStats({ totalBookings: 0, activeBookings: 0, totalSpent: 0, favouriteSlot: "-" });
  };

  const toggleFavorite = async (slotId) => {
    try {
      const data = await api(`/favorites/${slotId}`, { method: "POST" });
      setFavorites(data.slots || []);
      setFavoriteSlotIds(data.favoriteSlotIds || []);
      setNotice(data.favorited ? "Slot added to favorites" : "Slot removed from favorites");
    } catch (error) {
      setNotice(error.message);
    }
  };

  const navigateAdminBooking = (bookingCode) => {
    if (!bookingCode) return;
    setAdminBookingCode(bookingCode);
    window.location.hash = `#admin-booking/${encodeURIComponent(bookingCode)}`;
    setPage("admin-booking");
  };

  const backToAdminPage = () => {
    setAdminBookingCode(null);
    if (window.location.hash.startsWith("#admin-booking/")) {
      window.location.hash = "";
    }
    setPage("admin");
  };

  const setPageWithHashReset = (nextPage) => {
    if (window.location.hash.startsWith("#admin-booking/") && nextPage !== "admin-booking") {
      window.location.hash = "";
      setAdminBookingCode(null);
    }
    setPage(nextPage);
  };

  const openBooking = async (slot) => {
    if (slot) setSelectedSlot(slot);
    if (slot?.id) {
      try {
        const data = await api(`/recent-slots/${slot.id}`, { method: "POST" });
        setRecentViewedSlots(data.slots || []);
      } catch {
        // Ignore recent tracking failures to avoid blocking booking flow.
      }
    }
    setPage("booking");
  };

  const toggleCompareSlot = (slotId) => {
    setCompareSlotIds((prev) => {
      if (prev.includes(slotId)) {
        return prev.filter((id) => id !== slotId);
      }
      return [...prev, slotId].slice(0, 3);
    });
  };

  const alerts = useMemo(() => {
    const list = [];
    const lowStock = slots.filter((slot) => slot.free <= 3).length;
    const activeCount = bookings.filter((booking) => booking.status === "active").length;
    const upcomingCount = bookings.filter((booking) => booking.status === "upcoming").length;
    if (lowStock > 0) list.push(`${lowStock} slot locations are running low on free spaces`);
    if (activeCount > 0) list.push(`${activeCount} booking${activeCount > 1 ? "s" : ""} active right now`);
    if (upcomingCount > 0) list.push(`${upcomingCount} upcoming booking${upcomingCount > 1 ? "s" : ""} planned`);
    if (!list.length) list.push("All systems normal. No urgent parking alerts.");
    return list;
  }, [slots, bookings]);

  const compareSlots = useMemo(() => {
    const map = new Map(slots.map((slot) => [slot.id, slot]));
    return compareSlotIds.map((id) => map.get(id)).filter(Boolean);
  }, [slots, compareSlotIds]);

  const commandItems = useMemo(() => {
    if (!user) return [];
    const base = [
      { id: "dashboard", label: "Go to Dashboard" },
      { id: "slots", label: "Find Parking Slots" },
      { id: "map", label: "Open Map Explorer" },
      { id: "insights", label: "Open Insights" },
      { id: "favorites", label: "View Favorites" },
      { id: "bookings", label: "Open My Bookings" },
      { id: "book-now", label: "Start New Booking" },
      { id: "theme", label: "Toggle Theme" },
      { id: "logout", label: "Sign Out" },
    ];
    if (user.role === "admin") base.splice(5, 0, { id: "admin", label: "Open Admin Board" });
    return base;
  }, [user]);

  const runCommand = (commandId) => {
    if (commandId === "book-now") return setPage("slots");
    if (commandId === "theme") return setTheme((prev) => (prev === "light" ? "dark" : "light"));
    if (commandId === "logout") return onLogout();
    return setPageWithHashReset(commandId);
  };

  const totalForDraft = useMemo(() => {
    if (!selectedSlot) return 0;
    const subtotal = selectedSlot.pricePerHour * Number(bookingDraft.duration || 1);
    return subtotal + Math.round(subtotal * 0.1);
  }, [selectedSlot, bookingDraft.duration]);

  const payForBooking = async (paymentMethod) => {
    if (!user || !selectedSlot) {
      setNotice("Select a slot before payment");
      return;
    }
    setPaying(true);
    try {
      const payload = {
        slotId: selectedSlot.id,
        ...bookingDraft,
        paymentMethod,
      };
      const { booking } = await api("/bookings", { method: "POST", body: JSON.stringify(payload) });
      setLastBooking(booking);
      setBookingDraft(defaultDraft());
      setPage("confirmation");
      await refreshAll();
    } catch (err) {
      setNotice(err.message);
    } finally {
      setPaying(false);
    }
  };

  const extendBooking = async (bookingId) => {
    setBusyBookingId(bookingId);
    try {
      await api(`/bookings/${bookingId}/extend`, {
        method: "PATCH",
        body: JSON.stringify({ extraHours: 1 }),
      });
      await refreshAll();
      setNotice(`Booking ${bookingId} extended by 1 hour`);
    } catch (err) {
      setNotice(err.message);
    } finally {
      setBusyBookingId("");
    }
  };

  const cancelBooking = async (bookingId) => {
    setBusyBookingId(bookingId);
    try {
      await api(`/bookings/${bookingId}/cancel`, { method: "PATCH" });
      await refreshAll();
      setNotice(`Booking ${bookingId} cancelled`);
    } catch (err) {
      setNotice(err.message);
    } finally {
      setBusyBookingId("");
    }
  };

  let content;
  if (!user) {
    content = page === "signup"
      ? <Signup onSuccess={onAuthSuccess} gotoLogin={() => setPageWithHashReset("login")} />
      : <Login onSuccess={onAuthSuccess} gotoSignup={() => setPageWithHashReset("signup")} />;
  } else if (page === "dashboard") {
    content = <Dashboard stats={stats} recentBookings={recentBookings} slots={slots} recentViewedSlots={recentViewedSlots} onBookNow={(slot) => openBooking(slot)} favoriteSlotIds={favoriteSlotIds} onToggleFavorite={toggleFavorite} alerts={alerts} onGoInsights={() => setPage("insights")} onGoMap={() => setPage("map")} />;
  } else if (page === "slots") {
    content = (
      <>
        <SlotsPage slots={slots} onSelectSlot={(slot) => openBooking(slot)} favoriteSlotIds={favoriteSlotIds} onToggleFavorite={toggleFavorite} userPreferenceKey={userPreferenceKey} compareSlotIds={compareSlotIds} onToggleCompare={toggleCompareSlot} />
        <div className="container" style={{ paddingTop: 0 }}>
          <SlotCompareTray selectedSlots={compareSlots} onRemove={toggleCompareSlot} onBook={openBooking} onClear={() => setCompareSlotIds([])} />
        </div>
      </>
    );
  } else if (page === "map") {
    content = <SlotMapView slots={slots} favoriteSlotIds={favoriteSlotIds} onToggleFavorite={toggleFavorite} onBookSlot={openBooking} />;
  } else if (page === "insights") {
    content = <InsightsPage bookings={bookings} slots={slots} favoriteSlotIds={favoriteSlotIds} onBookNow={(slot) => openBooking(slot)} />;
  } else if (page === "favorites") {
    content = <FavoritesPage favorites={favorites} onSelectSlot={(slot) => openBooking(slot)} onToggleFavorite={toggleFavorite} userPreferenceKey={userPreferenceKey} />;
  } else if (page === "booking") {
    content = <BookingForm selectedSlot={selectedSlot} bookingDraft={bookingDraft} setBookingDraft={setBookingDraft} onProceed={() => setPage("payment")} />;
  } else if (page === "payment") {
    content = <Payment total={totalForDraft} onPay={payForBooking} paying={paying} />;
  } else if (page === "confirmation") {
    content = <Confirmation booking={lastBooking} onBackToDashboard={() => setPage("dashboard")} onBookAgain={() => setPage("slots")} />;
  } else if (page === "admin" && user.role === "admin") {
    content = <AdminPage slots={slots} loadSlots={loadSlots} showNotice={showNotice} apiClient={api} onNavigateBooking={navigateAdminBooking} />;
  } else if (page === "admin-booking" && user.role === "admin") {
    content = <AdminBookingRecordPage bookingCode={adminBookingCode} apiClient={api} onBack={backToAdminPage} showNotice={showNotice} />;
  } else if (page === "admin" || page === "admin-booking") {
    content = <AdminAccessRequired onGoDashboard={() => setPageWithHashReset("dashboard")} onLogout={onLogout} />;
  } else {
    content = <BookingsPage bookings={bookings} onExtend={extendBooking} onCancel={cancelBooking} busyBookingId={busyBookingId} />;
  }

  return (
    <>
      <Topbar user={user} page={page === "admin-booking" ? "admin" : page} setPage={setPageWithHashReset} onLogout={onLogout} theme={theme} onToggleTheme={() => setTheme((prev) => prev === "light" ? "dark" : "light")} onOpenCommand={() => setCommandOpen(true)} />
      {content}
      {notice && <div className="notice">{notice}</div>}
      <CommandPalette open={Boolean(user) && commandOpen} onClose={() => setCommandOpen(false)} items={commandItems} onRun={runCommand} />
    </>
  );
}
