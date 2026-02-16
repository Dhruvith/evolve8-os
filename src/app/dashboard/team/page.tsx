"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Shield, UserPlus, X, Search, MoreHorizontal, Briefcase, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useDashboardData, TeamMember } from "@/lib/hooks/use-dashboard-data";
import { useAuth } from "@/lib/contexts/AuthContext";
import { collection, addDoc, deleteDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const POSITIONS = [
    "CEO / Co-Founder",
    "CTO",
    "COO",
    "CFO",
    "CMO",
    "VP of Engineering",
    "VP of Product",
    "Lead Designer",
    "Full Stack Developer",
    "Frontend Developer",
    "Backend Developer",
    "Data Scientist",
    "DevOps Engineer",
    "Product Manager",
    "Growth Hacker",
    "Marketing Lead",
    "Sales Lead",
    "Business Analyst",
    "UI/UX Designer",
    "QA Engineer",
    "Intern",
    "Advisor",
    "Mentor",
    "Other"
];

const POSITION_COLORS: Record<string, string> = {
    "CEO / Co-Founder": "from-violet-500 to-purple-600",
    "CTO": "from-blue-500 to-cyan-600",
    "COO": "from-emerald-500 to-green-600",
    "CFO": "from-amber-500 to-yellow-600",
    "CMO": "from-rose-500 to-pink-600",
    "Advisor": "from-zinc-400 to-zinc-500",
    "Mentor": "from-teal-500 to-cyan-600"
};

const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.06 } }
};
const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
};

export default function TeamPage() {
    const { team, loading } = useDashboardData();
    const { user } = useAuth();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    const [newMember, setNewMember] = useState({
        name: "",
        email: "",
        role: "",
        position: "",
        access: "View Only"
    });

    const handleInvite = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        try {
            await addDoc(collection(db, `startups/${user.uid}/team`), {
                ...newMember,
                status: "Active",
                createdAt: new Date(),
                avatar: newMember.name.substring(0, 2).toUpperCase()
            });

            toast.success("Team Member Added", {
                description: `${newMember.name} has been added as ${newMember.position || newMember.role}.`
            });
            setIsModalOpen(false);
            setNewMember({ name: "", email: "", role: "", position: "", access: "View Only" });
        } catch (error: any) {
            console.error("Error adding team member:", error);
            toast.error("Failed to add member", {
                description: error.message || "Please check your permissions."
            });
        }
    };

    const handleDelete = async (memberId: string, memberName: string) => {
        if (!user) return;
        try {
            await deleteDoc(doc(db, `startups/${user.uid}/team`, memberId));
            toast.success("Member Removed", { description: `${memberName} has been removed.` });
        } catch {
            toast.error("Failed to remove member");
        }
    };

    const filteredTeam = team.filter(m =>
        m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const getAvatarGradient = (name: string) => {
        const gradients = [
            "from-violet-500 to-purple-600",
            "from-blue-500 to-cyan-600",
            "from-emerald-500 to-green-600",
            "from-amber-500 to-orange-600",
            "from-rose-500 to-pink-600",
            "from-teal-500 to-cyan-600",
            "from-fuchsia-500 to-violet-600"
        ];
        const idx = name.split("").reduce((a, c) => a + c.charCodeAt(0), 0) % gradients.length;
        return gradients[idx];
    };

    return (
        <div className="space-y-8 animate-fade-in relative">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                            <Briefcase className="w-5 h-5 text-white" />
                        </div>
                        Team Management
                    </h1>
                    <p className="text-muted-foreground mt-1">Manage your startup team, roles, positions & permissions.</p>
                </div>
                <Button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500"
                >
                    <UserPlus className="w-4 h-4 mr-2" /> Add Member
                </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="bg-white/[0.03] border-white/5">
                    <CardContent className="p-4">
                        <div className="text-xl font-bold">{team.length}</div>
                        <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Total Members</div>
                    </CardContent>
                </Card>
                <Card className="bg-white/[0.03] border-white/5">
                    <CardContent className="p-4">
                        <div className="text-xl font-bold">{team.filter((m: any) => m.status === "Active").length}</div>
                        <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Active</div>
                    </CardContent>
                </Card>
                <Card className="bg-white/[0.03] border-white/5">
                    <CardContent className="p-4">
                        <div className="text-xl font-bold">{team.filter((m: any) => m.access === "Admin").length}</div>
                        <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Admins</div>
                    </CardContent>
                </Card>
                <Card className="bg-white/[0.03] border-white/5">
                    <CardContent className="p-4">
                        <div className="text-xl font-bold">{team.filter((m: any) => m.status === "Pending").length}</div>
                        <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Pending</div>
                    </CardContent>
                </Card>
            </div>

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                    placeholder="Search by name, role, or email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-11 h-12 bg-white/5 border-white/10 rounded-xl text-sm"
                />
            </div>

            {/* Team Grid */}
            <motion.div variants={container} initial="hidden" animate="show" className="grid gap-4">
                {filteredTeam.map((member: any) => (
                    <motion.div key={member.id} variants={item}>
                        <Card className="group flex flex-col md:flex-row items-center p-5 gap-5 hover:bg-white/[0.03] transition-all duration-300 border-white/5 hover:border-white/15">
                            <div className={cn(
                                "w-12 h-12 rounded-2xl bg-gradient-to-br flex items-center justify-center text-lg font-bold text-white border border-white/10 group-hover:scale-110 transition-transform duration-300 shrink-0",
                                getAvatarGradient(member.name)
                            )}>
                                {member.avatar || member.name.charAt(0)}
                            </div>

                            <div className="flex-1 text-center md:text-left space-y-1 min-w-0">
                                <h3 className="font-semibold text-lg">{member.name}</h3>
                                <div className="flex items-center justify-center md:justify-start gap-2 text-muted-foreground text-sm">
                                    <Mail className="w-3 h-3 shrink-0" />
                                    <span className="truncate">{member.email}</span>
                                </div>
                            </div>

                            <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6 w-full md:w-auto">
                                {/* Position */}
                                {member.position && (
                                    <div className="bg-white/5 px-4 py-2 rounded-xl border border-white/5 min-w-[140px]">
                                        <div className="text-[10px] text-muted-foreground mb-0.5 uppercase tracking-wider">Position</div>
                                        <div className="font-medium text-sm">{member.position}</div>
                                    </div>
                                )}

                                {/* Role */}
                                <div className="bg-white/5 px-4 py-2 rounded-xl border border-white/5 min-w-[120px]">
                                    <div className="text-[10px] text-muted-foreground mb-0.5 uppercase tracking-wider">Role</div>
                                    <div className="font-medium text-sm">{member.role}</div>
                                </div>

                                {/* Access */}
                                <div className="flex items-center gap-2">
                                    <Shield className="w-4 h-4 text-muted-foreground" />
                                    <span className="text-sm border border-white/10 px-2.5 py-1 rounded-lg bg-white/5 text-xs font-medium">
                                        {member.access || "Member"}
                                    </span>
                                </div>

                                {/* Status */}
                                <div className="flex items-center gap-2">
                                    <span className={`w-2 h-2 rounded-full ${member.status === 'Active' ? 'bg-green-500 shadow-lg shadow-green-500/30' : 'bg-yellow-500 shadow-lg shadow-yellow-500/30'}`} />
                                    <span className="text-sm font-medium">{member.status || "Active"}</span>
                                </div>

                                {/* Delete */}
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="opacity-0 group-hover:opacity-100 transition-opacity text-red-400 hover:text-red-300 hover:bg-red-500/10"
                                    onClick={() => handleDelete(member.id, member.name)}
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                        </Card>
                    </motion.div>
                ))}
                {team.length === 0 && (
                    <div className="text-center p-16 bg-white/[0.02] rounded-2xl border border-dashed border-white/10">
                        <Briefcase className="w-16 h-16 mx-auto mb-4 opacity-20" />
                        <p className="text-muted-foreground mb-4 text-lg">No team members yet.</p>
                        <Button onClick={() => setIsModalOpen(true)} variant="outline" size="lg">
                            Add Your First Team Member
                        </Button>
                    </div>
                )}
            </motion.div>

            {/* Add Member Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
                        onClick={() => setIsModalOpen(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="w-full max-w-md"
                        >
                            <Card className="bg-zinc-950 border-white/10">
                                <CardHeader className="flex flex-row items-center justify-between">
                                    <CardTitle>Add Team Member</CardTitle>
                                    <Button variant="ghost" size="icon" onClick={() => setIsModalOpen(false)}>
                                        <X className="h-4 w-4" />
                                    </Button>
                                </CardHeader>
                                <CardContent>
                                    <form onSubmit={handleInvite} className="space-y-4">
                                        <div className="space-y-2">
                                            <Label>Full Name *</Label>
                                            <Input
                                                placeholder="Jane Doe"
                                                value={newMember.name}
                                                onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Email *</Label>
                                            <Input
                                                type="email"
                                                placeholder="jane@startup.io"
                                                value={newMember.email}
                                                onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Position *</Label>
                                            <select
                                                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                                value={newMember.position}
                                                onChange={(e) => setNewMember({ ...newMember, position: e.target.value })}
                                                required
                                            >
                                                <option value="">Select Position...</option>
                                                {POSITIONS.map(p => (
                                                    <option key={p} value={p}>{p}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Role / Department</Label>
                                            <Input
                                                placeholder="e.g. Engineering, Design, Marketing"
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
                                        <Button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-indigo-600">
                                            Add Member
                                        </Button>
                                    </form>
                                </CardContent>
                            </Card>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
