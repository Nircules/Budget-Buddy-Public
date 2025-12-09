import { useContext, useEffect, useState } from "react";
import { UserContext } from "../../../../Redux/UserContext";
import { useForm } from "react-hook-form";
import ExpenseModel from "../../../../Models/ExpenseModel";
import "./EditExpense.css";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { ExpensesDispatch, UserCategoriesState, BudgetsState } from "../../../../Redux/FinanceContext";
import { useDispatch, useSelector } from "react-redux";
import { updateExpense } from "../../../../Redux/slicers/expensesSlicer";
import Loading from "../../../SharedArea/Loading/Loading";
import Select from "react-select";

const EditExpense = (props: { expense: ExpenseModel }) => {
    const context = useContext(UserContext);
    const dispatch: ExpensesDispatch = useDispatch();
    const [selectedDate, setSelectedDate] = useState<Date>(props.expense ? new Date(props.expense.pay_date) : new Date());
    const { register, handleSubmit, formState, setValue } = useForm<ExpenseModel>();
    const [amount, setAmount] = useState("");

    function handleAddCategory() {
        const addCategoryElement = document.getElementById("add-category-overlay");
        if (addCategoryElement) {
            addCategoryElement.classList.add("visible");
        }
        else {
            alert("Error: Could not find the add category element.");
        }
    }

    function handleAddBudget() {
        const addBudgetElement = document.getElementById("add-budget-overlay");
        if (addBudgetElement) {
            addBudgetElement.classList.add("visible");
        }
        else {
            alert("Error: Could not find the add budget element.");
        }
    }

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

    const categories = useSelector((state: UserCategoriesState) => state.userCategories.categories);
    const budgets = useSelector((state: BudgetsState) => state.budgets.budgets);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [selectedBudget, setSelectedBudget] = useState(null);
    const options = [
        { value: 0, label: "הוספת קטגוריה" },
        ...categories
            .map((category) => ({
                value: category.id,
                label: category.category_name,
            }))
            .sort((a, b) => a.label.localeCompare(b.label, 'he'))
    ];

    const budgetOptions = [
        { value: 0, label: "הוספת תקציב", isAddOption: true },
        ...budgets.map((budget) => ({
            value: budget.id,
            label: budget.name,
            remaining: Math.floor(Number(budget.remaining_amount)),
            total: Math.floor(Number(budget.amount)),
            isAddOption: false
        }))
    ];

    // Custom onChange handler to intercept "Add Category" selection
    interface CategoryOption {
        value: number;
        label: string;
    }

    interface BudgetOption {
        value: number | null;
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

    function handleBudgetChange(selected: BudgetOption | null): void {
        if (selected && selected.value === 0) {
            handleAddBudget();
            setSelectedBudget(null); // Keep the field empty after opening overlay
        } else {
            setSelectedBudget(selected);
        }
    }


    const closeEditExpense = () => {
        const backgroundHandler = document.getElementById("EditExpense");
        if (backgroundHandler) {
            backgroundHandler.classList.remove("visible");
        }
    }

    useEffect(() => {
        document.querySelectorAll(".react-datepicker__input-container input").forEach((input) => { (input as HTMLInputElement).readOnly = true });
        const backgroundHandler = document.getElementById("EditExpense");
        const handleClick = (e: MouseEvent) => {
            if (e.target === backgroundHandler) {
                closeEditExpense();
            }
        };
        const escapeKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                closeEditExpense();
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
            setAmount(Number(props.expense.amount).toLocaleString("en-US"));
            setValue("description", props.expense.description);
            setSelectedDate(new Date(props.expense.pay_date));
            if (props.expense.category) {
                const category = categories.find((cat) => cat.id === props.expense.category);
                if (category) {
                    setSelectedCategory({ value: category.id, label: category.category_name });
                }
            } else {
                setSelectedCategory(null);
            }
            if (props.expense.budget) {
                const budget = budgets.find((b) => b.id === props.expense.budget);
                if (budget) {
                    setSelectedBudget({
                        value: budget.id,
                        label: budget.name,
                        remaining: Math.floor(Number(budget.remaining_amount)),
                        total: Math.floor(Number(budget.amount)),
                        isAddOption: false
                    });
                }
            } else {
                setSelectedBudget(null);
            }
        }
        setValue("user", context.user ? context.user.id : 0);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [props.expense, context.user, setValue]);


    async function send(expense: ExpenseModel) {
        // Format date in local timezone to avoid timezone shift
        const year = selectedDate.getFullYear();
        const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
        const day = String(selectedDate.getDate()).padStart(2, '0');
        expense.pay_date = `${year}-${month}-${day}`;
        expense.id = props.expense.id;
        expense.category = selectedCategory ? selectedCategory.value : null;
        expense.budget = selectedBudget ? selectedBudget.value : null;
        expense.amount = Number(amount.replace(/,/g, ''));
        try {
            dispatch(updateExpense(expense));
            // backgroundHandler.style.display = "none";
            closeEditExpense();
        } catch (err) {
            alert(err);
        }
    }


    return (
        <div className="EditExpense" id="EditExpense">
            <div className="EditExpenseContent">
                {props.expense ? (
                    <>
                        <h3>עריכת הוצאה</h3>
                        <form onSubmit={handleSubmit(send)}>
                            {/* Amount Field */}
                            <span>{formState.errors.amount?.message}</span>
                            <div className="form-floating">
                                <input
                                    type="text"
                                    className="form-control"
                                    id="firstFocus"
                                    value={amount}
                                    onChange={(e) => handleAmountChange(e)}
                                />
                                <label>סכום</label>
                            </div>

                            {/* Description Field */}
                            <div className="form-floating">
                                <input
                                    type="text"
                                    id="secondFocus"
                                    className="form-control"
                                    {...register("description")}
                                />
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
                            <br />


                            {/* Budget Field */}
                            <Select
                                value={selectedBudget}
                                onChange={(selected) => handleBudgetChange(selected)}
                                options={budgetOptions}
                                placeholder="תקציב..."
                                isSearchable
                                isClearable
                                formatOptionLabel={(option: any) => (
                                    <div style={{ textAlign: 'center' }}>
                                        <div>{option.label}</div>
                                        {!option.isAddOption && option.remaining !== undefined && (
                                            <div style={{ fontSize: '14px', color: option.remaining < 0 ? '#dc3545' : '#007bff', marginTop: '2px' }}>
                                                {option.total.toLocaleString()} / {option.remaining < 0 ? Math.abs(option.remaining).toLocaleString() + '-' : option.remaining.toLocaleString()}
                                            </div>
                                        )}
                                    </div>
                                )}
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
                            <br />

                            {/* Pay Date Field */}
                            <div className="form-floating">
                                <span className="spanTitle"> תאריך תשלום </span>
                                <DatePicker
                                    selected={selectedDate}
                                    onChange={(date: Date) => (setSelectedDate(date))}
                                    dateFormat="dd/MM/yyyy"
                                    showMonthDropdown
                                    showYearDropdown
                                    dropdownMode="select"
                                    locale="he"
                                    placeholderText="בחר תאריך"
                                    yearDropdownItemNumber={15}
                                    scrollableYearDropdown
                                />
                            </div>                            <button type="submit" className="button-29">עדכון</button>
                        </form>
                    </>
                ) : (
                    <Loading />
                )}
            </div>
        </div>
    );
};

export default EditExpense;
