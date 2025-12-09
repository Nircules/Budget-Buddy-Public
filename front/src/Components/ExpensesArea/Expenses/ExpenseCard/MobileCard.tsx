// ExpenseCard.tsx
import { useState } from "react";
import ExpenseModel from "../../../../Models/ExpenseModel";
import { SwipeEventData, useSwipeable } from "react-swipeable";
import { deleteExpense } from "../../../../Redux/slicers/expensesSlicer";
import { ExpensesDispatch, UserCategoriesState } from "../../../../Redux/FinanceContext";
import { useDispatch, useSelector } from "react-redux";
import ConfirmDialog from "../../../ConfirmDialog/ConfirmDialog";

const ACTION_WIDTH = 60;

const MobileCard = (props: { expense: ExpenseModel, setEditExpense: any }) => {
    // fully open or closed
    const [open, setOpen] = useState(false);
    // live drag offset between –ACTION_WIDTH and +ACTION_WIDTH
    const [offset, setOffset] = useState(0);
    const setEditExpense = props.setEditExpense;
    const dispatch: ExpensesDispatch = useDispatch();
    const categories = useSelector((state: UserCategoriesState) => state.userCategories.categories);


    const handlers = useSwipeable({
        onSwiping: (e: SwipeEventData) => {
            // e.deltaX >0 means dragging right → reveal actions on left
            // base = how far it would be if fully open already
            const base = open ? ACTION_WIDTH : 0;
            // raw position = base + finger movement
            let raw = base + e.deltaX;
            // clamp between 0 (closed) and ACTION_WIDTH (fully open)
            raw = Math.max(0, Math.min(ACTION_WIDTH, raw));
            // offset = raw – base  (this is the *live* drag delta)
            setOffset(raw - base);
        },
        onSwiped: (e: SwipeEventData) => {
            // decide snap: more than half → open, else close
            if (e.deltaX > ACTION_WIDTH / 2) setOpen(true);
            else if (e.deltaX < -ACTION_WIDTH / 2) setOpen(false);
            // clear live offset
            setOffset(0);
        },
        trackMouse: true,
        delta: 10,
    });

    // compute total translateX: fully-open position + live offset
    const translateX = (open ? ACTION_WIDTH : 0) + offset;

    // Format the date to DD/MM/YY
    const formatDate = (expense_date: String) => {
        const date = new Date(expense_date.toString());
        const startDay = date.getDate().toString().padStart(2, "0");
        let startMonth = date.getMonth() + 1;
        // let startYear = date.getFullYear();

        // Format startMonth and endMonth with leading zeros
        const startMonthStr = startMonth.toString().padStart(2, "0");

        // Extract the last two digits of the startYear and endYear
        // const startYearStr = startYear.toString().slice(-2);

        return `${startDay}/${startMonthStr}`;
    };

    function showEditExpense() {
        setEditExpense(expense);
        const editExpense = document.getElementById("EditExpense");
        if (editExpense) {
            editExpense.classList.add("visible");
        }
    }

    const [confirmOpen, setConfirmOpen] = useState(false);

    const handleDeleteClick = async () => {
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
        dispatch(deleteExpense(expense.id));
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

    const truncateText = (text: string, maxLength: number) => {
        if (!text) return text;
        if (text.length <= maxLength) return text;
        const truncated = text.slice(0, maxLength);
        return truncated.slice(0, truncated.lastIndexOf(" ")) + "...";
    };

    const expense = props.expense;

    return (
        <>
            <div {...handlers} className={`swipeable-card${open ? " open" : ""}`}>
                <div
                    className="card-front"
                    style={{ transform: `translateX(${translateX}px)` }}
                >
                    {/* ← indicator inside the front */}
                    <i className="fas fa-chevron-right swipe-indicator" />

                    <div className="description">
                        {truncateText(expense.description, 15)}
                        <div className="bottom-row">
                            <div className="date">{formatDate(expense.pay_date)} {expense.category ? ` - ${categories.find(cat => cat.id === expense.category)?.category_name}` : ''}</div>
                        </div>
                    </div>
                    <div className="amount">
                        ₪{Number(expense.amount).toLocaleString("en-US")}
                        <div className="bottom-row">
                            <i className="fa fa-info-circle" onClick={showEditExpense} />
                        </div>
                    </div>
                </div>

                <div className="card-actions">
                    <i className="fas fa-trash-alt" onClick={handleDeleteClick} />
                </div>
            </div>

            {confirmOpen && (
                <ConfirmDialog
                    message={`למחוק את ההוצאה "${expense.description}" על סך ₪${Number(expense.amount).toLocaleString("en-US")}?`}
                    onConfirm={handleConfirm}
                    onCancel={handleCancel}
                />
            )}
        </>
    );
}

export default MobileCard;