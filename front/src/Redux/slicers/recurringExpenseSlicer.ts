import { PayloadAction, createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import config, { api } from "../../Utils/Config";
import RecurringExpenseModel from "../../Models/RecurringExpenseModel";

export function calculateTotalAmount(
	expenses: RecurringExpenseModel[]
): number {
	if (expenses.length > 0) {
		const calculatedTotalAmount = expenses.reduce(
			(totalamount, expense) => {
				const expenseAmount =
					typeof expense.amount === "string"
						? parseFloat(expense.amount)
						: expense.amount;
				if (expense.is_active) {
					return (
						totalamount +
						expenseAmount *
							(expense.frequency === "W"
								? 4
								: expense.frequency === "B"
								? 2
								: 1)
					);
				}
				return totalamount;
			},
			0
		);
		return calculatedTotalAmount;
	} else {
		return 0;
	}
}

interface RecurringExpensesState {
	active_expenses: RecurringExpenseModel[];
	todayExpenses: RecurringExpenseModel[];
	inactive_expenses: RecurringExpenseModel[];
	totalAmount: number;
	recSorting: {
		sort:
			| "start_date"
			| "end_date"
			| "frequency"
			| "amount"
			| "category"
			| "description";
		order: "ascending" | "descending";
	};
}

const initialState: RecurringExpensesState = {
	active_expenses: [],
	todayExpenses: [],
	inactive_expenses: [],
	totalAmount: 0,
	recSorting: { sort: "start_date", order: "descending" },
};

const sortExpenses = (
	expenses: RecurringExpenseModel[],
	sorting: {
		sort:
			| "start_date"
			| "end_date"
			| "frequency"
			| "amount"
			| "category"
			| "description";
		order: "ascending" | "descending";
	}
) => {
	const sortedExpenses = [...expenses]; // Create a copy of the expenses array to avoid mutating the original array
	switch (sorting.sort) {
		case "start_date":
			sortedExpenses.sort((a, b) => {
				const dateA = new Date(a.start_date);
				const dateB = new Date(b.start_date);
				return sorting.order === "ascending"
					? dateA.getTime() - dateB.getTime()
					: dateB.getTime() - dateA.getTime();
			});
			break;
		case "end_date":
			sortedExpenses.sort((a, b) => {
				const dateA = a.end_date ? new Date(a.end_date) : new Date(0);
				const dateB = b.end_date ? new Date(b.end_date) : new Date(0);
				return sorting.order === "ascending"
					? dateA.getTime() - dateB.getTime()
					: dateB.getTime() - dateA.getTime();
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
		case "frequency":
			sortedExpenses.sort((a, b) => {
				return sorting.order === "ascending"
					? a.frequency.localeCompare(b.frequency)
					: b.frequency.localeCompare(a.frequency);
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

const recurringExpenseSlice = createSlice({
	name: "recurringExpenses",
	initialState,
	reducers: {},
	extraReducers: (builder) => {
		builder
			.addCase(
				fetchRecurringExpensesByUserId.fulfilled,
				(state, action: PayloadAction<RecurringExpenseModel[]>) => {
					const sortedExpenses = sortExpenses(
						action.payload,
						state.recSorting
					);

					const today = new Date();
					const todayDay = today.getDate();

					const todayExpenses: RecurringExpenseModel[] = [];
					const otherActiveExpenses: RecurringExpenseModel[] = [];
					const inactiveExpenses: RecurringExpenseModel[] = [];

					sortedExpenses.forEach((expense) => {
						if (!expense.is_active) {
							inactiveExpenses.push(expense);
							return;
						}
						const startDate = new Date(expense.start_date);

						if (startDate.getDate() === todayDay) {
							todayExpenses.push(expense);
						} else {
							otherActiveExpenses.push(expense);
						}
					});

					state.todayExpenses = todayExpenses;
					state.active_expenses = otherActiveExpenses;
					state.inactive_expenses = inactiveExpenses;
					state.totalAmount =
						calculateTotalAmount(state.active_expenses) +
						calculateTotalAmount(state.todayExpenses);
				}
			)
			.addCase(
				addRecurringExpense.fulfilled,
				(state, action: PayloadAction<RecurringExpenseModel>) => {
					const today = new Date();
					const todayDay = today.getDate();
					const startDate = new Date(action.payload.start_date);

					// Check if the expense starts today
					if (
						startDate.getDate() === todayDay &&
						action.payload.is_active
					) {
						state.todayExpenses.push(action.payload);
						state.todayExpenses = sortExpenses(
							state.todayExpenses,
							state.recSorting
						);
					} else if (action.payload.is_active) {
						state.active_expenses.push(action.payload);
						state.active_expenses = sortExpenses(
							state.active_expenses,
							state.recSorting
						);
					} else {
						state.inactive_expenses.push(action.payload);
						state.inactive_expenses = sortExpenses(
							state.inactive_expenses,
							state.recSorting
						);
					}

					state.totalAmount =
						calculateTotalAmount(state.active_expenses) +
						calculateTotalAmount(state.todayExpenses);
				}
			)
			.addCase(
				updateRecurringExpense.fulfilled,
				(state, action: PayloadAction<RecurringExpenseModel>) => {
					const { id, is_active } = action.payload;

					// Remove from all three arrays
					state.active_expenses = state.active_expenses.filter(
						(e) => e.id !== id
					);
					state.todayExpenses = state.todayExpenses.filter(
						(e) => e.id !== id
					);
					state.inactive_expenses = state.inactive_expenses.filter(
						(e) => e.id !== id
					);

					// Add to appropriate array based on is_active and start_date
					if (is_active) {
						const today = new Date();
						const todayDay = today.getDate();
						const startDate = new Date(action.payload.start_date);

						// Check if the expense starts today
						if (startDate.getDate() === todayDay) {
							state.todayExpenses.push(action.payload);
							state.todayExpenses = sortExpenses(
								state.todayExpenses,
								state.recSorting
							);
						} else {
							state.active_expenses.push(action.payload);
							state.active_expenses = sortExpenses(
								state.active_expenses,
								state.recSorting
							);
						}
					} else {
						state.inactive_expenses.push(action.payload);
						state.inactive_expenses = sortExpenses(
							state.inactive_expenses,
							state.recSorting
						);
					}

					state.totalAmount =
						calculateTotalAmount(state.active_expenses) +
						calculateTotalAmount(state.todayExpenses);
				}
			)
			.addCase(
				deleteRecurringExpense.fulfilled,
				(state, action: PayloadAction<number>) => {
					const index = state.active_expenses.findIndex(
						(expense) => expense.id === action.payload
					);
					if (state.active_expenses[index]) {
						if (state.active_expenses[index].is_active === true) {
							state.inactive_expenses.push({
								...state.active_expenses[index],
								is_active: false,
							});
							state.inactive_expenses = sortExpenses(
								state.inactive_expenses,
								state.recSorting
							);
							state.active_expenses =
								state.active_expenses.filter(
									(expense) => expense.id !== action.payload
								);
						}
					} else if (
						state.todayExpenses.find(
							(expense) => expense.id === action.payload
						)
					) {
						state.inactive_expenses.push({
							...state.todayExpenses.find(
								(expense) => expense.id === action.payload
							),
							is_active: false,
						});
						state.todayExpenses = state.todayExpenses.filter(
							(expense) => expense.id !== action.payload
						);
						state.inactive_expenses = sortExpenses(
							state.inactive_expenses,
							state.recSorting
						);
					} else {
						state.inactive_expenses =
							state.inactive_expenses.filter(
								(expense) => expense.id !== action.payload
							);
					}

					state.totalAmount = calculateTotalAmount(
						state.active_expenses
					);
				}
			)
			.addCase(
				changeSort.fulfilled,
				(
					state,
					action: PayloadAction<{
						sort:
							| "start_date"
							| "end_date"
							| "frequency"
							| "amount"
							| "category"
							| "description";
						order: "ascending" | "descending";
						active: boolean;
					}>
				) => {
					state.recSorting = action.payload;
					if (action.payload.active) {
						state.active_expenses = sortExpenses(
							state.active_expenses,
							action.payload
						);
					} else {
						state.inactive_expenses = sortExpenses(
							state.inactive_expenses,
							action.payload
						);
					}
					addArrowToHeader(state.recSorting);
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
	sort:
		| "start_date"
		| "end_date"
		| "frequency"
		| "amount"
		| "category"
		| "description";
	order: "ascending" | "descending";
}) => {
	const caretClass =
		sorting.order === "ascending" ? "fa-caret-up" : "fa-caret-down";

	// Remove old carets only from relevant sort elements
	const relevantSelectors = [
		".rec-expense-mobile-sort-bar .fa-caret-up",
		".rec-expense-mobile-sort-bar .fa-caret-down",
		".expensesTable th .fa-caret-up",
		".expensesTable th .fa-caret-down",
		".inactiveTable th .fa-caret-up",
		".inactiveTable th .fa-caret-down",
	];

	relevantSelectors.forEach((selector) => {
		// Skip expensesTable selectors if we're on /expenses route
		if (
			window.location.pathname === "/expenses" &&
			selector.includes(".expensesTable")
		) {
			return;
		}
		document.querySelectorAll(selector).forEach((el) => el.remove());
	});

	const createIcon = () => {
		const icon = document.createElement("i");
		icon.className = `fas ${caretClass}`;
		icon.style.marginRight = "8px";
		return icon;
	};

	// Try mobile first: new container
	const mobile = document.querySelector(".rec-expense-mobile-sort-bar");
	const mobileBtn = mobile?.querySelector<HTMLButtonElement>(
		`button[data-sort="${sorting.sort}"]`
	);
	if (mobileBtn) {
		mobileBtn.appendChild(createIcon());
		return;
	}

	const tryAttachToTable = (selector: string) => {
		const table = document.querySelector(selector);
		if (!table) return false;
		const headers = table.querySelectorAll("th");
		const target = Array.from(headers).find(
			(h) => h.textContent?.trim() === sortEngToHeb[sorting.sort].trim()
		);
		if (target) {
			target.appendChild(createIcon());
			return true;
		}
		return false;
	};

	// Try inactive table, then active table
	if (
		tryAttachToTable(".inactiveTable") ||
		tryAttachToTable(".expensesTable")
	) {
		return;
	}
};

export const fetchRecurringExpensesByUserId = createAsyncThunk(
	"financeContext/fetchRecurringExpenses",
	async (user_id: number) => {
		const response = await api.get(config.recurringExpensesUrl);
		return response.data;
	}
);

export const addRecurringExpense = createAsyncThunk(
	"financeContext/addRecurringExpense",
	async (recurringExpense: RecurringExpenseModel) => {
		const response = await api.post(
			config.recurringExpensesUrl,
			recurringExpense
		);
		return response.data;
	}
);

export const updateRecurringExpense = createAsyncThunk(
	"financeContext/updateRecurringExpense",
	async (recurringExpense: RecurringExpenseModel) => {
		const response = await api.put(
			config.recurringExpensesUrl + recurringExpense.id,
			recurringExpense
		);
		return response.data;
	}
);

export const deleteRecurringExpense = createAsyncThunk(
	"financeContext/deleteRecurringExpense",
	async (recurringExpenseId: number) => {
		await api.delete(config.recurringExpensesUrl + recurringExpenseId);
		return recurringExpenseId;
	}
);

export const changeSort = createAsyncThunk(
	"recurringExpensesSlicer/changeSort",
	async (sorting: {
		sort:
			| "start_date"
			| "end_date"
			| "frequency"
			| "amount"
			| "category"
			| "description";
		order: "ascending" | "descending";
		active: boolean;
	}) => {
		return sorting;
	}
);

export default recurringExpenseSlice.reducer;
