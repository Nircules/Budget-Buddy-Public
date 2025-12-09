import "./Incomes.css";
import "../IncomeCard/IncomeMobile.css";
import { useContext, useEffect, useState } from "react";
import { UserContext } from "../../../Redux/UserContext";
import { useNavigate } from "react-router-dom";
import {
	IncomesDispatch,
	IncomesState,
} from "../../../Redux/FinanceContext";
import { useDispatch, useSelector } from "react-redux";
import {
	calculateTotalAmount,
	changeSortIncomes,
	deleteIncome,
} from "../../../Redux/slicers/incomesSlicer";
import { useMediaQuery } from "../../ExpensesArea/Expenses/useMedia";
import IncomeModel from "../../../Models/IncomeModel";
import AddIncome from "../AddIncome/AddIncome";
import ConfirmDialog from "../../ConfirmDialog/ConfirmDialog";
import IncomeCardList from "../IncomeCard/IncomeCardList";
import IncomeMobile from "../IncomeCard/IncomeMobile";
import EditIncome from "../EditIncome/EditIncome";


function Incomes(): JSX.Element {
	const navigate = useNavigate();
	const dispatch: IncomesDispatch = useDispatch();
	const isMobile = useMediaQuery("(max-width: 840px)");
	const context = useContext(UserContext);
	const incomes = useSelector(
		(state: IncomesState) => state.incomes.value
	);

	const sorting = useSelector(
		(state: IncomesState) => state.incomes.sorting
	);
	const [currentPeriodStart, setCurrentPeriodStart] = useState(new Date());
	const [currentPeriodEnd, setCurrentPeriodEnd] = useState(new Date());
	const [payDay, setPayDay] = useState<number>();
	const [editIncome, setEditIncome] = useState<IncomeModel>();


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

	// Filter the incomes to show only the ones in the current period
	let filteredIncomes = incomes.filter((income) => {
		const start = new Date(currentPeriodStart);
		start.setHours(0, 0, 0, 0);
		const end = new Date(currentPeriodEnd);
		end.setHours(23, 59, 59, 999);
		const incomeDate = new Date(income.date);
		return start <= incomeDate && incomeDate <= end;
	});

	const sortByFunc = (sortBy: {
		sort: "amount" | "date" | "description" | "category";
	}) => {
		const order =
			sorting.sort === sortBy.sort && sorting.order === "ascending"
				? "descending"
				: "ascending";
		dispatch(changeSortIncomes({ sort: sortBy.sort, order }));
	};

	let totalAmount = calculateTotalAmount(filteredIncomes);

	const [confirmOpen, setConfirmOpen] = useState(false);
	const [confirmIncome, setConfirmIncome] = useState<IncomeModel>();

	useEffect(() => {
		if (context.user === null) {
			navigate("/login");
		} else if (context.profile !== null) {
			setPayDay(Number(context.profile.pay_day));
			if (payDay > 0) {
				setCurrentPeriodStart(getCurrentPeriod());
				setCurrentPeriodEnd(getCurrentPeriodEnd(currentPeriodStart));
			}
			dispatch(changeSortIncomes({ sort: "date", order: "descending" }));
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

	const handleDeleteClick = async (confirmIncome: IncomeModel) => {
		setConfirmIncome(confirmIncome);
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
		dispatch(deleteIncome(confirmIncome.id));
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
		<div className="Incomes">
			<div className="add-income">
				<AddIncome />
			</div>

			<div className="titleContainer">
				<div className="titleItem rightCol">
					<button onClick={goToPrevMonth} className="button-29">
						חודש קודם<br />→
					</button>
				</div>

				<div className="titleItem middleCol">
					<div className="month-label">
						הכנסות לחודש<br />{formatDate(currentPeriodStart)}
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
				</div>
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
					<div className="income-list">
						{filteredIncomes.map(exp => (
							<IncomeMobile
								key={exp.id}
								income={exp}
								setEditIncome={setEditIncome}
							/>
						))}
					</div>
				</>
			) : (
				<table className="incomesTable">
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
						{filteredIncomes.map((income) => (
							<IncomeCardList
								key={income.id}
								income={income}
								setEditIncome={setEditIncome}
								handleDeleteClick={handleDeleteClick}
							/>
						))}
					</tbody>
				</table>
			)}
			<EditIncome income={editIncome} />
			{/* <AddHiddenRecIncome income={newIncome} /> */}
			{confirmOpen && (
				<ConfirmDialog
					message={`למחוק את ההכנסה ${confirmIncome.description} על סך ₪${Number(confirmIncome.amount).toLocaleString("en-US")}?`}
					onConfirm={handleConfirm}
					onCancel={handleCancel}
				/>
			)}
		</div>
	);
}

export default Incomes;
