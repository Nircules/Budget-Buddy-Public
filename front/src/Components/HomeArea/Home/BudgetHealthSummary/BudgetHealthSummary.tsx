import React, { useMemo } from "react";
import "./BudgetHealthSummary.css";
import BudgetModel from "../../../../Models/BudgetModel";

type BudgetHealthSummaryProps = {
    budgets: BudgetModel[];           // User's budgets for the current month
    expectedIncome: number;           // User's expected monthly income
    currentExpenses: number;          // Total expenses so far this month
    savingTarget: number;             // User's monthly savings goal
    daysRemaining: number;            // Days left in the current pay period
};

/**
 * BudgetHealthSummary Component
 * 
 * Displays an overall financial health score (0-100) based on:
 * - Spending rate (expenses vs income)
 * - Budget performance (overspent, at-risk, or healthy)
 * - Time-awareness (considers days passed in the month)
 * - Savings goal tracking
 * 
 * The component shows:
 * - Health score with transparent breakdown of deductions
 * - Status indicator (excellent/good/warning/critical)
 * - Metric cards showing budget counts and savings status
 * - Contextual insights based on financial health
 */
const BudgetHealthSummary: React.FC<BudgetHealthSummaryProps> = ({
    budgets,
    expectedIncome,
    currentExpenses,
    savingTarget,
    daysRemaining,
}) => {
    const healthMetrics = useMemo(() => {
        // ═══════════════════════════════════════════════════════════
        // STEP 1: Calculate Basic Budget Metrics
        // ═══════════════════════════════════════════════════════════
        const totalRemaining = budgets.reduce((sum, b) => sum + b.remaining_amount, 0);

        // ═══════════════════════════════════════════════════════════
        // STEP 2: Calculate Time Progress
        // ═══════════════════════════════════════════════════════════
        // Used to make scoring time-aware: if 70% of month passed, 30% budget remaining is acceptable
        const totalDays = 30; // approximate month length
        const daysPassed = totalDays - daysRemaining;
        const timeProgress = totalDays > 0 ? (daysPassed / totalDays) * 100 : 0;

        // ═══════════════════════════════════════════════════════════
        // STEP 3: Identify At-Risk and Overspent Budgets
        // ═══════════════════════════════════════════════════════════

        // Budgets are "at risk" if they're depleting FASTER than time is passing
        // Example: 10% budget left with 50% time remaining = at risk (spending too fast)
        // Example: 10% budget left with 90% time passed = OK (good pacing)
        const budgetsAtRisk = budgets.filter((b) => {
            if (b.amount === 0 || b.remaining_amount < 0) return false;
            const budgetRemaining = (b.remaining_amount / b.amount) * 100;
            // Risk threshold: budget % should be at least half of time remaining %
            const expectedRemaining = (100 - timeProgress) * 0.5;
            return budgetRemaining < expectedRemaining && budgetRemaining < 20;
        }).length;

        // Count budgets that have gone negative (overspent)
        const overspentBudgets = budgets.filter((b) => b.remaining_amount < 0).length;

        // ═══════════════════════════════════════════════════════════
        // STEP 4: Calculate Health Score (Base: 100 - Spending Rate)
        // ═══════════════════════════════════════════════════════════

        // Track all deductions for transparency (shown to user)
        const deductions: { reason: string; points: number }[] = [];

        // Calculate spending rate: what % of expected income has been spent?
        const spendingRate = expectedIncome > 0 ? (currentExpenses / expectedIncome) * 100 : 0;

        // Base score starts at 100 and decreases based on spending rate
        // If you spent 40% of income, score starts at 60
        let healthScore = Math.max(0, 100 - spendingRate);

        // Only track spending as a deduction if there are actual expenses
        const spendingPoints = Math.round(Math.min(100, spendingRate));
        if (spendingPoints > 0) {
            deductions.push({
                reason: `הוצאות ${Math.round(spendingRate)}% מההכנסה`,
                points: spendingPoints
            });
        }

        // ═══════════════════════════════════════════════════════════
        // STEP 5: Apply Penalties for Budget Mismanagement
        // ═══════════════════════════════════════════════════════════

        // Penalty: Overspent budgets (went over the allocated amount)
        // Heavy penalty because this indicates poor budget adherence
        if (overspentBudgets > 0) {
            const penalty = overspentBudgets * 15;  // 15 points per overspent budget
            healthScore -= penalty;
            deductions.push({
                reason: `${overspentBudgets} תקציבים חרגו`,
                points: penalty
            });
        }

        // Penalty: At-risk budgets (depleting faster than time is passing)
        // Moderate penalty as these budgets may go over if pace continues
        if (budgetsAtRisk > 0) {
            const penalty = budgetsAtRisk * 8;  // 8 points per at-risk budget
            healthScore -= penalty;
            deductions.push({
                reason: `${budgetsAtRisk} תקציבים בסיכון`,
                points: penalty
            });
        }

        // ═══════════════════════════════════════════════════════════
        // STEP 6: Time-Adjusted Budget Health Penalty
        // ═══════════════════════════════════════════════════════════

        // Calculate average budget health across all budgets
        // Then compare to expected health based on time passed
        if (budgets.length > 0) {
            const avgBudgetHealth = budgets.reduce((sum, b) => {
                if (b.amount === 0) return sum;
                const percentage = (b.remaining_amount / b.amount) * 100;
                return sum + Math.max(0, Math.min(100, percentage));
            }, 0) / budgets.length;

            // Expected budget health: if 70% of month passed, 30% remaining is acceptable
            const expectedBudgetRemaining = 100 - timeProgress;

            // Apply penalty if budgets are draining significantly faster than expected
            if (avgBudgetHealth < expectedBudgetRemaining - 30) {
                healthScore -= 10;
                deductions.push({
                    reason: `תקציבים מתרוקנים מהר מדי (${Math.round(avgBudgetHealth)}%)`,
                    points: 10
                });
            } else if (avgBudgetHealth < expectedBudgetRemaining - 15) {
                healthScore -= 5;
                deductions.push({
                    reason: `קצב הוצאות מהיר (${Math.round(avgBudgetHealth)}%)`,
                    points: 5
                });
            }
        }

        // ═══════════════════════════════════════════════════════════
        // STEP 7: Savings Goal Penalty
        // ═══════════════════════════════════════════════════════════

        // Check if user is on track to meet their savings goal
        // Simple check: current income - current expenses - savings target
        const projectedSavings = expectedIncome - currentExpenses - savingTarget;
        if (savingTarget > 0 && projectedSavings < 0) {
            healthScore -= 10;
            deductions.push({
                reason: `לא במסלול ליעד חיסכון`,
                points: 10
            });
        }

        // ═══════════════════════════════════════════════════════════
        // STEP 8: Finalize Score and Determine Status
        // ═══════════════════════════════════════════════════════════

        // Ensure score stays within 0-100 range
        healthScore = Math.max(0, Math.min(100, healthScore));

        // Determine status category and UI elements based on final score
        let status: "excellent" | "good" | "warning" | "critical";
        let statusText: string;
        let statusIcon: string;

        if (healthScore >= 80) {
            status = "excellent";
            statusText = "מצוין";
            statusIcon = "✨";
        } else if (healthScore >= 60) {
            status = "good";
            statusText = "טוב";
            statusIcon = "👍";
        } else if (healthScore >= 40) {
            status = "warning";
            statusText = "זהירות";
            statusIcon = "⚠️";
        } else {
            status = "critical";
            statusText = "דורש תשומת לב";
            statusIcon = "🚨";
        }

        // ═══════════════════════════════════════════════════════════
        // STEP 9: Determine Savings Goal Status
        // ═══════════════════════════════════════════════════════════

        // Check if on track for savings (simple current state check)
        const onTrackForSavings = (expectedIncome - currentExpenses - savingTarget) >= 0;

        // ═══════════════════════════════════════════════════════════
        // Return all calculated metrics for rendering
        // ═══════════════════════════════════════════════════════════
        return {
            healthScore,          // Final score (0-100)
            status,               // Status category for styling
            statusText,           // Hebrew status text
            statusIcon,           // Emoji for status
            budgetsAtRisk,        // Count of at-risk budgets
            overspentBudgets,     // Count of overspent budgets
            totalBudgets: budgets.length,
            onTrackForSavings,    // Boolean: on track for savings?
            totalRemaining,       // Total money left in all budgets
            deductions,           // Array of deduction reasons & points
        };
    }, [budgets, expectedIncome, currentExpenses, savingTarget, daysRemaining]);

    // ═══════════════════════════════════════════════════════════
    // RENDER: Health Score Card with Metrics
    // ═══════════════════════════════════════════════════════════
    return (
        <div className={`budget-health-summary ${healthMetrics.status}`}>
            {/* Header: Score, Breakdown, and Status */}
            <div className="health-header">
                {/* Left: Health Score Display */}
                <div className="health-score-container">
                    <div className="health-score">{Math.round(healthMetrics.healthScore)}</div>
                    <div className="health-score-label">ציון בריאות תקציבית</div>
                </div>

                {/* Center: Deduction Breakdown (only shown if there are deductions) */}
                {healthMetrics.deductions.length > 0 && (
                    <div className="score-breakdown">
                        {healthMetrics.deductions.map((deduction, index) => (
                            <div key={index} className="breakdown-item">
                                <span className="breakdown-reason">{deduction.reason}</span>
                                <span className="breakdown-points">{deduction.points}-</span>
                            </div>
                        ))}
                    </div>
                )}

                {/* Right: Status Indicator */}
                <div className="health-status">
                    <span className="status-icon">{healthMetrics.statusIcon}</span>
                    <span className="status-text">{healthMetrics.statusText}</span>
                </div>
            </div>

            {/* Metric Cards: Budget Counts and Key Stats */}
            <div className="health-metrics">
                {/* Always show: Healthy budgets count */}
                <div className="metric-card">
                    <div className="metric-icon">📊</div>
                    <div className="metric-content">
                        <div className="metric-value">
                            {healthMetrics.totalBudgets - healthMetrics.budgetsAtRisk - healthMetrics.overspentBudgets}/{healthMetrics.totalBudgets}
                        </div>
                        <div className="metric-label">תקציבים תקינים</div>
                    </div>
                </div>

                {healthMetrics.budgetsAtRisk > 0 && (
                    <div className="metric-card warning">
                        <div className="metric-icon">⚠️</div>
                        <div className="metric-content">
                            <div className="metric-value">{healthMetrics.budgetsAtRisk}</div>
                            <div className="metric-label">תקציבים בסיכון</div>
                        </div>
                    </div>
                )}

                {healthMetrics.overspentBudgets > 0 && (
                    <div className="metric-card critical">
                        <div className="metric-icon">🚨</div>
                        <div className="metric-content">
                            <div className="metric-value">{healthMetrics.overspentBudgets}</div>
                            <div className="metric-label">תקציבים חרגו</div>
                        </div>
                    </div>
                )}

                {savingTarget > 0 && (
                    <div className={`metric-card ${healthMetrics.onTrackForSavings}`}>
                        <div className="metric-icon">{healthMetrics.onTrackForSavings ? "✅" : "⚠️"}</div>
                        <div className="metric-content">
                            <div className="metric-value">
                                {healthMetrics.onTrackForSavings ? "במסלול" : "מחוץ למסלול"}
                            </div>
                            <div className="metric-label">יעד חיסכון</div>
                        </div>
                    </div>
                )}

                <div className="metric-card">
                    <div className="metric-icon">📅</div>
                    <div className="metric-content">
                        <div className="metric-value">{daysRemaining}</div>
                        <div className="metric-label">ימים נותרו</div>
                    </div>
                </div>
            </div>

            {healthMetrics.status === "excellent" && (
                <div className="health-insight success">
                    🎉 עבודה מעולה! התקציבים שלך מאוזנים ואתה במסלול להצלחה
                </div>
            )}

            {healthMetrics.status === "good" && (
                <div className="health-insight info">
                    👍 ביצועים טובים! המשך לעקוב אחר ההוצאות שלך
                </div>
            )}

            {healthMetrics.status === "warning" && (
                <div className="health-insight warning">
                    ⚠️ שים לב להוצאות - כמה תקציבים דורשים תשומת לב
                </div>
            )}

            {healthMetrics.status === "critical" && (
                <div className="health-insight critical">
                    🚨 נדרשת פעולה! חלק מהתקציבים חרגו או בסיכון גבוה
                </div>
            )}
        </div>
    );
};

export default BudgetHealthSummary;
