import { auth } from "@b2b/auth";
import { env } from "@b2b/env/server";
import { toNodeHandler } from "better-auth/node";
import cors from "cors";
import express from "express";
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

app.listen(3000, () => {
  console.log("Server is running on http://localhost:3000");
});
