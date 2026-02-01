"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ChevronLeft, Rocket, Dna, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { toast } from "sonner";

const STARTUP_TYPES = [
    "Fintech", "Edtech", "Healthtech", "SaaS", "AI",
    "E-commerce", "Marketplace", "Web3", "AgriTech", "ClimateTech"
];

const STAGES = [
    { id: "idea", label: "Idea", desc: "Just starting out" },
    { id: "validation", label: "Validation", desc: "Talking to users" },
    { id: "mvp", label: "MVP", desc: "Building first version" },
    { id: "revenue", label: "Early Revenue", desc: "First paying customers" },
    { id: "growth", label: "Growth", desc: "Scaling up" },
];

export default function OnboardingPage() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        types: [] as string[],
        stage: "",
        problem: "",
        solution: "",
        customer: "",
    });

    const toggleType = (type: string) => {
        setFormData(prev => ({
            ...prev,
            types: prev.types.includes(type)
                ? prev.types.filter(t => t !== type)
                : [...prev.types, type]
        }));
    };

    const handleNext = () => {
        if (step === 1) setStep(2);
        else {
            handleSubmit();
        }
    };

    const handleSubmit = async () => {
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
            const user = userCredential.user;

            await setDoc(doc(db, "startups", user.uid), {
                ...formData,
                password: null, // Don't save password in DB
                createdAt: new Date(),
                userId: user.uid
            });

            toast.success("Startup OS Initialized", {
                description: "Welcome to your command center."
            });
            router.push("/dashboard");
        } catch (error: any) {
            toast.error("Setup Failed", {
                description: error.message
            });
        }
    };

    const handleBack = () => {
        if (step > 1) setStep(step - 1);
    };

    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-secondary to-accent" />
            <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-primary/10 rounded-full blur-[100px] pointer-events-none" />

            <div className="w-full max-w-3xl relative z-10">
                <div className="mb-8 text-center">
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-secondary mb-4 shadow-lg shadow-purple-500/20"
                    >
                        <Rocket className="text-white w-6 h-6" />
                    </motion.div>
                    <h1 className="text-3xl font-bold tracking-tight">Setup Your Startup OS</h1>
                    <p className="text-muted-foreground mt-2">Let's configure your workspace for maximum impact.</p>
                </div>

                {/* Progress System */}
                <div className="flex items-center justify-between mb-8 px-12 relative">
                    <div className="absolute left-0 top-1/2 w-full h-0.5 bg-white/10 -z-10" />
                    <div className={cn("w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-colors", step >= 1 ? "bg-primary text-white" : "bg-white/10 text-muted-foreground")}>1</div>
                    <div className={cn("w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-colors", step >= 2 ? "bg-primary text-white" : "bg-white/10 text-muted-foreground")}>2</div>
                    <div className={cn("w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-colors", step >= 3 ? "bg-primary text-white" : "bg-white/10 text-muted-foreground")}>3</div>
                </div>

                <Card className="glass-panel border-white/10">
                    <form onSubmit={(e) => { e.preventDefault(); handleNext(); }}>
                        <AnimatePresence mode="wait">
                            {step === 1 && (
                                <motion.div
                                    key="step1"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="p-8 space-y-6"
                                >
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label>Startup Name</Label>
                                            <Input
                                                placeholder="e.g. Acme Corp"
                                                value={formData.name}
                                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                                required
                                                autoFocus
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Founder Email</Label>
                                            <Input
                                                type="email"
                                                placeholder="you@company.com"
                                                value={formData.email}
                                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Password</Label>
                                            <Input
                                                type="password"
                                                placeholder="••••••••"
                                                value={formData.password}
                                                onChange={e => setFormData({ ...formData, password: e.target.value })}
                                                required
                                                minLength={6}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <Label>Industry / Sectors (Select all that apply)</Label>
                                        <div className="flex flex-wrap gap-2">
                                            {STARTUP_TYPES.map(type => (
                                                <button
                                                    key={type}
                                                    type="button"
                                                    onClick={() => toggleType(type)}
                                                    className={cn(
                                                        "px-4 py-2 rounded-full text-xs font-medium border transition-all duration-200",
                                                        formData.types.includes(type)
                                                            ? "bg-primary text-white border-primary shadow-lg shadow-purple-500/20"
                                                            : "bg-white/5 text-muted-foreground border-white/10 hover:border-white/20 hover:bg-white/10"
                                                    )}
                                                >
                                                    {type}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <Label>Current Stage</Label>
                                        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                                            {STAGES.map(stage => (
                                                <div
                                                    key={stage.id}
                                                    onClick={() => setFormData({ ...formData, stage: stage.id })}
                                                    className={cn(
                                                        "cursor-pointer rounded-lg border p-3 text-center transition-all hover:border-primary/50",
                                                        formData.stage === stage.id
                                                            ? "border-primary bg-primary/10 ring-1 ring-primary"
                                                            : "border-white/10 bg-white/5"
                                                    )}
                                                >
                                                    <div className="font-semibold text-xs">{stage.label}</div>
                                                    <div className="text-[10px] text-muted-foreground mt-1 leading-tight">{stage.desc}</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {step === 2 && (
                                <motion.div
                                    key="step2"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="p-8 space-y-6"
                                >
                                    <div className="flex items-center gap-2 mb-4">
                                        <Dna className="text-secondary w-5 h-5" />
                                        <h2 className="text-lg font-semibold">Startup DNA</h2>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <Label>Problem Statement</Label>
                                            <Textarea
                                                placeholder="What painful problem are you solving? Be specific."
                                                value={formData.problem}
                                                onChange={e => setFormData({ ...formData, problem: e.target.value })}
                                                className="bg-black/20"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Target Customer</Label>
                                            <Input
                                                placeholder="Who is desperate for this solution?"
                                                value={formData.customer}
                                                onChange={e => setFormData({ ...formData, customer: e.target.value })}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Solution Summary</Label>
                                            <Textarea
                                                placeholder="How do you solve it uniquely?"
                                                value={formData.solution}
                                                onChange={e => setFormData({ ...formData, solution: e.target.value })}
                                                className="bg-black/20"
                                            />
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="p-8 pt-0 flex justify-between">
                            {step > 1 ? (
                                <Button type="button" variant="ghost" onClick={handleBack}>
                                    <ChevronLeft className="mr-2 w-4 h-4" /> Back
                                </Button>
                            ) : (
                                <div />
                            )}

                            <Button type="submit" variant="gradient" className="min-w-[140px]">
                                {step === 2 ? "Launch OS" : "Next Step"} <ArrowRight className="ml-2 w-4 h-4" />
                            </Button>
                        </div>
                    </form>
                </Card>

                <div className="mt-8 text-center">
                    <Link href="/" className="text-xs text-muted-foreground hover:text-foreground">
                        Cancel Setup
                    </Link>
                </div>
            </div>
        </div>
    );
}
