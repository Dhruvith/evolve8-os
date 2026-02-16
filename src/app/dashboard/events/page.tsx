"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    CalendarDays, Plus, MapPin, Clock, Users, X, Globe,
    ExternalLink, Search, Filter, ChevronRight, Sparkles, Tag
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
    collection, query, getDocs, addDoc, orderBy, limit, onSnapshot, updateDoc, doc, arrayUnion, increment
} from "firebase/firestore";
import { format } from "date-fns";

interface Event {
    id: string;
    title: string;
    description: string;
    date: string;
    time: string;
    location: string;
    type: string;
    link?: string;
    authorId: string;
    authorName: string;
    createdAt: any;
    attendees: string[];
    attendeeCount: number;
    tags: string[];
}

const EVENT_TYPES = [
    { id: "all", label: "All Events" },
    { id: "workshop", label: "Workshop" },
    { id: "webinar", label: "Webinar" },
    { id: "meetup", label: "Meetup" },
    { id: "pitch", label: "Pitch Night" },
    { id: "conference", label: "Conference" },
    { id: "hackathon", label: "Hackathon" },
    { id: "demo", label: "Demo Day" }
];

const TYPE_COLORS: Record<string, string> = {
    workshop: "from-blue-500 to-cyan-500",
    webinar: "from-violet-500 to-purple-500",
    meetup: "from-emerald-500 to-green-500",
    pitch: "from-amber-500 to-orange-500",
    conference: "from-rose-500 to-pink-500",
    hackathon: "from-cyan-500 to-teal-500",
    demo: "from-fuchsia-500 to-violet-500"
};

const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.06 } }
};
const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
};

export default function EventsPage() {
    const { user } = useAuth();
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [typeFilter, setTypeFilter] = useState("all");
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
    const [myName, setMyName] = useState("");

    const [newEvent, setNewEvent] = useState({
        title: "",
        description: "",
        date: "",
        time: "",
        location: "",
        type: "meetup",
        link: "",
        tags: ""
    });

    useEffect(() => {
        if (!user) return;
        const fetchName = async () => {
            const { getDoc, doc: docRef } = await import("firebase/firestore");
            const d = await getDoc(docRef(db, "startups", user.uid));
            if (d.exists()) setMyName(d.data().name || "Anonymous");
        };
        fetchName();

        const q = query(collection(db, "events"), orderBy("date", "asc"), limit(200));
        const unsub = onSnapshot(q, (snap) => {
            const e: Event[] = snap.docs.map((d) => ({
                id: d.id,
                ...d.data(),
                attendees: d.data().attendees || [],
                attendeeCount: d.data().attendeeCount || 0,
                tags: d.data().tags || []
            } as Event));
            setEvents(e);
            setLoading(false);
        });
        return () => unsub();
    }, [user]);

    const filtered = useMemo(() => {
        return events.filter((e) => {
            const matchesSearch = e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                e.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                e.location.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesType = typeFilter === "all" || e.type === typeFilter;
            return matchesSearch && matchesType;
        });
    }, [events, searchQuery, typeFilter]);

    // Split into upcoming and past
    const now = new Date().toISOString().split("T")[0];
    const upcoming = filtered.filter(e => e.date >= now);
    const past = filtered.filter(e => e.date < now);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        try {
            await addDoc(collection(db, "events"), {
                ...newEvent,
                tags: newEvent.tags.split(",").map(t => t.trim()).filter(Boolean),
                authorId: user.uid,
                authorName: myName,
                createdAt: new Date(),
                attendees: [user.uid],
                attendeeCount: 1
            });
            toast.success("Event Created!");
            setIsCreateOpen(false);
            setNewEvent({ title: "", description: "", date: "", time: "", location: "", type: "meetup", link: "", tags: "" });
        } catch (err) {
            toast.error("Failed to create event");
        }
    };

    const handleRSVP = async (eventId: string) => {
        if (!user) return;
        try {
            await updateDoc(doc(db, "events", eventId), {
                attendees: arrayUnion(user.uid),
                attendeeCount: increment(1)
            });
            toast.success("You're registered!");
        } catch {
            toast.error("Failed to RSVP");
        }
    };

    const formatDate = (dateStr: string) => {
        try {
            return format(new Date(dateStr), "EEE, MMM d yyyy");
        } catch {
            return dateStr;
        }
    };

    const getTypeGradient = (type: string) => TYPE_COLORS[type] || "from-zinc-500 to-zinc-600";

    const isAttending = (event: Event) => user ? event.attendees.includes(user.uid) : false;

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                            <CalendarDays className="w-5 h-5 text-white" />
                        </div>
                        Events
                    </h1>
                    <p className="text-muted-foreground mt-1">Workshops, meetups, pitch nights and more.</p>
                </div>
                <Button
                    className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500"
                    onClick={() => setIsCreateOpen(true)}
                >
                    <Plus className="w-4 h-4 mr-2" /> Create Event
                </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: "Upcoming", value: upcoming.length, icon: CalendarDays, color: "text-amber-400" },
                    { label: "Past Events", value: past.length, icon: Clock, color: "text-zinc-400" },
                    {
                        label: "This Month", value: upcoming.filter(e => {
                            const d = new Date(e.date);
                            const n = new Date();
                            return d.getMonth() === n.getMonth() && d.getFullYear() === n.getFullYear();
                        }).length, icon: Sparkles, color: "text-violet-400"
                    },
                    { label: "Total Events", value: events.length, icon: Globe, color: "text-cyan-400" }
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

            {/* Search & Filters */}
            <div className="space-y-4">
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        placeholder="Search events by title, location..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-11 h-12 bg-white/5 border-white/10 rounded-xl text-sm"
                    />
                </div>
                <div className="flex flex-wrap gap-2">
                    {EVENT_TYPES.map((et) => (
                        <button
                            key={et.id}
                            onClick={() => setTypeFilter(et.id)}
                            className={cn(
                                "px-4 py-1.5 rounded-full text-xs font-medium border transition-all duration-200",
                                typeFilter === et.id
                                    ? "bg-white text-black border-white"
                                    : "border-white/10 text-muted-foreground hover:border-white/30 hover:text-white"
                            )}
                        >
                            {et.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Upcoming Events */}
            {upcoming.length > 0 && (
                <div className="space-y-4">
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-amber-400" />
                        Upcoming Events
                    </h2>
                    <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {upcoming.map((event) => (
                            <motion.div key={event.id} variants={item}>
                                <Card
                                    className="group border-white/5 hover:border-white/20 transition-all duration-500 cursor-pointer overflow-hidden"
                                    onClick={() => setSelectedEvent(event)}
                                >
                                    {/* Type gradient bar */}
                                    <div className={cn("h-1.5 bg-gradient-to-r", getTypeGradient(event.type))} />
                                    <CardContent className="p-5">
                                        <div className="flex items-start justify-between mb-3">
                                            <div className={cn("px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider text-white bg-gradient-to-r", getTypeGradient(event.type))}>
                                                {event.type}
                                            </div>
                                            <div className="text-right">
                                                <div className="text-xs font-bold text-foreground">{formatDate(event.date)}</div>
                                                <div className="text-[10px] text-muted-foreground">{event.time}</div>
                                            </div>
                                        </div>

                                        <h3 className="font-semibold text-base mb-1 group-hover:text-white transition-colors">{event.title}</h3>
                                        <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{event.description}</p>

                                        <div className="flex items-center gap-3 text-xs text-muted-foreground mb-4">
                                            <span className="flex items-center gap-1">
                                                <MapPin className="w-3 h-3" />
                                                {event.location || "Online"}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Users className="w-3 h-3" />
                                                {event.attendeeCount} attending
                                            </span>
                                        </div>

                                        {event.tags.length > 0 && (
                                            <div className="flex flex-wrap gap-1 mb-3">
                                                {event.tags.slice(0, 3).map(tag => (
                                                    <span key={tag} className="px-2 py-0.5 rounded text-[10px] bg-white/5 text-muted-foreground border border-white/5">
                                                        #{tag}
                                                    </span>
                                                ))}
                                            </div>
                                        )}

                                        <div className="pt-3 border-t border-white/5">
                                            {isAttending(event) ? (
                                                <Button size="sm" variant="outline" className="w-full text-xs opacity-60" disabled>
                                                    ✓ Registered
                                                </Button>
                                            ) : (
                                                <Button
                                                    size="sm"
                                                    className={cn("w-full text-xs bg-gradient-to-r", getTypeGradient(event.type))}
                                                    onClick={(e) => { e.stopPropagation(); handleRSVP(event.id); }}
                                                >
                                                    RSVP Now
                                                </Button>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            )}

            {/* Past Events */}
            {past.length > 0 && (
                <div className="space-y-4">
                    <h2 className="text-lg font-semibold flex items-center gap-2 text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        Past Events
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 opacity-60">
                        {past.map((event) => (
                            <Card
                                key={event.id}
                                className="border-white/5 cursor-pointer hover:border-white/10 transition-all"
                                onClick={() => setSelectedEvent(event)}
                            >
                                <CardContent className="p-5">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-[10px] font-medium bg-white/5 px-2 py-0.5 rounded border border-white/5 uppercase">{event.type}</span>
                                        <span className="text-xs text-muted-foreground">{formatDate(event.date)}</span>
                                    </div>
                                    <h3 className="font-medium text-sm mb-1">{event.title}</h3>
                                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                                        <Users className="w-3 h-3" /> {event.attendeeCount} attended
                                    </p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            )}

            {!loading && events.length === 0 && (
                <div className="text-center py-20 text-muted-foreground">
                    <CalendarDays className="w-16 h-16 mx-auto mb-4 opacity-20" />
                    <p className="text-lg font-medium">No events yet</p>
                    <p className="text-sm mb-4">Create the first event for the community!</p>
                    <Button onClick={() => setIsCreateOpen(true)} variant="outline">Create Event</Button>
                </div>
            )}

            {/* Create Event Modal */}
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
                            className="w-full max-w-lg max-h-[90vh] overflow-y-auto"
                        >
                            <Card className="bg-zinc-950 border-white/10">
                                <CardHeader className="flex flex-row items-center justify-between">
                                    <CardTitle>Create Event</CardTitle>
                                    <Button variant="ghost" size="icon" onClick={() => setIsCreateOpen(false)}>
                                        <X className="h-4 w-4" />
                                    </Button>
                                </CardHeader>
                                <CardContent>
                                    <form onSubmit={handleCreate} className="space-y-4">
                                        <div className="space-y-2">
                                            <Label>Event Title</Label>
                                            <Input
                                                placeholder="e.g. Founder Friday Meetup"
                                                value={newEvent.title}
                                                onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label>Date</Label>
                                                <Input
                                                    type="date"
                                                    value={newEvent.date}
                                                    onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                                                    required
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Time</Label>
                                                <Input
                                                    type="time"
                                                    value={newEvent.time}
                                                    onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
                                                    required
                                                />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label>Location</Label>
                                                <Input
                                                    placeholder="Online or venue..."
                                                    value={newEvent.location}
                                                    onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                                                    required
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Type</Label>
                                                <select
                                                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                                    value={newEvent.type}
                                                    onChange={(e) => setNewEvent({ ...newEvent, type: e.target.value })}
                                                >
                                                    {EVENT_TYPES.filter(t => t.id !== "all").map(t => (
                                                        <option key={t.id} value={t.id}>{t.label}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Description</Label>
                                            <Textarea
                                                placeholder="Describe the event..."
                                                value={newEvent.description}
                                                onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                                                required
                                                className="min-h-[100px] bg-black/20"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Event Link (optional)</Label>
                                            <Input
                                                placeholder="https://zoom.us/j/..."
                                                value={newEvent.link}
                                                onChange={(e) => setNewEvent({ ...newEvent, link: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Tags (comma-separated)</Label>
                                            <Input
                                                placeholder="e.g. AI, SaaS, Networking"
                                                value={newEvent.tags}
                                                onChange={(e) => setNewEvent({ ...newEvent, tags: e.target.value })}
                                            />
                                        </div>
                                        <Button type="submit" className="w-full bg-gradient-to-r from-amber-600 to-orange-600">
                                            Create Event
                                        </Button>
                                    </form>
                                </CardContent>
                            </Card>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Event Detail Modal */}
            <AnimatePresence>
                {selectedEvent && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
                        onClick={() => setSelectedEvent(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="w-full max-w-lg"
                        >
                            <Card className="bg-zinc-950 border-white/10">
                                <div className={cn("h-2 bg-gradient-to-r rounded-t-xl", getTypeGradient(selectedEvent.type))} />
                                <CardHeader className="flex flex-row items-start justify-between">
                                    <div>
                                        <div className={cn("inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-white bg-gradient-to-r mb-2", getTypeGradient(selectedEvent.type))}>
                                            {selectedEvent.type}
                                        </div>
                                        <CardTitle className="text-xl">{selectedEvent.title}</CardTitle>
                                        <CardDescription>by {selectedEvent.authorName}</CardDescription>
                                    </div>
                                    <Button variant="ghost" size="icon" onClick={() => setSelectedEvent(null)}>
                                        <X className="h-4 w-4" />
                                    </Button>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                                            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                                                <CalendarDays className="w-3 h-3" /> Date
                                            </div>
                                            <div className="text-sm font-medium">{formatDate(selectedEvent.date)}</div>
                                        </div>
                                        <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                                            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                                                <Clock className="w-3 h-3" /> Time
                                            </div>
                                            <div className="text-sm font-medium">{selectedEvent.time}</div>
                                        </div>
                                        <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                                            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                                                <MapPin className="w-3 h-3" /> Location
                                            </div>
                                            <div className="text-sm font-medium">{selectedEvent.location}</div>
                                        </div>
                                        <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                                            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                                                <Users className="w-3 h-3" /> Attendees
                                            </div>
                                            <div className="text-sm font-medium">{selectedEvent.attendeeCount}</div>
                                        </div>
                                    </div>

                                    <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{selectedEvent.description}</p>
                                    </div>

                                    {selectedEvent.tags.length > 0 && (
                                        <div className="flex flex-wrap gap-2">
                                            {selectedEvent.tags.map(tag => (
                                                <span key={tag} className="px-3 py-1 rounded-full text-xs bg-white/5 border border-white/10">
                                                    #{tag}
                                                </span>
                                            ))}
                                        </div>
                                    )}

                                    {selectedEvent.link && (
                                        <a
                                            href={selectedEvent.link}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-2 text-sm text-amber-400 hover:text-amber-300 transition-colors p-3 rounded-xl bg-amber-500/5 border border-amber-500/10"
                                        >
                                            <Globe className="w-4 h-4" /> Join Link <ExternalLink className="w-3 h-3 ml-auto" />
                                        </a>
                                    )}

                                    <div className="pt-3 border-t border-white/10">
                                        {selectedEvent.date < now ? (
                                            <Button className="w-full" disabled variant="outline">Event has ended</Button>
                                        ) : isAttending(selectedEvent) ? (
                                            <Button className="w-full" disabled variant="outline">✓ You're registered</Button>
                                        ) : (
                                            <Button
                                                className={cn("w-full bg-gradient-to-r", getTypeGradient(selectedEvent.type))}
                                                onClick={() => { handleRSVP(selectedEvent.id); setSelectedEvent(null); }}
                                            >
                                                RSVP for this Event
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
