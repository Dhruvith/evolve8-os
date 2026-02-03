import { Goal, Task, Milestone, TeamMember } from "@/lib/hooks/use-dashboard-data";
import { differenceInDays } from "date-fns";

export function calculateStartupScore(
    startup: any,
    goals: Goal[],
    tasks: Task[],
    milestones: Milestone[],
    team: TeamMember[]
): { score: number; breakup: any; trend: "up" | "down" | "neutral" } {
    if (!startup) return { score: 0, breakup: {}, trend: "neutral" };

    let score = 0;
    const breakup = {
        validation: 0,
        execution: 0,
        milestones: 0,
        team: 0,
        consistency: 0,
        readiness: 0
    };

    // 1. Idea Validation (20%)
    // Based on stage and DNA completeness
    if (["mvp", "revenue", "fundraising", "growth"].includes(startup.stage)) {
        breakup.validation = 20;
    } else if (startup.stage === "validation") {
        breakup.validation = 15;
    } else {
        breakup.validation = 10;
    }
    if (!startup.problem || !startup.revenueModel) breakup.validation -= 5;
    breakup.validation = Math.max(0, breakup.validation);
    score += breakup.validation;

    // 2. Execution (25%)
    // Task completion rate
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === "Done").length;
    if (totalTasks > 0) {
        breakup.execution = Math.round((completedTasks / totalTasks) * 25);
    } else {
        // If no tasks but goals exist
        breakup.execution = 5;
    }
    score += breakup.execution;

    // 3. Milestones (20%)
    const totalMilestones = milestones.length;
    const achieved = milestones.filter(m => m.status === "Achieved").length;
    if (totalMilestones > 0) {
        breakup.milestones = Math.round((achieved / totalMilestones) * 20);
    }
    score += breakup.milestones;

    // 4. Team Activity (15%)
    // Penalize if only 1 member (founder) or inactive
    if (team.length > 1 || (team.length === 1 && tasks.length > 5)) {
        breakup.team = 15;
    } else {
        breakup.team = 5;
    }
    score += breakup.team;

    // 5. Consistency (10%)
    // Last update check
    const lastUpdate = startup.lastUpdate ? new Date(startup.lastUpdate.seconds * 1000) : null;
    if (lastUpdate && differenceInDays(new Date(), lastUpdate) <= 7) {
        breakup.consistency = 10;
    } else {
        breakup.consistency = 0;
    }
    score += breakup.consistency;

    // 6. Investor Readiness (10%)
    // Checks for specific fields
    let readiness = 0;
    if (startup.pitchDeck) readiness += 4;
    if (startup.revenueModel) readiness += 3;
    if (startup.website) readiness += 3;
    breakup.readiness = readiness;
    score += readiness;

    // Calculate Trend (Simple logic for now: compare to previous stored score)
    const previousScore = startup.previousScore || 0;
    let trend: "up" | "down" | "neutral" = "neutral";
    if (score > previousScore) trend = "up";
    if (score < previousScore) trend = "down";

    return { score, breakup, trend };
}
