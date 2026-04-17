import { Inbox } from "lucide-react";

export function EmptyState({
  title = "No data available",
  description = "There is nothing to display yet.",
}: {
  title?: string;
  description?: string;
}) {
  return (
    <div className="rounded-lg border border-dashed bg-muted/30 p-8 text-center shadow-sm">
      <Inbox className="mx-auto mb-3 h-6 w-6 text-primary/70" />
      <h3 className="text-sm font-semibold">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
