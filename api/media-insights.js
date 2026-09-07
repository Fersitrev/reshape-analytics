```javascript
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
    // Obtener publicaciones
    const mediaUrl =
      "https://graph.instagram.com/v23.0/" +
      userId +
      "/media" +
      "?fields=id,caption,media_type,media_url,permalink,timestamp,thumbnail_url" +
      "&limit=50" +
      "&access_token=" +
      encodeURIComponent(token);

    const mediaResponse = await fetch(mediaUrl);
    const mediaData = await mediaResponse.json();

    if (!mediaResponse.ok) {
      return res.status(mediaResponse.status).json({
        error: "Error obteniendo publicaciones de Instagram",
        details: mediaData
      });
    }

    const posts = mediaData.data || [];

    // Obtener insights individualmente
    const postsWithInsights = await Promise.all(
      posts.map(async (post) => {

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

          if (!insightsResponse.ok) {
            return {
              ...post,
              insights: [],
              insights_error: insightsData
            };
          }

          return {
            ...post,
            insights: insightsData.data || []
          };

        } catch (error) {

          return {
            ...post,
            insights: [],
            insights_error: {
              message: error.message
            }
          };

        }
      })
    );

    return res.status(200).json({
      data: postsWithInsights
    });

  } catch (error) {

    return res.status(500).json({
      error: "Error interno del servidor",
      details: error.message
    });

  }
}
```
