import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { auth } from "@templator/auth";
import { env } from "@templator/env/server";

const app = new Hono();

app.use(logger());

app.use(
  "/*",
  cors({
    origin: env.CORS_ORIGIN, // your frontend URL
    allowMethods: ["GET", "POST", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  }),
);

// Better Auth handler
app.on(["POST", "GET"], "/api/auth/*", (c) => auth.handler(c.req.raw));

// Test route
app.get("/", (c) => c.text("OK"));

// /me route
app.get("/me", async (c) => {
  try {
    const session = await auth.api.getSession({
      headers: c.req.raw.headers, // raw fetch headers
    });

    if (!session?.user) {
      return c.json({ error: "Not authenticated" }, 401);
    }

    return c.json({ session }); // send entire session
  } catch (e) {
    console.error(e);
    return c.json({ error: "Internal server error" }, 500);
  }
});

export default app;
