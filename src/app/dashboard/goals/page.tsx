"use client";

import { useState } from "react";
import { Plus, Target, Calendar, CheckCircle2, TrendingUp, MoreHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useDashboardData, Goal } from "@/lib/hooks/use-dashboard-data";
import { doc, collection, addDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/contexts/AuthContext";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";

export default function GoalsPage() {
    const { goals, loading } = useDashboardData();
    const { user } = useAuth();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [stats, setStats] = useState({ active: 0, completed: 0, completionRate: 0 });

    const [newGoal, setNewGoal] = useState({
        title: "",
        type: "Product",
        dueDate: "",
        progress: 0
    });

    // Calculate stats
    if (!loading && goals.length > 0) {
        const completed = goals.filter(g => g.progress === 100).length;
        const rate = Math.round((completed / goals.length) * 100);
        if (stats.completionRate !== rate) {
            setStats({
                active: goals.length - completed,
                completed,
                completionRate: rate
            });
        }
    }

    const handleCreateGoal = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (!user) return;
            await addDoc(collection(db, `startups/${user.uid}/goals`), {
                ...newGoal,
                status: "On Track",
                createdAt: new Date(),
                progress: Number(newGoal.progress)
            });
            toast.success("Goal Created");
            setIsModalOpen(false);
            setNewGoal({ title: "", type: "Product", dueDate: "", progress: 0 });
        } catch (error: any) {
            console.error("Error creating goal:", error);
            toast.error("Failed to create goal", {
                description: error.message || "Please check your permissions."
            });
        }
    };

    return (
        <div className="space-y-8 animate-fade-in relative transition-all">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Goals & OKRs</h1>
                    <p className="text-muted-foreground">Align your team and track high-level execution.</p>
                </div>
                <Button onClick={() => setIsModalOpen(true)} className="bg-primary hover:bg-primary/90">
                    <Plus className="w-4 h-4 mr-2" /> New Goal
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-white/5 border-white/5">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Completion Rate</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.completionRate}%</div>
                    </CardContent>
                </Card>
                <Card className="bg-white/5 border-white/5">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Active Goals</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.active}</div>
                    </CardContent>
                </Card>
                <Card className="bg-white/5 border-white/5">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Completed Goals</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.completed}</div>
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
                                        goal.progress === 100 ? "bg-green-500/20 text-green-400" : "bg-primary/20 text-primary"
                                    )}>
                                        {goal.progress === 100 ? <CheckCircle2 className="w-5 h-5" /> : <Target className="w-5 h-5" />}
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-lg">{goal.title}</h3>
                                        <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                                            <span className="bg-white/5 px-2 py-0.5 rounded text-xs border border-white/5">{goal.type}</span>
                                            <span className="flex items-center gap-1">
                                                <Calendar className="w-3 h-3" />
                                                {/* Handle different date formats or timestamps */}
                                                {goal.dueDate || "No Date"}
                                            </span>
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
                                            goal.status === 'At Risk' || goal.status === 'Behind' ? "bg-red-500/10 text-red-400 border-red-500/20" :
                                                "bg-white/5 text-muted-foreground border-white/10"
                                    )}>
                                        {goal.status}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
                {goals.length === 0 && <div className="text-center text-muted-foreground py-10">No goals found. Create one!</div>}
            </div>

            {/* Simple Modal Overlay */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <Card className="w-full max-w-lg bg-black border-white/10">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>Create New Goal</CardTitle>
                            <Button variant="ghost" size="icon" onClick={() => setIsModalOpen(false)}>
                                <X className="h-4 w-4" />
                            </Button>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleCreateGoal} className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Goal Title</Label>
                                    <Input
                                        placeholder="e.g. Launch MVP"
                                        value={newGoal.title}
                                        onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Type</Label>
                                        <select
                                            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                            value={newGoal.type}
                                            onChange={(e) => setNewGoal({ ...newGoal, type: e.target.value })}
                                        >
                                            <option value="Product">Product</option>
                                            <option value="Validation">Validation</option>
                                            <option value="Sales">Sales</option>
                                            <option value="Fundraising">Fundraising</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Current Progress (%)</Label>
                                        <Input
                                            type="number"
                                            min="0"
                                            max="100"
                                            value={newGoal.progress}
                                            onChange={(e) => setNewGoal({ ...newGoal, progress: parseInt(e.target.value) })}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label>Due Date</Label>
                                    <Input
                                        type="date"
                                        value={newGoal.dueDate}
                                        onChange={(e) => setNewGoal({ ...newGoal, dueDate: e.target.value })}
                                    />
                                </div>
                                <Button type="submit" className="w-full">Create Goal</Button>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}
