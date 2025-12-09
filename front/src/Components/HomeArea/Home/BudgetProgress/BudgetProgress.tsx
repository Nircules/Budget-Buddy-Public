import React, { useState } from "react";
import "./BudgetProgress.css";
import BudgetModel from "../../../../Models/BudgetModel";
import EditBudget from "../../../AddBudget/EditBudget";

type BudgetProgressProps = {
    budgets: BudgetModel[];
};

const BudgetProgress: React.FC<BudgetProgressProps> = ({ budgets }) => {
    const [selectedBudget, setSelectedBudget] = useState<BudgetModel>(budgets[0]);
    const getProgressColor = (remaining: number, total: number) => {
        const percentage = (remaining / total) * 100;
        if (percentage > 50) return "#4caf50"; // Green - healthy
        if (percentage > 20) return "#ff9800"; // Orange - warning
        if (percentage >= 0) return "#f44336"; // Red - critical
        return "#9c27b0"; // Purple - overspent
    };

    const getProgressPercentage = (remaining: number, total: number) => {
        const percentage = (remaining / total) * 100;
        return Math.max(0, Math.min(100, percentage)); // Clamp between 0-100
    };


    const handleEditBudget = (budget: BudgetModel) => {
        setSelectedBudget(budget);
        const editBudgetContainer = document.getElementById("edit-budget-overlay");
        if (editBudgetContainer) {
            editBudgetContainer.classList.add("visible");
        }
    };

    return (
        <div className="budget-progress-section">
            {selectedBudget && <EditBudget budget={selectedBudget} />}
            <h2>תקציבים</h2>
            <div className="budget-cards-container">
                {budgets.map((budget) => {
                    const percentage = getProgressPercentage(
                        budget.remaining_amount,
                        budget.amount
                    );
                    const color = getProgressColor(
                        budget.remaining_amount,
                        budget.amount
                    );
                    const isOverspent = budget.remaining_amount < 0;

                    return (
                        <div key={budget.id} className="budget-card">
                            <div className="budget-header">
                                <h3>{budget.name}</h3>
                                <span className="budget-amounts">
                                    ₪{Number(budget.remaining_amount).toLocaleString("en-US")} / ₪
                                    {Number(budget.amount).toLocaleString("en-US")}
                                </span>
                                <button className="edit-category-button" title="ערוך תקציב" onClick={() => handleEditBudget(budget)}>
                                    <i className="fas fa-edit"></i>
                                </button>
                            </div>
                            <div className="budget-progress-bar">
                                <div
                                    className="budget-progress-fill"
                                    style={{
                                        width: `${percentage}%`,
                                        backgroundColor: color,
                                    }}
                                ></div>
                            </div>
                            <div className="budget-footer">
                                {isOverspent ? (
                                    <span className="budget-status overspent">
                                        חרגת מהתקציב ב-₪
                                        {Math.abs(budget.remaining_amount).toLocaleString("en-US")}
                                    </span>
                                ) : (
                                    <span className="budget-status">
                                        {percentage.toFixed(0)}% נותרו
                                    </span>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default BudgetProgress;
