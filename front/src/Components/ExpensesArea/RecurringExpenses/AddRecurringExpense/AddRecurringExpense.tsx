import { useContext, useEffect, useState } from "react";
import { UserContext } from "../../../../Redux/UserContext";
import "./AddRecurringExpense.css";
import { RecurringExpensesDispatch, UserCategoriesState } from "../../../../Redux/FinanceContext";
import { useDispatch, useSelector } from "react-redux";
import RecurringExpenseModel from "../../../../Models/RecurringExpenseModel";
import { useForm } from "react-hook-form";
import { addRecurringExpense } from "../../../../Redux/slicers/recurringExpenseSlicer";
import DatePicker, { registerLocale } from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import he from "date-fns/locale/he";
import Select from "react-select";

registerLocale("he", he);

function AddRecurringExpense(): JSX.Element {
    const [success, setSuccess] = useState(false); // After adding changes styles
    const context = useContext(UserContext);
    const dispatch: RecurringExpensesDispatch = useDispatch();
    const categories = useSelector((state: UserCategoriesState) => state.userCategories.categories);
    const currentDate = new Date();
    const [amount, setAmount] = useState("");
    const [startingDate, setStartingDate] = useState(currentDate);
    const [endDate, setEndDate] = useState(null);
    const [quickEndDate, setQuickEndDate] = useState(null); // For quick month selection
    const [minDate, setMinDate] = useState(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, currentDate.getDate()));
    const { register, handleSubmit, formState, reset } = useForm<RecurringExpenseModel>();
    register("user", { value: context.user ? context.user.id : 0 });

    const [selectedOption, setSelectedOption] = useState<string>("option1");

    // Set the date input to read-only so the user can only pick a date from the calendar
    useEffect(() => {
        (document.querySelector(".react-datepicker__input-container input") as HTMLInputElement).readOnly = true;
    });

    // Remove non-numeric characters from the amount input
    function handleAmountChange(event: React.ChangeEvent<HTMLInputElement>) {
        const value = event.target.value.replace(/[^\d]/g, "");
        if (value.length > 8) return;
        const formattedValue = value ? Number(value).toLocaleString() : "";
        setAmount(formattedValue);
        if (formState.errors.amount) {
            formState.errors.amount.message = "";
        }
    }

    function handleAddCategory() {
        const addCategoryElement = document.getElementById("add-category-overlay");
        if (addCategoryElement) {
            addCategoryElement.classList.add("visible");
        }
        else {
            alert("Error: Could not find the add category element.");
        }
    }

    const [selectedCategory, setSelectedCategory] = useState(null);
    const options = [
        { value: 0, label: "הוספת קטגוריה" },
        ...categories
            .map((category) => ({
                value: category.id,
                label: category.category_name,
            }))
            .sort((a, b) => a.label.localeCompare(b.label, 'he'))
    ];

    interface CategoryOption {
        value: number;
        label: string;
    }

    function handleCategoryChange(selected: CategoryOption | null): void {
        if (selected && selected.value === 0) {
            handleAddCategory();
            setSelectedCategory(null); // Keep the field empty after opening overlay
        } else {
            setSelectedCategory(selected);
        }
    }

    // Change the minimum date for the end date input based on the selected frequency
    function changeMinimumDate(value: Date, selected: string) {
        let newDate = new Date();
        try {
            if (selected === "M" || selected === "option1") {
                const nextMonth = value.getMonth() + 1;
                const nextYear = nextMonth > 11 ? value.getFullYear() + 1 : value.getFullYear();
                const nextMonthIndex = nextMonth % 12;
                newDate = new Date(nextYear, nextMonthIndex, value.getDate())
                setMinDate(newDate);
            }
            else if (selected === "W") {
                newDate = new Date(value.getFullYear(), value.getMonth(), value.getDate() + 7);
                setMinDate(newDate);
            }
            else if (selected === "B") {
                newDate = new Date(value.getFullYear(), value.getMonth(), value.getDate() + 14);
                setMinDate(newDate);
            }
            else if (selected === "BM") {
                const nextMonth = value.getMonth() + 2;
                const nextYear = nextMonth > 11 ? value.getFullYear() + 1 : value.getFullYear();
                const nextMonthIndex = nextMonth % 12;
                newDate = new Date(nextYear, nextMonthIndex, value.getDate())
                setMinDate(newDate);
            }
        }
        finally {
            if (endDate && endDate < newDate) {
                setEndDate(null);
            }
        }
    }

    // Handle the starting date change
    function handleStartingDateChange(value: Date) {
        setStartingDate(value);
        changeMinimumDate(value, selectedOption);
        if (endDate && endDate < value) {
            setEndDate(null);
        }
    }

    // Handle the select change
    const handleSelectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedOption(event.target.value);
        changeMinimumDate(startingDate, event.target.value);
    };

    // Month options for quick end date selection
    const monthOptions = [
        { value: 1, label: "2" },
        { value: 2, label: "3" },
        { value: 3, label: "4" },
        { value: 4, label: "5" },
        { value: 5, label: "6" },
        { value: 6, label: "7" },
        { value: 7, label: "8" },
        { value: 8, label: "9" },
        { value: 9, label: "10" },
        { value: 10, label: "11" },
        { value: 11, label: "12" },
    ];

    // Handle quick end date selection
    function handleQuickEndDateChange(selected: any) {
        setQuickEndDate(selected);

        if (!selected) {
            return; // User cleared selection
        }

        const monthsToAdd = selected.value;
        const newEndDate = new Date(startingDate);
        newEndDate.setMonth(newEndDate.getMonth() + monthsToAdd);
        setEndDate(newEndDate);
    }

    // Send the data to the server
    async function send(expenseForm: RecurringExpenseModel, resetForm: Function) {

        // Format start_date in local timezone
        const startYear = startingDate.getFullYear();
        const startMonth = String(startingDate.getMonth() + 1).padStart(2, '0');
        const startDay = String(startingDate.getDate()).padStart(2, '0');
        expenseForm.start_date = `${startYear}-${startMonth}-${startDay}`;

        endDate ? setEndDate(new Date(endDate.setHours(23, 59, 59, 999))) : setEndDate(null);

        // Format end_date in local timezone if it exists
        if (endDate) {
            const endYear = endDate.getFullYear();
            const endMonth = String(endDate.getMonth() + 1).padStart(2, '0');
            const endDay = String(endDate.getDate()).padStart(2, '0');
            expenseForm.end_date = `${endYear}-${endMonth}-${endDay}`;
        } else {
            expenseForm.end_date = null;
        }

        selectedOption === "option1" ? expenseForm.frequency = "M" : expenseForm.frequency = selectedOption;
        expenseForm.amount = Number(amount.replace(/,/g, ''));
        expenseForm.category = selectedCategory ? selectedCategory.value : null;
        try {
            dispatch(addRecurringExpense(expenseForm));
            resetForm();
            setStartingDate(currentDate);
            setEndDate(null);
            setAmount("");
            setSuccess(true);
            setTimeout(() => {
                setSuccess(false);
            }, 1500);
        } catch (err) {
            alert(err);
        }
    }

    return (
        <div className="AddRecurringExpense">
            <div className={`${success ? "success" : ""}`}>
                <h3>תשלום קבוע חדש</h3>
                <form onSubmit={handleSubmit((data) => send(data, reset))}>
                    {/* Amount Field */}
                    <span>{formState.errors.amount?.message}</span>
                    <div className="form-floating">
                        <input
                            type="text"
                            className="form-control"
                            value={amount}
                            onChange={(e) => handleAmountChange(e)}
                        />
                        <label>סכום</label>
                    </div>

                    {/* Description Field */}
                    <div className="form-floating">
                        <input type="text" className="form-control" {...register("description")} />
                        <label>תיאור</label>
                    </div>

                    {/* Category Field */}
                    <Select
                        value={selectedCategory}
                        onChange={(selected) => handleCategoryChange(selected)}
                        options={options}
                        placeholder="קטגוריה..."
                        isSearchable
                        isClearable
                        styles={{
                            control: (base) => ({
                                ...base,
                                borderRadius: "12px",
                                borderColor: "#a8c5ff",
                                boxShadow: "none",
                                "&:hover": { borderColor: "#7ea0f7" },
                                textAlign: "center",
                            }),
                            option: (base, state) => ({
                                ...base,
                                backgroundColor: state.isFocused ? "#e9f1ff" : "white",
                                color: "#333",
                            }),
                        }}
                    />

                    {/* Starting Date Field */}
                    <div className="form-floating">
                        <span className="spanTitle"> תחילת תשלום </span>
                        <DatePicker
                            selected={startingDate}
                            onChange={(date) => handleStartingDateChange(date)}
                            dateFormat="dd/MM/yyyy"
                            showMonthDropdown
                            showYearDropdown
                            dropdownMode="select"
                            locale="he"
                            placeholderText="בחר תאריך"
                            minDate={new Date(new Date().setFullYear(new Date().getFullYear() - 3))}
                            maxDate={new Date(new Date().setFullYear(new Date().getFullYear() + 3))}
                        />
                    </div>
                    {/* End Date Field */}
                    <div className="form-floating">
                        <span className="spanTitle"> סוף תשלום </span>

                        {/* Quick month selector */}
                        <Select
                            value={quickEndDate}
                            onChange={handleQuickEndDateChange}
                            options={monthOptions}
                            isClearable
                            placeholder="חודשים לסיום..."
                            styles={{
                                container: (provided) => ({
                                    ...provided,
                                    marginBottom: "10px",
                                }),
                            }}
                        />

                        <DatePicker
                            selected={endDate ? endDate : null}
                            onChange={(date) => setEndDate(date)}
                            dateFormat="dd/MM/yyyy"
                            showMonthDropdown
                            showYearDropdown
                            isClearable
                            dropdownMode="select"
                            locale="he"
                            placeholderText="תאריך סיום אם יש"
                            minDate={minDate}
                        />
                    </div>

                    {/* Frequency Field */}
                    <div className="form-floating">
                        <span className="spanTitle">תדירות תשלום </span>
                        <select id="choices" value={selectedOption} onChange={handleSelectChange}>
                            <option value="M">חודשי</option>
                            <option value="W">שבועי</option>
                            <option value="B">דו-שבועי</option>
                        </select>
                    </div>
                    <br />

                    <button type="submit" className="button-29">
                        הוסף
                    </button>
                </form>
            </div>
        </div>
    );
}

export default AddRecurringExpense;
