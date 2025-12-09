import { useSelector } from "react-redux";
import ExpenseModel from "../../../../Models/ExpenseModel";
import { UserCategoriesState } from "../../../../Redux/FinanceContext";
import "./ExpenseCardList.css";

const ExpenseCardList = (props: { expense: ExpenseModel, setEditExpense: any, handleDeleteClick: any }) => {
    const expense = props.expense;
    const setEditExpense = props.setEditExpense;
    const categories = useSelector((state: UserCategoriesState) => state.userCategories.categories);

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

    function showEditExpense() {
        setEditExpense(expense);
        const editExpense = document.getElementById("EditExpense");
        if (editExpense) {
            editExpense.classList.add("visible");
        }
    }

    const truncateText = (text: string, maxLength: number) => {
        if (!text) return text;
        if (text.length <= maxLength) return text;
        const truncated = text.slice(0, maxLength);
        return truncated.slice(0, truncated.lastIndexOf(" ")) + "...";
    };


    return (
        <tr className="ExpenseCardList" key={expense.id}>
            <td className="paymentDate">{formatDate(expense.pay_date)}</td>
            <td className="paymentDescription" title={expense.description}>{truncateText(expense.description, 25)}</td>
            <td className="amountCol">{Number(expense.amount).toLocaleString("en-US")} ₪</td>
            <td className="paymentCategory">{categories.find(cat => cat.id === expense.category)?.category_name}</td>
            <td className="smallCol paymentEdit">
                <i className="fa fa-info-circle" onClick={showEditExpense} />
            </td>
            <td className="smallCol paymentDelete">
                <i className="fas fa-trash-alt" onClick={() => props.handleDeleteClick(expense)} />
            </td>

        </tr>
    );
};

export default ExpenseCardList;
