"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/contexts/AuthContext";
import {
    LayoutDashboard,
    Target,
    CheckSquare,
    Users,
    Settings,
    Zap,
    Handshake,
    Compass,
    MessageSquare,
    UserSearch,
    CalendarDays,
    LogOut,
    ChevronLeft,
    Menu,
    Briefcase
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

const MENU_ITEMS = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
    { icon: Target, label: "Goals", href: "/dashboard/goals" },
    { icon: CheckSquare, label: "Tasks", href: "/dashboard/tasks" },
    { icon: Briefcase, label: "Team", href: "/dashboard/team" },
    { icon: Handshake, label: "Community", href: "/dashboard/community" },
    { icon: Compass, label: "Network", href: "/dashboard/network" },
    { icon: MessageSquare, label: "Topics", href: "/dashboard/topics" },
    { icon: UserSearch, label: "Find Founders", href: "/dashboard/founders" },
    { icon: CalendarDays, label: "Events", href: "/dashboard/events" },
];

export function Sidebar() {
    const pathname = usePathname();
    const { logout } = useAuth();
    const [mobileOpen, setMobileOpen] = useState(false);

    const NavContent = () => (
        <>
            <div className="h-16 flex items-center px-6 border-b border-white/10">
                <Link href="/" className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center shadow-lg shadow-violet-500/20">
                        <Zap className="w-5 h-5 text-white fill-current" />
                    </div>
                    <span className="text-lg font-bold tracking-tight">StartupOS</span>
                </Link>
            </div>

            <div className="flex-1 overflow-y-auto py-6 px-3 space-y-1">
                <div className="px-3 mb-4">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Main Menu</span>
                </div>
                {MENU_ITEMS.slice(0, 4).map((menuItem) => {
                    const isActive = pathname === menuItem.href;
                    return (
                        <Link key={menuItem.href + menuItem.label} href={menuItem.href} onClick={() => setMobileOpen(false)}>
                            <div
                                className={cn(
                                    "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative overflow-hidden",
                                    isActive
                                        ? "text-white bg-white/10 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1)]"
                                        : "text-muted-foreground hover:text-white hover:bg-white/5"
                                )}
                            >
                                {isActive && (
                                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-violet-500 to-fuchsia-500 rounded-r-full" />
                                )}
                                <menuItem.icon className={cn("w-5 h-5 transition-colors", isActive ? "text-violet-400" : "text-muted-foreground group-hover:text-white")} />
                                {menuItem.label}
                            </div>
                        </Link>
                    );
                })}

                <div className="px-3 mt-6 mb-4">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Ecosystem</span>
                </div>
                {MENU_ITEMS.slice(4).map((menuItem) => {
                    const isActive = pathname === menuItem.href;
                    return (
                        <Link key={menuItem.href + menuItem.label} href={menuItem.href} onClick={() => setMobileOpen(false)}>
                            <div
                                className={cn(
                                    "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative overflow-hidden",
                                    isActive
                                        ? "text-white bg-white/10 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1)]"
                                        : "text-muted-foreground hover:text-white hover:bg-white/5"
                                )}
                            >
                                {isActive && (
                                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-violet-500 to-fuchsia-500 rounded-r-full" />
                                )}
                                <menuItem.icon className={cn("w-5 h-5 transition-colors", isActive ? "text-violet-400" : "text-muted-foreground group-hover:text-white")} />
                                {menuItem.label}
                            </div>
                        </Link>
                    );
                })}
            </div>

            <div className="p-4 border-t border-white/10 space-y-1">
                <Link href="/dashboard" onClick={() => setMobileOpen(false)}>
                    <div className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-muted-foreground hover:text-white transition-colors rounded-xl hover:bg-white/5">
                        <Settings className="w-5 h-5" />
                        Settings
                    </div>
                </Link>
                <button
                    onClick={() => { logout(); setMobileOpen(false); }}
                    className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-red-400 hover:text-red-300 transition-colors w-full text-left rounded-xl hover:bg-red-500/5"
                >
                    <LogOut className="w-5 h-5" />
                    Sign Out
                </button>
            </div>
        </>
    );

    return (
        <>
            {/* Desktop Sidebar */}
            <aside className="fixed left-0 top-0 h-screen w-64 bg-black/60 border-r border-white/10 backdrop-blur-2xl hidden md:flex flex-col z-40">
                <NavContent />
            </aside>

            {/* Mobile hamburger */}
            <button
                className="fixed top-4 left-4 z-50 md:hidden p-2 rounded-xl bg-white/10 backdrop-blur-lg border border-white/10"
                onClick={() => setMobileOpen(!mobileOpen)}
            >
                {mobileOpen ? <ChevronLeft className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            {/* Mobile Sidebar */}
            {mobileOpen && (
                <>
                    <div className="fixed inset-0 bg-black/60 z-40 md:hidden" onClick={() => setMobileOpen(false)} />
                    <aside className="fixed left-0 top-0 h-screen w-64 bg-black/90 border-r border-white/10 backdrop-blur-2xl flex flex-col z-50 md:hidden">
                        <NavContent />
                    </aside>
                </>
            )}
        </>
    );
}
