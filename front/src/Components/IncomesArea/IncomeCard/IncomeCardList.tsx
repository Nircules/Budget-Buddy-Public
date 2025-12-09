import { useSelector } from "react-redux";
import "./IncomeCardList.css";
import IncomeModel from "../../../Models/IncomeModel";
import { UserCategoriesState } from "../../../Redux/FinanceContext";

const IncomeCardList = (props: { income: IncomeModel, setEditIncome: any, handleDeleteClick: any }) => {
    const income = props.income;
    const setEditIncome = props.setEditIncome;
    const categories = useSelector((state: UserCategoriesState) => state.userCategories.categories);

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

    function showEditIncome() {
        setEditIncome(income);
        const editIncome = document.getElementById("EditIncome");
        if (editIncome) {
            editIncome.classList.add("visible");
        }
    }

    const truncateText = (text: string, maxLength: number) => {
        if (!text) return text;
        if (text.length <= maxLength) return text;
        const truncated = text.slice(0, maxLength);
        return truncated.slice(0, truncated.lastIndexOf(" ")) + "...";
    };


    return (
        <tr className="IncomeCardList" key={income.id}>
            <td className="paymentDate">{formatDate(income.date)}</td>
            <td className="paymentDescription" title={income.description}>{truncateText(income.description, 25)}</td>
            <td className="amountCol">{Number(income.amount).toLocaleString("en-US")} ₪</td>
            <td className="paymentCategory">{categories.find(cat => cat.id === income.category)?.category_name}</td>
            <td className="smallCol paymentEdit">
                <i className="fa fa-info-circle" onClick={showEditIncome} />
            </td>
            <td className="smallCol paymentDelete">
                <i className="fas fa-trash-alt" onClick={() => props.handleDeleteClick(income)} />
            </td>

        </tr>
    );
};

export default IncomeCardList;
