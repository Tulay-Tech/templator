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

// Fetch session
const fetchSession = async () => {
  const session = await authClient.getSession();
  return session.data;
};

// Fetch organizations
const checkUserOrganizations = async () => {
  const orgs = await authClient.organization.list();
  return orgs.data || [];
};

export const Route = createRootRouteWithContext<RouterAppContext>()({
  component: RootComponent,
  beforeLoad: async ({ location, context }) => {
    const isAuthRoute = location.pathname.startsWith("/auth");
    const isCreateOrgRoute = location.pathname === "/create-organization";
    const isOrgSelectRoute = location.pathname === "/org-select";

    // Fetch session
    const session = await context.queryClient.ensureQueryData({
      queryKey: ["session"],
      queryFn: fetchSession,
      staleTime: 5 * 60 * 1000,
    });

    const isAuthenticated = !!session;

    // Redirect if not authenticated
    if (!isAuthenticated && !isAuthRoute) {
      throw redirect({
        to: "/auth/login",
        search: { redirect: location.href },
      });
    }

    // Redirect authenticated users away from auth pages
    if (isAuthenticated && isAuthRoute) {
      throw redirect({ to: "/" });
    }

    if (isAuthenticated) {
      const organizations = await context.queryClient.ensureQueryData({
        queryKey: ["organizations"],
        queryFn: checkUserOrganizations,
        staleTime: 5 * 60 * 1000,
      });

      const hasOrgs = organizations.length > 0;
      const activeOrgSet = !!session.session.activeOrganizationId;

      // Redirect to create org if no organizations
      if (!hasOrgs && !isCreateOrgRoute) {
        throw redirect({ to: "/create-organization" });
      }

      // Redirect to home if trying to create org but org exists
      if (hasOrgs && isCreateOrgRoute) {
        throw redirect({ to: "/" });
      }

      // Redirect to org select if user has orgs but no active organization
      if (hasOrgs && !activeOrgSet && !isOrgSelectRoute) {
        throw redirect({ to: "/org-select" });
      }

      // NEW: Redirect away from org-select if active org is already set
      if (hasOrgs && activeOrgSet && isOrgSelectRoute) {
        throw redirect({ to: "/" });
      }
    }
  },
  head: () => ({
    meta: [
      { title: "B2B template" },
      { name: "description", content: "b2b is a web application" },
    ],
    links: [{ rel: "icon", href: "/favicon.ico" }],
  }),
});

function RootComponent() {
  const router = useRouterState();
  const isAuthRoute =
    router.location.pathname.startsWith("/auth") ||
    router.location.pathname.startsWith("/create-organization") ||
    router.location.pathname.startsWith("/org-select");

  // Fetch session
  const { data: session } = useQuery({
    queryKey: ["session"],
    queryFn: fetchSession,
    enabled: !isAuthRoute,
    staleTime: 5 * 60 * 1000,
  });

  // Fetch organizations if authenticated
  const { data: organizations } = useQuery({
    queryKey: ["organizations"],
    queryFn: checkUserOrganizations,
    enabled: !isAuthRoute && !!session,
    staleTime: 5 * 60 * 1000,
  });

  return (
    <TooltipProvider>
      {isAuthRoute ? (
        <Outlet />
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
            teams={
              organizations?.map((org) => ({
                name: org.name,
                logo: org.logo || "",
                plan: "Free",
                id: org.id,
              })) || []
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
            <Outlet />
          </SidebarInset>
        </SidebarProvider>
      )}
    </TooltipProvider>
  );
}
