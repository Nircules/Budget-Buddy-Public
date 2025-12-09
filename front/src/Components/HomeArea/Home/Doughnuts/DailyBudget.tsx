import React, { useMemo } from 'react'
import { Doughnut } from "react-chartjs-2";
import { doughnutColors } from './DoughnutColors';
import { motion } from 'framer-motion';
import { externalTooltipHandler } from '../BudgetComparison';

type DailyBudgetProps = {
    expectedIncome: number;
    savingTarget: number;
    currentMonthDays: number;
    recExpensesAmount: number;
};

const DailyBudget: React.FC<DailyBudgetProps> = ({ expectedIncome, savingTarget, currentMonthDays, recExpensesAmount }) => {
    const dailyBudget = useMemo(() => {
        const remainingBalance = (expectedIncome ?? 0) - recExpensesAmount - (savingTarget ?? 0);

        return Math.floor(remainingBalance / Math.max(1, currentMonthDays)); // Ensure no division by zero
    }, [expectedIncome, savingTarget, currentMonthDays, recExpensesAmount]);

    const dailyBudgetData = useMemo(() => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return null;

        const gradient1 = ctx.createRadialGradient(150, 150, 0, 150, 150, 150);
        gradient1.addColorStop(0, doughnutColors.blue);
        gradient1.addColorStop(1, doughnutColors.lightBlue);

        const gradient_hover1 = ctx.createRadialGradient(150, 150, 0, 150, 150, 150);
        gradient_hover1.addColorStop(0, doughnutColors.hoverBlue);
        gradient_hover1.addColorStop(1, doughnutColors.hoverLightBlue);

        const gradient2 = ctx.createRadialGradient(150, 150, 0, 150, 150, 150);
        gradient2.addColorStop(0, doughnutColors.blue2);
        gradient2.addColorStop(1, doughnutColors.lightBlue2);

        const gradient2_hover = ctx.createRadialGradient(150, 150, 0, 150, 150, 150);
        gradient2_hover.addColorStop(0, doughnutColors.hoverBlue2);
        gradient2_hover.addColorStop(1, doughnutColors.hoverLightBlue2);

        const gradient3 = ctx.createRadialGradient(150, 150, 0, 150, 150, 150);
        gradient3.addColorStop(0, doughnutColors.lightRed);
        gradient3.addColorStop(1, doughnutColors.red);

        const gradient3_hover = ctx.createRadialGradient(150, 150, 0, 150, 150, 150);
        gradient3_hover.addColorStop(0, doughnutColors.hoverLightRed);
        gradient3_hover.addColorStop(1, doughnutColors.hoverRed);

        return {
            labels: ["הכנסה צפויה", "יעד חסכון", "הוצאות קבועות"],
            datasets: [
                {
                    data: [expectedIncome, savingTarget, recExpensesAmount],
                    borderWidth: 0,
                    backgroundColor: [gradient1, gradient2, gradient3],
                    hoverBackgroundColor: [gradient_hover1, gradient2_hover, gradient3_hover],
                },
            ],
        };
    }, [expectedIncome, savingTarget, recExpensesAmount]);

    return (
        <div className="motion-wrapper">
            <motion.div
                className="donutCenter"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
            >
                <Doughnut
                    data={dailyBudgetData}
                    options={{
                        responsive: true,
                        devicePixelRatio: window.devicePixelRatio,
                        plugins: {
                            legend: { display: false },
                            tooltip: {
                                enabled: false,
                                external: externalTooltipHandler as any,
                            },
                        },
                    }}
                />
                <div className="motion-title">תקציב יומי</div>
                <div className={`motion-value ${dailyBudget < 0 ? "neg" : ""}`}>
                    {dailyBudget < 0 ? `${Math.abs(dailyBudget).toLocaleString()}-₪` : `₪${dailyBudget.toLocaleString()}`}
                </div>
            </motion.div>
        </div>
    )
}

export default DailyBudget