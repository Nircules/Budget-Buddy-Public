import { useSelector } from "react-redux";
import "../RecurringIncomes.css"
import RecurringIncomeModel from "../../../../Models/RecurringIncomeModel";
import { UserCategoriesState } from "../../../../Redux/FinanceContext";
import "./RecurringIncomeList.css";
import { useLocation } from "react-router-dom";


const RecurringIncomeList = (props: { income: RecurringIncomeModel, setNewIncome: any, setEditRecurringIncome: any, handleDeleteClick: any }) => {
    const income = props.income;
    const setEditRecurringIncome = props.setEditRecurringIncome;
    const setNewIncome = props.setNewIncome;
    const location = useLocation();

    const categories = useSelector((state: UserCategoriesState) => state.userCategories.categories);

    // Create a new normal income from the recurring income
    function showAddHiddenRec() {
        setNewIncome(income);
        const addHiddenRec = document.getElementById("AddHiddenRec");
        if (addHiddenRec) {
            addHiddenRec.classList.add("visible");
        }
    }

    function showEditRecurringIncome() {
        setEditRecurringIncome(income);
        const editRecurringIncome = document.getElementById("EditRecurringIncome");
        if (editRecurringIncome) {
            editRecurringIncome.classList.add("visible");
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
    const formatDate = (income_date: String) => {
        const date = new Date(income_date.toString());
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
        <tr className="RecurringIncomeList" key={income.id}>
            <td>{formatDate(income.start_date)}</td>
            <td>{income.description}</td>
            <td className="amountCol">{Number(income.amount).toLocaleString("en-US")} ₪</td>
            <td>{income.end_date ? formatDate(income.end_date) : ""}</td>
            <td>{getFrequencyDisplay(income.frequency)}</td>

            <td>{categories.find(cat => cat.id === income.category)?.category_name}</td>
            {location.pathname === "/incomes" ?
                (
                    <td className="smallCol">
                        <i className="fas fa-arrow-alt-circle-up" onClick={showAddHiddenRec} />
                    </td>
                ) : (
                    <td className="smallCol">
                        <i className="fas fa-edit" onClick={() => showEditRecurringIncome()} />
                    </td>
                )}
            {location.pathname === "/incomes" ? null : (
                <td className="smallCol">
                    <i className="fas fa-trash-alt" onClick={() => props.handleDeleteClick(income)} />
                </td>
            )}

        </tr>
    )
};

export default RecurringIncomeList;
