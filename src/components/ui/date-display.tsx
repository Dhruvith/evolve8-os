"use client";

import { useMounted } from "@/lib/hooks/use-mounted";
import { format } from "date-fns";

export function DateDisplay() {
    const mounted = useMounted();
    if (!mounted) return <div className="h-4 w-24 bg-white/5 animate-pulse rounded" />;

    return (
        <span className="text-xs text-muted-foreground">
            {format(new Date(), "MMM dd, yyyy")}
        </span>
    );
}
