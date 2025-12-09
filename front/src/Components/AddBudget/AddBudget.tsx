import React, { useContext, useState } from 'react';
import './AddBudget.css';
import { useDispatch, useSelector } from 'react-redux';
import { BudgetsDispatch, BudgetsState } from '../../Redux/FinanceContext';
import { addBudget } from '../../Redux/slicers/budgetSlicer';
import { UserContext } from '../../Redux/UserContext';
import { useForm } from 'react-hook-form';
import BudgetModel from '../../Models/BudgetModel';

const AddBudget: React.FC = () => {
    const dispatch: BudgetsDispatch = useDispatch();
    const context = useContext(UserContext);
    const { register, handleSubmit, reset, setError, formState: { errors } } = useForm<BudgetModel>();
    const [amount, setAmount] = useState("");

    const handleOverlayClick = () => {
        document.getElementById("add-budget-overlay")?.classList.remove("visible");
    };

    const all_budgets = useSelector((state: BudgetsState) => state.budgets.budgets);

    // Remove non-numeric characters from the amount input
    function handleAmountChange(event: React.ChangeEvent<HTMLInputElement>) {
        const value = event.target.value.replace(/[^\d]/g, "");
        if (value.length > 8) return;
        const formattedValue = value ? Number(value).toLocaleString() : "";
        setAmount(formattedValue);
    }

    const addNewBudget = (data: BudgetModel) => {
        data.user = context.user.id;
        data.amount = Number(amount.replace(/,/g, ''));
        data.remaining_amount = data.amount; // Initialize remaining_amount to amount

        if (all_budgets.map(b => b.name).includes(data.name)) {
            setError("name", {
                type: "manual",
                message: "תקציב כבר קיים"
            });
            return;
        }

        if (!data.amount || data.amount <= 0) {
            setError("amount", {
                type: "manual",
                message: "יש להזין סכום תקין"
            });
            return;
        }

        try {
            dispatch(addBudget(data));
            reset();
            setAmount("");
            handleOverlayClick();
        } catch (error) {
            console.error("Failed to add budget:", error);
        }
    };

    return (
        <div className="add-budget-overlay" id="add-budget-overlay" onClick={handleOverlayClick}>
            <div className="add-budget-modal" onClick={(e) => e.stopPropagation()}>
                <form onSubmit={handleSubmit((data) => addNewBudget(data))}>
                    <div className="form-group">
                        <label htmlFor="budgetName" id="budgetNameLabel">הוספת תקציב</label>

                        <input
                            type="text"
                            id="budgetName"
                            placeholder="שם לתקציב"
                            required
                            {...register("name", {
                                required: {
                                    value: true,
                                    message: "יש להזין שם לתקציב",
                                },
                                minLength: { value: 2, message: "שם התקציב חייב להכיל לפחות 2 תווים" },
                                maxLength: { value: 49, message: "שם התקציב ארוך מדי (מקסימום 49 תווים)" },
                            })}
                        />
                        {errors.name && <span className="error-message">{errors.name.message}</span>}

                        <input
                            type="text"
                            id="budgetAmount"
                            placeholder="סכום"
                            required
                            value={amount}
                            onChange={(e) => handleAmountChange(e)}
                        />
                        {errors.amount && <span className="error-message">{errors.amount.message}</span>}
                    </div>

                    <div className="form-actions">
                        <button type="button" className="btn-cancel" onClick={handleOverlayClick}>
                            ביטול
                        </button>
                        <button type="submit" className="btn-cancel submit-button">
                            הוספה
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddBudget;
