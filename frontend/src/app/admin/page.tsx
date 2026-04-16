"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/providers/auth-provider";
import { RouteGuard } from "@/shared/auth/route-guard";
import { EmptyState } from "@/shared/ui/states/empty-state";
import { Modal } from "@/shared/ui/modal";

export default function AdminPage() {
  const { user, logout } = useAuth();

  return (
    <RouteGuard allowRole="ADMIN">
      <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-4 px-4 py-10">
        <Card>
          <CardHeader>
            <Badge className="w-fit">ADMIN</Badge>
            <CardTitle className="mt-2">Admin Workspace</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <p className="text-sm text-muted-foreground">
              Authenticated as <strong>{user?.email}</strong>. Business features will be added in future sprints.
            </p>
            <div className="flex gap-2">
              <Modal
                title="Sprint 1"
                description="This modal is part of the base design system."
                trigger={<Button variant="outline">Open Modal</Button>}
              >
                <p className="text-sm text-muted-foreground">
                  Authentication and role-based access are active.
                </p>
              </Modal>
              <Button variant="destructive" onClick={logout}>
                Sign out
              </Button>
            </div>
          </CardContent>
        </Card>
        <EmptyState
          title="No admin modules yet"
          description="Payments, reports, and dashboard screens are intentionally out of Sprint 1 scope."
        />
      </main>
    </RouteGuard>
  );
}
