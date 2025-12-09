import React, { useMemo } from 'react'
import { Doughnut } from 'react-chartjs-2';
import { doughnutColors } from './DoughnutColors';
import { motion } from 'framer-motion';
import { externalTooltipHandler } from '../BudgetComparison';

type AverageExpensesProps = {
    currentExpenses: number;
    daysPassedFromStart: number;
    expectedIncome: number;
}

const AverageExpenses: React.FC<AverageExpensesProps> = ({ currentExpenses, daysPassedFromStart, expectedIncome }) => {
    const averageExpenses = Math.round(currentExpenses / Math.max(1, daysPassedFromStart));

    const averageExpensesData = useMemo(() => {
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
        gradient2.addColorStop(0, doughnutColors.blue2);
        gradient2.addColorStop(1, doughnutColors.lightBlue2);


        const gradient2_hover = ctx.createRadialGradient(150, 150, 0, 150, 150, 150);
        gradient2_hover.addColorStop(0, doughnutColors.hoverBlue2);
        gradient2_hover.addColorStop(1, doughnutColors.hoverLightBlue2);

        return {
            labels: ["הוצאות החודש", "הכנסה צפויה"],
            datasets: [
                {
                    data: [currentExpenses, expectedIncome],
                    borderWidth: 0,
                    backgroundColor: [gradient1, gradient2],
                    hoverBackgroundColor: [gradient_hover1, gradient2_hover],
                },
            ],
        };
    }, [currentExpenses, expectedIncome]);


    return (
        <div className="motion-wrapper">
            <motion.div
                className="donutCenter"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
            >
                <Doughnut
                    key={averageExpenses}
                    data={averageExpensesData}
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
                <div className={`motion-title-long`}>
                    ממוצע הוצאות יומי {`${averageExpenses.toLocaleString()} ₪`}
                </div>
            </motion.div >
        </div >
    )
}

export default AverageExpenses