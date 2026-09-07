import {
  clearSessionCookie
} from "./auth-guard.js";

export default function handler(req, res) {

  res.setHeader(
    "Set-Cookie",
    clearSessionCookie()
  );

  return res.status(200).json({
    authenticated: false
  });

}
