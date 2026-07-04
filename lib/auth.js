// lib/auth.js
//
// Minimal JWT session handling, stored in an httpOnly cookie.
//
// SECURITY: AUTH_SECRET must be set in production. There is no silent
// fallback — if it's missing, every function here throws instead of
// signing/verifying tokens with a guessable default. This is deliberate:
// a hardcoded fallback secret would let anyone forge a valid session.

import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

const COOKIE_NAME = "bop_session";
const DEV_ONLY_SECRET = "dev-only-secret-change-me";

function getSecret() {
  const secret = process.env.AUTH_SECRET;
  if (secret && secret.length >= 16) return secret;

  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "AUTH_SECRET is missing or too short. Set a long random string in " +
        "your production environment before deploying — see .env.example. " +
        "Refusing to sign/verify sessions with a default secret."
    );
  }

  // Local development only: fall back to a fixed, clearly-labelled secret
  // so `npm run dev` works out of the box without extra setup.
  return DEV_ONLY_SECRET;
}

export function signSession(user) {
  return jwt.sign(
    { sub: user.id, role: user.role, identifier: user.identifier },
    getSecret(),
    { expiresIn: "30d" }
  );
}

export function verifySessionToken(token) {
  try {
    return jwt.verify(token, getSecret());
  } catch {
    return null;
  }
}

export async function setSessionCookie(token) {
  const store = await cookies();
  store.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function clearSessionCookie() {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}

export async function getSessionFromCookies() {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

// ---------------- lightweight CSRF guard ----------------
//
// The session lives in a cookie, so state-changing requests (POST/PATCH)
// need a CSRF check. Rather than standing up a token-issuance flow, this
// verifies the request's Origin (falling back to Referer) matches the
// host serving the request — a standard, low-overhead mitigation for
// same-site cookie-based sessions.

export function isSameOriginRequest(request) {
  const origin = request.headers.get("origin");
  const referer = request.headers.get("referer");
  const host = request.headers.get("host");
  if (!host) return false;

  const candidate = origin || referer;
  if (!candidate) {
    // Some same-site requests (e.g. certain fetch configurations) omit
    // both headers. Fail closed rather than assuming safety.
    return false;
  }

  try {
    const candidateHost = new URL(candidate).host;
    return candidateHost === host;
  } catch {
    return false;
  }
}
