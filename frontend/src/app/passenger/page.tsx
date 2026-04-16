"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useAuth } from "@/providers/auth-provider";
import { RouteGuard } from "@/shared/auth/route-guard";
import { EmptyState } from "@/shared/ui/states/empty-state";

export default function PassengerPage() {
  const { user, logout } = useAuth();

  return (
    <RouteGuard allowRole="PASSENGER">
      <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-4 px-4 py-10">
        <Card>
          <CardHeader>
            <Badge className="w-fit">PASSENGER</Badge>
            <CardTitle className="mt-2">Passenger Workspace</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <p className="text-sm text-muted-foreground">
              Authenticated as <strong>{user?.email}</strong>. Passenger business modules start in next sprints.
            </p>
            <div className="flex flex-wrap gap-2">
              <Link href="/passenger/upload-receipt" className={cn(buttonVariants({ variant: "outline" }), "w-fit")}>
                Upload receipt
              </Link>
              <Button variant="destructive" className="w-fit" onClick={logout}>
                Sign out
              </Button>
            </div>
          </CardContent>
        </Card>
        <EmptyState title="Next step" description="Use the Upload receipt action to send payment proof for analysis." />
      </main>
    </RouteGuard>
  );
}
