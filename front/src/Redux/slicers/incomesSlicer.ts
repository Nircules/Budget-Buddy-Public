import { PayloadAction, createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import IncomeModel from "../../Models/IncomeModel";
import config, { api } from "../../Utils/Config";

export function calculateTotalAmount(incomes: IncomeModel[]): number {
	if (incomes.length > 0) {
		const calculatedTotalAmount = incomes.reduce((totalamount, expense) => {
			const expenseAmount =
				typeof expense.amount === "string"
					? parseFloat(expense.amount)
					: expense.amount;
			return totalamount + expenseAmount;
		}, 0);
		return calculatedTotalAmount;
	} else {
		return 0;
	}
}

interface IncomesState {
	value: IncomeModel[];
	totalAmount: number;
	sorting: {
		sort: "date" | "amount" | "category" | "description";
		order: "ascending" | "descending";
	};
}

const initialState: IncomesState = {
	value: [],
	totalAmount: 0,
	sorting: { sort: "date", order: "descending" },
};

const sortIncomes = (
	incomes: IncomeModel[],
	sorting: {
		sort: "date" | "amount" | "category" | "description";
		order: "ascending" | "descending";
	}
) => {
	const sortedIncomes = [...incomes]; // Create a copy of the expenses array to avoid mutating the original array

	switch (sorting.sort) {
		case "date":
			sortedIncomes.sort((a, b) => {
				const dateA = new Date(a.date);
				const dateB = new Date(b.date);
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

export const incomesSlice = createSlice({
	name: "incomes",
	initialState,
	reducers: {},
	extraReducers: (builder) => {
		builder
			.addCase(
				fetchIncomesByUserId.fulfilled,
				(state, action: PayloadAction<IncomeModel[]>) => {
					const sortedIncomes = sortIncomes(
						action.payload,
						state.sorting
					);
					state.value = sortedIncomes;
					state.totalAmount = calculateTotalAmount(sortedIncomes);
				}
			)
			.addCase(
				addIncome.fulfilled,
				(state, action: PayloadAction<IncomeModel>) => {
					state.value.push(action.payload);
					state.value = sortIncomes(state.value, state.sorting);
					state.totalAmount = calculateTotalAmount(state.value);
				}
			)
			.addCase(
				deleteIncome.fulfilled,
				(state, action: PayloadAction<number>) => {
					state.value = state.value.filter(
						(income) => income.id !== action.payload
					);
					state.totalAmount = calculateTotalAmount(state.value);
				}
			)
			.addCase(
				updateIncome.fulfilled,
				(state, action: PayloadAction<IncomeModel>) => {
					const index = state.value.findIndex(
						(income) => income.id === action.payload.id
					);
					state.value[index] = action.payload;
					state.value = sortIncomes(state.value, state.sorting);
					state.totalAmount = calculateTotalAmount(state.value);
				}
			)
			.addCase(
				changeSortIncomes.fulfilled,
				(
					state,
					action: PayloadAction<{
						sort: "date" | "amount" | "category" | "description";
						order: "ascending" | "descending";
					}>
				) => {
					state.sorting = action.payload;
					state.value = sortIncomes(state.value, action.payload);
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
	const tableElement = document.querySelector(".incomesTable");
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

export const fetchIncomesByUserId = createAsyncThunk(
	"financeContext/fetchIncomesByUserId",
	async (userId: number) => {
		const response = await api.get<IncomeModel[]>(config.incomesUrl);
		return response.data;
	}
);

export const addIncome = createAsyncThunk(
	"financeContext/addIncome",
	async (income: IncomeModel) => {
		const response = await api.post<IncomeModel>(config.incomesUrl, income);
		return response.data;
	}
);

export const deleteIncome = createAsyncThunk(
	"financeContext/deleteIncome",
	async (id: number) => {
		await api.delete(config.incomesUrl + id);
		return id;
	}
);

export const updateIncome = createAsyncThunk(
	"financeContext/updateIncome",
	async (income: IncomeModel) => {
		const response = await api.put<IncomeModel>(
			config.incomesUrl + income.id,
			income
		);
		return response.data;
	}
);

export const changeSortIncomes = createAsyncThunk(
	"financeContext/changeSortIncomes",
	async (sorting: {
		sort: "date" | "amount" | "category" | "description";
		order: "ascending" | "descending";
	}) => {
		return sorting;
	}
);

export default incomesSlice.reducer;
