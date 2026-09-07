import {
  createSession,
  sessionCookie
} from "./auth-guard.js";

export default function handler(req, res) {

  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Método no permitido"
    });
  }

  const password =
    req.body?.password;

  const correctPassword =
    process.env.DASHBOARD_PASSWORD;

  if (!correctPassword) {
    return res.status(500).json({
      error:
        "DASHBOARD_PASSWORD no está configurado en Vercel"
    });
  }

  if (!password) {
    return res.status(400).json({
      error: "Contraseña requerida"
    });
  }

  if (password !== correctPassword) {
    return res.status(401).json({
      error: "Contraseña incorrecta"
    });
  }

  const session =
    createSession();

  res.setHeader(
    "Set-Cookie",
    sessionCookie(session)
  );

  return res.status(200).json({
    authenticated: true
  });
}
