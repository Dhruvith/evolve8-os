"use client";

import { useRef } from "react";
import { motion } from "framer-motion";
import {
    TrendingUp,
    Users,
    Target,
    CheckCircle2,
    AlertCircle,
    ArrowUpRight,
    MoreHorizontal
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { DateDisplay } from "@/components/ui/date-display";

const container = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
};

const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
};

export default function DashboardPage() {
    return (
        <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="space-y-8 animate-fade-in"
        >
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                    <p className="text-muted-foreground">Overview of your startup's health and progress.</p>
                </div>
                <div className="flex items-center gap-2">
                    <DateDisplay />
                    <Button onClick={() => toast.success("Synced with latest data", { description: "Your metrics are up to date." })}>
                        Update Progress
                    </Button>
                </div>
            </div>

            {/* Startup Health & Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {/* Health Score - Big Feature */}
                <motion.div variants={item} className="md:col-span-1">
                    <Card className="h-full bg-gradient-to-br from-primary/20 to-secondary/5 border-primary/20 relative overflow-hidden group hover:border-primary/40 transition-colors">
                        <div className="absolute top-0 right-0 p-3 opacity-20 group-hover:opacity-30 transition-opacity">
                            <TrendingUp size={80} />
                        </div>
                        <CardHeader>
                            <CardTitle className="text-sm font-medium text-muted-foreground">Startup Health Score</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="mt-2 flex items-baseline gap-2">
                                <span className="text-6xl font-bold tracking-tighter text-white">85</span>
                                <span className="text-sm text-green-400 font-medium flex items-center gap-1">
                                    <ArrowUpRight size={14} /> +2.5%
                                </span>
                            </div>
                            <div className="mt-4 h-2 w-full bg-black/20 rounded-full overflow-hidden">
                                <div className="h-full bg-gradient-to-r from-primary to-secondary w-[85%]" />
                            </div>
                            <p className="text-xs text-muted-foreground mt-3">Great progress on validation.</p>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Quick Stats */}
                <motion.div variants={item} className="md:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-6">
                    <StatsCard
                        title="Active Goals"
                        value="12"
                        trend="4 blocked"
                        trendColor="text-red-400"
                        icon={Target}
                    />
                    <StatsCard
                        title="Tasks Due"
                        value="8"
                        trend="3 overdue"
                        trendColor="text-orange-400"
                        icon={CheckCircle2}
                    />
                    <StatsCard
                        title="Investor Readiness"
                        value="70%"
                        trend="Pitch deck needs review"
                        trendColor="text-yellow-400"
                        icon={Users}
                    />
                </motion.div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Left Column: Goals & Tasks */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Goals */}
                    <motion.div variants={item}>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold">Quarterly Goals</h2>
                            <Button variant="ghost" size="sm">View All</Button>
                        </div>
                        <div className="space-y-4">
                            {[1, 2, 3].map((i) => (
                                <Card key={i} className="group hover:bg-white/5 transition-colors cursor-pointer" onClick={() => toast.info("Goal Details", { description: "Opening goal details view..." })}>
                                    <CardContent className="p-4 flex items-center gap-4">
                                        <div className={cn("w-2 h-12 rounded-full", i === 1 ? "bg-green-500" : i === 2 ? "bg-yellow-500" : "bg-primary")} />
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between mb-1">
                                                <h3 className="font-medium">Launch V2 Beta Program</h3>
                                                <span className="text-xs text-muted-foreground">{i * 25}%</span>
                                            </div>
                                            <div className="w-full h-1.5 bg-secondary/10 rounded-full">
                                                <div className="h-full bg-primary rounded-full" style={{ width: `${i * 25}%` }} />
                                            </div>
                                        </div>
                                        <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                                            <MoreHorizontal size={16} />
                                        </Button>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </motion.div>

                    {/* Milestones */}
                    <motion.div variants={item}>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold">Milestone Roadmap</h2>
                        </div>
                        <div className="relative border-l border-white/10 ml-3 space-y-8 py-2">
                            <TimelineItem
                                date="Oct 24"
                                title="Product Validation"
                                status="completed"
                                desc="Interviews completed with 50 users."
                            />
                            <TimelineItem
                                date="Nov 15"
                                title="MVP Release"
                                status="current"
                                desc="Core features implementation."
                            />
                            <TimelineItem
                                date="Dec 01"
                                title="First Paying Customer"
                                status="pending"
                                desc="Convert beta users to paid."
                            />
                        </div>
                    </motion.div>
                </div>

                {/* Right Column: Pulse & Team */}
                <div className="lg:col-span-1 space-y-8">
                    <motion.div variants={item}>
                        <Card>
                            <CardHeader>
                                <CardTitle>Team Pulse</CardTitle>
                                <CardDescription>Activity in last 7 days</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {["Alex (CEO)", "Sarah (CTO)", "Mike (Design)"].map((member, i) => (
                                    <div key={i} className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold border border-white/10">
                                                {member.charAt(0)}
                                            </div>
                                            <span className="text-sm font-medium">{member}</span>
                                        </div>
                                        <div className="text-xs text-green-400">95% tasks</div>
                                    </div>
                                ))}
                                <Button variant="outline" className="w-full mt-2" onClick={() => toast("Managing Team", { description: "Redirecting to team settings..." })}>Manage Team</Button>
                            </CardContent>
                        </Card>
                    </motion.div>

                    <motion.div variants={item}>
                        <Card className="bg-blue-500/5 border-blue-500/20">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-blue-400">
                                    <AlertCircle size={16} />
                                    Action Required
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="p-3 bg-blue-500/10 rounded-lg text-sm border border-blue-500/10 cursor-pointer hover:bg-blue-500/20 transition-colors">
                                    Update Monthly Investor Report
                                </div>
                                <div className="p-3 bg-blue-500/10 rounded-lg text-sm border border-blue-500/10 cursor-pointer hover:bg-blue-500/20 transition-colors">
                                    Review Q4 Financials
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>
            </div>
        </motion.div>
    );
}

function StatsCard({ title, value, trend, trendColor, icon: Icon }: any) {
    return (
        <Card className="hover:bg-white/5 transition-colors">
            <CardContent className="p-6">
                <div className="flex items-center justify-between space-y-0 pb-2">
                    <span className="text-sm font-medium text-muted-foreground">{title}</span>
                    <Icon size={16} className="text-muted-foreground" />
                </div>
                <div className="text-2xl font-bold">{value}</div>
                <p className={cn("text-xs mt-1 font-medium", trendColor)}>{trend}</p>
            </CardContent>
        </Card>
    )
}

function TimelineItem({ date, title, status, desc }: any) {
    return (
        <div className="ml-6 relative">
            <div className={cn(
                "absolute -left-[31px] top-0 w-4 h-4 rounded-full border-2 border-background",
                status === 'completed' ? "bg-green-500" : status === 'current' ? "bg-primary animate-pulse" : "bg-muted"
            )} />
            <div className="flex flex-col">
                <span className="text-xs text-muted-foreground font-mono mb-1">{date}</span>
                <span className={cn("font-medium", status !== 'pending' ? "text-foreground" : "text-muted-foreground")}>{title}</span>
                <span className="text-sm text-muted-foreground mt-1">{desc}</span>
            </div>
        </div>
    )
}
