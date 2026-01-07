import { env } from "@b2b/env/web";
import { polarClient } from "@polar-sh/better-auth";
import { organizationClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/client";

export const authClient = createAuthClient({
  baseURL: env.VITE_SERVER_URL,
  plugins: [polarClient(), organizationClient()],
});
