import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { authClient } from "@/lib/auth-client";
import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Building2, ChevronLeft, ChevronRight } from "lucide-react";

export const Route = createFileRoute("/org-select")({
  component: OrgSelect,
});

interface Organization {
  id: string;
  name: string;
  logo?: string | null;
  role?: string;
}

const ORGS_PER_PAGE = 5;

function OrgSelect() {
  const [loadingOrgId, setLoadingOrgId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);

  const { data: orgs, isLoading } = useQuery<Organization[]>({
    queryKey: ["org-select-organizations"],
    queryFn: async () => {
      const res = await authClient.organization.list();
      return res.data || [];
    },
  });

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Loading organizations...</p>
      </div>
    );
  }

  if (!orgs || orgs.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">No organizations found</p>
      </div>
    );
  }

  const totalPages = Math.ceil(orgs.length / ORGS_PER_PAGE);
  const startIndex = currentPage * ORGS_PER_PAGE;
  const endIndex = startIndex + ORGS_PER_PAGE;
  const currentOrgs = orgs.slice(startIndex, endIndex);

  const handleSelectOrg = async (orgId: string) => {
    try {
      setLoadingOrgId(orgId);
      await authClient.organization.setActive({ organizationId: orgId });
      window.location.href = "/";
    } catch (err) {
      console.error("Failed to select org:", err);
      setLoadingOrgId(null);
    }
  };

  const goToPreviousPage = () => {
    setCurrentPage((prev) => Math.max(0, prev - 1));
  };

  const goToNextPage = () => {
    setCurrentPage((prev) => Math.min(totalPages - 1, prev + 1));
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-md space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold">Select Organization</h1>
          <p className="text-muted-foreground">
            Choose an organization to continue
          </p>
        </div>

        <div className="space-y-3">
          {currentOrgs.map((org) => (
            <Card
              key={org.id}
              className="cursor-pointer transition-colors hover:bg-accent"
              onClick={() => handleSelectOrg(org.id)}
            >
              <CardHeader>
                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={org.logo || undefined} alt={org.name} />
                    <AvatarFallback>
                      <Building2 className="h-6 w-6" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <CardTitle className="text-lg">{org.name}</CardTitle>
                    {org.role && (
                      <CardDescription className="mt-1">
                        {org.role}
                      </CardDescription>
                    )}
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              size="icon"
              onClick={goToPreviousPage}
              disabled={currentPage === 0}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <span className="text-sm text-muted-foreground">
              Page {currentPage + 1} of {totalPages}
            </span>

            <Button
              variant="outline"
              size="icon"
              onClick={goToNextPage}
              disabled={currentPage === totalPages - 1}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
