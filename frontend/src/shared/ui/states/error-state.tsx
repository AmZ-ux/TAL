import { AlertTriangle } from "lucide-react";

export function ErrorState({
  message = "Something went wrong.",
}: {
  message?: string;
}) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-destructive/40 bg-destructive/10 p-6 text-sm text-destructive">
      <AlertTriangle className="h-4 w-4" />
      <span>{message}</span>
    </div>
  );
}
