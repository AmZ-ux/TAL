"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/providers/auth-provider";
import { LoadingState } from "@/shared/ui/states/loading-state";

export function RouteGuard({
  children,
  allowRole,
}: {
  children: React.ReactNode;
  allowRole?: "ADMIN" | "PASSENGER";
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { isLoading, isAuthenticated, user } = useAuth();

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
      return;
    }

    if (allowRole && user?.role !== allowRole) {
      router.replace(user?.role === "ADMIN" ? "/admin" : "/passenger");
    }
  }, [allowRole, isAuthenticated, isLoading, pathname, router, user?.role]);

  if (isLoading) {
    return <LoadingState label="Validating session..." />;
  }

  if (!isAuthenticated) {
    return <LoadingState label="Redirecting to login..." />;
  }

  if (allowRole && user?.role !== allowRole) {
    return <LoadingState label="Redirecting to your workspace..." />;
  }

  return <>{children}</>;
}
