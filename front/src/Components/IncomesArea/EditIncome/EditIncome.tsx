import { useContext, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import "./EditIncome.css";
import DatePicker, { registerLocale } from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import he from "date-fns/locale/he";
import { useDispatch, useSelector } from "react-redux";
import Select from "react-select";
import IncomeModel from "../../../Models/IncomeModel";
import { UserContext } from "../../../Redux/UserContext";
import { IncomesDispatch, UserCategoriesState } from "../../../Redux/FinanceContext";
import { updateIncome } from "../../../Redux/slicers/incomesSlicer";
import Loading from "../../SharedArea/Loading/Loading";
registerLocale("he", he);

const EditIncome = (props: { income: IncomeModel }) => {
    const context = useContext(UserContext);
    const dispatch: IncomesDispatch = useDispatch();
    const [selectedDate, setSelectedDate] = useState<Date>(props.income ? new Date(props.income.date) : new Date());
    const { register, handleSubmit, formState, setValue } = useForm<IncomeModel>();
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


    const closeEditIncome = () => {
        const backgroundHandler = document.getElementById("EditIncome");
        if (backgroundHandler) {
            backgroundHandler.classList.remove("visible");
        }
    }

    useEffect(() => {
        document.querySelectorAll(".react-datepicker__input-container input").forEach((input) => { (input as HTMLInputElement).readOnly = true });
        const backgroundHandler = document.getElementById("EditIncome");
        const handleClick = (e: MouseEvent) => {
            if (e.target === backgroundHandler) {
                closeEditIncome();
            }
        };
        const escapeKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                closeEditIncome();
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
        if (props.income) {
            setAmount(Number(props.income.amount).toLocaleString("en-US"));
            setValue("description", props.income.description);
            setSelectedDate(new Date(props.income.date));
            if (props.income.category) {
                const category = categories.find((cat) => cat.id === props.income.category);
                if (category) {
                    setSelectedCategory({ value: category.id, label: category.category_name });
                }
            } else {
                setSelectedCategory(null);
            }
        }
        setValue("user", context.user ? context.user.id : 0);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [props.income, context.user, setValue]);


    async function send(income: IncomeModel) {
        income.date = selectedDate.toISOString().split("T")[0];
        income.id = props.income.id;
        income.category = selectedCategory ? selectedCategory.value : null;
        income.amount = Number(amount.replace(/,/g, ''));
        try {
            dispatch(updateIncome(income));
            // backgroundHandler.style.display = "none";
            closeEditIncome();
        } catch (err) {
            alert(err);
        }
    }


    return (
        <div className="EditIncome" id="EditIncome">
            <div className="EditIncomeContent">
                {props.income ? (
                    <>
                        <h3>עריכת הכנסה</h3>
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

export default EditIncome;
