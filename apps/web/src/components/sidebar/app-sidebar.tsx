"use client";

import * as React from "react";
import { Settings2, SquareTerminal } from "lucide-react";

import { NavMain } from "@/components/sidebar/nav-main";
import { NavUser } from "@/components/sidebar/nav-user";
import { TeamSwitcher } from "@/components/sidebar/team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";

// This is sample data.
const data = {
  navMain: [
    {
      title: "Home",
      url: "/",
      icon: SquareTerminal,
      isActive: true,
    },
    {
      title: "Test",
      url: "#",
      icon: Settings2,
      items: [
        {
          title: "me",
          url: "/me",
        },
      ],
    },
  ],
};

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  user?: {
    name: string;
    email: string;
    avatar: string;
  };
  teams?: {
    name: string;
    logo: string | React.ElementType;
    plan: string;
    id: string;
  }[];
}

export function AppSidebar({ user, teams, ...props }: AppSidebarProps) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        {teams && teams.length > 0 && <TeamSwitcher teams={teams} />}
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>{user && <NavUser user={user} />}</SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
