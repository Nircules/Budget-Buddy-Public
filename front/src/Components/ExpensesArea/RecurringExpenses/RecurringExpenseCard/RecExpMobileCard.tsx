import { useState } from "react";
import { SwipeEventData, useSwipeable } from "react-swipeable";
import { deleteRecurringExpense } from "../../../../Redux/slicers/recurringExpenseSlicer";
import { ExpensesDispatch, UserCategoriesState } from "../../../../Redux/FinanceContext";
import { useDispatch, useSelector } from "react-redux";
import ConfirmDialog from "../../../ConfirmDialog/ConfirmDialog";
import RecurringExpenseModel from "../../../../Models/RecurringExpenseModel";
import './RecExpMobileCard.css';

const ACTION_WIDTH = 60;

const RecExpMobileCard = (props: {
    recExpense: RecurringExpenseModel,
    setEditRecurringExpense: any,
    setNewExpense: any,
    isToday: boolean
}) => {
    // fully open or closed
    const [open, setOpen] = useState(false);
    // live drag offset between –ACTION_WIDTH and +ACTION_WIDTH
    const [offset, setOffset] = useState(0);
    const setEditRecurringExpense = props.setEditRecurringExpense;
    const setNewExpense = props.setNewExpense;
    const dispatch: ExpensesDispatch = useDispatch();
    const recExpense = props.recExpense;
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
    const formatDate = (recExpense_date: String, year: Boolean) => {
        const date = new Date(recExpense_date.toString());
        const startDay = date.getDate().toString().padStart(2, "0");
        let startMonth = date.getMonth() + 1;
        let startYear = date.getFullYear();

        // Format startMonth and endMonth with leading zeros
        const startMonthStr = startMonth.toString().padStart(2, "0");

        // Extract the last two digits of the startYear and endYear
        const startYearStr = startYear.toString().slice(-2);

        return `${startDay}/${startMonthStr}${year ? '/' + startYearStr : ''}`;
    };

    function showEditRecurringExpense() {
        setEditRecurringExpense(recExpense);
        if (setEditRecurringExpense) {
            setEditRecurringExpense(recExpense);
            const editRecExpense = document.getElementById("EditRecurringExpense");
            if (editRecExpense) editRecExpense.classList.add("visible");
        }
        else if (setNewExpense) {
            setNewExpense(recExpense);
            const addHiddenRec = document.getElementById("AddHiddenRec");
            if (addHiddenRec) addHiddenRec.classList.add("visible");
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
        dispatch(deleteRecurringExpense(recExpense.id));
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


    return (
        <>
            <div {...handlers} className={`rec-expense-swipeable-card${open ? " open" : ""}`}>
                <div
                    className={`rec-expense-card-front ${props.isToday ? "todayRecExpense" : ""}`}
                    style={{ transform: `translateX(${translateX}px)` }}
                >
                    {/* ← indicator inside the front */}
                    <i className="fas fa-chevron-right rec-expense-swipe-indicator" />

                    <div className="rec-expense-description">
                        {truncateText(recExpense.description, 15)} {recExpense.category ? ` - ${categories.find(cat => cat.id === recExpense.category)?.category_name}` : ''}
                        <div className="rec-expense-bottom-row">
                            <div className="rec-expense-date">
                                {recExpense.end_date ? `${formatDate(recExpense.end_date, true)} - ` : ''} {formatDate(recExpense.start_date, true)}
                            </div>
                        </div>
                    </div>
                    <div className="rec-expense-amount">
                        ₪{Number(recExpense.amount).toLocaleString("en-US")}
                        <div className="rec-expense-bottom-row">
                            {window.location.pathname === "/expenses" ? (
                                <i className="fas fa-arrow-up" onClick={showEditRecurringExpense} />
                            ) : (
                                <i className="fa fa-info-circle" onClick={showEditRecurringExpense} />
                            )}
                        </div>
                    </div>
                </div>

                <div className="rec-expense-card-actions">
                    <i className="fas fa-trash-alt" onClick={handleDeleteClick} />
                </div>
            </div>

            {confirmOpen && (
                <ConfirmDialog
                    message={`למחוק את התשלום הקבוע "${recExpense.description}" על סך ₪${Number(recExpense.amount).toLocaleString("en-US")}?`}
                    onConfirm={handleConfirm}
                    onCancel={handleCancel}
                />
            )}
        </>
    );
}

export default RecExpMobileCard;