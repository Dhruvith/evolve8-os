"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Compass, Search, Users, Building2, MapPin, Globe, ExternalLink,
    X, UserPlus, TrendingUp, Star, Filter, Zap, ArrowUpRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/contexts/AuthContext";
import { db } from "@/lib/firebase";
import {
    collection, query, getDocs, addDoc, where, doc, getDoc, limit
} from "firebase/firestore";

interface NetworkMember {
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
    customer?: string;
    revenueModel?: string;
    healthScore?: number;
}

const STAGE_FILTERS = [
    { id: "all", label: "All Stages" },
    { id: "idea", label: "Idea" },
    { id: "validation", label: "Validation" },
    { id: "mvp", label: "MVP" },
    { id: "revenue", label: "Revenue" },
    { id: "fundraising", label: "Fundraising" },
    { id: "growth", label: "Growth" }
];

const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.05 } }
} as const;
const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 25 } }
};

export default function NetworkPage() {
    const { user } = useAuth();
    const [members, setMembers] = useState<NetworkMember[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [stageFilter, setStageFilter] = useState("all");
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
    const [selectedMember, setSelectedMember] = useState<NetworkMember | null>(null);
    const [sentRequests, setSentRequests] = useState<Set<string>>(new Set());

    useEffect(() => {
        if (!user) return;
        const fetchData = async () => {
            setLoading(true);
            try {
                const q = query(collection(db, "startups"), limit(200));
                const snapshot = await getDocs(q);
                const all: NetworkMember[] = [];
                snapshot.forEach((docSnap) => {
                    if (docSnap.id !== user.uid) {
                        const data = docSnap.data();
                        all.push({
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
                            customer: data.customer,
                            revenueModel: data.revenueModel,
                            healthScore: data.healthScore || 0
                        });
                    }
                });

                const reqQ = query(collection(db, "connectionRequests"), where("fromId", "==", user.uid));
                const reqSnap = await getDocs(reqQ);
                const sent = new Set<string>();
                reqSnap.forEach((d) => sent.add(d.data().toId));
                setSentRequests(sent);

                setMembers(all);
            } catch (err) {
                console.error("Error fetching network:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [user]);

    const filtered = useMemo(() => {
        return members.filter((m) => {
            const matchesSearch = m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                m.types.some(t => t.toLowerCase().includes(searchQuery.toLowerCase())) ||
                m.city.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesStage = stageFilter === "all" || m.stage === stageFilter;
            return matchesSearch && matchesStage;
        });
    }, [members, searchQuery, stageFilter]);

    const sendRequest = async (memberId: string, name: string) => {
        if (!user) return;
        try {
            const myDoc = await getDoc(doc(db, "startups", user.uid));
            const myName = myDoc.exists() ? myDoc.data().name : "Unknown";
            await addDoc(collection(db, "connectionRequests"), {
                fromId: user.uid,
                toId: memberId,
                fromName: myName,
                toName: name,
                status: "pending",
                createdAt: new Date(),
            });
            setSentRequests((prev) => new Set(prev).add(memberId));
            toast.success("Connection request sent!", { description: `Sent to ${name}` });
        } catch {
            toast.error("Failed to send request");
        }
    };

    const getStageColor = (s: string) => {
        const colors: Record<string, string> = {
            idea: "from-slate-500 to-slate-600",
            validation: "from-amber-500 to-orange-600",
            mvp: "from-blue-500 to-cyan-600",
            revenue: "from-green-500 to-emerald-600",
            fundraising: "from-violet-500 to-purple-600",
            growth: "from-rose-500 to-pink-600"
        };
        return colors[s] || "from-slate-500 to-slate-600";
    };

    const getStageLabel = (s: string) => ({
        idea: "Idea", validation: "Validation", mvp: "MVP",
        revenue: "Revenue", fundraising: "Fundraising", growth: "Growth"
    }[s] || s);

    // Stats
    const totalFounders = members.filter(m => m.role === "FOUNDER").length;
    const totalInvestors = members.filter(m => m.role?.toLowerCase().includes("investor")).length;
    const uniqueLocations = new Set(members.map(m => m.country)).size;

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                            <Compass className="w-5 h-5 text-white" />
                        </div>
                        Discover Network
                    </h1>
                    <p className="text-muted-foreground mt-1">Explore startups, founders & opportunities across the ecosystem.</p>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: "Total Startups", value: members.length, icon: Building2, color: "text-violet-400" },
                    { label: "Founders", value: totalFounders, icon: Users, color: "text-emerald-400" },
                    { label: "Investors", value: totalInvestors, icon: TrendingUp, color: "text-amber-400" },
                    { label: "Locations", value: uniqueLocations, icon: Globe, color: "text-cyan-400" },
                ].map((stat) => (
                    <Card key={stat.label} className="bg-white/[0.03] border-white/5">
                        <CardContent className="p-4 flex items-center gap-3">
                            <stat.icon className={cn("w-5 h-5", stat.color)} />
                            <div>
                                <div className="text-xl font-bold">{stat.value}</div>
                                <div className="text-[10px] text-muted-foreground uppercase tracking-wider">{stat.label}</div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Search & Stage Filters */}
            <div className="space-y-4">
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        placeholder="Search startups, industries, locations..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-11 h-12 bg-white/5 border-white/10 rounded-xl text-sm"
                    />
                </div>
                <div className="flex flex-wrap gap-2">
                    {STAGE_FILTERS.map((sf) => (
                        <button
                            key={sf.id}
                            onClick={() => setStageFilter(sf.id)}
                            className={cn(
                                "px-4 py-1.5 rounded-full text-xs font-medium border transition-all duration-200",
                                stageFilter === sf.id
                                    ? "bg-white text-black border-white"
                                    : "border-white/10 text-muted-foreground hover:border-white/30 hover:text-white"
                            )}
                        >
                            {sf.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Network Grid */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <div key={i} className="h-52 rounded-2xl bg-white/5 animate-pulse" />
                    ))}
                </div>
            ) : (
                <motion.div
                    variants={container}
                    initial="hidden"
                    animate="show"
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                    {filtered.map((member) => (
                        <motion.div key={member.id} variants={item}>
                            <Card
                                className="group relative overflow-hidden border-white/5 hover:border-white/20 transition-all duration-500 cursor-pointer"
                                onClick={() => setSelectedMember(member)}
                            >
                                {/* Stage gradient bar */}
                                <div className={cn("absolute top-0 left-0 right-0 h-1 bg-gradient-to-r", getStageColor(member.stage))} />

                                <CardContent className="p-5 pt-6">
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex items-center gap-3">
                                            <div className={cn("w-11 h-11 rounded-xl bg-gradient-to-br flex items-center justify-center text-sm font-bold text-white shrink-0", getStageColor(member.stage))}>
                                                {member.name.charAt(0)}
                                            </div>
                                            <div className="min-w-0">
                                                <h3 className="font-semibold truncate">{member.name}</h3>
                                                <p className="text-xs text-muted-foreground flex items-center gap-1">
                                                    <MapPin className="w-3 h-3" />
                                                    {member.city || "Remote"}{member.country ? `, ${member.country}` : ""}
                                                </p>
                                            </div>
                                        </div>
                                        {member.healthScore && member.healthScore > 50 && (
                                            <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-400">
                                                <Zap className="w-3 h-3" />
                                                {member.healthScore}
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex flex-wrap gap-1.5 mb-3">
                                        <span className={cn("px-2 py-0.5 rounded text-[10px] font-semibold text-white bg-gradient-to-r", getStageColor(member.stage))}>
                                            {getStageLabel(member.stage)}
                                        </span>
                                        {member.types.slice(0, 2).map(t => (
                                            <span key={t} className="px-2 py-0.5 rounded text-[10px] bg-white/5 text-muted-foreground border border-white/5">
                                                {t}
                                            </span>
                                        ))}
                                    </div>

                                    {member.solution && (
                                        <p className="text-xs text-muted-foreground line-clamp-2 mb-4">{member.solution}</p>
                                    )}

                                    <div className="flex items-center gap-2 pt-3 border-t border-white/5">
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            className="flex-1 text-xs h-8"
                                            onClick={(e) => { e.stopPropagation(); setSelectedMember(member); }}
                                        >
                                            View Profile <ArrowUpRight className="w-3 h-3 ml-1" />
                                        </Button>
                                        {sentRequests.has(member.id) ? (
                                            <Button size="sm" variant="outline" className="text-xs h-8 opacity-60" disabled>
                                                Sent
                                            </Button>
                                        ) : (
                                            <Button
                                                size="sm"
                                                className="text-xs h-8 bg-white/10 hover:bg-white/20"
                                                onClick={(e) => { e.stopPropagation(); sendRequest(member.id, member.name); }}
                                            >
                                                <UserPlus className="w-3 h-3 mr-1" /> Connect
                                            </Button>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </motion.div>
            )}

            {!loading && filtered.length === 0 && (
                <div className="text-center py-20 text-muted-foreground">
                    <Compass className="w-16 h-16 mx-auto mb-4 opacity-20" />
                    <p className="text-lg font-medium">No startups found</p>
                    <p className="text-sm">Try adjusting your search or filters.</p>
                </div>
            )}

            {/* Detail Modal */}
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
                            className="w-full max-w-lg"
                        >
                            <Card className="bg-zinc-950 border-white/10">
                                <div className={cn("h-2 bg-gradient-to-r rounded-t-xl", getStageColor(selectedMember.stage))} />
                                <CardHeader className="flex flex-row items-start justify-between">
                                    <div className="flex items-start gap-4">
                                        <div className={cn("w-14 h-14 rounded-2xl bg-gradient-to-br flex items-center justify-center text-xl font-bold text-white", getStageColor(selectedMember.stage))}>
                                            {selectedMember.name.charAt(0)}
                                        </div>
                                        <div>
                                            <CardTitle className="text-xl">{selectedMember.name}</CardTitle>
                                            <CardDescription className="flex items-center gap-1.5 mt-1">
                                                <MapPin className="w-3 h-3" />
                                                {selectedMember.city}, {selectedMember.country}
                                            </CardDescription>
                                            {selectedMember.healthScore ? (
                                                <div className="flex items-center gap-1 mt-1 text-xs text-emerald-400 font-medium">
                                                    <Zap className="w-3 h-3" /> Health Score: {selectedMember.healthScore}
                                                </div>
                                            ) : null}
                                        </div>
                                    </div>
                                    <Button variant="ghost" size="icon" onClick={() => setSelectedMember(null)}>
                                        <X className="h-4 w-4" />
                                    </Button>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex flex-wrap gap-2">
                                        <span className={cn("px-3 py-1 rounded-full text-xs font-bold text-white bg-gradient-to-r", getStageColor(selectedMember.stage))}>
                                            {getStageLabel(selectedMember.stage)} Stage
                                        </span>
                                        {selectedMember.types.map(t => (
                                            <span key={t} className="px-3 py-1 rounded-full text-xs bg-white/5 border border-white/10">{t}</span>
                                        ))}
                                    </div>

                                    {selectedMember.problem && (
                                        <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                                            <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Problem</h4>
                                            <p className="text-sm">{selectedMember.problem}</p>
                                        </div>
                                    )}
                                    {selectedMember.solution && (
                                        <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                                            <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Solution</h4>
                                            <p className="text-sm">{selectedMember.solution}</p>
                                        </div>
                                    )}
                                    {selectedMember.customer && (
                                        <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                                            <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Target Customer</h4>
                                            <p className="text-sm">{selectedMember.customer}</p>
                                        </div>
                                    )}
                                    {selectedMember.revenueModel && (
                                        <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                                            <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Revenue Model</h4>
                                            <p className="text-sm">{selectedMember.revenueModel}</p>
                                        </div>
                                    )}

                                    {selectedMember.website && (
                                        <a
                                            href={selectedMember.website}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-2 text-sm text-cyan-400 hover:text-cyan-300 transition-colors"
                                        >
                                            <Globe className="w-4 h-4" /> {selectedMember.website}
                                            <ExternalLink className="w-3 h-3" />
                                        </a>
                                    )}

                                    <div className="pt-3 border-t border-white/10">
                                        {sentRequests.has(selectedMember.id) ? (
                                            <Button className="w-full" disabled variant="outline">Request Already Sent</Button>
                                        ) : (
                                            <Button
                                                className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500"
                                                onClick={() => { sendRequest(selectedMember.id, selectedMember.name); setSelectedMember(null); }}
                                            >
                                                <UserPlus className="w-4 h-4 mr-2" /> Connect with {selectedMember.name}
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
