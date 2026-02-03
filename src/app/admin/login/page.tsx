"use client";

import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { ShieldCheck } from "lucide-react";

export default function AdminLoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // Check if user is Super Admin
            const userDoc = await getDoc(doc(db, "users", user.uid));

            if (userDoc.exists() && userDoc.data().role === "SUPER_ADMIN") {
                toast.success("Welcome, Administrator");
                router.push("/admin/dashboard");
            } else {
                toast.error("Access Denied", { description: "You do not have administrative privileges." });
                await auth.signOut();
            }
        } catch (error: any) {
            toast.error("Login Failed", { description: error.message });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-black">
            <Card className="w-full max-w-md border-red-900/20 bg-red-950/5">
                <CardHeader className="text-center space-y-4">
                    <div className="mx-auto w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center">
                        <ShieldCheck className="text-red-500" />
                    </div>
                    <CardTitle className="text-2xl text-red-500">Super Admin Portal</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div className="space-y-2">
                            <Input
                                type="email"
                                placeholder="admin@evolve8.com"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                className="bg-black/50 border-white/10"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Input
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                className="bg-black/50 border-white/10"
                                required
                            />
                        </div>
                        <Button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white" disabled={loading}>
                            {loading ? "Authenticating..." : "Access Mainframe"}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
