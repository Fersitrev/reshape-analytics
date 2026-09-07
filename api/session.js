import {
  isAuthenticated
} from "./auth-guard.js";

export default function handler(req, res) {

  return res.status(200).json({
    authenticated:
      isAuthenticated(req)
  });

}
