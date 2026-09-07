export default async function handler(req, res) {
  const token = process.env.INSTAGRAM_ACCESS_TOKEN;
  const userId = process.env.INSTAGRAM_USER_ID;

  if (!token) {
    return res.status(500).json({
      error: "INSTAGRAM_ACCESS_TOKEN no está configurado en Vercel"
    });
  }

  if (!userId) {
    return res.status(500).json({
      error: "INSTAGRAM_USER_ID no está configurado en Vercel"
    });
  }

  try {
    /*
     * ---------------------------------------------------------
     * 1. INFORMACIÓN BÁSICA DE LA CUENTA
     * ---------------------------------------------------------
     */

    const profileUrl =
      "https://graph.instagram.com/v23.0/me" +
      "?fields=id,username,account_type,media_count" +
      "&access_token=" +
      encodeURIComponent(token);

    const profileResponse = await fetch(profileUrl);
    const profileData = await profileResponse.json();

    if (!profileResponse.ok) {
      return res.status(profileResponse.status).json({
        error: "Error obteniendo información de Instagram",
        details: profileData
      });
    }


    /*
     * ---------------------------------------------------------
     * 2. INSIGHTS DE LA CUENTA
     * ---------------------------------------------------------
     *
     * Usamos métricas que podemos consultar a nivel de cuenta.
     */

    const metrics =
      "reach,follower_count,accounts_engaged,total_interactions";

    const insightsUrl =
      "https://graph.instagram.com/v23.0/" +
      userId +
      "/insights" +
      "?metric=" +
      encodeURIComponent(metrics) +
      "&period=day" +
      "&access_token=" +
      encodeURIComponent(token);

    const insightsResponse = await fetch(insightsUrl);
    const insightsData = await insightsResponse.json();

    if (!insightsResponse.ok) {
      return res.status(insightsResponse.status).json({
        error: "Error obteniendo insights de Instagram",
        details: insightsData
      });
    }


    /*
     * ---------------------------------------------------------
     * 3. DEVOLVEMOS TODO EN UN SOLO JSON
     * ---------------------------------------------------------
     */

    return res.status(200).json({
      profile: profileData,
      insights: insightsData
    });

  } catch (error) {

    return res.status(500).json({
      error: "Error interno del servidor",
      details: error.message
    });

  }
}
