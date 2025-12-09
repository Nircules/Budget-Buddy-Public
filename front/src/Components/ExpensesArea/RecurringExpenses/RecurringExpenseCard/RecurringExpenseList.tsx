import { useSelector } from "react-redux";
import "../RecurringExpenses.css"
import RecurringExpenseModel from "../../../../Models/RecurringExpenseModel";
import { UserCategoriesState } from "../../../../Redux/FinanceContext";
import "../../Expenses/ExpenseCard/ExpenseCardList.css";
import { useLocation } from "react-router-dom";


const RecurringExpenseList = (props: {
    expense: RecurringExpenseModel,
    setNewExpense: any,
    setEditRecurringExpense: any,
    handleDeleteClick: any,
    isToday: boolean
}) => {
    const expense = props.expense;
    const setEditRecurringExpense = props.setEditRecurringExpense;
    const setNewExpense = props.setNewExpense;
    const location = useLocation();

    const categories = useSelector((state: UserCategoriesState) => state.userCategories.categories);

    // Create a new normal expense from the recurring expense
    function showAddHiddenRec() {
        setNewExpense(expense);
        const addHiddenRec = document.getElementById("AddHiddenRec");
        if (addHiddenRec) {
            addHiddenRec.classList.add("visible");
        }
    }

    function showEditRecurringExpense() {
        setEditRecurringExpense(expense);
        const editRecurringExpense = document.getElementById("EditRecurringExpense");
        if (editRecurringExpense) {
            editRecurringExpense.classList.add("visible");
        }
    }

    // Get the frequency display
    function getFrequencyDisplay(frequency: string) {
        switch (frequency) {
            case "M":
                return "חודשי";
            case "W":
                return "שבועי";
            case "BM":
                return "דו-חודשי";
            case "B":
                return "דו-שבועי";
            default:
                return "";
        }
    }

    // Format the date to DD/MM/YY
    const formatDate = (expense_date: String) => {
        const date = new Date(expense_date.toString());
        const startDay = date.getDate().toString().padStart(2, "0");
        let startMonth = date.getMonth() + 1;
        let startYear = date.getFullYear();

        // Format startMonth and endMonth with leading zeros
        const startMonthStr = startMonth.toString().padStart(2, "0");

        // Extract the last two digits of the startYear and endYear
        const startYearStr = startYear.toString().slice(-2);

        return `${startDay}/${startMonthStr}/${startYearStr}`;
    };

    return (
        <tr className={`RecurringExpenseList ${props.isToday ? "todayRecExpense" : ""}`} key={expense.id}>
            <td>{formatDate(expense.start_date)}</td>
            <td>{expense.description}</td>
            <td className="amountCol">{Number(expense.amount).toLocaleString("en-US")} ₪</td>
            <td>{expense.end_date ? formatDate(expense.end_date) : ""}</td>
            <td>{getFrequencyDisplay(expense.frequency)}</td>

            <td>{categories.find(cat => cat.id === expense.category)?.category_name}</td>
            {location.pathname === "/expenses" ?
                (
                    <td className="smallCol">
                        <i className="fas fa-arrow-alt-circle-up" onClick={showAddHiddenRec} />
                    </td>
                ) : (
                    <td className="smallCol">
                        <i className="fas fa-edit" onClick={showEditRecurringExpense} />
                    </td>
                )}
            {location.pathname === "/expenses" ? null : (
                <td className="smallCol">
                    <i className="fas fa-trash-alt" onClick={() => props.handleDeleteClick(expense)} />
                </td>
            )}

        </tr>
    )
};

export default RecurringExpenseList;
