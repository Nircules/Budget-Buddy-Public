import "../Expenses/Expenses.css";
import "./RecurringExpenses.css";
import "./RecurringExpenseCard/RecExpMobileCard.css";
import { useContext, useEffect, useState } from "react";
import { UserContext } from "../../../Redux/UserContext";
import { useNavigate } from "react-router-dom";
import { RecurringExpensesDispatch, RecurringExpensesState } from "../../../Redux/FinanceContext";
import { useDispatch, useSelector } from "react-redux";
import { changeSort, deleteRecurringExpense } from "../../../Redux/slicers/recurringExpenseSlicer";
import RecurringExpenseList from "./RecurringExpenseCard/RecurringExpenseList";
import AddRecurringExpense from "./AddRecurringExpense/AddRecurringExpense";
import { useMediaQuery } from "../Expenses/useMedia";
import RecExpMobileCard from "./RecurringExpenseCard/RecExpMobileCard";
import EditRecurringExpense from "./EditRecurringExpense/EditRecurringExpense";
import ConfirmDialog from "../../ConfirmDialog/ConfirmDialog";
import RecurringExpenseModel from "../../../Models/RecurringExpenseModel";


function RecurringExpenses(): JSX.Element {
    const navigate = useNavigate();
    const dispatch: RecurringExpensesDispatch = useDispatch();
    const isMobile = useMediaQuery("(max-width: 1000px)");
    const [editRecurringExpense, setEditRecurringExpense] = useState(null);
    const context = useContext(UserContext);
    const activeRecurringExpenses = useSelector(
        (state: RecurringExpensesState) => state.recurringExpenses.active_expenses
    );
    const inactiveRecurringExpenses = useSelector(
        (state: RecurringExpensesState) => state.recurringExpenses.inactive_expenses
    );
    const todayRecurringExpenses = useSelector(
        (state: RecurringExpensesState) => state.recurringExpenses.todayExpenses
    );
    const sorting = useSelector((state: RecurringExpensesState) => state.recurringExpenses.recSorting);

    const [confirmOpen, setConfirmOpen] = useState(false);
    const [confirmExpense, setConfirmExpense] = useState<RecurringExpenseModel>(null);

    const handleDeleteClick = async (confirmExpense: RecurringExpenseModel) => {
        setConfirmExpense(confirmExpense);
        await new Promise(resolve => setTimeout(resolve, 50)); // Wait for the dialog to be ready
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
        dispatch(deleteRecurringExpense(confirmExpense.id));
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


    const sortByFunc = (
        sortBy: {
            sort: "start_date" | "end_date" | "frequency" | "amount" | "category" | "description";
        },
        active: boolean
    ) => {
        if (sorting.sort === sortBy.sort) {
            if (sorting.order === "ascending") {
                dispatch(changeSort({ sort: sortBy.sort, order: "descending", active }));
            } else {
                dispatch(changeSort({ sort: sortBy.sort, order: "ascending", active }));
            }
        } else dispatch(changeSort({ sort: sortBy.sort, order: "descending", active }));
    };

    const totalAmount = useSelector((state: RecurringExpensesState) => state.recurringExpenses.totalAmount);

    useEffect(() => {
        if (context.user === null) {
            navigate("/login");
        }
        dispatch(changeSort({ sort: "start_date", order: "descending", active: true }));
        dispatch(changeSort({ sort: "start_date", order: "descending", active: false }));
    }, [context.user, navigate, dispatch]);

    return (
        <div className="RecurringExpenses">

            <div className="titleContainer">
                <div className="titleItem middleCol">
                    <div className="month-label">
                        הוראות קבע / תשלומים קבועים
                    </div>
                    <div className="total-amount">
                        סך הכל:{" "}
                        ₪
                        {totalAmount > 0
                            ? totalAmount.toLocaleString()
                            : totalAmount.toLocaleString()}
                    </div>
                </div>
            </div>


            {isMobile ? (

                <>
                    {/* ─── Mobile Sort Bar ───────────────────────── */}
                    <div className="rec-expense-mobile-sort-bar">
                        <button data-sort="start_date" onClick={() => sortByFunc({ sort: "start_date" }, true)}>
                            תאריך התחלה
                        </button>
                        <button data-sort="description" onClick={() => sortByFunc({ sort: "description" }, true)}>
                            תיאור
                        </button>
                        <button data-sort="amount" onClick={() => sortByFunc({ sort: "amount" }, true)}>
                            סכום
                        </button>
                        <button data-sort="category" onClick={() => sortByFunc({ sort: "category" }, true)}>
                            קטגוריה
                        </button>
                    </div>

                    {/* ─── Mobile Card List ─────────────────────────── */}
                    <div className="rec-expense-list">
                        {todayRecurringExpenses.length > 0 && (
                            todayRecurringExpenses.map(exp => (
                                <RecExpMobileCard
                                    key={exp.id}
                                    recExpense={exp}
                                    setEditRecurringExpense={setEditRecurringExpense}
                                    setNewExpense={''}
                                    isToday={true}
                                />
                            ))
                        )}
                        {activeRecurringExpenses.map(exp => (
                            <RecExpMobileCard
                                key={exp.id}
                                recExpense={exp}
                                setEditRecurringExpense={setEditRecurringExpense}
                                setNewExpense={''}
                                isToday={false}
                            />
                        ))}
                    </div>
                </>
            ) : (
                <table className="expensesTable">
                    <thead>
                        <tr>
                            <th onClick={() => sortByFunc({ sort: "start_date" }, true)}>תאריך התחלה</th>
                            <th onClick={() => sortByFunc({ sort: "description" }, true)}>תיאור</th>
                            <th onClick={() => sortByFunc({ sort: "amount" }, true)}>סכום</th>
                            <th onClick={() => sortByFunc({ sort: "end_date" }, true)}>תאריך סיום</th>
                            <th onClick={() => sortByFunc({ sort: "frequency" }, true)}>תדירות תשלום</th>
                            <th onClick={() => sortByFunc({ sort: "category" }, true)}>קטגוריה</th>
                            <th className="smallCol">עריכה</th>
                            <th className="smallCol">מחיקה</th>
                        </tr>
                    </thead>
                    <tbody>
                        {todayRecurringExpenses.length > 0 && (
                            todayRecurringExpenses.map(expense => (
                                <RecurringExpenseList
                                    key={expense.id}
                                    expense={expense}
                                    setNewExpense={''}
                                    setEditRecurringExpense={setEditRecurringExpense}
                                    handleDeleteClick={handleDeleteClick}
                                    isToday={true}
                                />
                            ))
                        )}
                        {activeRecurringExpenses.map((expense) => (
                            <RecurringExpenseList
                                key={expense.id}
                                expense={expense}
                                setNewExpense={null}
                                setEditRecurringExpense={setEditRecurringExpense}
                                handleDeleteClick={handleDeleteClick}
                                isToday={false}
                            />
                        ))}
                    </tbody>
                </table>
            )}

            {inactiveRecurringExpenses.length > 0 && (
                <table className="inactiveTable">
                    <thead>
                        <tr>
                            <th colSpan={8} className="tableTitle">
                                הוצאות לא פעילות
                            </th>
                        </tr>
                        <tr>
                            <th onClick={() => sortByFunc({ sort: "start_date" }, false)}>תאריך התחלה</th>
                            <th onClick={() => sortByFunc({ sort: "description" }, false)}>תיאור</th>
                            <th onClick={() => sortByFunc({ sort: "amount" }, false)}>סכום</th>
                            <th onClick={() => sortByFunc({ sort: "end_date" }, false)}>תאריך סיום</th>
                            <th onClick={() => sortByFunc({ sort: "frequency" }, false)}>תדירות תשלום</th>
                            <th onClick={() => sortByFunc({ sort: "category" }, false)}>קטגוריה</th>
                            <th className="smallCol">עריכה</th>
                            <th className="smallCol">מחיקה</th>
                        </tr>
                    </thead>
                    <tbody>
                        {inactiveRecurringExpenses.map((expense) => (
                            <RecurringExpenseList
                                key={expense.id}
                                expense={expense}
                                setNewExpense={null}
                                setEditRecurringExpense={setEditRecurringExpense}
                                handleDeleteClick={handleDeleteClick}
                                isToday={false}
                            />
                        ))}
                    </tbody>
                </table>
            )}
            <EditRecurringExpense expense={editRecurringExpense} />
            <div className="add-expense">
                <AddRecurringExpense />
            </div>
            {confirmOpen && (
                <ConfirmDialog
                    message={`למחוק את התשלום הקבוע "${confirmExpense.description}" על סך ₪${Number(confirmExpense.amount).toLocaleString("en-US")}?`}
                    onConfirm={handleConfirm}
                    onCancel={handleCancel}
                />
            )}

        </div>
    );
}

export default RecurringExpenses;
