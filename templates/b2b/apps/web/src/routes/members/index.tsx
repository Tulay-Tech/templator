import { createFileRoute } from "@tanstack/react-router";
import { authClient } from "@/lib/auth-client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, UserPlus, Trash2, Mail } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/members/")({
  component: MembersPage,
});

type Member = {
  id: string;
  userId: string;
  role: string;
  createdAt: Date;
  user: {
    id: string;
    name: string;
    email: string;
    image?: string;
  };
};

type Invitation = {
  id: string;
  email: string;
  role: string;
  status: string;
  createdAt: Date;
  expiresAt: Date;
};

function MembersPage() {
  const queryClient = useQueryClient();
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"member" | "admin">("member");

  // Fetch active organization
  const { data: activeOrg } = useQuery({
    queryKey: ["activeOrganization"],
    queryFn: async () => {
      const { data } = await authClient.organization.getFullOrganization();
      return data;
    },
  });

  // Fetch active member (current user's role)
  const { data: activeMember } = useQuery({
    queryKey: ["activeMember"],
    queryFn: async () => {
      const { data } = await authClient.organization.getActiveMember();
      return data;
    },
  });

  // Fetch members
  const { data: membersData, isPending: membersLoading } = useQuery({
    queryKey: ["members", activeOrg?.id],
    queryFn: async () => {
      const { data } = await authClient.organization.listMembers();
      return data;
    },
    enabled: !!activeOrg,
  });

  // Extract members array from the response
  const members = membersData?.members as Member[] | undefined;

  // Fetch invitations
  const { data: invitations, isPending: invitationsLoading } = useQuery({
    queryKey: ["invitations", activeOrg?.id],
    queryFn: async () => {
      const { data } = await authClient.organization.listInvitations();
      return data as Invitation[];
    },
    enabled: !!activeOrg,
  });

  // Invite member mutation
  const inviteMutation = useMutation({
    mutationFn: async ({
      email,
      role,
    }: {
      email: string;
      role: "member" | "admin";
    }) => {
      return await authClient.organization.inviteMember({
        email,
        role,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invitations"] });
      setInviteDialogOpen(false);
      setInviteEmail("");
      setInviteRole("member");
      toast.success("Invitation sent successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to send invitation");
    },
  });

  // Update role mutation
  const updateRoleMutation = useMutation({
    mutationFn: async ({
      memberId,
      role,
    }: {
      memberId: string;
      role: string;
    }) => {
      return await authClient.organization.updateMemberRole({
        memberId,
        role,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["members"] });
      toast.success("Role updated successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update role");
    },
  });

  // Remove member mutation
  const removeMemberMutation = useMutation({
    mutationFn: async (memberId: string) => {
      return await authClient.organization.removeMember({
        memberIdOrEmail: memberId,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["members"] });
      toast.success("Member removed successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to remove member");
    },
  });

  // Cancel invitation mutation
  const cancelInvitationMutation = useMutation({
    mutationFn: async (invitationId: string) => {
      return await authClient.organization.cancelInvitation({
        invitationId,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invitations"] });
      toast.success("Invitation cancelled");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to cancel invitation");
    },
  });

  const handleInvite = () => {
    if (!inviteEmail) {
      toast.error("Please enter an email address");
      return;
    }
    inviteMutation.mutate({ email: inviteEmail, role: inviteRole });
  };

  const canManageMembers =
    activeMember?.role === "owner" || activeMember?.role === "admin";

  if (membersLoading || invitationsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Team Members</h1>
          <p className="text-muted-foreground mt-1">
            Manage your organization members and invitations
          </p>
        </div>
        {canManageMembers && (
          <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="mr-2 h-4 w-4" />
                Invite Member
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Invite Team Member</DialogTitle>
                <DialogDescription>
                  Send an invitation to join your organization
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="colleague@example.com"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Select
                    value={inviteRole}
                    onValueChange={(value) => {
                      if (value === "member" || value === "admin") {
                        setInviteRole(value);
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="member">Member</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button
                  onClick={handleInvite}
                  disabled={inviteMutation.isPending}
                >
                  {inviteMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    "Send Invitation"
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Pending Invitations */}
      {invitations && invitations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Pending Invitations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Expires</TableHead>
                  {canManageMembers && <TableHead>Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {invitations.map((invitation: Invitation) => (
                  <TableRow key={invitation.id}>
                    <TableCell className="font-medium">
                      {invitation.email}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{invitation.role}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          invitation.status === "pending"
                            ? "secondary"
                            : "default"
                        }
                      >
                        {invitation.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(invitation.expiresAt).toLocaleDateString()}
                    </TableCell>
                    {canManageMembers && (
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            cancelInvitationMutation.mutate(invitation.id)
                          }
                          disabled={cancelInvitationMutation.isPending}
                        >
                          Cancel
                        </Button>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Members Table */}
      <Card>
        <CardHeader>
          <CardTitle>Members ({members?.length || 0})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Joined</TableHead>
                {canManageMembers && <TableHead>Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {members?.map((member) => (
                <TableRow key={member.id}>
                  <TableCell className="font-medium">
                    {member.user.name}
                  </TableCell>
                  <TableCell>{member.user.email}</TableCell>
                  <TableCell>
                    {canManageMembers && member.role !== "owner" ? (
                      <Select
                        value={member.role}
                        onValueChange={(value) => {
                          if (value) {
                            updateRoleMutation.mutate({
                              memberId: member.id,
                              role: value,
                            });
                          }
                        }}
                        disabled={updateRoleMutation.isPending}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="member">Member</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <Badge
                        variant={
                          member.role === "owner" ? "default" : "secondary"
                        }
                      >
                        {member.role}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {new Date(member.createdAt).toLocaleDateString()}
                  </TableCell>
                  {canManageMembers && (
                    <TableCell>
                      {member.role !== "owner" && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Remove Member</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to remove{" "}
                                {member.user.name} from the organization? This
                                action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() =>
                                  removeMemberMutation.mutate(member.id)
                                }
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Remove
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
