"use client";

import { Mail, Shield, UserPlus, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";

const TEAM = [
    { name: "Alexandra Chen", role: "CEO & Founder", email: "alex@startup.io", access: "Admin", status: "Active", avatar: "AC" },
    { name: "Marcus Johnson", role: "CTO", email: "marcus@startup.io", access: "Admin", status: "Active", avatar: "MJ" },
    { name: "Sarah Williams", role: "Product Designer", email: "sarah@startup.io", access: "Editor", status: "Active", avatar: "SW" },
    { name: "David Kim", role: "Advisor", email: "david@vc.com", access: "View Only", status: "Pending", avatar: "DK" },
];

export default function TeamPage() {
    const handleInvite = () => {
        toast.success("Invitation Sent", {
            description: "An email has been sent to the new team member."
        });
    };

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Team Management</h1>
                    <p className="text-muted-foreground">Manage roles, permissions, and access.</p>
                </div>
                <Button onClick={handleInvite} variant="gradient">
                    <UserPlus className="w-4 h-4 mr-2" /> Invite Member
                </Button>
            </div>

            <div className="grid gap-6">
                {TEAM.map((member, i) => (
                    <Card key={i} className="flex flex-col md:flex-row items-center p-6 gap-6 hover:bg-white/5 transition-colors">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center text-lg font-bold text-primary border border-white/10">
                            {member.avatar}
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
                                <span className="text-sm border border-white/10 px-2 py-0.5 rounded bg-white/5">{member.access}</span>
                            </div>

                            <div className="flex items-center gap-2">
                                <span className={`w-2 h-2 rounded-full ${member.status === 'Active' ? 'bg-green-500' : 'bg-yellow-500'}`} />
                                <span className="text-sm font-medium">{member.status}</span>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
}
