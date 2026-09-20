export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Health check
    if (url.pathname === "/api/health") {
      return Response.json({
        ok: true,
        service: "bluebow-fullstack"
      });
    }

    // Get all reviews
    if (url.pathname === "/api/reviews" && request.method === "GET") {
      const { results } = await env.DB.prepare(
        "SELECT id, name, rating, review, created_at FROM reviews ORDER BY id DESC"
      ).all();

      return Response.json(results);
    }

    // Add a review
    if (url.pathname === "/api/reviews" && request.method === "POST") {
      try {
        const body = await request.json();

        const name = String(body.name || "").trim();
        const rating = Number(body.rating);
        const review = String(body.review || "").trim();

        if (
          !name ||
          !Number.isInteger(rating) ||
          rating < 1 ||
          rating > 5 ||
          !review
        ) {
          return Response.json(
            { error: "Invalid review" },
            { status: 400 }
          );
        }

        const createdAt = new Date().toISOString();

        await env.DB.prepare(
          "INSERT INTO reviews (name, rating, review, created_at) VALUES (?, ?, ?, ?)"
        )
          .bind(name, rating, review, createdAt)
          .run();

        return Response.json(
          { ok: true },
          { status: 201 }
        );
      } catch (error) {
        return Response.json(
          { error: "Could not save review" },
          { status: 500 }
        );
      }
    }

    // Serve the BlueBow website
    return env.ASSETS.fetch(request);
  }
};
