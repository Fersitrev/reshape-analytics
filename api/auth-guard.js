import crypto from "crypto";

const COOKIE_NAME = "reshape_session";
const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 horas

function getCookie(req, name) {
  const cookies = req.headers.cookie || "";

  const match = cookies.match(
    new RegExp(
      "(?:^|; )" +
      name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") +
      "=([^;]*)"
    )
  );

  return match ? decodeURIComponent(match[1]) : null;
}

function createSignature(timestamp) {
  return crypto
    .createHmac(
      "sha256",
      process.env.DASHBOARD_PASSWORD
    )
    .update(timestamp)
    .digest("hex");
}

export function createSession() {
  const timestamp = Date.now().toString();
  const signature = createSignature(timestamp);

  return `${timestamp}.${signature}`;
}

export function isAuthenticated(req) {
  const session = getCookie(
    req,
    COOKIE_NAME
  );

  if (!session) {
    return false;
  }

  const parts = session.split(".");

  if (parts.length !== 2) {
    return false;
  }

  const [timestamp, signature] = parts;

  const timestampNumber =
    Number(timestamp);

  if (
    !Number.isFinite(timestampNumber)
  ) {
    return false;
  }

  if (
    Date.now() - timestampNumber >
    SESSION_DURATION
  ) {
    return false;
  }

  const expectedSignature =
    createSignature(timestamp);

  try {
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
  } catch {
    return false;
  }
}

export function requireAuth(req, res) {
  if (!isAuthenticated(req)) {
    res.status(401).json({
      error: "No autorizado"
    });

    return false;
  }

  return true;
}

export function sessionCookie(session) {
  return [
    `${COOKIE_NAME}=${encodeURIComponent(session)}`,
    "HttpOnly",
    "Secure",
    "SameSite=Lax",
    "Path=/",
    `Max-Age=${SESSION_DURATION / 1000}`
  ].join("; ");
}

export function clearSessionCookie() {
  return [
    `${COOKIE_NAME}=`,
    "HttpOnly",
    "Secure",
    "SameSite=Lax",
    "Path=/",
    "Max-Age=0"
  ].join("; ");
}
