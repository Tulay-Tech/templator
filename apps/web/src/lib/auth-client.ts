import { polarClient } from "@polar-sh/better-auth";
import { env } from "@templator/env/web";
import { createAuthClient } from "better-auth/react";
import { organizationClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  baseURL: env.VITE_SERVER_URL,
  plugins: [polarClient(), organizationClient()],
});
