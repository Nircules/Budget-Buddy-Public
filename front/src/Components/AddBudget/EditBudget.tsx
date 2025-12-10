import { useContext, useEffect, useState } from "react";
import BudgetModel from "../../Models/BudgetModel";
import { UserContext } from "../../Redux/UserContext";
import { BudgetsDispatch, BudgetsState } from "../../Redux/FinanceContext";
import { useDispatch, useSelector } from "react-redux";
import { useForm } from "react-hook-form";
import { deleteBudget, updateBudget } from "../../Redux/slicers/budgetSlicer";
import "./EditBudget.css";
import ConfirmDialog from "../ConfirmDialog/ConfirmDialog";

const EditBudget = (props: { budget: BudgetModel | null }) => {
    const context = useContext(UserContext);
    const dispatch: BudgetsDispatch = useDispatch();
    const { register, handleSubmit, setError, formState: { errors }, setValue } = useForm<BudgetModel>();
    const [amount, setAmount] = useState("");
    const [remainingAmount, setRemainingAmount] = useState("");

    const handleOverlayClick = () => {
        document.getElementById("edit-budget-overlay")?.classList.remove("visible");
        setConfirmOpen(false);
    };
    const all_budgets = useSelector((state: BudgetsState) => state.budgets.budgets);

    useEffect(() => {
        setValue("id", props.budget.id);
        setValue("name", props.budget.name);
        setAmount(Math.floor(props.budget.amount).toLocaleString("en-US"));
        setRemainingAmount(Math.floor(props.budget.remaining_amount).toLocaleString("en-US"));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [props.budget]);

    const [confirmOpen, setConfirmOpen] = useState(false);

    const handleAmountChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value.replace(/[^\d]/g, "");
        if (value.length > 8) return;
        const formattedValue = value ? Number(value).toLocaleString() : "";
        setAmount(formattedValue);
    };

    const handleRemainingAmountChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value.replace(/[^\d]/g, "");
        if (value.length > 8) return;
        const formattedValue = value ? Number(value).toLocaleString() : "";
        setRemainingAmount(formattedValue);
    };

    const handleDelete = async () => {
        setConfirmOpen(true);
        await new Promise(resolve => setTimeout(resolve, 50)); // Wait for the dialog to be ready
        // Show the confirm dialog
        const confirmDialog = document.getElementById("ConfirmDialog");
        if (confirmDialog) {
            confirmDialog.classList.add("visible");
        }
    };

    const handleConfirm = () => {
        setConfirmOpen(false);
        dispatch(deleteBudget(props.budget.id));
        handleOverlayClick();
    };

    const handleCancel = async () => {
        // Hide the confirm dialog
        const confirmDialog = document.getElementById("ConfirmDialog");
        if (confirmDialog) {
            confirmDialog.classList.remove("visible");
        }
        await new Promise(resolve => setTimeout(resolve, 300)); // Wait for the dialog to close
        setConfirmOpen(false);
    };

    const editBudget = (data: BudgetModel) => {
        data.user = context.user.id;

        // Parse amounts from formatted strings
        const totalAmount = Number(amount.replace(/,/g, ''));
        const remaining = Number(remainingAmount.replace(/,/g, ''));

        if (!totalAmount || totalAmount <= 0) {
            setError("amount", {
                type: "manual",
                message: "יש להזין סכום תקין"
            });
            return;
        }

        if (remaining < 0) {
            setError("remaining_amount", {
                type: "manual",
                message: "יתרה לא יכולה להיות שלילית"
            });
            return;
        }

        if (all_budgets
            .filter(b => b.id !== props.budget.id)
            .map(b => b.name)
            .includes(data.name)) {
            setError("name", {
                type: "manual",
                message: "תקציב כבר קיים"
            });
            return;
        }

        // Validate remaining amount doesn't exceed total amount
        if (remaining > totalAmount) {
            setError("remaining_amount", {
                type: "manual",
                message: "יתרה לא יכולה להיות גבוהה מסכום התקציב"
            });
            return;
        }

        // Set amounts
        data.amount = totalAmount;
        data.remaining_amount = remaining;

        try {
            dispatch(updateBudget(data));
            handleOverlayClick();
        } catch (error) {
            console.error("Failed to edit budget:", error);
        }
    };

    return (
        <div className="edit-budget-overlay" id="edit-budget-overlay" onClick={handleOverlayClick}>
            <div className="edit-budget-container" onClick={(e) => e.stopPropagation()}>
                <form onSubmit={handleSubmit((data) => editBudget(data))}>
                    <div className="form-group">
                        <label htmlFor="budgetName" id="budgetNameLabel">עריכת תקציב</label>
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
                                minLength: { value: 2, message: "Budget name must be at least 2 characters long" },
                            })}
                        />
                    </div>
                    {errors.name && <span className="error-message">{errors.name.message}</span>}

                    <div className="form-group">
                        <label htmlFor="budgetAmount">סכום תקציב</label>
                        <input
                            type="text"
                            id="budgetAmount"
                            placeholder="סכום"
                            required
                            value={amount}
                            onChange={handleAmountChange}
                        />
                    </div>
                    {errors.amount && <span className="error-message">{errors.amount.message}</span>}

                    <div className="form-group">
                        <label htmlFor="remainingAmount">יתרה נותרת</label>
                        <input
                            type="text"
                            id="remainingAmount"
                            placeholder="יתרה"
                            required
                            value={remainingAmount}
                            onChange={handleRemainingAmountChange}
                        />
                    </div>
                    {errors.remaining_amount && <span className="error-message">{errors.remaining_amount.message}</span>}

                    <div className="form-actions">
                        <button type="button" className="btn-confirm" onClick={handleDelete}>
                            מחק
                        </button>
                        <button type="submit" className="btn-confirm submit-button">
                            עדכון
                        </button>
                    </div>
                </form>

                {confirmOpen && (
                    <ConfirmDialog
                        message={`למחוק את התקציב "${props.budget.name}"?`}
                        onConfirm={handleConfirm}
                        onCancel={handleCancel}
                    />
                )}
            </div>
        </div>
    );
};

export default EditBudget;
