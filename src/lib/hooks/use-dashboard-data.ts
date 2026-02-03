"use client";

import { useEffect, useState } from "react";
import { collection, doc, onSnapshot, query, orderBy, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/contexts/AuthContext";

export interface Goal {
    id: string;
    title: string;
    type: "Validation" | "Product" | "Sales" | "Fundraising";
    status: "On Track" | "At Risk" | "Completed" | "Behind";
    progress: number;
    ownerId?: string;
    createdAt: any;
    dueDate?: any;
}

export interface Task {
    id: string;
    title: string;
    status: "To Do" | "In Progress" | "Done";
    priority: "Low" | "Medium" | "High";
    goalId?: string;
    assigneeId?: string;
    dueDate?: any;
}

export interface Milestone {
    id: string;
    title: string;
    description: string;
    status: "Pending" | "Achieved" | "Missed";
    dueDate: any;
}

export interface TeamMember {
    id: string;
    name: string;
    role: string;
    email: string;
    avatar?: string;
    activityScore?: number;
}

export function useDashboardData() {
    const { user } = useAuth();
    const [startup, setStartup] = useState<any>(null);
    const [goals, setGoals] = useState<Goal[]>([]);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [milestones, setMilestones] = useState<Milestone[]>([]);
    const [team, setTeam] = useState<TeamMember[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) {
            setLoading(false);
            return;
        }

        const startupRef = doc(db, "startups", user.uid);

        // 1. Listen to Startup Doc
        const unsubStartup = onSnapshot(startupRef, (doc) => {
            if (doc.exists()) {
                setStartup(doc.data());
            } else {
                setStartup(null);
            }
        });

        // 2. Listen to Goals
        const goalsQuery = query(collection(db, `startups/${user.uid}/goals`), orderBy("createdAt", "desc"));
        const unsubGoals = onSnapshot(goalsQuery, (snapshot) => {
            setGoals(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Goal)));
        });

        // 3. Listen to Tasks
        const tasksQuery = query(collection(db, `startups/${user.uid}/tasks`), orderBy("createdAt", "desc"));
        const unsubTasks = onSnapshot(tasksQuery, (snapshot) => {
            setTasks(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Task)));
        });

        // 4. Listen to Milestones
        const milestonesQuery = query(collection(db, `startups/${user.uid}/milestones`));
        const unsubMilestones = onSnapshot(milestonesQuery, (snapshot) => {
            setMilestones(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Milestone)));
        });

        // 5. Listen to Team
        const teamQuery = query(collection(db, `startups/${user.uid}/team`));
        const unsubTeam = onSnapshot(teamQuery, (snapshot) => {
            setTeam(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as TeamMember)));
        });

        setLoading(false);

        return () => {
            unsubStartup();
            unsubGoals();
            unsubTasks();
            unsubMilestones();
            unsubTeam();
        };
    }, [user]);

    return { startup, goals, tasks, milestones, team, loading };
}
