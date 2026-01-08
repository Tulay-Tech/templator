"use client";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

export const Route = createFileRoute("/create-organization")({
  component: CreateOrganizationPage,
});

function CreateOrganizationPage() {
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleNameChange = (value: string) => {
    setName(value);
    const generatedSlug = value
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");
    setSlug(generatedSlug);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!name || !slug) {
      setError("Organization name and slug are required");
      return;
    }
    setLoading(true);

    try {
      const result = await authClient.organization.create({ name, slug });

      if (result.error) {
        setError(result.error.message || "Failed to create organization");
        setLoading(false);
        return;
      }

      const newOrg = result.data;

      // Automatically set the newly created org as active
      const setActive = await authClient.organization.setActive({
        organizationId: newOrg.id,
      });
      if (setActive.error)
        console.error("Failed to set active org:", setActive.error);

      // Refresh session queries
      await queryClient.invalidateQueries({ queryKey: ["session"] });

      // Navigate to home
      window.location.href = "/";
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Unexpected error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Create Your Organization</CardTitle>
          <CardDescription>
            You need an organization to continue. This will be your workspace.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="org-name">Organization Name</Label>
              <Input
                id="org-name"
                placeholder="My Company"
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="org-slug">Slug</Label>
              <Input
                id="org-slug"
                placeholder="my-company"
                value={slug}
                disabled={loading}
                onChange={(e) => setSlug(e.target.value)}
              />
            </div>
            {error && <div className="text-red-500">{error}</div>}
            <Button type="submit" disabled={loading || !name || !slug}>
              {loading ? "Creating..." : "Create Organization"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
