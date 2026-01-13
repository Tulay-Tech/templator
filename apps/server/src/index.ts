import { auth } from "@b2b/auth";
import { env } from "@b2b/env/server";
import { fromNodeHeaders, toNodeHandler } from "better-auth/node";
import cors from "cors";
import express, { type Request, type Response } from "express";
import { serve } from "inngest/express";
import { inngest } from "./inngest";
import { functions } from "./inngest/functions";

const app = express();

app.use(
  cors({
    origin: env.CORS_ORIGIN,
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.all("/api/auth{/*path}", toNodeHandler(auth));

app.use(express.json());

app.use("/api/inngest", serve({ client: inngest, functions }));

app.get("/", (_req, res) => {
  res.status(200).send("OK");
});

app.get("/me", async (req: Request, res: Response) => {
  try {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers as any),
    });

    if (!session) return res.status(401).json({ error: "Not authenticated" });

    return res.json({ session });
  } catch (error: any) {
    console.error("Error fetching session:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

app.listen(3000, () => {
  console.log("Server is running on http://localhost:3000");
});
