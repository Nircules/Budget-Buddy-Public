import { useContext, useEffect, useState } from "react";
import { UserContext } from "../../../../Redux/UserContext";
import { useForm } from "react-hook-form";
import RecurringExpenseModel from "../../../../Models/RecurringExpenseModel";
import "./EditRecurringExpense.css";
import DatePicker, { registerLocale } from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import he from "date-fns/locale/he";
import { RecurringExpensesDispatch, UserCategoriesState } from "../../../../Redux/FinanceContext";
import { useDispatch, useSelector } from "react-redux";
import Loading from "../../../SharedArea/Loading/Loading";
import Select from "react-select";
import { updateRecurringExpense } from "../../../../Redux/slicers/recurringExpenseSlicer";
registerLocale("he", he);

const EditRecurringExpense = (props: { expense: RecurringExpenseModel }) => {
    const context = useContext(UserContext);
    const dispatch: RecurringExpensesDispatch = useDispatch();
    const currentDate = new Date();
    const [amount, setAmount] = useState("");
    const [startingDate, setStartingDate] = useState(currentDate);
    const [endDate, setEndDate] = useState(null);
    const [quickEndDate, setQuickEndDate] = useState(null); // For quick month selection
    const [minDate, setMinDate] = useState(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, currentDate.getDate()));
    const [isActive, setIsActive] = useState(true);
    const { register, handleSubmit, formState, setValue } = useForm<RecurringExpenseModel>();
    register("user", { value: context.user ? context.user.id : 0 });

    function handleAddCategory() {
        const addCategoryElement = document.getElementById("add-category-overlay");
        if (addCategoryElement) {
            addCategoryElement.classList.add("visible");
        }
        else {
            alert("Error: Could not find the add category element.");
        }
    }

    const categories = useSelector((state: UserCategoriesState) => state.userCategories.categories);
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

    // Custom onChange handler to intercept "Add Category" selection
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

    const [selectedOption, setSelectedOption] = useState<string>("option1");

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


    const closeEditRecurringExpense = () => {
        const backgroundHandler = document.getElementById("EditRecurringExpense");
        if (backgroundHandler) {
            backgroundHandler.classList.remove("visible");
        }
    }

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

    // Cleanup and event listeners
    useEffect(() => {
        document.querySelectorAll(".react-datepicker__input-container input").forEach((input) => { (input as HTMLInputElement).readOnly = true });
        const backgroundHandler = document.getElementById("EditRecurringExpense");
        const handleClick = (e: MouseEvent) => {
            if (e.target === backgroundHandler) {
                closeEditRecurringExpense();
            }
        };
        const escapeKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                closeEditRecurringExpense();
            }
        };
        if (backgroundHandler) {
            backgroundHandler.addEventListener("click", handleClick);
        }
        window.addEventListener("keydown", escapeKey);
        // Cleanup event listener on component unmount
        return () => {
            if (backgroundHandler) {
                backgroundHandler.removeEventListener("click", handleClick);
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    });

    useEffect(() => {
        if (props.expense) {
            setAmount(Math.round(props.expense.amount).toLocaleString('en-US'));
            setValue("description", props.expense.description);
            setStartingDate(new Date(props.expense.start_date));
            setEndDate(props.expense.end_date ? new Date(props.expense.end_date) : null);
            setIsActive(props.expense.is_active);
            if (props.expense.frequency) {
                setSelectedOption(props.expense.frequency);
            }
            if (props.expense.category) {
                const category = categories.find((cat) => cat.id === props.expense.category);
                if (category) {
                    setSelectedCategory({ value: category.id, label: category.category_name });
                }
            } else {
                setSelectedCategory(null);
            }
        }
        setValue("user", context.user ? context.user.id : 0);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [props.expense, context.user, setValue]);


    async function send(expense: RecurringExpenseModel) {
        expense.start_date = startingDate.toISOString().split("T")[0];
        expense.end_date = endDate ? endDate.toISOString().split("T")[0] : null;
        expense.amount = Number(amount.replace(/,/g, ''));
        selectedOption === "option1" ? expense.frequency = "M" : expense.frequency = selectedOption;
        expense.id = props.expense.id;
        expense.category = selectedCategory ? selectedCategory.value : null;
        expense.is_active = isActive;
        try {
            dispatch(updateRecurringExpense(expense));
            closeEditRecurringExpense();
        } catch (err) {
            alert(err);
        }
    }


    return (
        <div className="EditRecurringExpense" id="EditRecurringExpense">
            <div className="EditRecurringExpenseContent">
                {props.expense ? (
                    <>
                        <h3>עריכת תשלום קבוע</h3>
                        <form onSubmit={handleSubmit(send)}>
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

                            {/* Active Status Field */}
                            <div className="form-check form-switch form-check-inline">
                                <input className="form-check-input" type="checkbox" id="flexSwitchCheckDefault" checked={isActive} onChange={() => setIsActive(!isActive)} />
                                <label className="form-check-label" htmlFor="flexSwitchCheckDefault">האם פעיל</label>
                            </div>
                            <br />


                            <button type="submit" className="button-29">עדכון</button>
                        </form>
                    </>
                ) : (
                    <Loading />
                )}
            </div>
        </div>
    );
};

export default EditRecurringExpense;
