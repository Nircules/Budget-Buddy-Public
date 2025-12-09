import { PayloadAction, createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import config, { api } from "../../Utils/Config";
import ExpenseModel from "../../Models/ExpenseModel";

export function calculateTotalAmount(expenses: ExpenseModel[]): number {
	if (expenses.length > 0) {
		const calculatedTotalAmount = expenses.reduce(
			(totalamount, expense) => {
				const expenseAmount =
					typeof expense.amount === "string"
						? parseFloat(expense.amount)
						: expense.amount;
				return totalamount + expenseAmount;
			},
			0
		);
		return calculatedTotalAmount;
	} else {
		return 0;
	}
}

interface ExpensesState {
	value: ExpenseModel[];
	totalAmount: number;
	sorting: {
		sort: "date" | "amount" | "category" | "description";
		order: "ascending" | "descending";
	};
}

const initialState: ExpensesState = {
	value: [],
	totalAmount: 0,
	sorting: { sort: "date", order: "descending" },
};

// Sort expenses by date, amount, category or description
const sortExpenses = (
	expenses: ExpenseModel[],
	sorting: {
		sort: "date" | "amount" | "category" | "description";
		order: "ascending" | "descending";
	}
) => {
	const sortedExpenses = [...expenses]; // Create a copy of the expenses array to avoid mutating the original array

	switch (sorting.sort) {
		case "date":
			sortedExpenses.sort((a, b) => {
				const dateA = new Date(a.pay_date);
				const dateB = new Date(b.pay_date);

				// Compare dates first
				const dateComparison = dateA.getTime() - dateB.getTime();
				if (dateComparison !== 0) {
					return sorting.order === "ascending"
						? dateComparison
						: -dateComparison;
				}

				// If dates are equal, compare by id
				return sorting.order === "ascending"
					? a.id - b.id
					: b.id - a.id;
			});
			break;
		case "amount":
			sortedExpenses.sort((a, b) => {
				const amountA =
					typeof a.amount === "string"
						? parseFloat(a.amount)
						: a.amount;
				const amountB =
					typeof b.amount === "string"
						? parseFloat(b.amount)
						: b.amount;
				return sorting.order === "ascending"
					? amountA - amountB
					: amountB - amountA;
			});
			break;
		case "description":
			sortedExpenses.sort((a, b) => {
				return sorting.order === "ascending"
					? a.description.localeCompare(b.description)
					: b.description.localeCompare(a.description);
			});
			break;
		case "category":
			sortedExpenses.sort((a, b) => {
				return sorting.order === "ascending"
					? a.category - b.category
					: b.category - a.category;
			});
			break;
		default:
			break;
	}

	return sortedExpenses;
};

const expensesSlice = createSlice({
	name: "expenses",
	initialState,
	reducers: {},
	extraReducers: (builder) => {
		builder
			.addCase(
				fetchExpensesByUserId.fulfilled,
				(state, action: PayloadAction<ExpenseModel[]>) => {
					const sortedExpenses = sortExpenses(
						action.payload,
						state.sorting
					);
					state.value = sortedExpenses;
					state.totalAmount = calculateTotalAmount(sortedExpenses);
				}
			)
			.addCase(
				addExpense.fulfilled,
				(state, action: PayloadAction<ExpenseModel>) => {
					state.value.push(action.payload);
					state.value = sortExpenses(state.value, state.sorting);
					state.totalAmount = calculateTotalAmount(state.value);
				}
			)
			.addCase(
				deleteExpense.fulfilled,
				(
					state,
					action: PayloadAction<{
						id: number;
						deletedExpense?: ExpenseModel;
					}>
				) => {
					state.value = state.value.filter(
						(expense) => expense.id !== action.payload.id
					);
					state.totalAmount = calculateTotalAmount(state.value);
				}
			)
			.addCase(
				updateExpense.fulfilled,
				(
					state,
					action: PayloadAction<{
						expense: ExpenseModel;
						oldExpense?: ExpenseModel;
					}>
				) => {
					const updatedExpense = action.payload.expense;
					const newState = state.value.map((expense) =>
						expense.id === updatedExpense.id
							? updatedExpense
							: expense
					);
					const sortedExpenses = sortExpenses(
						newState,
						state.sorting
					);
					state.value = sortedExpenses;
					state.totalAmount = calculateTotalAmount(sortedExpenses);
				}
			)
			.addCase(
				changeSort.fulfilled,
				(
					state,
					action: PayloadAction<{
						sort: "date" | "amount" | "category" | "description";
						order: "ascending" | "descending";
					}>
				) => {
					state.sorting = action.payload;
					state.value = sortExpenses(state.value, action.payload);
					addArrowToHeader(state.sorting);
				}
			);
	},
});

const sortEngToHeb: { [key: string]: string } = {
	date: "תאריך",
	description: "תיאור",
	amount: "סכום",
	category: "קטגוריה",
	start_date: "תאריך התחלה",
	end_date: "תאריך סיום",
	frequency: "תדירות תשלום",
};

// Add arrow to the header of the sorted column
const addArrowToHeader = (sorting: {
	sort: "date" | "amount" | "category" | "description";
	order: "ascending" | "descending";
}) => {
	const tableElement = document.querySelector(".expensesTable");
	const caretClass =
		sorting.order === "ascending" ? "fa-caret-up" : "fa-caret-down";

	// Remove old carets only within the relevant container
	if (tableElement) {
		tableElement
			.querySelectorAll(".fas.fa-caret-up, .fas.fa-caret-down")
			.forEach((el) => el.remove());
	} else {
		const bar = document.querySelector(".mobile-sort-bar");
		bar?.querySelectorAll(".fas.fa-caret-up, .fas.fa-caret-down").forEach(
			(el) => el.remove()
		);
	}

	if (tableElement) {
		const headers = tableElement.querySelectorAll("th");
		const sortedHeader = Array.from(headers).find(
			(header) =>
				header.textContent?.trim() === sortEngToHeb[sorting.sort].trim()
		);
		if (sortedHeader) {
			const icon = document.createElement("i");
			icon.className = `fas ${caretClass}`;
			icon.style.marginRight = "8px";
			sortedHeader.appendChild(icon);
		}
	} else {
		const bar = document.querySelector(".mobile-sort-bar");
		const btn = bar?.querySelector<HTMLButtonElement>(
			`button[data-sort="${sorting.sort}"]`
		);
		if (btn) {
			const icon = document.createElement("i");
			icon.className = `fas ${caretClass}`;
			icon.style.marginRight = "8px";
			btn.appendChild(icon);
		}
	}
};

export const fetchExpensesByUserId = createAsyncThunk(
	"financeContext/fetchExpensesByUserId",
	async (user_id: number) => {
		const response = await api.get<ExpenseModel[]>(config.expensesUrl);
		return response.data;
	}
);

export const addExpense = createAsyncThunk(
	"financeContext/addExpense",
	async (expense: ExpenseModel) => {
		const response = await api.post<ExpenseModel>(
			config.expensesUrl,
			expense
		);
		return response.data;
	}
);

export const deleteExpense = createAsyncThunk(
	"financeContext/removeExpense",
	async (id: number, { getState }) => {
		// Get the expense before deleting to track budget info
		const state = getState() as { expenses: ExpensesState };
		const expense = state.expenses.value.find((e) => e.id === id);

		await api.delete(config.expensesUrl + id);

		return {
			id,
			deletedExpense: expense,
		};
	}
);

export const updateExpense = createAsyncThunk(
	"financeContext/updateExpense",
	async (expense: ExpenseModel, { getState }) => {
		// Get the old expense before updating to track budget changes
		const state = getState() as { expenses: ExpensesState };
		const oldExpense = state.expenses.value.find(
			(e) => e.id === expense.id
		);

		const response = await api.put<ExpenseModel>(
			config.expensesUrl + expense.id,
			expense
		);

		return {
			expense: response.data,
			oldExpense,
		};
	}
);

export const changeSort = createAsyncThunk(
	"financeContext/changeSort",
	async (sorting: {
		sort: "date" | "amount" | "category" | "description";
		order: "ascending" | "descending";
	}) => {
		return sorting;
	}
);

export default expensesSlice.reducer;
