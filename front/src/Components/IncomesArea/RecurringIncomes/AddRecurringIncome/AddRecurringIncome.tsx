import { useContext, useEffect, useState } from "react";
import { UserContext } from "../../../../Redux/UserContext";
import "./AddRecurringIncome.css";
import { RecurringIncomesDispatch } from "../../../../Redux/FinanceContext";
import { useDispatch } from "react-redux";
import RecurringIncomeModel from "../../../../Models/RecurringIncomeModel";
import { useForm } from "react-hook-form";
import DatePicker, { registerLocale } from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import he from "date-fns/locale/he";
import { addRecurringIncome } from "../../../../Redux/slicers/recurringIncomesSlicer";

registerLocale("he", he);

function AddRecurringIncome(): JSX.Element {
    const [success, setSuccess] = useState(false); // After adding changes styles
    const context = useContext(UserContext);
    const dispatch: RecurringIncomesDispatch = useDispatch();
    const currentDate = new Date();
    const [amount, setAmount] = useState("");
    const [startingDate, setStartingDate] = useState(currentDate);
    const [endDate, setEndDate] = useState(null);
    const [quickEndDate, setQuickEndDate] = useState(""); // For quick month selection
    const [minDate, setMinDate] = useState(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, currentDate.getDate()));
    const { register, handleSubmit, formState, reset } = useForm<RecurringIncomeModel>();
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

    // Handle quick end date selection
    function handleQuickEndDateChange(event: React.ChangeEvent<HTMLSelectElement>) {
        const months = event.target.value;
        setQuickEndDate(months);

        if (months === "") {
            return; // User selected "בחר..." option
        }

        const monthsToAdd = parseInt(months);
        const newEndDate = new Date(startingDate);
        newEndDate.setMonth(newEndDate.getMonth() + monthsToAdd);
        setEndDate(newEndDate);
    }

    // Handle the select change
    const handleSelectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedOption(event.target.value);
        changeMinimumDate(startingDate, event.target.value);
    };

    // Send the data to the server
    async function send(incomeForm: RecurringIncomeModel, resetForm: Function) {
        incomeForm.start_date = startingDate.toISOString().split("T")[0];
        endDate ? setEndDate(new Date(endDate.setHours(23, 59, 59, 999))) : setEndDate(null);
        incomeForm.end_date = endDate ? endDate.toISOString().split("T")[0] : null;
        selectedOption === "option1" ? incomeForm.frequency = "M" : incomeForm.frequency = selectedOption;
        incomeForm.amount = Number(amount.replace(/,/g, ''));
        try {
            console.log(endDate);
            dispatch(addRecurringIncome(incomeForm));
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
        <div className="AddRecurringIncome">
            <div className={`${success ? "success" : ""}`}>
                <h3>הכנסה קבועה חדש</h3>
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
                    <div className="form-floating">
                        <input type="text" className="form-control" {...register("category")} />
                        <label>קטגוריה</label>
                    </div>

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
                        <select
                            value={quickEndDate}
                            onChange={handleQuickEndDateChange}
                            style={{ marginBottom: "10px" }}
                        >
                            <option value="">בחר תקופה...</option>
                            <option value="1">חודש אחד</option>
                            <option value="2">חודשיים</option>
                            <option value="3">3 חודשים</option>
                            <option value="4">4 חודשים</option>
                            <option value="5">5 חודשים</option>
                            <option value="6">6 חודשים</option>
                            <option value="7">7 חודשים</option>
                            <option value="8">8 חודשים</option>
                            <option value="9">9 חודשים</option>
                            <option value="10">10 חודשים</option>
                            <option value="11">11 חודשים</option>
                            <option value="12">שנה</option>
                        </select>

                        <DatePicker
                            selected={endDate ? endDate : null}
                            onChange={(date) => setEndDate(date)}
                            dateFormat="dd/MM/yyyy"
                            showMonthDropdown
                            showYearDropdown
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
                            <option value="BM">דו-חודשי</option>
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

export default AddRecurringIncome;
