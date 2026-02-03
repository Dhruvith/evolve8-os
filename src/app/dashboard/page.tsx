"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
    TrendingUp,
    Users,
    Target,
    CheckCircle2,
    AlertCircle,
    ArrowUpRight,
    ArrowDownRight,
    Minus,
    MoreHorizontal
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { DateDisplay } from "@/components/ui/date-display";
import { useDashboardData, Goal, Task, Milestone, TeamMember } from "@/lib/hooks/use-dashboard-data";
import { calculateStartupScore } from "@/lib/score-logic";
import { Skeleton } from "@/components/ui/skeleton";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/contexts/AuthContext";
import { format } from "date-fns";
import Link from "next/link";

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
    const { startup, goals, tasks, milestones, team, loading } = useDashboardData();
    const { user } = useAuth();
    const [scoreData, setScoreData] = useState<{ score: number; trend: "up" | "down" | "neutral" } | null>(null);

    // Calculate score and update DB if needed
    useEffect(() => {
        if (!loading && startup && user) {
            const { score, trend } = calculateStartupScore(startup, goals, tasks, milestones, team);
            setScoreData({ score, trend });

            // Only update if score changed significantly to avoid loops
            if (startup.healthScore !== score) {
                updateDoc(doc(db, "startups", user.uid), {
                    healthScore: score,
                    previousScore: startup.healthScore || 0,
                    lastUpdate: new Date(), // Updates consistency score
                    trend: trend
                }).catch(err => console.error("Failed to update score", err));
            }
        }
    }, [loading, startup, goals, tasks, milestones, team, user]);

    if (loading) {
        return <div className="p-8 space-y-8">
            <Skeleton className="h-12 w-48" />
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-40" />)}
            </div>
        </div>
    }

    // Active Goals Count
    const activeGoals = goals.filter(g => g.status !== "Completed").length;
    const blockedGoals = goals.filter(g => g.status === "At Risk" || g.status === "Behind").length;

    // Tasks Status
    const dueTasks = tasks.filter(t => t.status !== "Done").length;

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
                    <h1 className="text-3xl font-bold tracking-tight">{startup?.name || "Dashboard"}</h1>
                    <p className="text-muted-foreground">{startup?.stage ? `${startup.stage} Stage` : "Overview"} - Startup's health and progress.</p>
                </div>
                <div className="flex items-center gap-2">
                    <DateDisplay />
                    <Button onClick={() => toast.success("Synced with latest data", { description: "Your metrics are up to date." })}>
                        Update Progress
                    </Button>
                </div>
            </div>

            {/* If pending approval */}
            {startup?.status === 'pending' && (
                <div className="bg-yellow-500/10 border border-yellow-500/20 p-4 rounded-lg flex items-center gap-3 text-yellow-500">
                    <AlertCircle />
                    <span>Your startup is pending approval. Some features may be limited until an admin verifies your profile.</span>
                </div>
            )}

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
                                <span className="text-6xl font-bold tracking-tighter text-white">
                                    {scoreData?.score || 0}
                                </span>
                                <span className={cn("text-sm font-medium flex items-center gap-1",
                                    scoreData?.trend === 'up' ? "text-green-400" : scoreData?.trend === 'down' ? "text-red-400" : "text-muted-foreground"
                                )}>
                                    {scoreData?.trend === 'up' && <ArrowUpRight size={14} />}
                                    {scoreData?.trend === 'down' && <ArrowDownRight size={14} />}
                                    {scoreData?.trend === 'neutral' && <Minus size={14} />}
                                    {scoreData?.trend === 'up' ? "Trending Up" : "Stable"}
                                </span>
                            </div>
                            <div className="mt-4 h-2 w-full bg-black/20 rounded-full overflow-hidden">
                                <div className="h-full bg-gradient-to-r from-primary to-secondary" style={{ width: `${scoreData?.score || 0}%` }} />
                            </div>
                            <p className="text-xs text-muted-foreground mt-3">
                                {scoreData?.score && scoreData.score > 80 ? "Excellent execution!" : "Needs improvement in weekly consistency."}
                            </p>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Quick Stats */}
                <motion.div variants={item} className="md:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-6">
                    <StatsCard
                        title="Active Goals"
                        value={activeGoals}
                        trend={`${blockedGoals} blocked`}
                        trendColor={blockedGoals > 0 ? "text-red-400" : "text-green-400"}
                        icon={Target}
                    />
                    <StatsCard
                        title="Tasks Due"
                        value={dueTasks}
                        trend={`${dueTasks} remaining`}
                        trendColor="text-orange-400"
                        icon={CheckCircle2}
                    />
                    <StatsCard
                        title="Investor Readiness"
                        value={`${startup?.pitchDeck ? "80%" : "40%"}`}
                        trend={startup?.pitchDeck ? "Pitch Deck Ready" : "Pitch Deck Missing"}
                        trendColor={startup?.pitchDeck ? "text-green-400" : "text-yellow-400"}
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
                            <h2 className="text-lg font-semibold">Active Goals</h2>
                            <Link href="/dashboard/goals">
                                <Button variant="ghost" size="sm">Manage Goals</Button>
                            </Link>
                        </div>
                        <div className="space-y-4">
                            {goals.slice(0, 3).map((goal) => (
                                <Card key={goal.id} className="group hover:bg-white/5 transition-colors cursor-pointer">
                                    <CardContent className="p-4 flex items-center gap-4">
                                        <div className={cn("w-2 h-12 rounded-full", goal.status === "Completed" ? "bg-green-500" : (goal.status === "At Risk" || goal.status === "Behind") ? "bg-red-500" : "bg-primary")} />
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between mb-1">
                                                <h3 className="font-medium">{goal.title}</h3>
                                                <span className="text-xs text-muted-foreground">{goal.progress || 0}%</span>
                                            </div>
                                            <div className="w-full h-1.5 bg-secondary/10 rounded-full">
                                                <div className="h-full bg-primary rounded-full" style={{ width: `${goal.progress || 0}%` }} />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                            {goals.length === 0 && (
                                <div className="text-center p-8 border border-dashed border-white/10 rounded-lg text-muted-foreground">
                                    No active goals. Set one to start scoring points.
                                </div>
                            )}
                        </div>
                    </motion.div>

                    {/* Milestones */}
                    <motion.div variants={item}>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold">Milestone Roadmap</h2>
                        </div>
                        <div className="relative border-l border-white/10 ml-3 space-y-8 py-2">
                            {milestones.length > 0 ? milestones.map((m, i) => (
                                <TimelineItem
                                    key={i}
                                    date={m.dueDate ? format(new Date(m.dueDate.seconds * 1000), "MMM dd") : "TBD"}
                                    title={m.title}
                                    status={m.status.toLowerCase()}
                                    desc={m.description}
                                />
                            )) : (
                                <div className="ml-6 text-sm text-muted-foreground">No milestones set yet.</div>
                            )}
                        </div>
                    </motion.div>
                </div>

                {/* Right Column: Pulse & Team */}
                <div className="lg:col-span-1 space-y-8">
                    <motion.div variants={item}>
                        <Card>
                            <CardHeader>
                                <CardTitle>Team Pulse</CardTitle>
                                <CardDescription>Active Members: {team.length}</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {team.slice(0, 4).map((member, i) => (
                                    <div key={i} className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold border border-white/10">
                                                {member.name.charAt(0)}
                                            </div>
                                            <span className="text-sm font-medium">{member.name}</span>
                                        </div>
                                        <div className="text-xs text-green-400">Active</div>
                                    </div>
                                ))}
                                <Link href="/dashboard/team">
                                    <Button variant="outline" className="w-full mt-2">Manage Team</Button>
                                </Link>
                            </CardContent>
                        </Card>
                    </motion.div>

                    <motion.div variants={item}>
                        <Card className="bg-blue-500/5 border-blue-500/20">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-blue-400">
                                    <AlertCircle size={16} />
                                    Actions Required
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {dueTasks > 0 ? (
                                    <div className="p-3 bg-blue-500/10 rounded-lg text-sm border border-blue-500/10 cursor-pointer">
                                        You have {dueTasks} tasks requiring attention.
                                    </div>
                                ) : (
                                    <div className="text-sm text-muted-foreground">No immediate actions.</div>
                                )}
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
                status === 'achieved' || status === 'completed' ? "bg-green-500" : status === 'pending' ? "bg-primary animate-pulse" : "bg-red-500"
            )} />
            <div className="flex flex-col">
                <span className="text-xs text-muted-foreground font-mono mb-1">{date}</span>
                <span className={cn("font-medium", status !== 'pending' ? "text-foreground" : "text-muted-foreground")}>{title}</span>
                <span className="text-sm text-muted-foreground mt-1">{desc}</span>
            </div>
        </div>
    )
}
