import { useContext, useEffect, useState } from "react";
import { UserContext } from "../../../../Redux/UserContext";
import { useForm } from "react-hook-form";
import ExpenseModel from "../../../../Models/ExpenseModel";
import "./AddHiddenRec.css";
import DatePicker, { registerLocale } from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import he from "date-fns/locale/he";
import { ExpensesDispatch, UserCategoriesState } from "../../../../Redux/FinanceContext";
import { useDispatch, useSelector } from "react-redux";
import { addExpense } from "../../../../Redux/slicers/expensesSlicer";
import Loading from "../../../SharedArea/Loading/Loading";
import Select from "react-select";
registerLocale("he", he);

const AddHiddenRec = (props: { expense: ExpenseModel }) => {
    const context = useContext(UserContext);
    const dispatch: ExpensesDispatch = useDispatch();
    let currentDate = new Date();
    const categories = useSelector((state: UserCategoriesState) => state.userCategories.categories);
    const [selectedDate, setSelectedDate] = useState<Date>(currentDate);
    const { register, handleSubmit, formState, setValue } = useForm<ExpenseModel>();
    const [amount, setAmount] = useState("");

    const closeAddHiddenRec = () => {
        const backgroundHandler = document.getElementById("AddHiddenRec");
        if (backgroundHandler) {
            backgroundHandler.classList.remove("visible");
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

    function handleAmountChange(event: React.ChangeEvent<HTMLInputElement>) {
        const value = event.target.value.replace(/[^\d]/g, "");
        if (value.length > 8) return;
        const formattedValue = value ? Number(value).toLocaleString() : "";
        setAmount(formattedValue);
        if (formState.errors.amount) {
            formState.errors.amount.message = "";
        }
    }

    useEffect(() => {
        document.querySelectorAll(".react-datepicker__input-container input").forEach((input) => { (input as HTMLInputElement).readOnly = true });
        const backgroundHandler = document.getElementById("AddHiddenRec");
        const handleClick = (e: MouseEvent) => {
            if (e.target === backgroundHandler) {
                closeAddHiddenRec();
            }
        };
        const escapeKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                closeAddHiddenRec();
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
    }, []);

    useEffect(() => {
        if (props.expense) {
            setValue("amount", props.expense.amount);
            setValue("description", props.expense.description);
            setAmount(Math.round(props.expense.amount).toLocaleString('en-US'));
        }
        setValue("user", context.user ? context.user.id : 0);
    }, [props.expense, context.user, setValue]);

    async function send(expense: ExpenseModel) {
        expense.pay_date = selectedDate.toISOString().split("T")[0];
        expense.amount = Number(amount.replace(/,/g, ''));
        expense.category = selectedCategory ? selectedCategory.value : null;
        try {
            dispatch(addExpense(expense));
            closeAddHiddenRec();
        } catch (err) {
            alert(err);
        }
    }

    return (
        <div className="AddHiddenRec" id="AddHiddenRec">
            <div className="AddHiddenRecContent">

                {props.expense ? (
                    <>
                        <h3>הוספת תשלום קבוע להוצאות</h3>
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
                                    minDate={new Date(new Date().setFullYear(new Date().getFullYear() - 3))}
                                    maxDate={new Date(new Date().setFullYear(new Date().getFullYear() + 3))}
                                />
                            </div>

                            <button type="submit" className="button-29">הוסף</button>
                        </form>
                    </>
                ) : (
                    <Loading />
                )}
            </div>
        </div>
    );
};

export default AddHiddenRec;
