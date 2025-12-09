import React, { useMemo } from 'react'
import { Doughnut } from "react-chartjs-2";
import { doughnutColors } from './DoughnutColors';
import { motion } from 'framer-motion';
import { externalTooltipHandler } from '../BudgetComparison';

type ExpectedSavingsProps = {
    expectedIncome: number;
    currentExpenses: number;
    daysPassedFromStart: number;
    currentMonthDays: number;
    recExpensesAmount: number;
};

const ExpectedSavings: React.FC<ExpectedSavingsProps> = ({ expectedIncome, currentExpenses, daysPassedFromStart, currentMonthDays, recExpensesAmount }) => {
    const averageExpenses = Math.round(currentExpenses / Math.max(1, daysPassedFromStart));
    const expectedSavings = useMemo(() => {
        const projectedExpenses = averageExpenses * currentMonthDays;
        const remainingBalance = (expectedIncome ?? 0) - projectedExpenses;
        return remainingBalance;
    }, [expectedIncome, averageExpenses, currentMonthDays]);

    const expectedSavingsData = useMemo(() => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return null;

        const gradient1 = ctx.createRadialGradient(150, 150, 0, 150, 150, 150);
        gradient1.addColorStop(0, doughnutColors.lightRed2);
        gradient1.addColorStop(1, doughnutColors.red2);

        const gradient_hover1 = ctx.createRadialGradient(150, 150, 0, 150, 150, 150);
        gradient_hover1.addColorStop(0, doughnutColors.hoverLightRed2);
        gradient_hover1.addColorStop(1, doughnutColors.hoverRed2);

        const gradient2 = ctx.createRadialGradient(150, 150, 0, 150, 150, 150);
        gradient2.addColorStop(0, doughnutColors.lightRed);
        gradient2.addColorStop(1, doughnutColors.red);


        const gradient2_hover = ctx.createRadialGradient(150, 150, 0, 150, 150, 150);
        gradient2_hover.addColorStop(0, doughnutColors.hoverLightRed);
        gradient2_hover.addColorStop(1, doughnutColors.hoverRed);

        const gradient3 = ctx.createRadialGradient(150, 150, 0, 150, 150, 150);
        gradient3.addColorStop(0, '#eb6687ff');
        gradient3.addColorStop(1, '#ff9db5ff');

        const gradient3_hover = ctx.createRadialGradient(150, 150, 0, 150, 150, 150);
        gradient3_hover.addColorStop(0, '#df6080ff');
        gradient3_hover.addColorStop(1, '#eb90a7ff');

        return {
            labels: ["ממוצע הוצאות יומי", "הוצאות נוכחיות", "תשלומים קבועים"],
            datasets: [
                {
                    data: [averageExpenses, currentExpenses, recExpensesAmount],
                    borderWidth: 0,
                    backgroundColor: [gradient1, gradient2, gradient3],
                    hoverBackgroundColor: [gradient_hover1, gradient2_hover, gradient3_hover],
                },
            ],
        };
    }, [currentExpenses, recExpensesAmount, averageExpenses]);


    return (
        <div className="motion-wrapper">
            <motion.div
                className="donutCenter"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
            >
                <Doughnut
                    data={expectedSavingsData}
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
                <div className="motion-title">צפי חיסכון</div>
                <div className={`motion-value ${expectedSavings < 0 ? "neg" : ""}`}>
                    {expectedSavings < 0 ? `${Math.abs(expectedSavings).toLocaleString()}-₪` : `₪${expectedSavings.toLocaleString()}`}
                </div>
            </motion.div>
        </div>
    )
}

export default ExpectedSavings