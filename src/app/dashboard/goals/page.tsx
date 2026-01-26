"use client";

import { useState } from "react";
import { Plus, Target, Calendar, CheckCircle2, TrendingUp, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const GOALS = [
    { id: 1, title: "Launch V1 Beta", type: "Product", progress: 85, dueDate: "Oct 30", status: "On Track" },
    { id: 2, title: "Secure Seed Funding", type: "Fundraising", progress: 40, dueDate: "Dec 15", status: "At Risk" },
    { id: 3, title: "Hire Lead Engineer", type: "Team", progress: 100, dueDate: "Completed", status: "Done" },
    { id: 4, title: "Reach 100 Paying Users", type: "Growth", progress: 25, dueDate: "Nov 20", status: "On Track" },
];

export default function GoalsPage() {
    const [goals, setGoals] = useState(GOALS);

    const handleAddGoal = () => {
        toast.info("Create Goal Modal", {
            description: "This feature will open a modal to add a new goal in the connected version."
        });
    };

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Goals & OKRs</h1>
                    <p className="text-muted-foreground">Align your team and track high-level execution.</p>
                </div>
                <Button onClick={handleAddGoal} className="bg-primary hover:bg-primary/90">
                    <Plus className="w-4 h-4 mr-2" /> New Goal
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-white/5 border-white/5">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Completion Rate</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">62%</div>
                        <p className="text-xs text-green-400 mt-1 flex items-center">+12% from last month</p>
                    </CardContent>
                </Card>
                <Card className="bg-white/5 border-white/5">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Active Goals</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">8</div>
                        <p className="text-xs text-muted-foreground mt-1">3 critical path</p>
                    </CardContent>
                </Card>
                <Card className="bg-white/5 border-white/5">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Upcoming Deadlines</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">2</div>
                        <p className="text-xs text-orange-400 mt-1">Due this week</p>
                    </CardContent>
                </Card>
            </div>

            <div className="space-y-4">
                {goals.map((goal) => (
                    <Card key={goal.id} className="group hover:bg-white/5 transition-all duration-300">
                        <CardContent className="p-6">
                            <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-8">
                                <div className="flex items-start gap-4 flex-1">
                                    <div className={cn(
                                        "w-10 h-10 rounded-lg flex items-center justify-center shrink-0",
                                        goal.status === 'Done' ? "bg-green-500/20 text-green-400" : "bg-primary/20 text-primary"
                                    )}>
                                        {goal.status === 'Done' ? <CheckCircle2 className="w-5 h-5" /> : <Target className="w-5 h-5" />}
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-lg">{goal.title}</h3>
                                        <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                                            <span className="bg-white/5 px-2 py-0.5 rounded text-xs border border-white/5">{goal.type}</span>
                                            <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {goal.dueDate}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex-1 space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Progress</span>
                                        <span className="font-medium">{goal.progress}%</span>
                                    </div>
                                    <div className="h-2 w-full bg-secondary/10 rounded-full overflow-hidden">
                                        <div
                                            className={cn("h-full rounded-full transition-all duration-500",
                                                goal.progress === 100 ? "bg-green-500" : "bg-gradient-to-r from-primary to-secondary"
                                            )}
                                            style={{ width: `${goal.progress}%` }}
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 md:w-32 justify-end">
                                    <div className={cn(
                                        "px-3 py-1 rounded-full text-xs font-medium border",
                                        goal.status === 'On Track' ? "bg-green-500/10 text-green-400 border-green-500/20" :
                                            goal.status === 'At Risk' ? "bg-red-500/10 text-red-400 border-red-500/20" :
                                                goal.status === 'Done' ? "bg-blue-500/10 text-blue-400 border-blue-500/20" :
                                                    "bg-white/5 text-muted-foreground border-white/10"
                                    )}>
                                        {goal.status}
                                    </div>
                                    <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                                        <MoreHorizontal className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
