"use client";
import { useRef } from "react";
import { motion, useMotionValue, useTransform, useSpring, useScroll } from "framer-motion";
import { Layout } from "lucide-react";

export function TiltMockup() {
    const ref = useRef<HTMLDivElement>(null);
    const { scrollY } = useScroll();
    const y1 = useTransform(scrollY, [0, 500], [0, 100]);

    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const mouseX = useSpring(x, { stiffness: 50, damping: 20 });
    const mouseY = useSpring(y, { stiffness: 50, damping: 20 });

    function onMouseMove({ currentTarget, clientX, clientY }: React.MouseEvent) {
        const { left, top, width, height } = currentTarget.getBoundingClientRect();
        const xPct = (clientX - left) / width - 0.5;
        const yPct = (clientY - top) / height - 0.5;
        x.set(xPct);
        y.set(yPct);
    }

    function onMouseLeave() {
        x.set(0);
        y.set(0);
    }

    const rotateX = useTransform(mouseY, [-0.5, 0.5], [7, -7]);
    const rotateY = useTransform(mouseX, [-0.5, 0.5], [-7, 7]);
    const brightness = useTransform(mouseY, [-0.5, 0.5], [1.1, 0.9]);

    return (
        <motion.div
            style={{
                y: y1,
                rotateX,
                rotateY,
                perspective: 1000,
                transformStyle: "preserve-3d"
            }}
            onMouseMove={onMouseMove}
            onMouseLeave={onMouseLeave}
            className="mt-20 relative mx-auto max-w-5xl group cursor-default"
        >
            <motion.div
                style={{ filter: useTransform(brightness, b => `brightness(${b})`) }}
                className="rounded-xl border border-white/10 bg-black/40 backdrop-blur-sm shadow-2xl overflow-hidden aspect-video relative"
            >
                <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

                {/* Mockup UI */}
                <div className="p-4 border-b border-white/10 flex items-center justify-between bg-white/5">
                    <div className="flex gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-500/50" />
                        <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                        <div className="w-3 h-3 rounded-full bg-green-500/50" />
                    </div>
                    <div className="text-xs text-muted-foreground font-mono">dashboard.startup-os.io</div>
                </div>
                <div className="p-8 grid grid-cols-4 gap-6 h-full">
                    {/* Sidebar Mock */}
                    <div className="col-span-1 space-y-4 opacity-80">
                        <div className="h-8 w-24 bg-white/10 rounded flex items-center px-2"><Layout className="w-4 h-4 mr-2 opacity-50" /></div>
                        <div className="h-4 w-16 bg-white/5 rounded ml-2" />
                        <div className="h-4 w-20 bg-white/5 rounded ml-2" />
                        <div className="h-4 w-14 bg-white/5 rounded ml-2" />

                        <div className="mt-8 h-32 w-full bg-white/5 rounded-lg border border-white/5 p-4 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-16 h-16 bg-green-500/20 blur-xl" />
                            <div className="text-xs text-muted-foreground mb-2">Startup Health</div>
                            <div className="text-2xl font-bold text-green-400">85/100</div>
                            <div className="w-full h-1 bg-white/10 rounded-full mt-2">
                                <div className="w-[85%] h-full bg-green-500 rounded-full shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
                            </div>
                        </div>
                    </div>

                    {/* Main Content Mock */}
                    <div className="col-span-3 space-y-6">
                        {/* Top Stats */}
                        <div className="grid grid-cols-3 gap-4">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="h-24 rounded-lg bg-white/5 p-4 border border-white/5 flex flex-col justify-between hover:bg-white/10 transition-colors">
                                    <div className="w-8 h-8 rounded bg-primary/20" />
                                    <div className="h-4 w-12 bg-white/10 rounded" />
                                </div>
                            ))}
                        </div>
                        {/* Chart Mock */}
                        <div className="h-40 w-full rounded-lg bg-white/5 border border-white/5 p-4 flex items-end justify-between px-8 gap-2 relative overflow-hidden">
                            <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-primary/10 to-transparent" />
                            {[40, 60, 45, 70, 80, 50, 90, 85].map((h, i) => (
                                <div key={i} className="w-full bg-primary/40 hover:bg-primary/60 transition-all duration-300 rounded-t-sm" style={{ height: `${h}%` }} />
                            ))}
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Reflection */}
            <div className="absolute bottom-[-20px] left-0 right-0 h-20 bg-gradient-to-t from-transparent to-primary/5 blur-xl transform scale-y-[-1] opacity-30" />
        </motion.div>
    );
}
