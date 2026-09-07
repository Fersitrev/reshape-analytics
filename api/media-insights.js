export default async function handler(req, res) {
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
    // Obtener una sola publicación
    const mediaUrl =
      "https://graph.instagram.com/v23.0/" +
      userId +
      "/media" +
      "?fields=id,caption,media_type,timestamp" +
      "&limit=1" +
      "&access_token=" +
      encodeURIComponent(token);

    const mediaResponse = await fetch(mediaUrl);
    const mediaData = await mediaResponse.json();

    if (!mediaResponse.ok) {
      return res.status(mediaResponse.status).json({
        error: "Error obteniendo publicación",
        details: mediaData
      });
    }

    if (!mediaData.data || mediaData.data.length === 0) {
      return res.status(404).json({
        error: "No se encontraron publicaciones"
      });
    }

    const mediaId = mediaData.data[0].id;

    // Obtener insights de esa publicación
    const insightsUrl =
      "https://graph.instagram.com/v23.0/" +
      mediaId +
      "/insights" +
      "?metric=reach" +
      "&access_token=" +
      encodeURIComponent(token);

    const insightsResponse = await fetch(insightsUrl);
    const insightsData = await insightsResponse.json();

    if (!insightsResponse.ok) {
      return res.status(insightsResponse.status).json({
        error: "Error obteniendo insights de la publicación",
        details: insightsData
      });
    }

    return res.status(200).json({
      media: mediaData.data[0],
      insights: insightsData
    });

  } catch (error) {
    return res.status(500).json({
      error: "Error interno del servidor",
      details: error.message
    });
  }
}
