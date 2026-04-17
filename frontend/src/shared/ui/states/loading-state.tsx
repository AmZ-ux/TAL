import { Loader2 } from "lucide-react";

export function LoadingState({ label = "Loading..." }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-2 rounded-lg border bg-card/90 p-6 text-sm text-muted-foreground shadow-sm">
      <Loader2 className="h-4 w-4 animate-spin text-primary" />
      <span>{label}</span>
    </div>
  );
}
