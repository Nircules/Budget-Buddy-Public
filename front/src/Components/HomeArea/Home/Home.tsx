import { useContext, useEffect, useMemo, useState } from "react";
import "./Home.css";
import { UserContext } from "../../../Redux/UserContext";
import { useNavigate } from "react-router-dom";
import BudgetComparison from "./BudgetComparison";
import { useDispatch, useSelector } from "react-redux";
import { ExpensesDispatch, ExpensesState, RecurringExpensesState, BudgetsState } from "../../../Redux/FinanceContext";
import ExpenseModel from "../../../Models/ExpenseModel";
import RecurringExpenseModel from "../../../Models/RecurringExpenseModel";
import { useMediaQuery } from "../../ExpensesArea/Expenses/useMedia";
import RecExpMobileCard from "../../ExpensesArea/RecurringExpenses/RecurringExpenseCard/RecExpMobileCard";
import RecurringExpenseList from "../../ExpensesArea/RecurringExpenses/RecurringExpenseCard/RecurringExpenseList";
import '../../ExpensesArea/RecurringExpenses/RecurringExpenses.css';
import '../../ExpensesArea/Expenses/Expenses.css';
import { deleteRecurringExpense } from "../../../Redux/slicers/recurringExpenseSlicer";
import ConfirmDialog from "../../ConfirmDialog/ConfirmDialog";
import EditRecurringExpense from "../../ExpensesArea/RecurringExpenses/EditRecurringExpense/EditRecurringExpense";
import BudgetProgress from "./BudgetProgress/BudgetProgress";
import BudgetHealthSummary from "./BudgetHealthSummary/BudgetHealthSummary";

function Home(): JSX.Element {
	const context = useContext(UserContext);
	const userProfile = context.profile;
	const isMobile = useMediaQuery("(max-width: 1000px)");
	const expenses = useSelector((state: ExpensesState) => state.expenses);
	const budgets = useSelector((state: BudgetsState) => state.budgets.budgets);
	const [editRecurringExpense, setEditRecurringExpense] = useState(null);
	const navigate = useNavigate();
	const [isExpensesLoaded, setIsExpensesLoaded] = useState(false);
	const recurringExpenses = useSelector((state: RecurringExpensesState) => state.recurringExpenses);
	const [recExpensesToCheck, setRecExpensesToCheck] = useState<RecurringExpenseModel[]>([]);
	const dispatch: ExpensesDispatch = useDispatch();


	const checkOutDateRecurring = (expenses: RecurringExpenseModel[]) => {
		const currentDate = new Date();
		const expensesToCheck: RecurringExpenseModel[] = [];
		expenses.forEach(expense => {
			if (currentDate > new Date(expense.end_date) && expense.end_date) {
				expensesToCheck.push(expense);
			}
		});
		setRecExpensesToCheck(expensesToCheck);
	};

	const [confirmOpen, setConfirmOpen] = useState(false);
	const [confirmExpense, setConfirmExpense] = useState<RecurringExpenseModel>(null);

	const handleDeleteClick = async (expense: RecurringExpenseModel) => {
		setConfirmOpen(true);
		setConfirmExpense(expense);
		await new Promise(resolve => setTimeout(resolve, 50)); // Wait for the dialog to be ready
		// Show the confirm dialog
		const confirmDialog = document.getElementById("ConfirmDialog");
		if (confirmDialog) {
			confirmDialog.classList.add("visible");
		}
	};

	const handleConfirm = () => {
		setConfirmOpen(false);
		dispatch(deleteRecurringExpense(confirmExpense.id));
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

	// Redirect to login if user is not authenticated
	useEffect(() => {
		if (!context.user) {
			navigate("/login");
		}
	}, [context.user, navigate]);

	// **Ensure expenses are fully loaded before calculations**
	useEffect(() => {
		if (expenses.value && expenses.value.length > 0) {
			checkOutDateRecurring(recurringExpenses.active_expenses);
			setIsExpensesLoaded(true);
		}
	}, [expenses.value, recurringExpenses]);

	const pay_day = Number(userProfile?.pay_day) || 1; // Default to 1st

	// Calculate start and end of the budget period
	const { startOfMonth, endOfMonth, currentMonthDays, daysPassed } = useMemo(() => {
		const today = new Date();
		let start = new Date(today.getFullYear(), today.getMonth(), pay_day);
		let end = new Date(today.getFullYear(), today.getMonth() + 1, pay_day - 1);

		// Adjust if today is before payday
		if (today.getDate() < pay_day) {
			start.setMonth(today.getMonth() - 1);
			end.setMonth(today.getMonth());
		}

		const days = Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24) + 1);
		const daysPassed = Math.floor((today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24) + 1);
		return { startOfMonth: start, endOfMonth: end, currentMonthDays: days, daysPassed: daysPassed };
	}, [pay_day]); // Only recalculates when payday changes

	// Compute current expenses only when expenses are fully loaded
	const currentExpenses = useMemo(() => {
		if (!isExpensesLoaded) return null;

		return expenses.value
			.filter((expense: ExpenseModel) => {
				const expenseDate = new Date(expense.pay_date);
				return expenseDate >= startOfMonth && expenseDate <= endOfMonth;
			})
			.reduce((sum, expense) => sum + Number(expense.amount), 0);
	}, [isExpensesLoaded, expenses.value, startOfMonth, endOfMonth]);

	const dailyExpenses = useMemo(() => {
		if (!isExpensesLoaded) return null;

		const today = new Date();

		return expenses.value
			.filter((expense: ExpenseModel) => {
				const expenseDate = new Date(expense.pay_date);
				return expenseDate >= startOfMonth && expenseDate <= endOfMonth &&
					expenseDate.toDateString() === today.toDateString();
			})
			.reduce((sum, expense) => sum + Number(expense.amount), 0);
	}, [isExpensesLoaded, expenses.value, startOfMonth, endOfMonth]);

	const categoriesExpenses = useMemo(() => {
		if (!isExpensesLoaded) return null;

		return expenses.value
			.filter((expense: ExpenseModel) => {
				const expenseDate = new Date(expense.pay_date);
				return expenseDate >= startOfMonth && expenseDate <= endOfMonth;
			});
	}, [isExpensesLoaded, expenses.value, startOfMonth, endOfMonth]);

	return (
		<div className="Home Box">
			<h1>Budget Buddy</h1>

			{/* Budgets of the User */}
			{budgets.length > 0 && <BudgetProgress budgets={budgets} />}

			{/* Outdated Recurring Expenses */}
			<div className="recurring-checks">
				{recExpensesToCheck.length > 0 && (
					<>
						<h2>תשלומים קבועים שפג תוקפם</h2>
						{isMobile ? (
							<div className="rec-expense-list">
								{recExpensesToCheck.map(exp => (
									<RecExpMobileCard
										key={exp.id}
										recExpense={exp}
										setEditRecurringExpense={''}
										setNewExpense={''}
										isToday={false}
									/>
								))}
							</div>) : (
							<table className="expensesTable">
								<thead>
									<tr>
										<th>תאריך התחלה</th>
										<th>תיאור</th>
										<th>סכום</th>
										<th>תאריך סיום</th>
										<th>תדירות תשלום</th>
										<th>קטגוריה</th>
										<th className="smallCol">עריכה</th>
										<th className="smallCol">מחיקה</th>
									</tr>
								</thead>
								<tbody>
									{recExpensesToCheck.map((expense) => (
										<RecurringExpenseList
											key={expense.id}
											expense={expense}
											setNewExpense={null}
											setEditRecurringExpense={setEditRecurringExpense}
											handleDeleteClick={handleDeleteClick}
											isToday={false}
										/>
									))}
								</tbody>
							</table>
						)}
						<EditRecurringExpense expense={editRecurringExpense} />
						{confirmOpen && (
							<ConfirmDialog
								message={`למחוק את התשלום הקבוע "${confirmExpense.description}" על סך ₪${Number(confirmExpense.amount).toLocaleString("en-US")}?`}
								onConfirm={handleConfirm}
								onCancel={handleCancel}
							/>
						)}
					</>
				)}
			</div>

			{/* Doughnut Charts */}
			<h3>תובנות לתקציב החודשי </h3>
			<BudgetComparison
				currentExpenses={currentExpenses}
				dailyExpenses={dailyExpenses}
				savingTarget={userProfile?.saving_target ?? 0}
				expectedIncome={userProfile?.expected_income ?? 0}
				overallExpenses={expenses.totalAmount ?? 0}
				overallIncome={0}
				currentMonthDays={currentMonthDays}
				daysPassed={daysPassed}
				categoriesExpenses={categoriesExpenses}
				recExpensesAmount={recurringExpenses.totalAmount}
				budgets={budgets}
			/>

			{/* Budget Health Summary */}
			<BudgetHealthSummary
				budgets={budgets}
				expectedIncome={userProfile?.expected_income ?? 0}
				currentExpenses={currentExpenses ?? 0}
				savingTarget={userProfile?.saving_target ?? 0}
				daysRemaining={currentMonthDays - daysPassed}
			/>


		</div>
	);
}

export default Home;
