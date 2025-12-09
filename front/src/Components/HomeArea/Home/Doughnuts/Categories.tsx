import React, { useMemo } from 'react'
import { Doughnut } from "react-chartjs-2";
import { motion } from 'framer-motion';
import { externalTooltipHandler } from '../BudgetComparison';
import { useSelector } from 'react-redux';
import { UserCategoriesState } from '../../../../Redux/FinanceContext';

type CategoriesProps = {
    categoriesExpenses: any[];
};

const Categories: React.FC<CategoriesProps> = ({ categoriesExpenses }) => {
    const all_categories = useSelector((state: UserCategoriesState) => state.userCategories.categories);

    function makeCategoryGradients(
        ctx: CanvasRenderingContext2D,
        count: number
    ) {
        // Pick hue range from ~180° (teal) to ~300° (purple)
        const gradients: CanvasGradient[] = [];
        const hoverGradients: CanvasGradient[] = [];

        for (let i = 0; i < count; i++) {
            const hue = 180 + (i * 120) / Math.max(1, count - 1); // limited hue range
            const grad = ctx.createRadialGradient(150, 150, 0, 150, 150, 150);
            grad.addColorStop(0, `hsl(${hue}, 60%, 55%)`);
            grad.addColorStop(1, `hsl(${hue + 10}, 70%, 75%)`);
            gradients.push(grad);

            const hoverGrad = ctx.createRadialGradient(150, 150, 0, 150, 150, 150);
            hoverGrad.addColorStop(0, `hsl(${hue}, 60%, 45%)`);
            hoverGrad.addColorStop(1, `hsl(${hue + 10}, 70%, 65%)`);
            hoverGradients.push(hoverGrad);
        }

        return { gradients, hoverGradients };
    }

    // Build a fast lookup map: id -> name
    const catNameById = useMemo(() => {
        const m = new Map<number | string, string>();
        for (const c of all_categories ?? []) {
            // adjust field names if yours differ (id, _id, value, etc.)
            m.set((c.id ?? c.category_name) as number | string, c.category_name ?? c.category_name ?? "");
        }
        return m;
    }, [all_categories]);

    // Aggregate totals by categoryId and output labels as NAMES (not IDs)
    const categoriesData = useMemo(() => {
        if (!categoriesExpenses?.length) return null;

        const totals = new Map<number | string, number>();
        for (const exp of categoriesExpenses) {
            const catId = exp.category;
            const amount = Math.abs(Number(exp.amount) || 0);
            totals.set(catId, (totals.get(catId) ?? 0) + amount);
        }

        const ids = Array.from(totals.keys());
        ids.sort((a, b) => (totals.get(b)! - totals.get(a)!));

        const labels = ids.map((id) => catNameById.get(id) || "קטגוריה לא ידועה");
        const values = ids.map((id) => totals.get(id)!);

        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) return null;

        const { gradients, hoverGradients } = makeCategoryGradients(ctx, labels.length);

        return {
            labels,
            datasets: [
                {
                    label: 'סה"כ',
                    data: values,
                    backgroundColor: gradients,
                    hoverBackgroundColor: hoverGradients,
                    borderWidth: 0,
                },
            ],
        };
    }, [categoriesExpenses, catNameById]);

    return (
        <div className="motion-wrapper">
            <motion.div
                className="donutCenter"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
            >
                <Doughnut
                    data={categoriesData ?? { labels: [], datasets: [] } as any}
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
                        animation: { duration: 700 },
                    }}
                />
                <div className="motion-title">לפי קטגוריה</div>

            </motion.div>
        </div>
    )
}

export default Categories