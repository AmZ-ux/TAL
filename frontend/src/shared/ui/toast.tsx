"use client";

import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";

export { toast };

export function AppToast() {
  return <Toaster richColors position="top-right" />;
}
