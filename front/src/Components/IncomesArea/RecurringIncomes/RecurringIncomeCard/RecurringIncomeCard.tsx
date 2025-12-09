import { useDispatch } from "react-redux";
import RecurringIncomeModel from "../../../../Models/RecurringIncomeModel";
import { RecurringIncomesDispatch } from "../../../../Redux/FinanceContext";
import "./RecurringIncomeCard.css";
import "../../IncomeCard/IncomeCard.css";
import React from "react";
import { deleteRecurringIncome } from "../../../../Redux/slicers/recurringIncomesSlicer";

const RecurringIncomeCard: React.FC<RecurringIncomeModel> = (recurringIncome) => {
    const dispatch: RecurringIncomesDispatch = useDispatch();

    function removeIncome() {
        dispatch(deleteRecurringIncome(recurringIncome.id));
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
        <div className="IncomeCard">
            <div className="income-card">
                <div className="income-header">
                    {Number(recurringIncome.amount).toLocaleString("en-US")} ₪
                    <button className="delete-button" onClick={removeIncome}>
                        X
                    </button>
                </div>
                <div className="recurringIncome-body">
                    {recurringIncome.description}
                    <br />
                    {recurringIncome.category}
                    <br />
                    {formatDate(recurringIncome.start_date)}
                </div>
            </div>
        </div>
    );
}

export default RecurringIncomeCard;
