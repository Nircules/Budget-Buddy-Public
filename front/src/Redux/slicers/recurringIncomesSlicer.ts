import { PayloadAction, createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import config, { api } from "../../Utils/Config";
import RecurringIncomeModel from "../../Models/RecurringIncomeModel";

export function calculateTotalAmount(incomes: RecurringIncomeModel[]): number {
	if (incomes.length > 0) {
		const calculatedTotalAmount = incomes.reduce((totalamount, income) => {
			const start_date = new Date(income.start_date);
			const end_date = income.end_date ? new Date(income.end_date) : null; // Handle possible null end_date
			const today = new Date();
			const incomeAmount =
				typeof income.amount === "string"
					? parseFloat(income.amount)
					: income.amount;

			// Adjusted condition to check for future start_date, past end_date, and null end_date
			if (
				start_date <= today &&
				(end_date === null || end_date >= today)
			) {
				return totalamount + incomeAmount;
			}
			return totalamount;
		}, 0);
		return calculatedTotalAmount;
	} else {
		return 0;
	}
}

interface RecurringIncomesState {
	active_incomes: RecurringIncomeModel[];
	inactive_incomes: RecurringIncomeModel[];
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

const initialState: RecurringIncomesState = {
	active_incomes: [],
	inactive_incomes: [],
	totalAmount: 0,
	recSorting: { sort: "start_date", order: "descending" },
};

const sortIncomes = (
	incomes: RecurringIncomeModel[],
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
	const sortedIncomes = [...incomes]; // Create a copy of the incomes array to avoid mutating the original array
	switch (sorting.sort) {
		case "start_date":
			sortedIncomes.sort((a, b) => {
				const dateA = new Date(a.start_date);
				const dateB = new Date(b.start_date);
				return sorting.order === "ascending"
					? dateA.getTime() - dateB.getTime()
					: dateB.getTime() - dateA.getTime();
			});
			break;
		case "end_date":
			sortedIncomes.sort((a, b) => {
				const dateA = a.end_date ? new Date(a.end_date) : new Date(0);
				const dateB = b.end_date ? new Date(b.end_date) : new Date(0);
				return sorting.order === "ascending"
					? dateA.getTime() - dateB.getTime()
					: dateB.getTime() - dateA.getTime();
			});
			break;
		case "amount":
			sortedIncomes.sort((a, b) => {
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
			sortedIncomes.sort((a, b) => {
				return sorting.order === "ascending"
					? a.description.localeCompare(b.description)
					: b.description.localeCompare(a.description);
			});
			break;
		case "frequency":
			sortedIncomes.sort((a, b) => {
				return sorting.order === "ascending"
					? a.frequency.localeCompare(b.frequency)
					: b.frequency.localeCompare(a.frequency);
			});
			break;
		case "category":
			sortedIncomes.sort((a, b) => {
				return sorting.order === "ascending"
					? a.category - b.category
					: b.category - a.category;
			});
			break;
		default:
			break;
	}
	return sortedIncomes;
};

const recurringIncomesSlice = createSlice({
	name: "recurringIncomes",
	initialState,
	reducers: {},
	extraReducers: (builder) => {
		builder
			.addCase(
				fetchRecurringIncomesByUserId.fulfilled,
				(state, action: PayloadAction<RecurringIncomeModel[]>) => {
					const sortedIncomes = sortIncomes(
						action.payload,
						state.recSorting
					);
					state.active_incomes = sortedIncomes.filter(
						(income) => income.is_active
					);
					state.inactive_incomes = sortedIncomes.filter(
						(income) => !income.is_active
					);
					state.totalAmount = calculateTotalAmount(sortedIncomes);
				}
			)
			.addCase(
				addRecurringIncome.fulfilled,
				(state, action: PayloadAction<RecurringIncomeModel>) => {
					state.active_incomes.push(action.payload);
					state.active_incomes = sortIncomes(
						state.active_incomes,
						state.recSorting
					);
					state.totalAmount = calculateTotalAmount(
						state.active_incomes
					);
				}
			)
			.addCase(
				updateRecurringIncome.fulfilled,
				(state, action: PayloadAction<RecurringIncomeModel>) => {
					const index = state.active_incomes.findIndex(
						(income) => income.id === action.payload.id
					);
					state.active_incomes[index] = action.payload;
					state.active_incomes = sortIncomes(
						state.active_incomes,
						state.recSorting
					);
					state.totalAmount = calculateTotalAmount(
						state.active_incomes
					);
				}
			)
			.addCase(
				deleteRecurringIncome.fulfilled,
				(state, action: PayloadAction<number>) => {
					state.active_incomes = state.active_incomes.filter(
						(income) => income.id !== action.payload
					);
					state.totalAmount = calculateTotalAmount(
						state.active_incomes
					);
				}
			)
			.addCase(
				changeSortRecIncomes.fulfilled,
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
						state.active_incomes = sortIncomes(
							state.active_incomes,
							action.payload
						);
					} else {
						state.inactive_incomes = sortIncomes(
							state.inactive_incomes,
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

// Clean the arrows from the headers
const cleanArrows = () => {
	const headers = document
		.getElementsByClassName("incomesTable")[0]
		.querySelectorAll("th");
	headers.forEach((header) => {
		if (header.contains(document.querySelector(".fa-caret-down")))
			header.removeChild(document.querySelector(".fa-caret-down"));
		else if (header.contains(document.querySelector(".fa-caret-up")))
			header.removeChild(document.querySelector(".fa-caret-up"));
	});
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
	const headers = document
		.getElementsByClassName("incomesTable")[0]
		.querySelectorAll("th");
	const downArrow = document.createElement("i");
	downArrow.className = "fas fa-caret-down";
	const upArrow = document.createElement("i");
	upArrow.className = "fas fa-caret-up";
	const sortedHeader = Array.from(headers).find(
		(header) =>
			header.textContent.trim() === sortEngToHeb[sorting.sort].trim()
	);
	if (sortedHeader) {
		sortedHeader.innerHTML += " ";
		cleanArrows();
		if (sorting.order === "ascending") {
			sortedHeader.appendChild(upArrow);
			const downArrowElement =
				sortedHeader.querySelector(".fa-caret-down");
			if (downArrowElement) {
				sortedHeader.removeChild(downArrowElement);
			}
		} else if (sorting.order === "descending") {
			sortedHeader.appendChild(downArrow);
			const upArrowElement = sortedHeader.querySelector(".fa-caret-up");
			if (upArrowElement) {
				sortedHeader.removeChild(upArrowElement);
			}
		}
	}
	return sorting;
};

export const fetchRecurringIncomesByUserId = createAsyncThunk(
	"financeContext/fetchRecurringIncomes",
	async (user_id: number) => {
		const response = await api.get(
			config.recurringIncomesUrl + "user/" + user_id
		);
		return response.data;
	}
);

export const addRecurringIncome = createAsyncThunk(
	"financeContext/addRecurringIncome",
	async (recurringIncome: RecurringIncomeModel) => {
		const response = await api.post(
			config.recurringIncomesUrl,
			recurringIncome
		);
		return response.data;
	}
);

export const updateRecurringIncome = createAsyncThunk(
	"financeContext/updateRecurringIncome",
	async (recurringIncome: RecurringIncomeModel) => {
		const response = await api.put(
			config.recurringIncomesUrl + recurringIncome.id,
			recurringIncome
		);
		return response.data;
	}
);

export const deleteRecurringIncome = createAsyncThunk(
	"financeContext/deleteRecurringIncome",
	async (recurringIncomeId: number) => {
		await api.delete(config.recurringIncomesUrl + recurringIncomeId);
		return recurringIncomeId;
	}
);

export const changeSortRecIncomes = createAsyncThunk(
	"recurringIncomesSlicer/changeSort",
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

export default recurringIncomesSlice.reducer;
