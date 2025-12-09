import React from "react";
import './BudgetComparison.css';
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend,
} from "chart.js";
import DailyBudget from "./Doughnuts/DailyBudget";
import DailyExpenses from "./Doughnuts/DailyExpenses";
import AverageExpenses from "./Doughnuts/AverageExpenses";
import ExpenseModel from "../../../Models/ExpenseModel";
import Categories from "./Doughnuts/Categories";
import ExpectedSavings from "./Doughnuts/ExpectedSavings";
import BudgetModel from "../../../Models/BudgetModel";

// Register required Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

// Define props for the BudgetComparison component
type BudgetComparisonProps = {
    currentExpenses: number;
    dailyExpenses: number;
    savingTarget: number;
    expectedIncome: number;
    overallExpenses: number;
    overallIncome: number;
    currentMonthDays: number;
    daysPassed: number;
    categoriesExpenses: ExpenseModel[];
    recExpensesAmount: number;
    budgets: BudgetModel[];
};

export const externalTooltipHandler = (context: any) => {
    const { chart, tooltip } = context;
    const canvas = chart.canvas as HTMLCanvasElement;
    const parent = canvas.parentNode as HTMLElement;

    // Create tooltip element if it doesn't exist
    let tooltipEl = parent.querySelector(
        ".chartjs-external-tooltip"
    ) as HTMLDivElement | null;

    if (!tooltipEl) {
        tooltipEl = document.createElement("div");
        tooltipEl.className = "chartjs-external-tooltip";
        tooltipEl.style.position = "absolute";
        tooltipEl.style.pointerEvents = "none";
        tooltipEl.style.zIndex = "9999"; // 👈 ABOVE your title
        parent.appendChild(tooltipEl);
    }

    // Hide tooltip if no opacity
    if (tooltip.opacity === 0) {
        tooltipEl.style.opacity = "0";
        return;
    }

    // Set content
    if (tooltip.body) {
        const bodyLines = tooltip.body.map((b: any) => b.lines).flat();
        const titleLines = tooltip.title || [];

        tooltipEl.innerHTML = `
            <div class="chartjs-tooltip-inner">
                ${titleLines.length ? `<div class="tooltip-title">${titleLines.join("<br>")}</div>` : ""}
                ${bodyLines.length ? `<div class="tooltip-body">${bodyLines.join("<br>")}</div>` : ""}
            </div>
            `;
    }

    const { offsetLeft, offsetTop } = canvas;

    // Position tooltip
    tooltipEl.style.opacity = "1";
    tooltipEl.style.left = offsetLeft + tooltip.caretX + "px";
    tooltipEl.style.top = offsetTop + tooltip.caretY + "px";
};

const BudgetComparison: React.FC<BudgetComparisonProps> = ({
    currentExpenses,
    dailyExpenses,
    savingTarget,
    expectedIncome,
    currentMonthDays,
    daysPassed,
    categoriesExpenses,
    recExpensesAmount,
    budgets,
}) => {

    const filteredCategoriesExpenses = categoriesExpenses?.filter(expense => expense.category) || [];

    // Calculate daily budget for stats
    const dailyBudget = Math.floor(
        ((expectedIncome ?? 0) - recExpensesAmount - (savingTarget ?? 0)) / Math.max(1, currentMonthDays)
    );

    return (
        <div className="budget-comparison">
            <div className="doughnut-card">
                <DailyBudget
                    expectedIncome={expectedIncome}
                    savingTarget={savingTarget}
                    currentMonthDays={currentMonthDays}
                    recExpensesAmount={recExpensesAmount}
                />
                <div className="doughnut-stats">
                    <div className="stat-item">
                        <div className="stat-value">
                            ₪{expectedIncome?.toLocaleString("en-US") || 0}
                        </div>
                        <div className="stat-label">הכנסה צפויה</div>
                    </div>
                    <div className="stat-item">
                        <div className="stat-value">
                            ₪{recExpensesAmount?.toLocaleString("en-US") || 0}
                        </div>
                        <div className="stat-label">הוצאות קבועות</div>
                    </div>
                </div>
            </div>

            {dailyExpenses !== null && (
                <div className="doughnut-card">
                    <DailyExpenses
                        dailyExpenses={dailyExpenses}
                        expectedIncome={expectedIncome}
                        savingTarget={savingTarget}
                        currentMonthDays={currentMonthDays}
                        recExpensesAmount={recExpensesAmount}
                    />
                    <div className="doughnut-stats">
                        <div className="stat-item">
                            <div className={`stat-value ${dailyExpenses <= dailyBudget ? 'positive' : 'negative'}`}>
                                {dailyExpenses <= dailyBudget ? '✓' : '✗'}
                            </div>
                            <div className="stat-label">
                                {dailyExpenses <= dailyBudget ? 'בתקציב' : 'חורג'}
                            </div>
                        </div>
                        <div className="stat-item">
                            <div className="stat-value" style={{ color: dailyExpenses <= dailyBudget ? 'green' : 'red' }}>
                                ₪{Math.abs(dailyBudget - dailyExpenses).toLocaleString("en-US")}
                            </div>
                            <div className="stat-label">
                                {dailyExpenses <= dailyBudget ? 'נחסך' : 'חריגה'}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {currentExpenses !== null && (
                <>
                    <div className="doughnut-card">
                        <AverageExpenses
                            currentExpenses={currentExpenses}
                            daysPassedFromStart={daysPassed}
                            expectedIncome={expectedIncome}
                        />
                        <div className="doughnut-stats">
                            <div className="stat-item">
                                <div className="stat-value">
                                    ₪{currentExpenses.toLocaleString("en-US")}
                                </div>
                                <div className="stat-label">הוצאות החודש</div>
                            </div>
                            <div className="stat-item">
                                <div className="stat-value">
                                    {daysPassed}
                                </div>
                                <div className="stat-label">ימים עברו</div>
                            </div>
                        </div>
                    </div>

                    <div className="doughnut-card">
                        <ExpectedSavings
                            expectedIncome={expectedIncome}
                            currentExpenses={currentExpenses}
                            daysPassedFromStart={daysPassed}
                            currentMonthDays={currentMonthDays}
                            recExpensesAmount={recExpensesAmount}
                        />
                        <div className="doughnut-stats">
                            <div className="stat-item">
                                <div className="stat-value">
                                    ₪{savingTarget?.toLocaleString("en-US") || 0}
                                </div>
                                <div className="stat-label">יעד חיסכון</div>
                            </div>
                            <div className="stat-item">
                                <div className="stat-value">
                                    {currentMonthDays - daysPassed}
                                </div>
                                <div className="stat-label">ימים נותרו</div>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {filteredCategoriesExpenses.length > 0 && (
                <div className="doughnut-card">
                    <Categories categoriesExpenses={filteredCategoriesExpenses} />
                    <div className="doughnut-stats">
                        <div className="stat-item">
                            <div className="stat-value">
                                {filteredCategoriesExpenses.length}
                            </div>
                            <div className="stat-label">הוצאות</div>
                        </div>
                        <div className="stat-item">
                            <div className="stat-value">
                                {new Set(filteredCategoriesExpenses.map(e => e.category)).size}
                            </div>
                            <div className="stat-label">קטגוריות</div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BudgetComparison;
