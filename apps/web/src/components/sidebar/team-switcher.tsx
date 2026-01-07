"use client";

import * as React from "react";
import { ChevronsUpDown, Plus, Building2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { authClient } from "@/lib/auth-client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { CreateOrganizationDialog } from "./create-organization-dialog";

interface Team {
  name: string;
  logo: string | React.ElementType;
  plan: string;
  id: string;
}

export function TeamSwitcher({ teams }: { teams: Team[] }) {
  const { isMobile } = useSidebar();
  const queryClient = useQueryClient();
  const [activeTeam, setActiveTeam] = React.useState(teams[0]);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [isSwitching, setIsSwitching] = React.useState(false);

  if (!activeTeam) {
    return null;
  }

  const renderLogo = (
    logo: string | React.ElementType,
    size: string = "size-4"
  ) => {
    if (typeof logo === "string") {
      return logo ? (
        <img src={logo} alt="" className={`${size} object-cover`} />
      ) : (
        <Building2 className={size} />
      );
    }
    const LogoComponent = logo;
    return <LogoComponent className={size} />;
  };

  const handleTeamSwitch = async (team: Team) => {
    if (team.id === activeTeam.id) return;

    setIsSwitching(true);
    try {
      // Set the active organization in Better Auth
      const { data, error } = await authClient.organization.setActive({
        organizationId: team.id,
      });

      if (error) {
        console.error("Failed to switch organization:", error);
        return;
      }

      // Update local state
      setActiveTeam(team);

      // Invalidate session to get updated active organization
      await queryClient.invalidateQueries({ queryKey: ["session"] });

      // Optionally reload the page to refresh all org-specific data
      // window.location.reload();
    } catch (err) {
      console.error("Error switching organization:", err);
    } finally {
      setIsSwitching(false);
    }
  };

  return (
    <>
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                  disabled={isSwitching}
                >
                  <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                    {renderLogo(activeTeam.logo, "size-4")}
                  </div>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-medium">
                      {activeTeam.name}
                    </span>
                    <span className="truncate text-xs">{activeTeam.plan}</span>
                  </div>
                  <ChevronsUpDown className="ml-auto" />
                </SidebarMenuButton>
              }
            />
            <DropdownMenuContent
              className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
              align="start"
              side={isMobile ? "bottom" : "right"}
              sideOffset={4}
            >
              <div className="text-muted-foreground text-xs px-2 py-1.5">
                Teams
              </div>
              <DropdownMenuGroup>
                {teams.map((team, index) => (
                  <DropdownMenuItem
                    key={team.id}
                    onClick={() => handleTeamSwitch(team)}
                    className="gap-2 p-2"
                    disabled={isSwitching || team.id === activeTeam.id}
                  >
                    <div className="flex size-6 items-center justify-center rounded-md border">
                      {renderLogo(team.logo, "size-3.5")}
                    </div>
                    {team.name}
                    {team.id === activeTeam.id && (
                      <span className="ml-auto text-xs">✓</span>
                    )}
                    <DropdownMenuShortcut>⌘{index + 1}</DropdownMenuShortcut>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="gap-2 p-2"
                onClick={() => setIsDialogOpen(true)}
                disabled={isSwitching}
              >
                <div className="flex size-6 items-center justify-center rounded-md border bg-transparent">
                  <Plus className="size-4" />
                </div>
                <div className="text-muted-foreground font-medium">
                  Add team
                </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>

      <CreateOrganizationDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
      />
    </>
  );
}
