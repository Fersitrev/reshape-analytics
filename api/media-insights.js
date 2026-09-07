import { requireAuth } from "./auth-guard.js";

export default async function handler(req, res) {

   if (!requireAuth(req, res)) {
    return;
  }
  
  const token = process.env.INSTAGRAM_ACCESS_TOKEN;
  const userId = process.env.INSTAGRAM_USER_ID;

  if (!token) {
    return res.status(500).json({
      error: "INSTAGRAM_ACCESS_TOKEN no está configurado"
    });
  }

  if (!userId) {
    return res.status(500).json({
      error: "INSTAGRAM_USER_ID no está configurado"
    });
  }

  try {
    // 1. Obtener todas las publicaciones actuales
    const mediaUrl =
      "https://graph.instagram.com/v23.0/" +
      userId +
      "/media" +
      "?fields=id,caption,media_type,media_url,permalink,timestamp,thumbnail_url" +
      "&limit=100" +
      "&access_token=" +
      encodeURIComponent(token);

    const mediaResponse = await fetch(mediaUrl);
    const mediaData = await mediaResponse.json();

    if (!mediaResponse.ok) {
      return res.status(mediaResponse.status).json({
        error: "Error obteniendo publicaciones",
        details: mediaData
      });
    }

    const media = mediaData.data || [];

    // 2. Obtener reach de cada publicación
    const results = [];

    for (const post of media) {
      try {
        const insightsUrl =
          "https://graph.instagram.com/v23.0/" +
          post.id +
          "/insights" +
          "?metric=reach" +
          "&access_token=" +
          encodeURIComponent(token);

        const insightsResponse = await fetch(insightsUrl);
        const insightsData = await insightsResponse.json();

        let reach = null;

        if (
          insightsResponse.ok &&
          insightsData.data &&
          insightsData.data.length > 0
        ) {
          reach = insightsData.data[0].values?.[0]?.value ?? null;
        }

        results.push({
          ...post,
          insights: {
            reach
          }
        });

      } catch (error) {
        results.push({
          ...post,
          insights: {
            reach: null
          },
          insights_error: error.message
        });
      }
    }

    return res.status(200).json({
      total: results.length,
      data: results
    });

  } catch (error) {
    return res.status(500).json({
      error: "Error interno del servidor",
      details: error.message
    });
  }
}
