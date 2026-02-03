"use client";

import { useState } from "react";
import { Check, CheckCircle2, Circle, Clock, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useDashboardData } from "@/lib/hooks/use-dashboard-data";
import { collection, addDoc, updateDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/contexts/AuthContext";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function TasksPage() {
    const { tasks, goals, loading, team } = useDashboardData();
    const { user } = useAuth();
    const [isModalOpen, setIsModalOpen] = useState(false);

    const [newTask, setNewTask] = useState({
        title: "",
        priority: "Medium",
        goalId: "",
        assigneeId: "",
        dueDate: ""
    });

    const handleCreateTask = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (!user) return;
            await addDoc(collection(db, `startups/${user.uid}/tasks`), {
                ...newTask,
                status: "To Do",
                createdAt: new Date()
            });
            toast.success("Task Added");
            setIsModalOpen(false);
            setNewTask({ title: "", priority: "Medium", goalId: "", assigneeId: "", dueDate: "" });
        } catch (error) {
            toast.error("Failed to add task");
        }
    };

    const toggleTaskStatus = async (taskId: string, currentStatus: string) => {
        try {
            if (!user) return;
            const newStatus = currentStatus === "Done" ? "To Do" : "Done";
            await updateDoc(doc(db, `startups/${user.uid}/tasks`, taskId), {
                status: newStatus
            });
            toast.success(`Task marked as ${newStatus}`);
        } catch (error) {
            toast.error("Update failed");
        }
    };

    return (
        <div className="space-y-8 animate-fade-in relative">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Execution Tasks</h1>
                    <p className="text-muted-foreground">Daily actions driven by your high-level goals.</p>
                </div>
                <Button onClick={() => setIsModalOpen(true)} className="bg-primary hover:bg-primary/90">
                    <Plus className="w-4 h-4 mr-2" /> New Task
                </Button>
            </div>

            <div className="space-y-4">
                {tasks.map((task) => (
                    <div
                        key={task.id}
                        className="group flex items-center justify-between p-4 bg-white/5 border border-white/5 rounded-lg hover:border-primary/20 transition-all"
                    >
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => toggleTaskStatus(task.id, task.status)}
                                className={cn(
                                    "w-6 h-6 rounded-full border flex items-center justify-center transition-colors",
                                    task.status === 'Done' ? "bg-green-500 border-green-500 text-black" : "border-white/20 hover:border-white/40"
                                )}
                            >
                                {task.status === 'Done' && <Check size={14} />}
                            </button>
                            <div>
                                <h3 className={cn("font-medium", task.status === 'Done' && "line-through text-muted-foreground")}>
                                    {task.title}
                                </h3>
                                <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                                    {task.priority && (
                                        <span className={cn(
                                            "capitalize px-1.5 py-0.5 rounded",
                                            task.priority === 'High' ? "bg-red-500/20 text-red-300" : "bg-white/10"
                                        )}>
                                            {task.priority}
                                        </span>
                                    )}
                                    {task.goalId && (
                                        <span className="flex items-center gap-1">
                                            <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                                            {goals.find(g => g.id === task.goalId)?.title || "Linked Goal"}
                                        </span>
                                    )}
                                    {task.assigneeId && (
                                        <span className="flex items-center gap-1">
                                            For: {team.find(t => t.id === task.assigneeId)?.name || "Team Member"}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}

                {tasks.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground border border-dashed border-white/10 rounded-lg">
                        <CheckCircle2 className="w-12 h-12 mx-auto mb-4 opacity-20" />
                        <p>No active tasks. Create one to start executing.</p>
                    </div>
                )}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <Card className="w-full max-w-lg bg-black border-white/10">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>Create New Task</CardTitle>
                            <Button variant="ghost" size="icon" onClick={() => setIsModalOpen(false)}>
                                <X className="h-4 w-4" />
                            </Button>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleCreateTask} className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Task Title</Label>
                                    <Input
                                        placeholder="e.g. Schedule user interviews"
                                        value={newTask.title}
                                        onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Related Goal (Required)</Label>
                                        <select
                                            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                            value={newTask.goalId}
                                            onChange={(e) => setNewTask({ ...newTask, goalId: e.target.value })}
                                            required
                                        >
                                            <option value="">Select a Goal...</option>
                                            {goals.map(g => (
                                                <option key={g.id} value={g.id}>{g.title}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Priority</Label>
                                        <select
                                            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                            value={newTask.priority}
                                            onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                                        >
                                            <option value="Low">Low</option>
                                            <option value="Medium">Medium</option>
                                            <option value="High">High</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label>Assignee (Optional)</Label>
                                    <select
                                        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                        value={newTask.assigneeId}
                                        onChange={(e) => setNewTask({ ...newTask, assigneeId: e.target.value })}
                                    >
                                        <option value="">Unassigned</option>
                                        {team.map(t => (
                                            <option key={t.id} value={t.id}>{t.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <Button type="submit" className="w-full">Add Task</Button>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}
