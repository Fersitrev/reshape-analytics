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
    const url =
      "https://graph.instagram.com/v23.0/" +
      userId +
      "/media" +
      "?fields=id,caption,media_type,media_url,permalink,timestamp,thumbnail_url" +
      "&limit=50" +
      "&access_token=" +
      encodeURIComponent(token);

    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: "Error obteniendo publicaciones de Instagram",
        details: data
      });
    }

    return res.status(200).json(data);

  } catch (error) {
    return res.status(500).json({
      error: "Error interno del servidor",
      details: error.message
    });
  }
}
