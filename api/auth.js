export default function handler(req, res) {
  const appId = process.env.META_APP_ID;
  const redirectUri = "https://reshape-analytics.vercel.app/api/auth";

  if (!appId) {
    return res.status(500).json({
      error: "META_APP_ID no está configurado"
    });
  }

  const authUrl =
    "https://www.facebook.com/v23.0/dialog/oauth" +
    `?client_id=${encodeURIComponent(appId)}` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    `&response_type=code` +
    `&scope=instagram_business_basic,instagram_business_manage_insights`;

  res.redirect(authUrl);
}
