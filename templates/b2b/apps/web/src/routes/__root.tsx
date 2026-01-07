import {
  HeadContent,
  Outlet,
  createRootRouteWithContext,
  useRouterState,
  redirect,
} from "@tanstack/react-router";
import { QueryClient, useQuery } from "@tanstack/react-query";

import "../index.css";

import { TooltipProvider } from "@/components/ui/tooltip";

import { authClient } from "@/lib/auth-client";

import "../index.css";

// Define the router context interface
export interface RouterAppContext {
  queryClient: QueryClient;
}

// Create this function outside the component
const fetchSession = async () => {
  const session = await authClient.getSession();
  return session.data;
};

const checkUserOrganizations = async () => {
  const orgs = await authClient.organization.list();
  return orgs.data || [];
};

export const Route = createRootRouteWithContext<RouterAppContext>()({
  component: RootComponent,
  beforeLoad: async ({ location, context }) => {
    const isAuthRoute = location.pathname.startsWith("/auth");
    const isCreateOrgRoute = location.pathname === "/create-organization";

    // Use TanStack Query to cache the session
    const session = await context.queryClient.ensureQueryData({
      queryKey: ["session"],
      queryFn: fetchSession,
      staleTime: 5 * 60 * 1000,
    });

    const isAuthenticated = !!session;

    // If logged in and trying to access auth pages, redirect to home
    if (isAuthenticated && isAuthRoute) {
      throw redirect({
        to: "/",
      });
    }

    // Check organizations only if authenticated and not already on create-org page
    if (isAuthenticated && !isCreateOrgRoute) {
      const organizations = await context.queryClient.ensureQueryData({
        queryKey: ["organizations"],
        queryFn: checkUserOrganizations,
        staleTime: 5 * 60 * 1000,
      });

      if (organizations.length === 0) {
        throw redirect({
          to: "/create-organization",
        });
      }
    }
  },
  head: () => ({
    meta: [
      {
        title: "paagos",
      },
      {
        name: "description",
        content: "paagos is a web application",
      },
    ],
    links: [
      {
        rel: "icon",
        href: "/favicon.ico",
      },
    ],
  }),
});

function RootComponent() {
  const router = useRouterState();
  const isAuthRoute = router.location.pathname.startsWith("/auth");

  return (
    <TooltipProvider>{isAuthRoute ? <Outlet /> : <Outlet />}</TooltipProvider>
  );
}
