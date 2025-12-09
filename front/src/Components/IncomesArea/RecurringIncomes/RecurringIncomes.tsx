import "../Incomes/Incomes.css";
import "./RecurringIncomes.css";
// import "./RecurringIncomeCard/RecExpMobileCard.css";
import { useContext, useEffect, useState } from "react";
import { UserContext } from "../../../Redux/UserContext";
import { useNavigate } from "react-router-dom";
import { RecurringIncomesDispatch, RecurringIncomesState } from "../../../Redux/FinanceContext";
import { useDispatch, useSelector } from "react-redux";
import ConfirmDialog from "../../ConfirmDialog/ConfirmDialog";
import RecurringIncomeModel from "../../../Models/RecurringIncomeModel";
import { useMediaQuery } from "../../ExpensesArea/Expenses/useMedia";
import { calculateTotalAmount, changeSortRecIncomes, deleteRecurringIncome } from "../../../Redux/slicers/recurringIncomesSlicer";
import RecurringIncomeList from "./RecurringIncomeCard/RecurringIncomeList";
import AddRecurringIncome from "./AddRecurringIncome/AddRecurringIncome";


function RecurringIncomes(): JSX.Element {
	const navigate = useNavigate();
	const dispatch: RecurringIncomesDispatch = useDispatch();
	const isMobile = useMediaQuery("(max-width: 1000px)");
	const [editRecurringIncome, setEditRecurringIncome] = useState(null);
	const context = useContext(UserContext);
	const sorting = useSelector((state: RecurringIncomesState) => state.recurringIncomes.recSorting);
	const activeRecurringIncomes = useSelector(
		(state: RecurringIncomesState) => state.recurringIncomes.active_incomes
	);
	const inactiveRecurringIncomes = useSelector(
		(state: RecurringIncomesState) => state.recurringIncomes.inactive_incomes
	);
	const [confirmOpen, setConfirmOpen] = useState(false);
	const [confirmIncome, setConfirmIncome] = useState<RecurringIncomeModel>(null);

	const handleDeleteClick = async (confirmIncome: RecurringIncomeModel) => {
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
		dispatch(deleteRecurringIncome(confirmIncome.id));
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


	const sortByFunc = (
		sortBy: {
			sort: "start_date" | "end_date" | "frequency" | "amount" | "category" | "description";
		},
		active: boolean
	) => {
		if (sorting.sort === sortBy.sort) {
			if (sorting.order === "ascending") {
				dispatch(changeSortRecIncomes({ sort: sortBy.sort, order: "descending", active }));
			} else {
				dispatch(changeSortRecIncomes({ sort: sortBy.sort, order: "ascending", active }));
			}
		} else dispatch(changeSortRecIncomes({ sort: sortBy.sort, order: "descending", active }));
	};

	const totalAmount = calculateTotalAmount(activeRecurringIncomes);

	useEffect(() => {
		if (context.user === null) {
			navigate("/login");
		}
		dispatch(changeSortRecIncomes({ sort: "start_date", order: "descending", active: true }));
		dispatch(changeSortRecIncomes({ sort: "start_date", order: "descending", active: false }));
	}, [context.user, navigate, dispatch]);

	return (
		<div className="RecurringIncomes">

			<div className="titleContainer">
				<div className="titleItem middleCol">
					<div className="month-label">
						הוראות קבע / תשלומים קבועים
					</div>
					<div className="total-amount">
						סך הכל:{" "}
						₪
						{totalAmount > 0
							? totalAmount.toLocaleString()
							: totalAmount.toLocaleString()}
					</div>
				</div>
			</div>


			{isMobile ? (

				<>
					{/* ─── Mobile Sort Bar ───────────────────────── */}
					<div className="rec-income-mobile-sort-bar">
						<button data-sort="start_date" onClick={() => sortByFunc({ sort: "start_date" }, true)}>
							תאריך התחלה
						</button>
						<button data-sort="description" onClick={() => sortByFunc({ sort: "description" }, true)}>
							תיאור
						</button>
						<button data-sort="amount" onClick={() => sortByFunc({ sort: "amount" }, true)}>
							סכום
						</button>
						<button data-sort="category" onClick={() => sortByFunc({ sort: "category" }, true)}>
							קטגוריה
						</button>
					</div>

					{/* ─── Mobile Card List ─────────────────────────── */}
					{/* <div className="rec-income-list">
						{activeRecurringIncomes.map(exp => (
							<RecExpMobileCard
								key={exp.id}
								recIncome={exp}
								setEditRecurringIncome={''}
								setNewIncome={''}
							/>
						))}
					</div> */}
				</>
			) : (
				<table className="incomesTable">
					<thead>
						<tr>
							<th onClick={() => sortByFunc({ sort: "start_date" }, true)}>תאריך התחלה</th>
							<th onClick={() => sortByFunc({ sort: "description" }, true)}>תיאור</th>
							<th onClick={() => sortByFunc({ sort: "amount" }, true)}>סכום</th>
							<th onClick={() => sortByFunc({ sort: "end_date" }, true)}>תאריך סיום</th>
							<th onClick={() => sortByFunc({ sort: "frequency" }, true)}>תדירות תשלום</th>
							<th onClick={() => sortByFunc({ sort: "category" }, true)}>קטגוריה</th>
							<th className="smallCol">עריכה</th>
							<th className="smallCol">מחיקה</th>
						</tr>
					</thead>
					<tbody>
						{activeRecurringIncomes.map((income) => (
							<RecurringIncomeList key={income.id} income={income} setNewIncome={null} setEditRecurringIncome={setEditRecurringIncome} handleDeleteClick={handleDeleteClick} />
						))}
					</tbody>
				</table>
			)}

			{/* <EditRecurringIncome income={editRecurringIncome} /> */}
			<div className="add-income">
				<AddRecurringIncome />
			</div>
			{confirmOpen && (
				<ConfirmDialog
					message={`למחוק את התשלום הקבוע "${confirmIncome.description}" על סך ₪${Number(confirmIncome.amount).toLocaleString("en-US")}?`}
					onConfirm={handleConfirm}
					onCancel={handleCancel}
				/>
			)}

		</div>
	);
}

export default RecurringIncomes;
