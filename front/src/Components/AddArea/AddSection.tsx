import { useState } from "react";
import "./AddSection.css";
import AddExpense from "../ExpensesArea/Expenses/AddExpense/AddExpense";
import AddIncome from "../IncomesArea/AddIncome/AddIncome";
import AddRecurringExpense from "../ExpensesArea/RecurringExpenses/AddRecurringExpense/AddRecurringExpense";
import { useLocation } from "react-router-dom";

const AddSection = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedOption, setSelectedOption] = useState("expense");
    const location = useLocation();

    const options = [
        { key: "expense", label: "הוצאה" },
        { key: "recurring-expense", label: "תשלום קבוע" },
        { key: "income", label: "הכנסה" },
    ];

    const renderComponent = () => {
        switch (selectedOption) {
            case "expense":
                return <AddExpense />;
            case "income":
                return <AddIncome />;
            case "recurring-expense":
                return <AddRecurringExpense />;
            default:
                return <AddExpense />;
        }
    };

    if (location.pathname === "/login" || location.pathname === "/register") {
        return null;
    }

    return (
        <>
            {/* Floating Button */}
            <button
                className={"floating-btn" + (isOpen ? " open" : "")}
                onClick={() => setIsOpen(!isOpen)}
            >
                <span></span>
            </button>

            {/* Overlay */}
            <div className={`overlay ${isOpen ? "show" : ""}`} onClick={() => setIsOpen(false)}></div>

            {/* Expandable Add Transaction Container */}
            <div className={`add-section-container ${isOpen ? "open" : ""}`}>
                <div className="add-section-inner">
                    {/* Toggle Buttons */}
                    <div className="toggle-buttons">
                        {options.map((option) => (
                            <button
                                key={option.key}
                                onClick={() => setSelectedOption(option.key)}
                                className={`toggle-btn ${selectedOption === option.key ? "selected" : ""}`}
                            >
                                {option.label}
                            </button>
                        ))}
                    </div>

                    {/* Render Selected Component */}
                    <div className="transaction-form">
                        {renderComponent()}
                    </div>
                </div>
            </div>
        </>
    );
};

export default AddSection;
