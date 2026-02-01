"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Zap, ArrowRight, Loader2, Github } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useAuth } from "@/lib/contexts/AuthContext";
import { toast } from "sonner";

export default function LoginPage() {
    const router = useRouter();
    const { signInWithGoogle } = useAuth();
    const [loading, setLoading] = useState(false);
    const [credentials, setCredentials] = useState({ email: "", password: "" });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setCredentials({ ...credentials, [e.target.id]: e.target.value });
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            await signInWithEmailAndPassword(auth, credentials.email, credentials.password);
            toast.success("Welcome back!", {
                description: "Redirecting to your dashboard..."
            });
            router.push("/dashboard");
        } catch (error: any) {
            toast.error("Login failed", {
                description: "Invalid email or password."
            });
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 relative overflow-hidden">
            {/* Animated Background */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-[-50%] left-[-20%] w-[1000px] h-[1000px] bg-primary/10 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute bottom-[-20%] right-[-20%] w-[800px] h-[800px] bg-secondary/5 rounded-full blur-[100px]" />
            </div>

            <Link href="/" className="absolute top-8 left-8 z-20 flex items-center gap-2 group">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Zap className="w-5 h-5 text-white fill-current" />
                </div>
                <span className="text-xl font-bold tracking-tight">StartupOS</span>
            </Link>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md relative z-10"
            >
                <Card className="glass-panel border-white/10">
                    <CardHeader className="space-y-1">
                        <CardTitle className="text-2xl font-bold text-center">Welcome back</CardTitle>
                        <CardDescription className="text-center">
                            Enter your credentials to access your workspace
                        </CardDescription>
                    </CardHeader>
                    <form onSubmit={handleLogin}>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input id="email" type="email" placeholder="founder@startup.io" required value={credentials.email} onChange={handleChange} />
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="password">Password</Label>
                                    <Link href="#" className="text-xs text-primary hover:underline">Forgot password?</Link>
                                </div>
                                <Input id="password" type="password" placeholder="••••••••" required value={credentials.password} onChange={handleChange} />
                            </div>
                        </CardContent>
                        <CardFooter className="flex flex-col gap-4">
                            <Button type="submit" className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-opacity" disabled={loading}>
                                {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : "Sign In"}
                                {!loading && <ArrowRight className="w-4 h-4 ml-2" />}
                            </Button>

                            <div className="relative w-full text-center text-xs text-muted-foreground">
                                <span className="bg-background px-2 relative z-10">Or continue with</span>
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-white/10"></div>
                                </div>
                            </div>

                            <Button variant="outline" type="button" className="w-full bg-white/5 border-white/10 hover:bg-white/10" onClick={signInWithGoogle}>
                                <Github className="w-4 h-4 mr-2" /> Google
                            </Button>
                        </CardFooter>
                    </form>
                </Card>

                <p className="text-center text-sm text-muted-foreground mt-4">
                    Don't have an account? <Link href="/onboarding" className="text-primary hover:underline">Start your journey</Link>
                </p>
            </motion.div>
        </div>
    );
}
