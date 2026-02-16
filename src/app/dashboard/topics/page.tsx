"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    MessageSquare, Plus, Search, ThumbsUp, MessageCircle, X,
    Hash, TrendingUp, Clock, Send, Filter, Flame, ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/contexts/AuthContext";
import { db } from "@/lib/firebase";
import {
    collection, query, getDocs, addDoc, updateDoc, doc, orderBy,
    limit, getDoc, increment, onSnapshot, serverTimestamp, arrayUnion, arrayRemove
} from "firebase/firestore";

interface Topic {
    id: string;
    title: string;
    category: string;
    description: string;
    authorId: string;
    authorName: string;
    createdAt: any;
    likes: number;
    likedBy: string[];
    replyCount: number;
}

interface Reply {
    id: string;
    topicId: string;
    content: string;
    authorId: string;
    authorName: string;
    createdAt: any;
}

const CATEGORIES = [
    { id: "all", label: "All Topics", icon: Hash, color: "text-white" },
    { id: "fundraising", label: "Fundraising", icon: TrendingUp, color: "text-emerald-400" },
    { id: "growth", label: "Growth", icon: Flame, color: "text-orange-400" },
    { id: "product", label: "Product", icon: MessageSquare, color: "text-blue-400" },
    { id: "hiring", label: "Hiring", icon: MessageCircle, color: "text-violet-400" },
    { id: "general", label: "General", icon: Hash, color: "text-zinc-400" }
];

const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.05 } }
};
const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
};

export default function TopicsPage() {
    const { user } = useAuth();
    const [topics, setTopics] = useState<Topic[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("all");
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
    const [replies, setReplies] = useState<Reply[]>([]);
    const [replyContent, setReplyContent] = useState("");
    const [newTopic, setNewTopic] = useState({ title: "", description: "", category: "general" });
    const [myName, setMyName] = useState("");
    const repliesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!user) return;
        // Get user name
        const fetchName = async () => {
            const d = await getDoc(doc(db, "startups", user.uid));
            if (d.exists()) setMyName(d.data().name || "Anonymous");
        };
        fetchName();

        // Listen to topics
        const q = query(collection(db, "topics"), orderBy("createdAt", "desc"), limit(100));
        const unsub = onSnapshot(q, (snap) => {
            const t: Topic[] = snap.docs.map((d) => ({
                id: d.id,
                ...d.data(),
                likedBy: d.data().likedBy || [],
                likes: d.data().likes || 0,
                replyCount: d.data().replyCount || 0
            } as Topic));
            setTopics(t);
            setLoading(false);
        });
        return () => unsub();
    }, [user]);

    // Listen to replies when a topic is selected
    useEffect(() => {
        if (!selectedTopic) return;
        const q = query(
            collection(db, "topics", selectedTopic.id, "replies"),
            orderBy("createdAt", "asc"),
            limit(200)
        );
        const unsub = onSnapshot(q, (snap) => {
            setReplies(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Reply)));
            setTimeout(() => repliesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
        });
        return () => unsub();
    }, [selectedTopic]);

    const filtered = useMemo(() => {
        return topics.filter((t) => {
            const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                t.description.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesCategory = categoryFilter === "all" || t.category === categoryFilter;
            return matchesSearch && matchesCategory;
        });
    }, [topics, searchQuery, categoryFilter]);

    const handleCreateTopic = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !newTopic.title.trim()) return;
        try {
            await addDoc(collection(db, "topics"), {
                ...newTopic,
                authorId: user.uid,
                authorName: myName,
                createdAt: new Date(),
                likes: 0,
                likedBy: [],
                replyCount: 0
            });
            toast.success("Topic Created!");
            setIsCreateOpen(false);
            setNewTopic({ title: "", description: "", category: "general" });
        } catch (err) {
            toast.error("Failed to create topic");
        }
    };

    const handleLike = async (topicId: string, likedBy: string[]) => {
        if (!user) return;
        const ref = doc(db, "topics", topicId);
        const isLiked = likedBy.includes(user.uid);
        try {
            await updateDoc(ref, {
                likes: increment(isLiked ? -1 : 1),
                likedBy: isLiked ? arrayRemove(user.uid) : arrayUnion(user.uid)
            });
        } catch (err) {
            toast.error("Failed to update");
        }
    };

    const handleReply = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !selectedTopic || !replyContent.trim()) return;
        try {
            await addDoc(collection(db, "topics", selectedTopic.id, "replies"), {
                topicId: selectedTopic.id,
                content: replyContent,
                authorId: user.uid,
                authorName: myName,
                createdAt: new Date()
            });
            await updateDoc(doc(db, "topics", selectedTopic.id), {
                replyCount: increment(1)
            });
            setReplyContent("");
        } catch (err) {
            toast.error("Failed to reply");
        }
    };

    const getTimeAgo = (timestamp: any) => {
        if (!timestamp) return "Just now";
        const date = timestamp.seconds ? new Date(timestamp.seconds * 1000) : new Date(timestamp);
        const diff = Date.now() - date.getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 1) return "Just now";
        if (mins < 60) return `${mins}m ago`;
        const hours = Math.floor(mins / 60);
        if (hours < 24) return `${hours}h ago`;
        const days = Math.floor(hours / 24);
        return `${days}d ago`;
    };

    const getCategoryInfo = (cat: string) => {
        return CATEGORIES.find(c => c.id === cat) || CATEGORIES[5];
    };

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
                            <MessageSquare className="w-5 h-5 text-white" />
                        </div>
                        Topics & Discussions
                    </h1>
                    <p className="text-muted-foreground mt-1">Share ideas, ask questions, and learn from fellow founders.</p>
                </div>
                <Button
                    className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500"
                    onClick={() => setIsCreateOpen(true)}
                >
                    <Plus className="w-4 h-4 mr-2" /> New Topic
                </Button>
            </div>

            {/* Search & Categories */}
            <div className="space-y-4">
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        placeholder="Search discussions..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-11 h-12 bg-white/5 border-white/10 rounded-xl text-sm"
                    />
                </div>
                <div className="flex flex-wrap gap-2">
                    {CATEGORIES.map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => setCategoryFilter(cat.id)}
                            className={cn(
                                "px-4 py-1.5 rounded-full text-xs font-medium border transition-all duration-200 flex items-center gap-1.5",
                                categoryFilter === cat.id
                                    ? "bg-white text-black border-white"
                                    : "border-white/10 text-muted-foreground hover:border-white/30 hover:text-white"
                            )}
                        >
                            <cat.icon className="w-3 h-3" />
                            {cat.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Topics List */}
            {loading ? (
                <div className="space-y-4">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="h-28 rounded-2xl bg-white/5 animate-pulse" />
                    ))}
                </div>
            ) : (
                <motion.div variants={container} initial="hidden" animate="show" className="space-y-3">
                    {filtered.map((topic) => {
                        const cat = getCategoryInfo(topic.category);
                        const isLiked = user ? topic.likedBy.includes(user.uid) : false;
                        return (
                            <motion.div key={topic.id} variants={item}>
                                <Card
                                    className="group border-white/5 hover:border-white/15 transition-all duration-300 cursor-pointer"
                                    onClick={() => { setSelectedTopic(topic); setReplies([]); }}
                                >
                                    <CardContent className="p-5">
                                        <div className="flex items-start gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center shrink-0 border border-white/5">
                                                <cat.icon className={cn("w-4 h-4", cat.color)} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between gap-3">
                                                    <div>
                                                        <h3 className="font-semibold text-base group-hover:text-white transition-colors">{topic.title}</h3>
                                                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{topic.description}</p>
                                                    </div>
                                                    <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mt-1" />
                                                </div>
                                                <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                                                    <span className="font-medium text-foreground/70">{topic.authorName}</span>
                                                    <span className="flex items-center gap-1">
                                                        <Clock className="w-3 h-3" />
                                                        {getTimeAgo(topic.createdAt)}
                                                    </span>
                                                    <button
                                                        className={cn(
                                                            "flex items-center gap-1 transition-colors hover:text-rose-400",
                                                            isLiked && "text-rose-400"
                                                        )}
                                                        onClick={(e) => { e.stopPropagation(); handleLike(topic.id, topic.likedBy); }}
                                                    >
                                                        <ThumbsUp className="w-3 h-3" /> {topic.likes}
                                                    </button>
                                                    <span className="flex items-center gap-1">
                                                        <MessageCircle className="w-3 h-3" /> {topic.replyCount}
                                                    </span>
                                                    <span className={cn("px-2 py-0.5 rounded text-[10px] font-medium border", `${cat.color} bg-white/5 border-white/5`)}>
                                                        {cat.label}
                                                    </span>
                                                </div>
                                            </div>
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
                    <MessageSquare className="w-16 h-16 mx-auto mb-4 opacity-20" />
                    <p className="text-lg font-medium">No discussions yet</p>
                    <p className="text-sm mb-4">Be the first to start a conversation!</p>
                    <Button onClick={() => setIsCreateOpen(true)} variant="outline">Start a Topic</Button>
                </div>
            )}

            {/* Create Topic Modal */}
            <AnimatePresence>
                {isCreateOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
                        onClick={() => setIsCreateOpen(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="w-full max-w-lg"
                        >
                            <Card className="bg-zinc-950 border-white/10">
                                <CardHeader className="flex flex-row items-center justify-between">
                                    <CardTitle>Start a Discussion</CardTitle>
                                    <Button variant="ghost" size="icon" onClick={() => setIsCreateOpen(false)}>
                                        <X className="h-4 w-4" />
                                    </Button>
                                </CardHeader>
                                <CardContent>
                                    <form onSubmit={handleCreateTopic} className="space-y-4">
                                        <div className="space-y-2">
                                            <Label>Topic Title</Label>
                                            <Input
                                                placeholder="What's on your mind?"
                                                value={newTopic.title}
                                                onChange={(e) => setNewTopic({ ...newTopic, title: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Category</Label>
                                            <select
                                                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                                value={newTopic.category}
                                                onChange={(e) => setNewTopic({ ...newTopic, category: e.target.value })}
                                            >
                                                {CATEGORIES.filter(c => c.id !== "all").map(c => (
                                                    <option key={c.id} value={c.id}>{c.label}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Description</Label>
                                            <Textarea
                                                placeholder="Share your thoughts, question, or insight..."
                                                value={newTopic.description}
                                                onChange={(e) => setNewTopic({ ...newTopic, description: e.target.value })}
                                                required
                                                className="min-h-[120px] bg-black/20"
                                            />
                                        </div>
                                        <Button type="submit" className="w-full bg-gradient-to-r from-orange-600 to-red-600">
                                            Post Topic
                                        </Button>
                                    </form>
                                </CardContent>
                            </Card>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Topic Detail / Thread Modal */}
            <AnimatePresence>
                {selectedTopic && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
                        onClick={() => setSelectedTopic(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="w-full max-w-2xl max-h-[85vh] flex flex-col"
                        >
                            <Card className="bg-zinc-950 border-white/10 flex flex-col max-h-[85vh]">
                                <CardHeader className="flex flex-row items-start justify-between shrink-0 border-b border-white/5">
                                    <div>
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className={cn("px-2 py-0.5 rounded text-[10px] font-medium border", `${getCategoryInfo(selectedTopic.category).color} bg-white/5 border-white/5`)}>
                                                {getCategoryInfo(selectedTopic.category).label}
                                            </span>
                                            <span className="text-xs text-muted-foreground">{getTimeAgo(selectedTopic.createdAt)}</span>
                                        </div>
                                        <CardTitle className="text-xl">{selectedTopic.title}</CardTitle>
                                        <CardDescription className="mt-1">by {selectedTopic.authorName}</CardDescription>
                                    </div>
                                    <Button variant="ghost" size="icon" onClick={() => setSelectedTopic(null)}>
                                        <X className="h-4 w-4" />
                                    </Button>
                                </CardHeader>

                                {/* Thread body */}
                                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                                    {/* Original post */}
                                    <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{selectedTopic.description}</p>
                                        <div className="flex items-center gap-4 mt-4 text-xs text-muted-foreground">
                                            <button
                                                className={cn(
                                                    "flex items-center gap-1 transition-colors hover:text-rose-400",
                                                    user && selectedTopic.likedBy.includes(user.uid) && "text-rose-400"
                                                )}
                                                onClick={() => handleLike(selectedTopic.id, selectedTopic.likedBy)}
                                            >
                                                <ThumbsUp className="w-3 h-3" /> {selectedTopic.likes} likes
                                            </button>
                                            <span className="flex items-center gap-1">
                                                <MessageCircle className="w-3 h-3" /> {replies.length} replies
                                            </span>
                                        </div>
                                    </div>

                                    {/* Replies */}
                                    {replies.map((reply) => (
                                        <div key={reply.id} className="flex items-start gap-3">
                                            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold border border-white/10 shrink-0">
                                                {reply.authorName?.charAt(0) || "?"}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="text-sm font-medium">{reply.authorName}</span>
                                                    <span className="text-[10px] text-muted-foreground">{getTimeAgo(reply.createdAt)}</span>
                                                </div>
                                                <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">{reply.content}</p>
                                            </div>
                                        </div>
                                    ))}

                                    <div ref={repliesEndRef} />

                                    {replies.length === 0 && (
                                        <div className="text-center text-muted-foreground text-sm py-6">
                                            No replies yet. Be the first to contribute!
                                        </div>
                                    )}
                                </div>

                                {/* Reply input */}
                                <div className="shrink-0 p-4 border-t border-white/10">
                                    <form onSubmit={handleReply} className="flex items-center gap-3">
                                        <Input
                                            placeholder="Write a reply..."
                                            value={replyContent}
                                            onChange={(e) => setReplyContent(e.target.value)}
                                            className="flex-1 bg-white/5 border-white/10"
                                        />
                                        <Button type="submit" size="icon" className="shrink-0 bg-gradient-to-r from-orange-600 to-red-600">
                                            <Send className="w-4 h-4" />
                                        </Button>
                                    </form>
                                </div>
                            </Card>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
