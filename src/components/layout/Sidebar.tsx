"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
    LayoutDashboard,
    Target,
    CheckSquare,
    Flag,
    Users,
    FileText,
    Settings,
    Zap,
    BarChart2
} from "lucide-react";

const MENU_ITEMS = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
    { icon: Target, label: "Goals", href: "/dashboard/goals" },
    { icon: Flag, label: "Milestones", href: "/dashboard" }, // Can add page if needed
    { icon: CheckSquare, label: "Tasks", href: "/dashboard/tasks" },
    { icon: Users, label: "Team", href: "/dashboard/team" },
    { icon: FileText, label: "Documents", href: "/dashboard" },
    { icon: BarChart2, label: "Analytics", href: "/dashboard" },
];

export function Sidebar() {
    const pathname = usePathname();

    return (
        <aside className="fixed left-0 top-0 h-screen w-64 bg-black/40 border-r border-white/10 backdrop-blur-xl hidden md:flex flex-col z-40">
            <div className="h-16 flex items-center px-6 border-b border-white/10">
                <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                        <Zap className="w-5 h-5 text-white fill-current" />
                    </div>
                    <span className="text-lg font-bold tracking-tight">StartupOS</span>
                </Link>
            </div>

            <div className="flex-1 overflow-y-auto py-6 px-3 space-y-1">
                {MENU_ITEMS.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link key={item.href} href={item.href}>
                            <div
                                className={cn(
                                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group relative overflow-hidden",
                                    isActive
                                        ? "text-white bg-white/10 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1)]"
                                        : "text-muted-foreground hover:text-white hover:bg-white/5"
                                )}
                            >
                                {isActive && (
                                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-r-full" />
                                )}
                                <item.icon className={cn("w-5 h-5 transition-colors", isActive ? "text-primary" : "text-muted-foreground group-hover:text-white")} />
                                {item.label}
                            </div>
                        </Link>
                    )
                })}
            </div>

            <div className="p-4 border-t border-white/10">
                <Link href="/settings">
                    <div className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-muted-foreground hover:text-white transition-colors">
                        <Settings className="w-5 h-5" />
                        Settings
                    </div>
                </Link>
            </div>
        </aside>
    );
}
