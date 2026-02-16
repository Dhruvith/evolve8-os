"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    UserSearch, Search, MapPin, Globe, ExternalLink, X, UserPlus,
    Building2, Mail, Briefcase, Award, ChevronRight, Eye
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

interface Founder {
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
    customer?: string;
    revenueModel?: string;
    website?: string;
    healthScore?: number;
    phone?: string;
    assumptions?: string;
    pitchDeck?: string;
}

const STAGE_LABELS: Record<string, string> = {
    idea: "🧠 Idea", validation: "🔍 Validation", mvp: "🚀 MVP",
    revenue: "💰 Revenue", fundraising: "📈 Fundraising", growth: "🌍 Growth"
};

const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.06 } }
};
const item = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    show: { opacity: 1, y: 0, scale: 1 }
};

export default function FindFounderPage() {
    const { user } = useAuth();
    const [founders, setFounders] = useState<Founder[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedFounder, setSelectedFounder] = useState<Founder | null>(null);
    const [viewMode, setViewMode] = useState<"founder" | "startup">("founder");
    const [sentRequests, setSentRequests] = useState<Set<string>>(new Set());

    useEffect(() => {
        if (!user) return;
        const fetchData = async () => {
            setLoading(true);
            try {
                const q = query(collection(db, "startups"), limit(200));
                const snapshot = await getDocs(q);
                const all: Founder[] = [];
                snapshot.forEach((docSnap) => {
                    if (docSnap.id !== user.uid) {
                        const data = docSnap.data();
                        all.push({
                            id: docSnap.id,
                            name: data.name || "Unnamed",
                            email: data.email || "",
                            role: data.role || "FOUNDER",
                            types: data.types || [],
                            stage: data.stage || "idea",
                            city: data.city || "",
                            country: data.country || "",
                            problem: data.problem,
                            solution: data.solution,
                            customer: data.customer,
                            revenueModel: data.revenueModel,
                            website: data.website,
                            healthScore: data.healthScore || 0,
                            phone: data.phone,
                            assumptions: data.assumptions,
                            pitchDeck: data.pitchDeck
                        });
                    }
                });
                setFounders(all);

                const reqQ = query(collection(db, "connectionRequests"), where("fromId", "==", user.uid));
                const reqSnap = await getDocs(reqQ);
                const sent = new Set<string>();
                reqSnap.forEach((d) => sent.add(d.data().toId));
                setSentRequests(sent);
            } catch (err) {
                console.error("Error fetching founders:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [user]);

    const filtered = useMemo(() => {
        return founders.filter((f) => {
            return f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                f.types.some(t => t.toLowerCase().includes(searchQuery.toLowerCase())) ||
                f.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
                f.country.toLowerCase().includes(searchQuery.toLowerCase());
        });
    }, [founders, searchQuery]);

    const sendRequest = async (founderId: string, founderName: string) => {
        if (!user) return;
        try {
            const myDoc = await getDoc(doc(db, "startups", user.uid));
            const myName = myDoc.exists() ? myDoc.data().name : "Unknown";
            await addDoc(collection(db, "connectionRequests"), {
                fromId: user.uid,
                toId: founderId,
                fromName: myName,
                toName: founderName,
                status: "pending",
                createdAt: new Date()
            });
            setSentRequests((prev) => new Set(prev).add(founderId));
            toast.success("Request Sent!", { description: `Sent to ${founderName}` });
        } catch {
            toast.error("Failed to send request");
        }
    };

    const getStageColor = (s: string) => {
        const c: Record<string, string> = {
            idea: "border-slate-500/30 bg-slate-500/10",
            validation: "border-amber-500/30 bg-amber-500/10",
            mvp: "border-blue-500/30 bg-blue-500/10",
            revenue: "border-green-500/30 bg-green-500/10",
            fundraising: "border-violet-500/30 bg-violet-500/10",
            growth: "border-rose-500/30 bg-rose-500/10"
        };
        return c[s] || "";
    };

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                            <UserSearch className="w-5 h-5 text-white" />
                        </div>
                        Find Founders
                    </h1>
                    <p className="text-muted-foreground mt-1">Discover founder profiles, explore their startups, and connect.</p>
                </div>
                <div className="text-sm text-muted-foreground">
                    {filtered.length} founders in directory
                </div>
            </div>

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                    placeholder="Search founders by name, industry, city or country..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-11 h-12 bg-white/5 border-white/10 rounded-xl text-sm"
                />
            </div>

            {/* Founders Grid */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="h-72 rounded-2xl bg-white/5 animate-pulse" />
                    ))}
                </div>
            ) : (
                <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {filtered.map((founder) => (
                        <motion.div key={founder.id} variants={item}>
                            <Card className="group border-white/5 hover:border-white/20 transition-all duration-500 overflow-hidden">
                                <CardContent className="p-0">
                                    {/* Founder header section */}
                                    <div className="p-6 pb-4 border-b border-white/5">
                                        <div className="flex items-start gap-4">
                                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center text-xl font-bold text-emerald-300 border border-white/10 group-hover:scale-110 transition-transform duration-300">
                                                {founder.name.charAt(0)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-bold text-lg">{founder.name}</h3>
                                                <div className="flex items-center gap-3 mt-1">
                                                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                        <MapPin className="w-3 h-3" />
                                                        {founder.city || "Remote"}, {founder.country}
                                                    </span>
                                                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                        <Mail className="w-3 h-3" />
                                                        {founder.email}
                                                    </span>
                                                </div>
                                            </div>
                                            {founder.healthScore && founder.healthScore > 0 && (
                                                <div className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                                                    <div className="text-[10px] text-emerald-400 font-bold">{founder.healthScore}</div>
                                                    <div className="text-[8px] text-emerald-500">Score</div>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Startup profile section */}
                                    <div className="p-6 pt-4 space-y-3">
                                        <div className="flex flex-wrap gap-1.5">
                                            <span className={cn("px-2.5 py-1 rounded-lg text-[10px] font-semibold border", getStageColor(founder.stage))}>
                                                {STAGE_LABELS[founder.stage] || founder.stage}
                                            </span>
                                            {founder.types.slice(0, 3).map(t => (
                                                <span key={t} className="px-2.5 py-1 rounded-lg text-[10px] bg-white/5 text-muted-foreground border border-white/5">
                                                    {t}
                                                </span>
                                            ))}
                                        </div>

                                        {founder.problem && (
                                            <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">{founder.problem}</p>
                                        )}

                                        <div className="flex items-center gap-2 pt-3">
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                className="flex-1 text-xs h-9"
                                                onClick={() => { setSelectedFounder(founder); setViewMode("founder"); }}
                                            >
                                                <Eye className="w-3 h-3 mr-1.5" /> Founder Profile
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                className="flex-1 text-xs h-9"
                                                onClick={() => { setSelectedFounder(founder); setViewMode("startup"); }}
                                            >
                                                <Building2 className="w-3 h-3 mr-1.5" /> Startup Profile
                                            </Button>
                                            {sentRequests.has(founder.id) ? (
                                                <Button size="sm" variant="outline" className="text-xs h-9 opacity-60" disabled>
                                                    Sent
                                                </Button>
                                            ) : (
                                                <Button
                                                    size="sm"
                                                    className="text-xs h-9 bg-emerald-600 hover:bg-emerald-500"
                                                    onClick={() => sendRequest(founder.id, founder.name)}
                                                >
                                                    <UserPlus className="w-3 h-3 mr-1" /> Connect
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </motion.div>
            )}

            {!loading && filtered.length === 0 && (
                <div className="text-center py-20 text-muted-foreground">
                    <UserSearch className="w-16 h-16 mx-auto mb-4 opacity-20" />
                    <p className="text-lg font-medium">No founders found</p>
                    <p className="text-sm">Try a different search.</p>
                </div>
            )}

            {/* Profile Modal */}
            <AnimatePresence>
                {selectedFounder && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
                        onClick={() => setSelectedFounder(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="w-full max-w-xl max-h-[90vh] overflow-y-auto"
                        >
                            <Card className="bg-zinc-950 border-white/10">
                                {/* Profile Header */}
                                <div className="p-6 border-b border-white/10">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-2xl font-bold text-white">
                                                {selectedFounder.name.charAt(0)}
                                            </div>
                                            <div>
                                                <h2 className="text-xl font-bold">{selectedFounder.name}</h2>
                                                <p className="text-sm text-muted-foreground flex items-center gap-1.5 mt-0.5">
                                                    <MapPin className="w-3 h-3" />
                                                    {selectedFounder.city}, {selectedFounder.country}
                                                </p>
                                                <p className="text-sm text-muted-foreground flex items-center gap-1.5 mt-0.5">
                                                    <Mail className="w-3 h-3" />
                                                    {selectedFounder.email}
                                                </p>
                                            </div>
                                        </div>
                                        <Button variant="ghost" size="icon" onClick={() => setSelectedFounder(null)}>
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>

                                    {/* View Toggle */}
                                    <div className="flex gap-1 mt-4 p-1 rounded-lg bg-white/5 border border-white/5">
                                        <button
                                            onClick={() => setViewMode("founder")}
                                            className={cn(
                                                "flex-1 px-4 py-2 rounded-md text-xs font-medium transition-all",
                                                viewMode === "founder" ? "bg-white text-black" : "text-muted-foreground hover:text-white"
                                            )}
                                        >
                                            👤 Founder Profile
                                        </button>
                                        <button
                                            onClick={() => setViewMode("startup")}
                                            className={cn(
                                                "flex-1 px-4 py-2 rounded-md text-xs font-medium transition-all",
                                                viewMode === "startup" ? "bg-white text-black" : "text-muted-foreground hover:text-white"
                                            )}
                                        >
                                            🚀 Startup Profile
                                        </button>
                                    </div>
                                </div>

                                {/* Content */}
                                <CardContent className="p-6 space-y-5">
                                    {viewMode === "founder" ? (
                                        <>
                                            {/* Founder Profile */}
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                                                    <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Role</h4>
                                                    <p className="text-sm font-medium">{selectedFounder.role}</p>
                                                </div>
                                                <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                                                    <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Health Score</h4>
                                                    <p className="text-sm font-medium">{selectedFounder.healthScore || 0}/100</p>
                                                </div>
                                            </div>

                                            <div className="flex flex-wrap gap-2">
                                                {selectedFounder.types.map(t => (
                                                    <span key={t} className="px-3 py-1 rounded-full text-xs bg-white/5 border border-white/10">{t}</span>
                                                ))}
                                            </div>

                                            <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                                                <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Contact Information</h4>
                                                <div className="space-y-2 text-sm">
                                                    <p className="flex items-center gap-2"><Mail className="w-3 h-3 text-muted-foreground" /> {selectedFounder.email}</p>
                                                    {selectedFounder.phone && <p className="flex items-center gap-2"><Briefcase className="w-3 h-3 text-muted-foreground" /> {selectedFounder.phone}</p>}
                                                </div>
                                            </div>

                                            {selectedFounder.website && (
                                                <a href={selectedFounder.website} target="_blank" rel="noopener noreferrer"
                                                    className="flex items-center gap-2 text-sm text-emerald-400 hover:text-emerald-300 transition-colors p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/10"
                                                >
                                                    <Globe className="w-4 h-4" /> {selectedFounder.website} <ExternalLink className="w-3 h-3 ml-auto" />
                                                </a>
                                            )}
                                        </>
                                    ) : (
                                        <>
                                            {/* Startup Profile */}
                                            <div className={cn("p-4 rounded-xl border", getStageColor(selectedFounder.stage))}>
                                                <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Current Stage</h4>
                                                <p className="text-lg font-bold">{STAGE_LABELS[selectedFounder.stage] || selectedFounder.stage}</p>
                                            </div>

                                            <div className="flex flex-wrap gap-2">
                                                {selectedFounder.types.map(t => (
                                                    <span key={t} className="px-3 py-1.5 rounded-xl text-xs bg-white/5 border border-white/10 font-medium">{t}</span>
                                                ))}
                                            </div>

                                            {selectedFounder.problem && (
                                                <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                                                    <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Problem Statement</h4>
                                                    <p className="text-sm leading-relaxed">{selectedFounder.problem}</p>
                                                </div>
                                            )}
                                            {selectedFounder.solution && (
                                                <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                                                    <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Solution</h4>
                                                    <p className="text-sm leading-relaxed">{selectedFounder.solution}</p>
                                                </div>
                                            )}
                                            {selectedFounder.customer && (
                                                <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                                                    <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Target Customer</h4>
                                                    <p className="text-sm leading-relaxed">{selectedFounder.customer}</p>
                                                </div>
                                            )}
                                            {selectedFounder.revenueModel && (
                                                <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                                                    <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Revenue Model</h4>
                                                    <p className="text-sm leading-relaxed">{selectedFounder.revenueModel}</p>
                                                </div>
                                            )}
                                            {selectedFounder.assumptions && (
                                                <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                                                    <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Key Assumptions</h4>
                                                    <p className="text-sm leading-relaxed">{selectedFounder.assumptions}</p>
                                                </div>
                                            )}
                                        </>
                                    )}

                                    {/* Action buttons */}
                                    <div className="pt-4 border-t border-white/10">
                                        {sentRequests.has(selectedFounder.id) ? (
                                            <Button className="w-full" disabled variant="outline">Request Already Sent</Button>
                                        ) : (
                                            <Button
                                                className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500"
                                                onClick={() => { sendRequest(selectedFounder.id, selectedFounder.name); setSelectedFounder(null); }}
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
