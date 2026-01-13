import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/me")({
  component: RouteComponent,
});

function RouteComponent() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSession() {
      try {
        const res = await fetch("http://localhost:3000/me", {
          credentials: "include", // important for cookie-based auth
        });

        if (!res.ok) {
          throw new Error("Failed to fetch session");
        }

        const data = await res.json();
        setSession(data.session);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchSession();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h1>Hello {session.user.name}!</h1>
      <pre>{JSON.stringify(session, null, 2)}</pre>
    </div>
  );
}
