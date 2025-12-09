import { useContext, useEffect, useState } from "react";
import { UserContext } from "../../../Redux/UserContext";
import { useForm } from "react-hook-form";
import IncomeModel from "../../../Models/IncomeModel";
import "./AddIncome.css";
import DatePicker, { registerLocale } from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import he from "date-fns/locale/he";
import { useDispatch, useSelector } from "react-redux";
import { IncomesDispatch, UserCategoriesState } from "../../../Redux/FinanceContext";
import { addIncome } from "../../../Redux/slicers/incomesSlicer";
import Select from "react-select";

registerLocale("he", he);

function AddIncome(): JSX.Element {
	const context = useContext(UserContext);
	const dispatch: IncomesDispatch = useDispatch();
	const categories = useSelector((state: UserCategoriesState) => state.userCategories.categories);
	const [success, setSuccess] = useState(false); // After adding changes styles
	const currentDate = new Date();
	const [amount, setAmount] = useState("");
	const [payDate, setPayDate] = useState(currentDate);
	const { register, handleSubmit, formState, reset } =
		useForm<IncomeModel>();
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

	async function send(income: IncomeModel, resetForm: Function) {
		const year = payDate.getFullYear();
		const month = String(payDate.getMonth() + 1).padStart(2, '0');
		const day = String(payDate.getDate()).padStart(2, '0');
		income.date = `${year}-${month}-${day}`;
		income.amount = Number(amount.replace(/,/g, ''));
		income.category = selectedCategory ? selectedCategory.value : null;
		try {
			dispatch(addIncome(income));
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
		<div className="AddIncome">
			<div className={`${success ? "success" : ""}`}>
				<h3>הכנסה חדשה</h3>
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

export default AddIncome;
