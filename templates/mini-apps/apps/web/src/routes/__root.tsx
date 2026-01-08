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
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/sidebar/app-sidebar";
import { Separator } from "@/components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

// Define the router context interface
export interface RouterAppContext {
  queryClient: QueryClient;
}

// Create this function outside the component
const fetchSession = async () => {
  const session = await authClient.getSession();
  return session.data;
};

const checkHasUsers = async () => {
  const users = await authClient.admin.listUsers({
    query: { limit: 1 },
  });
  return (users.data?.total || 0) > 0;
};

export const Route = createRootRouteWithContext<RouterAppContext>()({
  component: RootComponent,
  beforeLoad: async ({ location, context }) => {
    const isAuthRoute = location.pathname.startsWith("/auth");
    const isAdminSignupRoute = location.pathname === "/auth/admin-signup";

    // Check if any users exist in the system
    const hasUsers = await context.queryClient.ensureQueryData({
      queryKey: ["hasUsers"],
      queryFn: checkHasUsers,
      staleTime: 5 * 60 * 1000,
    });

    // RULE 1: If no users exist, force redirect to admin signup
    if (!hasUsers && !isAdminSignupRoute) {
      throw redirect({
        to: "/auth/admin-signup",
      });
    }

    // RULE 2: If users exist, block admin signup page forever
    if (hasUsers && isAdminSignupRoute) {
      throw redirect({
        to: "/",
      });
    }

    // Use TanStack Query to cache the session
    const session = await context.queryClient.ensureQueryData({
      queryKey: ["session"],
      queryFn: fetchSession,
      staleTime: 5 * 60 * 1000,
    });

    const isAuthenticated = !!session;

    // RULE 3: If NOT authenticated and trying to access protected routes, redirect to login
    if (!isAuthenticated && !isAuthRoute) {
      throw redirect({
        to: "/auth/login",
        search: {
          redirect: location.href,
        },
      });
    }

    // RULE 4: If logged in and trying to access auth pages (except admin signup which is already handled), redirect to home
    if (isAuthenticated && isAuthRoute && !isAdminSignupRoute) {
      throw redirect({
        to: "/",
      });
    }
  },
  head: () => ({
    meta: [
      {
        title: "mini-apps",
      },
      {
        name: "description",
        content: "mini-apps is a web application",
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

  // Fetch session
  const { data: session } = useQuery({
    queryKey: ["session"],
    queryFn: fetchSession,
    enabled: !isAuthRoute,
    staleTime: 5 * 60 * 1000,
  });

  // Check if users exist
  const { data: hasUsers } = useQuery({
    queryKey: ["hasUsers"],
    queryFn: checkHasUsers,
    staleTime: 5 * 60 * 1000,
  });

  return (
    <TooltipProvider>
      <HeadContent />
      {isAuthRoute ? (
        <div className="grid grid-rows-[auto_1fr] h-svh">
          <Outlet />
        </div>
      ) : (
        <SidebarProvider>
          <AppSidebar
            user={
              session?.user
                ? {
                    name: session.user.name || "User",
                    email: session.user.email,
                    avatar: session.user.image || "",
                  }
                : undefined
            }
          />
          <SidebarInset>
            <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
              <div className="flex items-center gap-2 px-4">
                <SidebarTrigger className="-ml-1" />
                <Separator
                  orientation="vertical"
                  className="mr-2 data-[orientation=vertical]:h-4"
                />
                <Breadcrumb>
                  <BreadcrumbList>
                    <BreadcrumbItem className="hidden md:block">
                      <BreadcrumbLink href="#">
                        Building Your Application
                      </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator className="hidden md:block" />
                    <BreadcrumbItem>
                      <BreadcrumbPage>Data Fetching</BreadcrumbPage>
                    </BreadcrumbItem>
                  </BreadcrumbList>
                </Breadcrumb>
              </div>
            </header>
            <div className="grid grid-rows-[auto_1fr] h-svh">
              <Outlet />
            </div>
          </SidebarInset>
        </SidebarProvider>
      )}
    </TooltipProvider>
  );
}
