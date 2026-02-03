"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, updateDoc, doc, query, orderBy } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Check, X, LogOut, Loader2 } from "lucide-react";
import { format } from "date-fns";

export default function AdminDashboardPage() {
    const router = useRouter();
    const [startups, setStartups] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            // Basic client-side check, security rules should handle real protection
            if (!auth.currentUser) {
                router.push("/admin/login");
            }
        };
        checkAuth();
        fetchStartups();
    }, []);

    const fetchStartups = async () => {
        try {
            const q = query(collection(db, "startups"), orderBy("createdAt", "desc"));
            const querySnapshot = await getDocs(q);
            const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setStartups(data);
        } catch (error) {
            console.error("Error fetching startups:", error);
            toast.error("Failed to load startups");
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (id: string, newStatus: "approved" | "rejected") => {
        try {
            await updateDoc(doc(db, "startups", id), {
                status: newStatus,
                reviewedAt: new Date(),
                reviewedBy: auth.currentUser?.email
            });

            // Update local state
            setStartups(startups.map(s => s.id === id ? { ...s, status: newStatus } : s));
            toast.success(`Startup ${newStatus} successfully`);
        } catch (error) {
            toast.error("Failed to update status");
        }
    };

    const handleLogout = async () => {
        await auth.signOut();
        router.push("/admin/login");
    };

    if (loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="min-h-screen bg-background p-8 space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Super Admin Command Center</h1>
                    <p className="text-muted-foreground">Oversee and manage startup entities.</p>
                </div>
                <Button variant="outline" onClick={handleLogout} className="gap-2">
                    <LogOut size={16} /> Logout
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Total Startups</CardTitle>
                        <div className="text-2xl font-bold">{startups.length}</div>
                    </CardHeader>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Pending Approval</CardTitle>
                        <div className="text-2xl font-bold text-yellow-500">
                            {startups.filter(s => s.status === 'pending').length}
                        </div>
                    </CardHeader>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Approved Active</CardTitle>
                        <div className="text-2xl font-bold text-green-500">
                            {startups.filter(s => s.status === 'approved').length}
                        </div>
                    </CardHeader>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Startup Registry</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Startup Name</TableHead>
                                <TableHead>Founder</TableHead>
                                <TableHead>Stage</TableHead>
                                <TableHead>Industry</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {startups.map((startup) => (
                                <TableRow key={startup.id}>
                                    <TableCell className="font-medium">{startup.name}</TableCell>
                                    <TableCell>{startup.email}</TableCell>
                                    <TableCell className="capitalize">{startup.stage}</TableCell>
                                    <TableCell>{startup.types?.join(", ")}</TableCell>
                                    <TableCell>{startup.createdAt?.seconds ? format(new Date(startup.createdAt.seconds * 1000), "MMM d, yyyy") : "-"}</TableCell>
                                    <TableCell>
                                        <Badge variant={startup.status === 'approved' ? 'default' : startup.status === 'rejected' ? 'destructive' : 'secondary'}>
                                            {startup.status || 'Pending'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {startup.status !== 'approved' && startup.status !== 'rejected' && (
                                            <div className="flex items-center justify-end gap-2">
                                                <Button size="sm" variant="outline" className="h-8 w-8 p-0" onClick={() => handleStatusUpdate(startup.id, 'approved')}>
                                                    <Check className="h-4 w-4 text-green-500" />
                                                </Button>
                                                <Button size="sm" variant="outline" className="h-8 w-8 p-0 border-red-500/20 hover:bg-red-500/10" onClick={() => handleStatusUpdate(startup.id, 'rejected')}>
                                                    <X className="h-4 w-4 text-red-500" />
                                                </Button>
                                            </div>
                                        )}
                                        {startup.status === 'approved' && <span className="text-xs text-green-500">Verified</span>}
                                        {startup.status === 'rejected' && <span className="text-xs text-red-500">Rejected</span>}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
