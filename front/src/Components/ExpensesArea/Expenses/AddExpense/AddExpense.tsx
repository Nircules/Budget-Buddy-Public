import { useContext, useEffect, useState } from "react";
import { UserContext } from "../../../../Redux/UserContext";
import { useForm } from "react-hook-form";
import ExpenseModel from "../../../../Models/ExpenseModel";
import "./AddExpense.css";
import DatePicker, { registerLocale } from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import he from "date-fns/locale/he";
import { useDispatch, useSelector } from "react-redux";
import { BudgetsState, ExpensesDispatch, UserCategoriesState } from "../../../../Redux/FinanceContext";
import { addExpense } from "../../../../Redux/slicers/expensesSlicer";
import Select from "react-select";

registerLocale("he", he);

function AddExpense(): JSX.Element {
	const context = useContext(UserContext);
	const dispatch: ExpensesDispatch = useDispatch();
	const categories = useSelector((state: UserCategoriesState) => state.userCategories.categories);
	const budgets = useSelector((state: BudgetsState) => state.budgets.budgets);
	const [success, setSuccess] = useState(false); // After adding changes styles	
	const currentDate = new Date();
	const [amount, setAmount] = useState("");
	const [payDate, setPayDate] = useState(currentDate);
	const { register, handleSubmit, formState, reset } =
		useForm<ExpenseModel>();
	register("user", { value: context.user ? context.user.id : 0 });

	const [selectedCategory, setSelectedCategory] = useState(null);
	const [selectedBudget, setSelectedBudget] = useState(null);
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

	// Set the date input to read-only so the user can only pick a date from the calendar
	useEffect(() => {
		(
			document.querySelector(
				".react-datepicker__input-container input"
			) as HTMLInputElement
		).readOnly = true;
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


	// Send the expense to the server
	async function send(expense: ExpenseModel, resetForm: Function) {
		expense.pay_date = payDate.toISOString().split("T")[0];
		if (expense.category === 0 || expense.category === undefined) {
			expense.category = null;
		}
		expense.category = selectedCategory ? selectedCategory.value : null;
		expense.amount = Number(amount.replace(/,/g, ''));
		expense.budget = selectedBudget ? selectedBudget.value : null;
		try {
			dispatch(addExpense(expense));
			resetForm();
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
		<div className="AddExpense">
			<div className={`${success ? "success" : ""}`}>
				<h3>הוצאה חדשה</h3>
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
						<input
							type="text"
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
							selected={payDate}
							onChange={(date) => setPayDate(date)}
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

					<button type="submit" className="button-29">
						הוסף
					</button>
				</form>
			</div>
		</div>
	);
}

export default AddExpense;
