import "./Expenses.css";
import "./ExpenseCard/MobileCard.css"
import { useContext, useEffect, useState } from "react";
import { UserContext } from "../../../Redux/UserContext";
import { useNavigate } from "react-router-dom";
import {
	ExpensesDispatch,
	ExpensesState,
	RecurringExpensesDispatch,
	RecurringExpensesState,
} from "../../../Redux/FinanceContext";
import { useDispatch, useSelector } from "react-redux";
import {
	calculateTotalAmount,
	changeSort,
	deleteExpense,
} from "../../../Redux/slicers/expensesSlicer";
import { changeSort as recSort } from "../../../Redux/slicers/recurringExpenseSlicer";
import AddExpense from "../Expenses/AddExpense/AddExpense";
import ExpenseCardList from "./ExpenseCard/ExpenseCardList";
import RecurringExpenseList from "../RecurringExpenses/RecurringExpenseCard/RecurringExpenseList";
import AddHiddenRec from "../RecurringExpenses/AddHiddenRec/AddHiddenRec";
import ExpenseModel from "../../../Models/ExpenseModel";
import EditExpense from "./EditExpense/EditExpense";
import MobileCard from "./ExpenseCard/MobileCard";
import { useMediaQuery } from "./useMedia";
import ConfirmDialog from "../../ConfirmDialog/ConfirmDialog";
import RecExpMobileCard from "../RecurringExpenses/RecurringExpenseCard/RecExpMobileCard";
import ExpenseSearch from "./ExpenseSearch/ExpenseSearch";

function Expenses(): JSX.Element {
	const navigate = useNavigate();
	const dispatch: ExpensesDispatch = useDispatch();
	const recDispatch: RecurringExpensesDispatch = useDispatch();
	const isMobile = useMediaQuery("(max-width: 840px)");
	const isMobileRecurring = useMediaQuery("(max-width: 1000px)");
	const context = useContext(UserContext);
	const expenses = useSelector(
		(state: ExpensesState) => state.expenses.value
	);
	const recurringExpenses = useSelector(
		(state: RecurringExpensesState) =>
			state.recurringExpenses.active_expenses
	);
	const todayRecurringExpenses = useSelector(
		(state: RecurringExpensesState) =>
			state.recurringExpenses.todayExpenses
	);
	const sorting = useSelector(
		(state: ExpensesState) => state.expenses.sorting
	);
	const recSorting = useSelector(
		(state: RecurringExpensesState) => state.recurringExpenses.recSorting
	);
	const [currentPeriodStart, setCurrentPeriodStart] = useState(new Date());
	const [currentPeriodEnd, setCurrentPeriodEnd] = useState(new Date());
	const [payDay, setPayDay] = useState<number>();
	const [newExpense, setNewExpense] = useState<ExpenseModel>();
	const [editExpense, setEditExpense] = useState<ExpenseModel>();

	// Search and filter states
	const [searchTerm, setSearchTerm] = useState("");
	const [categoryFilter, setCategoryFilter] = useState<number | null>(null);
	const [budgetFilter, setBudgetFilter] = useState<number | null>(null);
	const [minAmount, setMinAmount] = useState("");
	const [maxAmount, setMaxAmount] = useState("");
	const [timeFilter, setTimeFilter] = useState<number | null>(null);

	const hasActiveFilters = searchTerm || categoryFilter || budgetFilter || minAmount || maxAmount || timeFilter !== null;


	// Gets the current pay period start date
	const getCurrentPeriod = () => {
		let year = new Date().getFullYear();
		let month = new Date().getMonth();
		let day = new Date().getDate();
		if (day >= payDay) {
			return new Date(year, month, payDay);
		} else {
			month -= 1;
			if (month < 0) {
				year -= 1;
				month = 11; // December
			}
			return new Date(year, month, payDay);
		}
	};

	// Gets the current pay period end date
	const getCurrentPeriodEnd = (date: Date) => {
		let year = date.getFullYear();
		let month = date.getMonth();
		let day = date.getDate();
		if (day >= payDay) {
			month += 1;
			if (month > 11) {
				year += 1;
				month = 0; // January
			}
			return new Date(year, month, payDay - 1);
		} else {
			return new Date(year, month, payDay - 1);
		}
	};

	// Go to the previous month
	const goToPrevMonth = () => {
		const prevMonth = new Date(
			currentPeriodStart.getFullYear(),
			currentPeriodStart.getMonth() - 1,
			currentPeriodStart.getDate()
		);
		setCurrentPeriodStart(prevMonth);
		setCurrentPeriodEnd(
			new Date(
				currentPeriodStart.getFullYear(),
				currentPeriodStart.getMonth(),
				currentPeriodStart.getDate() - 1
			)
		);
	};

	// Go to the next month
	const goToNextMonth = () => {
		const nextMonth = new Date(
			currentPeriodStart.getFullYear(),
			currentPeriodStart.getMonth() + 1,
			currentPeriodStart.getDate()
		);
		setCurrentPeriodStart(nextMonth);
		setCurrentPeriodEnd(
			new Date(
				nextMonth.getFullYear(),
				nextMonth.getMonth() + 1,
				nextMonth.getDate() - 1
			)
		);
	};

	// Filter the expenses - either by current period OR by time filter
	let filteredExpenses = expenses.filter((expense) => {
		const expenseDate = new Date(expense.pay_date);

		// If time filter is active, use it instead of monthly period
		if (timeFilter !== null) {
			if (timeFilter === 0) {
				// "All times" - show all expenses
				return true;
			}
			// Filter by months back from today
			const today = new Date();
			const monthsBack = new Date();
			monthsBack.setMonth(today.getMonth() - timeFilter);
			monthsBack.setHours(0, 0, 0, 0);
			return expenseDate >= monthsBack;
		}

		// Otherwise use current monthly period
		const start = new Date(currentPeriodStart);
		start.setHours(0, 0, 0, 0);
		const end = new Date(currentPeriodEnd);
		end.setHours(23, 59, 59, 999);
		return start <= expenseDate && expenseDate <= end;
	});

	// Apply search and filters
	let searchedExpenses = filteredExpenses.filter((expense) => {

		// Search term filter (description, amount, date)
		if (searchTerm) {
			const term = searchTerm.toLowerCase();
			const matchesDescription = expense.description?.toLowerCase().includes(term);
			const matchesAmount = expense.amount.toString().includes(term);
			const expenseDate = new Date(expense.pay_date);
			const formattedDate = `${expenseDate.getDate().toString().padStart(2, "0")}/${(expenseDate.getMonth() + 1).toString().padStart(2, "0")}/${expenseDate.getFullYear().toString().slice(-2)}`;
			const matchesDate = formattedDate.includes(term);

			if (!matchesDescription && !matchesAmount && !matchesDate) {
				return false;
			}
		}

		// Category filter
		if (categoryFilter !== null && expense.category !== categoryFilter) {
			return false;
		}

		// Budget filter
		if (budgetFilter !== null && expense.budget !== budgetFilter) {
			return false;
		}

		// Amount range filter
		if (minAmount && Number(expense.amount) < Number(minAmount)) {
			return false;
		}
		if (maxAmount && Number(expense.amount) > Number(maxAmount)) {
			return false;
		}

		return true;
	});

	const handleClearFilters = () => {
		setSearchTerm("");
		setCategoryFilter(null);
		setBudgetFilter(null);
		setMinAmount("");
		setMaxAmount("");
		setTimeFilter(null);
	};

	const sortByFunc = (sortBy: {
		sort: "amount" | "date" | "description" | "category";
	}) => {
		const order =
			sorting.sort === sortBy.sort && sorting.order === "ascending"
				? "descending"
				: "ascending";
		dispatch(changeSort({ sort: sortBy.sort, order }));
	};

	// Sort the recurring expenses by the selected column
	const sortByRecFunc = (sortBy: {
		sort:
		| "start_date"
		| "end_date"
		| "frequency"
		| "amount"
		| "category"
		| "description";
	}) => {
		recDispatch(
			recSort({
				sort: sortBy.sort,
				order:
					recSorting.sort === sortBy.sort && recSorting.order === "ascending"
						? "descending"
						: "ascending",
				active: true,
			})
		);
	};

	let totalAmount = calculateTotalAmount(searchedExpenses);

	const [confirmOpen, setConfirmOpen] = useState(false);
	const [confirmExpense, setConfirmExpense] = useState<ExpenseModel>();

	useEffect(() => {
		if (context.user === null) {
			navigate("/login");
		} else if (context.profile !== null) {
			setPayDay(Number(context.profile.pay_day));
			if (payDay > 0) {
				setCurrentPeriodStart(getCurrentPeriod());
				setCurrentPeriodEnd(getCurrentPeriodEnd(currentPeriodStart));
			}
			dispatch(changeSort({ sort: "date", order: "descending" }));
			recDispatch(recSort({ sort: "start_date", order: "descending", active: true }));
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [context.user, navigate, payDay]);

	const formatDate = (date: Date) => {
		const startDay = date.getDate().toString().padStart(2, "0");
		let startMonth = date.getMonth() + 1; // getMonth() is zero-based
		// let startYear = date.getFullYear();

		// Calculate the end date as one month later, then subtract one day
		let endDate = new Date(
			date.getFullYear(),
			date.getMonth() + 1,
			date.getDate()
		);
		endDate.setDate(endDate.getDate() - 1); // Subtract one day to get the last day of the current month

		const endDay = endDate.getDate().toString().padStart(2, "0");
		let endMonth = endDate.getMonth() + 1;
		// let endYear = endDate.getFullYear();

		// Format startMonth and endMonth with leading zeros
		const startMonthStr = startMonth.toString().padStart(2, "0");
		const endMonthStr = endMonth.toString().padStart(2, "0");

		// Extract the last two digits of the startYear and endYear
		// const startYearStr = startYear.toString().slice(-2);
		// const endYearStr = endYear.toString().slice(-2);

		return `${endDay}/${endMonthStr} - ${startDay}/${startMonthStr}`;
	};

	const handleDeleteClick = async (confirmExpense: ExpenseModel) => {
		setConfirmExpense(confirmExpense);
		await new Promise(resolve => setTimeout(resolve, 50)); // Wait for the dialog to be ready
		setConfirmOpen(true);
		await new Promise(resolve => setTimeout(resolve, 50)); // Wait for the dialog to be ready
		// Show the confirm dialog
		const confirmDialog = document.getElementById("ConfirmDialog");
		if (confirmDialog) {
			confirmDialog.classList.add("visible");
		}
	};

	const handleConfirm = () => {
		setConfirmOpen(false);
		dispatch(deleteExpense(confirmExpense.id));
	};

	const handleCancel = async () => {
		// Hide the confirm dialog
		const confirmDialog = document.getElementById("ConfirmDialog");
		if (confirmDialog) {
			confirmDialog.classList.remove("visible");
		}
		await new Promise(resolve => setTimeout(resolve, 300)); // Wait for the dialog to close
		setConfirmOpen(false);
	};


	return (
		<>
			{/* Search and Filter Component */}
			<ExpenseSearch
				onSearchChange={setSearchTerm}
				onCategoryFilter={setCategoryFilter}
				onBudgetFilter={setBudgetFilter}
				onAmountFilter={(min, max) => {
					setMinAmount(min);
					setMaxAmount(max);
				}}
				onTimeFilter={setTimeFilter}
				onClearFilters={handleClearFilters}
				resultCount={searchedExpenses.length}
				totalCount={filteredExpenses.length}
			/>
			<div className="Expenses">
				<div className="add-expense">
					<AddExpense />
				</div>


				{/* Title Header */}
				<div className="titleContainer">
					{!hasActiveFilters ? (
						<>
							<div className="titleItem rightCol">
								<button onClick={goToPrevMonth} className="button-29">
									חודש קודם<br />→
								</button>
							</div>

							<div className="titleItem middleCol">
								<div className="month-label">
									הוצאות לחודש<br />{formatDate(currentPeriodStart)}
								</div>
								<div className="total-amount">
									סך הכל:{" "}
									₪
									{totalAmount > 0
										? totalAmount.toLocaleString()
										: totalAmount.toLocaleString()}
								</div>
							</div>


							<div className="titleItem leftCol">
								<button onClick={goToPrevMonth} className="button-29 smallScreenButton">
									חודש קודם<br />→
								</button>
								<button onClick={goToNextMonth} className="button-29">
									חודש הבא<br />←
								</button>
							</div></>) : (
						<div className="titleItem middleCol">
							<div className="month-label">
								תוצאות חיפוש
							</div>
							<div className="total-amount">
								סך הכל:{" "}
								₪
								{totalAmount > 0
									? totalAmount.toLocaleString()
									: totalAmount.toLocaleString(
									)}
							</div>
						</div>
					)}
				</div>



				{isMobile ? (

					<>
						{/* ─── Mobile Sort Bar ───────────────────────── */}
						<div className="mobile-sort-bar">
							<button data-sort="date" onClick={() => sortByFunc({ sort: "date" })}>
								תאריך
							</button>
							<button data-sort="description" onClick={() => sortByFunc({ sort: "description" })}>
								תיאור
							</button>
							<button data-sort="amount" onClick={() => sortByFunc({ sort: "amount" })}>
								סכום
							</button>
							<button data-sort="category" onClick={() => sortByFunc({ sort: "category" })}>
								קטגוריה
							</button>
						</div>

						{/* ─── Mobile Card List ─────────────────────────── */}
						<div className="expense-list">
							{searchedExpenses.map(exp => (
								<MobileCard
									key={exp.id}
									expense={exp}
									setEditExpense={setEditExpense}
								/>
							))}
						</div>
					</>
				) : (
					<table className="expensesTable">
						<thead>
							<tr>
								<th className="paymentDate" onClick={() => sortByFunc({ sort: "date" })}>
									תאריך
								</th>
								<th className="paymentDescription" onClick={() => sortByFunc({ sort: "description" })}>
									תיאור
								</th>
								<th className="paymentAmount" onClick={() => sortByFunc({ sort: "amount" })}>
									סכום
								</th>
								<th className="paymentCategory" onClick={() => sortByFunc({ sort: "category" })}>
									קטגוריה
								</th>
								<th className="smallCol paymentEdit">עריכה</th>
								<th className="smallCol paymentDelete" >מחיקה</th>
							</tr>
						</thead>
						<tbody>
							{searchedExpenses.map((expense) => (
								<ExpenseCardList
									key={expense.id}
									expense={expense}
									setEditExpense={setEditExpense}
									handleDeleteClick={handleDeleteClick}
								/>
							))}
						</tbody>
					</table>
				)}

				{/* ───────────────────────── Recurring Expenses ───────────────────────── */}
				{(recurringExpenses.length > 0 || todayRecurringExpenses.length > 0) && isMobileRecurring ? (
					<>
						{/* ────────────────── Mobile Sort Bar ───────────────────────── */}
						<div className="rec-expense-headTitle ">תשלומים קבועים</div>
						<div className="rec-expense-mobile-sort-bar">
							<button data-sort="start_date" onClick={() => sortByRecFunc({ sort: "start_date" })}>
								תאריך התחלה
							</button>
							<button data-sort="description" onClick={() => sortByRecFunc({ sort: "description" })}>
								תיאור
							</button>
							<button data-sort="amount" onClick={() => sortByRecFunc({ sort: "amount" })}>
								סכום
							</button>
							<button data-sort="category" onClick={() => sortByRecFunc({ sort: "category" })}>
								קטגוריה
							</button>
						</div>

						{/* ────────────────── Mobile Card List ─────────────────────────── */}
						<div className="rec-expense-list">
							{todayRecurringExpenses.length > 0 && (
								todayRecurringExpenses.map(exp => (
									<RecExpMobileCard
										key={exp.id}
										recExpense={exp}
										setEditRecurringExpense={''}
										setNewExpense={setNewExpense}
										isToday={true}
									/>
								))
							)}
							{recurringExpenses.map(exp => (
								<RecExpMobileCard
									key={exp.id}
									recExpense={exp}
									setEditRecurringExpense={''}
									setNewExpense={setNewExpense}
									isToday={false}
								/>
							))}
						</div>
					</>
				) : (
					(recurringExpenses.length > 0 || todayRecurringExpenses.length > 0) && (
						<table className="inactiveTable">
							<thead>
								<tr>
									<th colSpan={8} className="tableTitle">
										תשלומים קבועים
									</th>
								</tr>
								<tr>
									<th
										onClick={() =>
											sortByRecFunc({ sort: "start_date" })
										}
									>
										תאריך התחלה
									</th>
									<th
										onClick={() =>
											sortByRecFunc({ sort: "description" })
										}
									>
										תיאור
									</th>
									<th onClick={() => sortByRecFunc({ sort: "amount" })}>
										סכום
									</th>
									<th onClick={() => sortByRecFunc({ sort: "end_date" })}>
										תאריך סיום
									</th>
									<th
										onClick={() => sortByRecFunc({ sort: "frequency" })}
									>
										תדירות תשלום
									</th>
									<th onClick={() => sortByRecFunc({ sort: "category" })}>
										קטגוריה
									</th>
									<th className="smallCol">הוספה</th>
								</tr>
							</thead>
							<tbody>
								{todayRecurringExpenses.length > 0 && (
									todayRecurringExpenses.map(expense => (
										<RecurringExpenseList
											key={expense.id}
											expense={expense}
											setNewExpense={setNewExpense}
											setEditRecurringExpense={null}
											handleDeleteClick={''}
											isToday={true}
										/>
									))
								)}
								{recurringExpenses.map((expense) => (
									<RecurringExpenseList
										key={expense.id}
										expense={expense}
										setNewExpense={setNewExpense}
										setEditRecurringExpense={null}
										handleDeleteClick={''}
										isToday={false}
									/>
								))}
							</tbody>
						</table>
					)
				)}
				<EditExpense expense={editExpense} />
				<AddHiddenRec expense={newExpense} />
				{confirmOpen && (
					<ConfirmDialog
						message={`למחוק את ההוצאה ${confirmExpense.description} על סך ₪${Number(confirmExpense.amount).toLocaleString("en-US")}?`}
						onConfirm={handleConfirm}
						onCancel={handleCancel}
					/>
				)}
			</div></>
	);
}

export default Expenses;
