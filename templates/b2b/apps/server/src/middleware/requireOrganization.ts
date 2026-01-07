import { fromNodeHeaders } from "better-auth/node";
import { auth } from "@b2b/auth";
import { type Request, type Response, type NextFunction } from "express";

export async function requireOrganization(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const session = (req as any).session;

    if (!session) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Get the active organization from the session
    const activeOrgId = session.session.activeOrganizationId;

    if (!activeOrgId) {
      return res.status(403).json({
        error: "No active organization. Please join or create an organization.",
      });
    }

    // Optional: Verify the user is actually a member of this organization
    const member = await auth.api.getFullOrganization({
      headers: fromNodeHeaders(req.headers),
      query: {
        organizationId: activeOrgId,
      },
    });

    if (!member) {
      return res.status(403).json({
        error: "You are not a member of this organization",
      });
    }

    // Attach organization info to request
    (req as any).organization = member;
    next();
  } catch (error) {
    console.error("Organization middleware error:", error);
    return res.status(403).json({ error: "Organization access denied" });
  }
}
