"use client";

import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/contexts/AuthContext";

export interface StartupData {
    name: string;
    stage: string;
    types: string[];
    healthScore?: number;
    goals?: any[];
    metrics?: any;
}

export function useStartupData() {
    const { user } = useAuth();
    const [data, setData] = useState<StartupData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) {
            setLoading(false);
            return;
        }

        const unsubscribe = onSnapshot(doc(db, "startups", user.uid), (doc) => {
            if (doc.exists()) {
                setData(doc.data() as StartupData);
            } else {
                setData(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user]);

    return { data, loading };
}
