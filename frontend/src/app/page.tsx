import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl items-center justify-center px-4 py-10">
      <Card className="w-full">
        <CardHeader>
          <Badge variant="secondary" className="w-fit">
            Sprint 1 Foundation
          </Badge>
          <CardTitle className="mt-2 text-2xl">
            Transportation Monthly Payments Platform
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 sm:flex-row">
          <Link href="/login" className={cn(buttonVariants({ variant: "default" }))}>
            Go to Login
          </Link>
          <Link href="/admin" className={cn(buttonVariants({ variant: "outline" }))}>
            Admin Area
          </Link>
          <Link href="/passenger" className={cn(buttonVariants({ variant: "outline" }))}>
            Passenger Area
          </Link>
        </CardContent>
      </Card>
    </main>
  );
}
