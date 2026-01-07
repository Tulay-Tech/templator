import { fromNodeHeaders } from "better-auth/node";
import { auth } from "@b2b/auth";
import { type Request, type Response, type NextFunction } from "express";

export function requirePermission(resource: string, action: string) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const session = (req as any).session;
      const organization = (req as any).organization;

      if (!session || !organization) {
        return res.status(403).json({ error: "Access denied" });
      }

      // Check if user has the required permission
      const hasPermission = await auth.api.hasPermission({
        headers: fromNodeHeaders(req.headers),
        body: {
          organizationId: organization.id,
          permission: {
            [resource]: [action],
          },
        },
      });

      if (!hasPermission) {
        return res.status(403).json({
          error: `You don't have permission to ${action} ${resource}`,
        });
      }

      next();
    } catch (error) {
      console.error("Permission middleware error:", error);
      return res.status(403).json({ error: "Permission check failed" });
    }
  };
}
