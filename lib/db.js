// lib/db.js
//
// Lightweight file-based data store for local development / small deployments.
// Data lives in data/db.json as plain JSON, so a non-technical maintainer can
// open, back up, or edit it directly if needed.
//
// IMPORTANT FOR PRODUCTION: serverless hosts (Vercel, Netlify, etc.) do not
// persist local filesystem writes between requests/deploys. Before deploying
// to production, swap this module for a managed database — see
// README.md -> "Moving to production" for a drop-in Supabase/Postgres path.
// The rest of the app only talks to the functions exported below, so the
// swap is isolated to this one file.

import { promises as fs } from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");
const DB_FILE = path.join(DATA_DIR, "db.json");

const DEFAULT_DATA = {
  users: [],
  otpCodes: [],
  reports: [],
};

let cache = null;
let writeQueue = Promise.resolve();

async function ensureFile() {
  await fs.mkdir(DATA_DIR, { recursive: true });
  try {
    await fs.access(DB_FILE);
  } catch {
    await fs.writeFile(DB_FILE, JSON.stringify(DEFAULT_DATA, null, 2));
  }
}

async function readData() {
  if (cache) return cache;
  await ensureFile();
  const raw = await fs.readFile(DB_FILE, "utf-8");
  cache = JSON.parse(raw);
  return cache;
}

async function writeData(data) {
  cache = data;
  // serialize writes so concurrent requests can't corrupt the file
  writeQueue = writeQueue.then(() =>
    fs.writeFile(DB_FILE, JSON.stringify(data, null, 2))
  );
  await writeQueue;
}

function uid(prefix) {
  const rand = Math.random().toString(36).slice(2, 8).toUpperCase();
  const ts = Date.now().toString(36).slice(-4).toUpperCase();
  return `${prefix}-${ts}${rand}`;
}

// ---------------- Users ----------------

function roleForIdentifier(identifier) {
  // Roles are granted ONLY to identifiers explicitly listed in these env
  // vars — never inferred from the identifier's text. Set them as a
  // comma-separated list, e.g.:
  //   ADMIN_EMAILS=you@yourorg.org
  //   STAFF_EMAILS=pwd-desk@yourorg.org,water-desk@yourorg.org
  // Re-checked on every login, so updating the env var (and redeploying)
  // is enough to change someone's role — no direct database edit needed.
  const admins = (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  const staff = (process.env.STAFF_EMAILS || "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);

  if (admins.includes(identifier)) return "admin";
  if (staff.includes(identifier)) return "staff";
  return "citizen";
}

export async function findOrCreateUser(identifier) {
  const data = await readData();
  let user = data.users.find((u) => u.identifier === identifier);
  const role = roleForIdentifier(identifier);

  if (!user) {
    user = {
      id: uid("USR"),
      identifier, // email or phone, used as the login handle
      displayName: identifier.includes("@")
        ? identifier.split("@")[0]
        : "Citizen",
      role,
      impactScore: 0,
      volunteerHours: 0,
      createdAt: new Date().toISOString(),
    };
    data.users.push(user);
    await writeData(data);
  } else if (user.role !== role) {
    // Keep role in sync with the allowlist in case it changed since this
    // user was created (e.g. someone was added to STAFF_EMAILS later).
    user.role = role;
    await writeData(data);
  }
  return user;
}

export async function getUserById(id) {
  const data = await readData();
  return data.users.find((u) => u.id === id) || null;
}

export async function bumpImpactScore(userId, amount) {
  const data = await readData();
  const user = data.users.find((u) => u.id === userId);
  if (user) {
    user.impactScore = (user.impactScore || 0) + amount;
    await writeData(data);
  }
  return user;
}

// ---------------- OTP (mock — see README for swapping in real email/SMS) ----------------

export async function createOtp(identifier) {
  const data = await readData();
  const code = String(Math.floor(100000 + Math.random() * 900000));
  const entry = {
    identifier,
    code,
    expiresAt: Date.now() + 10 * 60 * 1000,
  };
  data.otpCodes = data.otpCodes.filter((o) => o.identifier !== identifier);
  data.otpCodes.push(entry);
  await writeData(data);
  return code;
}

export async function verifyOtp(identifier, code) {
  const data = await readData();
  const entry = data.otpCodes.find(
    (o) => o.identifier === identifier && o.code === code
  );
  if (!entry) return false;
  if (entry.expiresAt < Date.now()) return false;
  data.otpCodes = data.otpCodes.filter((o) => o.identifier !== identifier);
  await writeData(data);
  return true;
}

// ---------------- Reports ----------------

const DEPARTMENTS = {
  Infrastructure: "Municipal Public Works Department",
  Environment: "Pollution Control Board",
  Traffic: "Traffic Police",
  Health: "Health Department",
  Corruption: "Vigilance Cell",
  "Crime Tip": "Local Police",
};

export function departmentFor(category) {
  return DEPARTMENTS[category] || "General Grievance Cell";
}

export async function createReport({
  userId,
  category,
  description,
  photoDataUrl,
  lat,
  lng,
  anonymous,
}) {
  const data = await readData();
  const report = {
    id: uid("BOP"),
    // IMPORTANT: userId is always kept, even for anonymous reports, so the
    // citizen who filed it can still see it in "My Reports" and follow its
    // status. "Anonymous" means the department/staff view doesn't surface
    // who filed it — see the `anonymous` flag consumed by the staff
    // dashboard — not that the platform forgets who submitted it.
    userId,
    anonymous: !!anonymous,
    category,
    department: departmentFor(category),
    description: description || "",
    photoDataUrl: photoDataUrl || null,
    location: lat && lng ? { lat, lng } : null,
    status: "pending", // pending -> in_review -> resolved
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    statusHistory: [{ status: "pending", at: new Date().toISOString() }],
  };
  data.reports.unshift(report);
  await writeData(data);
  if (userId) await bumpImpactScore(userId, 10);
  return report;
}

export async function listReportsForUser(userId) {
  const data = await readData();
  return data.reports.filter((r) => r.userId === userId);
}

export async function listAllReports() {
  const data = await readData();
  return data.reports;
}

// Staff/admin views must never receive the reporter's userId for a report
// filed anonymously — even though the UI doesn't currently render it, the
// API payload shouldn't carry it either. Call this before returning any
// report list/detail to a staff or admin session.
export function redactForStaff(report) {
  if (!report.anonymous) return report;
  const { userId, ...rest } = report;
  return rest;
}

export async function getReport(id) {
  const data = await readData();
  return data.reports.find((r) => r.id === id) || null;
}

export async function updateReportStatus(id, status) {
  const data = await readData();
  const report = data.reports.find((r) => r.id === id);
  if (!report) return null;
  report.status = status;
  report.updatedAt = new Date().toISOString();
  report.statusHistory.push({ status, at: report.updatedAt });
  if (status === "resolved" && report.userId) {
    await bumpImpactScore(report.userId, 25);
  }
  await writeData(data);
  return report;
}

export async function reportStats(userId) {
  const data = await readData();
  const mine = userId
    ? data.reports.filter((r) => r.userId === userId)
    : [];
  return {
    filed: mine.length,
    resolved: mine.filter((r) => r.status === "resolved").length,
    inReview: mine.filter((r) => r.status === "in_review").length,
    pending: mine.filter((r) => r.status === "pending").length,
  };
}
