"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Users, Search, Sparkles, UserPlus, Building2, TrendingUp,
    Globe, Filter, X, ChevronRight, Handshake, Star, MapPin
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/contexts/AuthContext";
import { db } from "@/lib/firebase";
import {
    collection, query, getDocs, addDoc, where, doc, getDoc, orderBy, limit
} from "firebase/firestore";

interface CommunityMember {
    id: string;
    name: string;
    email: string;
    role: string;
    types: string[];
    stage: string;
    city: string;
    country: string;
    problem?: string;
    solution?: string;
    website?: string;
    matchScore?: number;
}

const ROLE_FILTERS = ["All", "Founder", "Investor", "Mentor", "Advisor"];
const INDUSTRY_FILTERS = [
    "All", "Fintech", "Edtech", "Healthtech", "SaaS", "AI",
    "E-commerce", "Marketplace", "Web3", "AgriTech", "ClimateTech"
];

const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.06 } }
};
const item = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    show: { opacity: 1, y: 0, scale: 1 }
};

export default function CommunityPage() {
    const { user } = useAuth();
    const [members, setMembers] = useState<CommunityMember[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [roleFilter, setRoleFilter] = useState("All");
    const [industryFilter, setIndustryFilter] = useState("All");
    const [selectedMember, setSelectedMember] = useState<CommunityMember | null>(null);
    const [sentRequests, setSentRequests] = useState<Set<string>>(new Set());
    const [myStartup, setMyStartup] = useState<any>(null);

    useEffect(() => {
        if (!user) return;
        const fetchData = async () => {
            setLoading(true);
            try {
                // Get my startup data
                const myDoc = await getDoc(doc(db, "startups", user.uid));
                if (myDoc.exists()) setMyStartup(myDoc.data());

                // Get all startups (community members)
                const q = query(collection(db, "startups"), limit(200));
                const snapshot = await getDocs(q);
                const allMembers: CommunityMember[] = [];
                snapshot.forEach((docSnap) => {
                    if (docSnap.id !== user.uid) {
                        const data = docSnap.data();
                        allMembers.push({
                            id: docSnap.id,
                            name: data.name || "Unnamed Startup",
                            email: data.email || "",
                            role: data.role || "FOUNDER",
                            types: data.types || [],
                            stage: data.stage || "idea",
                            city: data.city || "",
                            country: data.country || "",
                            problem: data.problem,
                            solution: data.solution,
                            website: data.website,
                        });
                    }
                });

                // Get sent requests
                const reqQuery = query(
                    collection(db, "connectionRequests"),
                    where("fromId", "==", user.uid)
                );
                const reqSnap = await getDocs(reqQuery);
                const sent = new Set<string>();
                reqSnap.forEach((d) => sent.add(d.data().toId));
                setSentRequests(sent);

                setMembers(allMembers);
            } catch (err) {
                console.error("Error fetching community:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [user]);

    // Calculate match scores
    const membersWithScores = useMemo(() => {
        if (!myStartup) return members;
        return members.map((m) => {
            let score = 0;
            // Industry match
            const myTypes = myStartup.types || [];
            const commonTypes = m.types.filter((t: string) => myTypes.includes(t));
            score += commonTypes.length * 20;
            // Stage proximity
            const stages = ["idea", "validation", "mvp", "revenue", "fundraising", "growth"];
            const myIdx = stages.indexOf(myStartup.stage);
            const theirIdx = stages.indexOf(m.stage);
            if (Math.abs(myIdx - theirIdx) <= 1) score += 25;
            // Location match
            if (m.country === myStartup.country) score += 10;
            if (m.city === myStartup.city) score += 15;
            // Complementary roles
            if (myStartup.role === "FOUNDER" && m.role === "INVESTOR") score += 30;
            if (myStartup.role === "INVESTOR" && m.role === "FOUNDER") score += 30;

            return { ...m, matchScore: Math.min(score, 100) };
        }).sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
    }, [members, myStartup]);

    const filtered = useMemo(() => {
        return membersWithScores.filter((m) => {
            const matchesSearch = m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                m.types.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
            const matchesRole = roleFilter === "All" || m.role.toLowerCase().includes(roleFilter.toLowerCase());
            const matchesIndustry = industryFilter === "All" || m.types.includes(industryFilter);
            return matchesSearch && matchesRole && matchesIndustry;
        });
    }, [membersWithScores, searchQuery, roleFilter, industryFilter]);

    const sendRequest = async (memberId: string, memberName: string) => {
        if (!user) return;
        try {
            await addDoc(collection(db, "connectionRequests"), {
                fromId: user.uid,
                toId: memberId,
                fromName: myStartup?.name || "Unknown",
                toName: memberName,
                status: "pending",
                createdAt: new Date(),
            });
            setSentRequests((prev) => new Set(prev).add(memberId));
            toast.success("Request Sent!", {
                description: `Connection request sent to ${memberName}`,
            });
        } catch (err) {
            toast.error("Failed to send request");
        }
    };

    const getStageLabel = (s: string) => ({
        idea: "Idea", validation: "Validation", mvp: "MVP",
        revenue: "Revenue", fundraising: "Fundraising", growth: "Growth"
    }[s] || s);

    const getRoleBadge = (role: string) => {
        const r = role.toLowerCase();
        if (r.includes("investor")) return { label: "Investor", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" };
        if (r.includes("mentor")) return { label: "Mentor", color: "text-amber-400 bg-amber-500/10 border-amber-500/20" };
        if (r.includes("advisor")) return { label: "Advisor", color: "text-blue-400 bg-blue-500/10 border-blue-500/20" };
        return { label: "Founder", color: "text-violet-400 bg-violet-500/10 border-violet-500/20" };
    };

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center">
                            <Handshake className="w-5 h-5 text-white" />
                        </div>
                        Community
                    </h1>
                    <p className="text-muted-foreground mt-1">Match with founders, investors & mentors in the ecosystem.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 flex items-center gap-2">
                        <Users className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm font-medium">{filtered.length} Members</span>
                    </div>
                </div>
            </div>

            {/* Search & Filters */}
            <div className="space-y-4">
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        placeholder="Search by name, industry, or keyword..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-11 h-12 bg-white/5 border-white/10 rounded-xl text-sm"
                    />
                </div>
                <div className="flex flex-wrap gap-2">
                    {ROLE_FILTERS.map((r) => (
                        <button
                            key={r}
                            onClick={() => setRoleFilter(r)}
                            className={cn(
                                "px-4 py-1.5 rounded-full text-xs font-medium border transition-all duration-200",
                                roleFilter === r
                                    ? "bg-white text-black border-white"
                                    : "border-white/10 text-muted-foreground hover:border-white/30 hover:text-white"
                            )}
                        >
                            {r}
                        </button>
                    ))}
                    <div className="w-px h-6 bg-white/10 self-center mx-1" />
                    {INDUSTRY_FILTERS.slice(0, 6).map((ind) => (
                        <button
                            key={ind}
                            onClick={() => setIndustryFilter(ind)}
                            className={cn(
                                "px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-200",
                                industryFilter === ind
                                    ? "bg-violet-500/20 text-violet-300 border-violet-500/30"
                                    : "border-white/10 text-muted-foreground hover:border-white/30 hover:text-white"
                            )}
                        >
                            {ind}
                        </button>
                    ))}
                </div>
            </div>

            {/* Members Grid */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className="h-64 rounded-2xl bg-white/5 animate-pulse" />
                    ))}
                </div>
            ) : (
                <motion.div
                    variants={container}
                    initial="hidden"
                    animate="show"
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                    {filtered.map((member) => {
                        const badge = getRoleBadge(member.role);
                        return (
                            <motion.div key={member.id} variants={item}>
                                <Card
                                    className="group relative overflow-hidden border-white/5 hover:border-white/20 transition-all duration-500 cursor-pointer bg-gradient-to-b from-white/[0.03] to-transparent"
                                    onClick={() => setSelectedMember(member)}
                                >
                                    {/* Match score indicator */}
                                    {member.matchScore && member.matchScore > 40 && (
                                        <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/20">
                                            <Sparkles className="w-3 h-3 text-amber-400" />
                                            <span className="text-[10px] font-bold text-amber-300">{member.matchScore}% Match</span>
                                        </div>
                                    )}

                                    <CardContent className="p-6">
                                        <div className="flex items-start gap-4 mb-4">
                                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 flex items-center justify-center text-lg font-bold text-violet-300 border border-white/10 shrink-0 group-hover:scale-110 transition-transform duration-300">
                                                {member.name.charAt(0)}
                                            </div>
                                            <div className="min-w-0">
                                                <h3 className="font-semibold text-base truncate">{member.name}</h3>
                                                <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
                                                    <MapPin className="w-3 h-3 shrink-0" />
                                                    <span className="truncate">{member.city}{member.country ? `, ${member.country}` : ""}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap gap-1.5 mb-4">
                                            <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-semibold border", badge.color)}>
                                                {badge.label}
                                            </span>
                                            <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-white/5 text-muted-foreground border border-white/5">
                                                {getStageLabel(member.stage)}
                                            </span>
                                            {member.types.slice(0, 2).map((t) => (
                                                <span key={t} className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-white/5 text-muted-foreground border border-white/5">
                                                    {t}
                                                </span>
                                            ))}
                                        </div>

                                        {member.problem && (
                                            <p className="text-xs text-muted-foreground line-clamp-2 mb-4 leading-relaxed">
                                                {member.problem}
                                            </p>
                                        )}

                                        <div className="flex items-center gap-2 pt-3 border-t border-white/5">
                                            {sentRequests.has(member.id) ? (
                                                <Button size="sm" variant="outline" className="w-full text-xs opacity-60" disabled>
                                                    Request Sent
                                                </Button>
                                            ) : (
                                                <Button
                                                    size="sm"
                                                    className="w-full text-xs bg-white/10 hover:bg-white/20 border border-white/10"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        sendRequest(member.id, member.name);
                                                    }}
                                                >
                                                    <UserPlus className="w-3 h-3 mr-1.5" /> Connect
                                                </Button>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        );
                    })}
                </motion.div>
            )}

            {!loading && filtered.length === 0 && (
                <div className="text-center py-20 text-muted-foreground">
                    <Users className="w-16 h-16 mx-auto mb-4 opacity-20" />
                    <p className="text-lg font-medium">No members found</p>
                    <p className="text-sm">Try adjusting your filters or invite more people to the community.</p>
                </div>
            )}

            {/* Member Detail Modal */}
            <AnimatePresence>
                {selectedMember && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
                        onClick={() => setSelectedMember(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <Card className="w-full max-w-lg bg-zinc-950 border-white/10">
                                <CardHeader className="flex flex-row items-start justify-between">
                                    <div className="flex items-start gap-4">
                                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-xl font-bold text-white">
                                            {selectedMember.name.charAt(0)}
                                        </div>
                                        <div>
                                            <CardTitle className="text-xl">{selectedMember.name}</CardTitle>
                                            <CardDescription className="flex items-center gap-1.5 mt-1">
                                                <MapPin className="w-3 h-3" />
                                                {selectedMember.city}, {selectedMember.country}
                                            </CardDescription>
                                        </div>
                                    </div>
                                    <Button variant="ghost" size="icon" onClick={() => setSelectedMember(null)}>
                                        <X className="h-4 w-4" />
                                    </Button>
                                </CardHeader>
                                <CardContent className="space-y-5">
                                    <div className="flex flex-wrap gap-2">
                                        {(() => {
                                            const b = getRoleBadge(selectedMember.role);
                                            return <span className={cn("px-3 py-1 rounded-full text-xs font-semibold border", b.color)}>{b.label}</span>;
                                        })()}
                                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-white/5 border border-white/10">
                                            {getStageLabel(selectedMember.stage)} Stage
                                        </span>
                                        {selectedMember.types.map((t) => (
                                            <span key={t} className="px-3 py-1 rounded-full text-xs font-medium bg-white/5 border border-white/10">
                                                {t}
                                            </span>
                                        ))}
                                    </div>

                                    {selectedMember.problem && (
                                        <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                                            <h4 className="text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">Problem</h4>
                                            <p className="text-sm leading-relaxed">{selectedMember.problem}</p>
                                        </div>
                                    )}
                                    {selectedMember.solution && (
                                        <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                                            <h4 className="text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">Solution</h4>
                                            <p className="text-sm leading-relaxed">{selectedMember.solution}</p>
                                        </div>
                                    )}

                                    {selectedMember.website && (
                                        <a
                                            href={selectedMember.website}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-2 text-sm text-violet-400 hover:text-violet-300 transition-colors"
                                        >
                                            <Globe className="w-4 h-4" /> {selectedMember.website}
                                        </a>
                                    )}

                                    <div className="pt-3 border-t border-white/10">
                                        {sentRequests.has(selectedMember.id) ? (
                                            <Button className="w-full" disabled variant="outline">
                                                Request Already Sent
                                            </Button>
                                        ) : (
                                            <Button
                                                className="w-full bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500"
                                                onClick={() => {
                                                    sendRequest(selectedMember.id, selectedMember.name);
                                                    setSelectedMember(null);
                                                }}
                                            >
                                                <UserPlus className="w-4 h-4 mr-2" /> Send Connection Request
                                            </Button>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
