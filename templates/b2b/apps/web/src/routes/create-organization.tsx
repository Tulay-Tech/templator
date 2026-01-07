import {
  createFileRoute,
  useNavigate,
  useRouter,
} from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useQueryClient } from "@tanstack/react-query";

export const Route = createFileRoute("/create-organization")({
  component: CreateOrganizationPage,
});

function CreateOrganizationPage() {
  const navigate = useNavigate();
  const router = useRouter();
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

    if (slug.length < 3) {
      setError("Slug must be at least 3 characters long");
      return;
    }

    setLoading(true);

    try {
      const result = await authClient.organization.create({
        name,
        slug,
      });

      if (result.error) {
        setError(result.error.message || "Failed to create organization");
        setLoading(false);
      } else {
        // Invalidate and wait for the query to refetch
        await queryClient.invalidateQueries({ queryKey: ["organizations"] });

        // Use router.navigate instead of the navigate hook for more reliable navigation
        router.navigate({ to: "/" });

        // Or alternatively, use window.location if you need a hard refresh:
        // window.location.href = "/";
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
      console.error(err);
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Create Your Organization</CardTitle>
          <CardDescription>
            You need to create an organization to continue. This will be your
            workspace.
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
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="org-slug">Slug (URL identifier)</Label>
              <Input
                id="org-slug"
                placeholder="my-company"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                disabled={loading}
                required
              />
              <p className="text-sm text-muted-foreground">
                This will be used in your organization's URL
              </p>
            </div>

            {error && (
              <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={loading || !name || !slug}
            >
              {loading ? "Creating..." : "Create Organization"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
