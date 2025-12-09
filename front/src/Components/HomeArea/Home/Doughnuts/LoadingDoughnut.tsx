import React, { useEffect, useRef } from "react";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

const LoadingDoughnut = () => {
    const chartRef = useRef<any>(null);

    // Shades of grey for the animation effect
    const greyShades = ["#ececec", "#d6d6d6"];
    let colorIndex = 0;

    useEffect(() => {
        const interval = setInterval(() => {
            const chart = chartRef.current;
            if (chart) {
                const newColor = greyShades[colorIndex % greyShades.length];
                chart.data.datasets[0].backgroundColor = [newColor];
                chart.update();
                colorIndex++;
            }
        }, 600); // Changes color every 600ms
        return () => clearInterval(interval); // Cleanup on unmount
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);


    return (
        <div>
            <Doughnut
                ref={chartRef}
                data={{
                    datasets: [
                        {
                            data: [1],
                            backgroundColor: ["#ececec"], // Initial color
                            borderWidth: 0,
                        },
                    ],
                }}
                options={{
                    responsive: true,
                    devicePixelRatio: window.devicePixelRatio,
                    plugins: {
                        legend: { display: false },
                        tooltip: { enabled: false }, // Disable tooltip
                    },
                    hover: { mode: null }, // Disable hover effect
                }}
            />
        </div>
    );
};

export default LoadingDoughnut;
