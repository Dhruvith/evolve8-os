"use client";

import { useState } from "react";
import { Mail, Shield, UserPlus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { useDashboardData, TeamMember } from "@/lib/hooks/use-dashboard-data";
import { useAuth } from "@/lib/contexts/AuthContext";
import { collection, addDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function TeamPage() {
    const { team, loading } = useDashboardData();
    const { user } = useAuth();
    const [isModalOpen, setIsModalOpen] = useState(false);

    // New Member Form State
    const [newMember, setNewMember] = useState({
        name: "",
        email: "",
        role: "",
        access: "View Only"
    });

    const handleInvite = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        try {
            await addDoc(collection(db, `startups/${user.uid}/team`), {
                ...newMember,
                status: "Pending", // Until they accept, or just 'Active' for roster
                createdAt: new Date(),
                avatar: newMember.name.substring(0, 2).toUpperCase()
            });

            toast.success("Team Member Added", {
                description: `${newMember.name} has been added to the roster.`
            });
            setIsModalOpen(false);
            setNewMember({ name: "", email: "", role: "", access: "View Only" });
        } catch (error: any) {
            console.error("Error adding team member:", error);
            toast.error("Failed to add member", {
                description: error.message || "Please check your permissions."
            });
        }
    };

    return (
        <div className="space-y-8 animate-fade-in relative">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Team Management</h1>
                    <p className="text-muted-foreground">Manage roles, permissions, and access.</p>
                </div>
                <Button onClick={() => setIsModalOpen(true)} variant="gradient">
                    <UserPlus className="w-4 h-4 mr-2" /> Add Member
                </Button>
            </div>

            <div className="grid gap-6">
                {team.map((member: any) => (
                    <Card key={member.id} className="flex flex-col md:flex-row items-center p-6 gap-6 hover:bg-white/5 transition-colors">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center text-lg font-bold text-primary border border-white/10">
                            {member.avatar || member.name.charAt(0)}
                        </div>

                        <div className="flex-1 text-center md:text-left space-y-1">
                            <h3 className="font-semibold text-lg">{member.name}</h3>
                            <div className="flex items-center justify-center md:justify-start gap-2 text-muted-foreground text-sm">
                                <Mail className="w-3 h-3" /> {member.email}
                            </div>
                        </div>

                        <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8 w-full md:w-auto">
                            <div className="bg-white/5 px-4 py-2 rounded-lg border border-white/5 min-w-[140px]">
                                <div className="text-xs text-muted-foreground mb-1">Role</div>
                                <div className="font-medium text-sm">{member.role}</div>
                            </div>

                            <div className="flex items-center gap-2">
                                <Shield className="w-4 h-4 text-muted-foreground" />
                                <span className="text-sm border border-white/10 px-2 py-0.5 rounded bg-white/5">{member.access || "Member"}</span>
                            </div>

                            <div className="flex items-center gap-2">
                                <span className={`w-2 h-2 rounded-full ${member.status === 'Active' ? 'bg-green-500' : 'bg-yellow-500'}`} />
                                <span className="text-sm font-medium">{member.status || "Active"}</span>
                            </div>
                        </div>
                    </Card>
                ))}
                {team.length === 0 && (
                    <div className="text-center p-12 bg-white/5 rounded-lg border border-dashed border-white/10">
                        <p className="text-muted-foreground mb-4">No team members yet.</p>
                        <Button onClick={() => setIsModalOpen(true)} variant="outline">Add Your First Hire</Button>
                    </div>
                )}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <Card className="w-full max-w-md bg-black border-white/10">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>Add Team Member</CardTitle>
                            <Button variant="ghost" size="icon" onClick={() => setIsModalOpen(false)}>
                                <X className="h-4 w-4" />
                            </Button>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleInvite} className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Full Name</Label>
                                    <Input
                                        placeholder="Jane Doe"
                                        value={newMember.name}
                                        onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Email</Label>
                                    <Input
                                        type="email"
                                        placeholder="jane@startup.io"
                                        value={newMember.email}
                                        onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Role</Label>
                                    <Input
                                        placeholder="e.g. CTO, Designer"
                                        value={newMember.role}
                                        onChange={(e) => setNewMember({ ...newMember, role: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>System Access</Label>
                                    <select
                                        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                        value={newMember.access}
                                        onChange={(e) => setNewMember({ ...newMember, access: e.target.value })}
                                    >
                                        <option value="Admin">Admin (Full Access)</option>
                                        <option value="Editor">Core Team (Tasks & Goals)</option>
                                        <option value="View Only">Advisor (Read Only)</option>
                                    </select>
                                </div>
                                <Button type="submit" className="w-full">Add Member</Button>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}
