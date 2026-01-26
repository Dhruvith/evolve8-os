"use client";

import { useEffect, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import { ArrowRight, BarChart3, CheckCircle, Target, Zap, Layout, Layers, Shield, Database } from "lucide-react";
import { TiltMockup } from "@/components/layout/TiltMockup";
import { Button } from "@/components/ui/button";
import { Spotlight } from "@/components/ui/spotlight";
import { BentoGrid, BentoGridItem } from "@/components/ui/bento-grid";
import { ButtonMovingBorder } from "@/components/ui/moving-border";

export default function LandingPage() {
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 500], [0, 200]);

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  return (
    <main className="min-h-screen bg-black text-white relative overflow-hidden font-sans selection:bg-white/20">

      {/* Spotlight Effect */}
      <Spotlight className="-top-40 left-0 md:left-60 md:-top-20" fill="white" />

      {/* Navbar - Minimal Apple Style */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-black/50 backdrop-blur-xl">
        <div className="container mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg font-semibold tracking-tight text-white/90">StartupOS</span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/login" className="text-sm font-medium text-white/60 hover:text-white transition-colors">
              Login
            </Link>
            <Link href="/onboarding">
              <Button size="sm" className="bg-white text-black hover:bg-white/90 rounded-full px-4 text-xs font-semibold h-8 disabled:opacity-50">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section - The Apple "Big" Feel */}
      <section className="relative z-10 pt-32 pb-20 md:pt-48 md:pb-32 container mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="max-w-5xl mx-auto space-y-8"
        >
          <h1 className="text-5xl md:text-8xl font-semibold tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-white to-white/40 pb-4">
            The Operating System <br /> for Founders.
          </h1>
          <p className="text-xl md:text-2xl text-white/50 max-w-2xl mx-auto leading-relaxed">
            Track progress. Enforce discipline. Unlock investor readiness. <br className="hidden md:block" />
            Everything you need to build a billion-dollar company.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-4">
            <Link href="/onboarding">
              <ButtonMovingBorder
                borderRadius="1.75rem"
                className="bg-black text-white border-neutral-800 font-medium"
              >
                Start Building
              </ButtonMovingBorder>
            </Link>
            <Button variant="ghost" className="text-white/60 hover:text-white hover:bg-transparent text-lg">
              View the film <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </div>
        </motion.div>

        {/* Cinematic Dashboard Preview */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.2, ease: "circOut" }}
          className="mt-20 relative mx-auto max-w-6xl"
        >
          <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-zinc-900/50 backdrop-blur-sm aspect-[16/10] group">
            {/* Abstract Data Viz / Dashboard Placeholder Video or Image */}
            <img
              src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2670&auto=format&fit=crop"
              alt="App Dashboard"
              className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-1000 ease-in-out"
            />

            {/* Overlay UI Mockup (Code overlay to look techy) */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />

            <div className="absolute bottom-10 left-10 md:bottom-20 md:left-20 text-left">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-xs font-mono text-green-400">SYSTEM ONLINE</span>
              </div>
              <h3 className="text-3xl font-bold">Real-time Metrics</h3>
              <p className="text-white/60 max-w-md">Live tracking of your startup's vital signs.</p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Trusted By - Minimal monochrome */}
      <section className="py-12 border-y border-white/5 bg-zinc-950">
        <div className="container mx-auto px-6 text-center">
          <p className="text-xs font-medium text-white/30 tracking-widest mb-8">POWERING THE NEXT GENERATION OF UNICORNS</p>
          <div className="flex flex-wrap justify-center items-center gap-12 sm:gap-20 opacity-40 grayscale hover:grayscale-0 transition-grayscale duration-500">
            {/* Iconic Fonts or SVGs would be better, using simple text for minimalist placeholder */}
            <span className="text-xl font-bold font-mono">ACME</span>
            <span className="text-xl font-bold font-mono">STRIPE</span>
            <span className="text-xl font-bold font-mono">VERCEL</span>
            <span className="text-xl font-bold font-mono">LINEAR</span>
            <span className="text-xl font-bold font-mono">NOTION</span>
          </div>
        </div>
      </section>

      {/* Features - Bento Grid Style */}
      <section className="py-32 container mx-auto px-6 bg-black relative">
        <div className="max-w-4xl mx-auto text-center mb-20 space-y-4">
          <h2 className="text-4xl md:text-5xl font-semibold tracking-tight">Everything you need. <br /> <span className="text-white/40">Nothing you don't.</span></h2>
          <p className="text-lg text-white/50">Designed to remove friction and accelerate execution.</p>
        </div>

        <BentoGrid className="max-w-6xl mx-auto">
          <BentoGridItem
            title="Goal Tracking"
            description="Set quarterly OKRs and track them with precision."
            header={<div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-gradient-to-br from-neutral-900 to-neutral-800 border border-white/5" />}
            icon={<Target className="h-4 w-4 text-neutral-300" />}
            className="md:col-span-2"
          />
          <BentoGridItem
            title="Investor Ready"
            description="Auto-generate reports for your board meetings."
            header={<div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-gradient-to-br from-neutral-900 to-neutral-800 border border-white/5" />}
            icon={<BarChart3 className="h-4 w-4 text-neutral-300" />}
            className="md:col-span-1"
          />
          <BentoGridItem
            title="Team Sync"
            description="Keep everyone aligned on the critical path."
            header={<div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-gradient-to-br from-neutral-900 to-neutral-800 border border-white/5" />}
            icon={<Layout className="h-4 w-4 text-neutral-300" />}
            className="md:col-span-1"
          />
          <BentoGridItem
            title="Health Score"
            description="Quantify your startup's viability in real-time."
            header={<div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-gradient-to-br from-neutral-900 to-neutral-800 border border-white/5" />}
            icon={<Zap className="h-4 w-4 text-neutral-300" />}
            className="md:col-span-2"
          />
        </BentoGrid>
      </section>

      {/* Apple-style Large Feature Highlight */}
      <section className="py-32 bg-zinc-950 relative overflow-hidden">
        <div className="container mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <h2 className="text-4xl md:text-6xl font-semibold tracking-tighter">Your Startup's DNA. <br /> <span className="text-white/40">Visualized.</span></h2>
            <p className="text-xl text-white/50 leading-relaxed">
              Capture the core of your business. From problem statements to revenue models,
              StartupOS maps your DNA to ensure you never lose sight of the mission.
            </p>
            <ul className="space-y-4 text-white/70">
              <li className="flex items-center gap-3"><CheckCircle className="w-5 h-5 text-blue-500" /> Dynamic Problem/Solution Mapping</li>
              <li className="flex items-center gap-3"><CheckCircle className="w-5 h-5 text-blue-500" /> Real-time Pivot Tracking</li>
              <li className="flex items-center gap-3"><CheckCircle className="w-5 h-5 text-blue-500" /> Integrated Lean Canvas</li>
            </ul>
          </div>
          <div className="relative h-[600px] w-full rounded-2xl overflow-hidden border border-white/10 bg-black">
            <img
              src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop"
              className="absolute inset-0 w-full h-full object-cover opacity-60 hover:scale-105 transition-transform duration-1000"
              alt="Abstract DNA"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
          </div>
        </div>
      </section>

      {/* CTA Section - Minimal */}
      <section className="py-40 container mx-auto px-6 text-center">
        <div className="max-w-3xl mx-auto space-y-8">
          <h2 className="text-5xl md:text-7xl font-semibold tracking-tighter">Ready to build?</h2>
          <p className="text-xl text-white/50">Join the thousands of founders shipping faster.</p>
          <Link href="/onboarding">
            <Button size="lg" className="h-14 px-8 rounded-full text-lg bg-white text-black hover:bg-neutral-200 transition-colors">
              Start your journey
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer - Apple Style */}
      <footer className="border-t border-white/10 py-12 bg-black text-xs text-neutral-500">
        <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p>© 2026 Evolve8 Studio. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-white transition-colors">Twitter</a>
          </div>
        </div>
      </footer>
    </main>
  );
}
