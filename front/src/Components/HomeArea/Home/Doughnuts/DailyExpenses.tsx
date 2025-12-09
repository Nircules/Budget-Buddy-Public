import React, { useMemo } from 'react'
import { Doughnut } from "react-chartjs-2";
import { doughnutColors } from './DoughnutColors';
import { motion } from 'framer-motion';
import { externalTooltipHandler } from '../BudgetComparison';

type DailyExpensesProps = {
    dailyExpenses: number;
    expectedIncome: number;
    savingTarget: number;
    currentMonthDays: number;
    recExpensesAmount: number;
}

const DailyExpenses: React.FC<DailyExpensesProps> = ({ dailyExpenses, expectedIncome, savingTarget, currentMonthDays, recExpensesAmount }) => {
    const dailyBudget = useMemo(() => {
        const remainingBalance = (expectedIncome ?? 0) - recExpensesAmount - (savingTarget ?? 0);

        return Math.floor(remainingBalance / Math.max(1, currentMonthDays)); // Ensure no division by zero
    }, [expectedIncome, savingTarget, currentMonthDays, recExpensesAmount]);

    const remainingBudget = dailyBudget - dailyExpenses;

    const dailyExpensesData = useMemo(() => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return null;

        const gradient1 = ctx.createRadialGradient(150, 150, 0, 150, 150, 150);
        gradient1.addColorStop(0, doughnutColors.lightRed);
        gradient1.addColorStop(1, doughnutColors.red);

        const gradient_hover1 = ctx.createRadialGradient(150, 150, 0, 150, 150, 150);
        gradient_hover1.addColorStop(0, doughnutColors.hoverLightRed);
        gradient_hover1.addColorStop(1, doughnutColors.hoverRed);

        const gradient2 = ctx.createRadialGradient(150, 150, 0, 150, 150, 150);
        gradient2.addColorStop(0, doughnutColors.lightRed2);
        gradient2.addColorStop(1, doughnutColors.red2);

        const gradient2_hover = ctx.createRadialGradient(150, 150, 0, 150, 150, 150);
        gradient2_hover.addColorStop(0, doughnutColors.hoverLightRed2);
        gradient2_hover.addColorStop(1, doughnutColors.hoverRed2);

        return {
            labels: ["הוצאות היום", "תקציב נותר"],
            datasets: [
                {
                    data: [Math.max(0.0001, dailyExpenses), remainingBudget < 0 ? Math.max(0.0001, remainingBudget) : remainingBudget],
                    borderWidth: 0,
                    backgroundColor: [gradient1, gradient2],
                    hoverBackgroundColor: [gradient_hover1, gradient2_hover],
                },
            ],
        };
    }, [dailyExpenses, remainingBudget]);

    return (
        <div className="motion-wrapper">

            <motion.div
                className="donutCenter"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}>
                <Doughnut
                    key={dailyExpenses}
                    data={dailyExpensesData}
                    options={{
                        responsive: true,
                        devicePixelRatio: window.devicePixelRatio,
                        plugins: {
                            legend: { display: false },
                            tooltip: {
                                enabled: false,                 // IMPORTANT: disable default tooltip
                                external: externalTooltipHandler as any, // we'll define it below
                            },
                        },
                    }}
                />
                <div className="motion-title">הוצאות היום</div>
                <div className={`motion-value`}>
                    {`${dailyExpenses.toLocaleString()} ₪`}
                </div>
            </motion.div>
        </div>
    )
}

export default DailyExpenses