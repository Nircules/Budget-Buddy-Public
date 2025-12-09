import { PayloadAction, createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import config, { api } from "../../Utils/Config";
import BudgetModel from "../../Models/BudgetModel";
import { addExpense, deleteExpense, updateExpense } from "./expensesSlicer";
import ExpenseModel from "../../Models/ExpenseModel";

interface BudgetsState {
	budgets: BudgetModel[];
}

const initialState: BudgetsState = {
	budgets: [],
};

const budgetSlice = createSlice({
	name: "budgets",
	initialState,
	reducers: {
		resetBudgets: (state) => {
			state.budgets = [];
		},
	},
	extraReducers: (builder) => {
		builder
			.addCase(
				fetchBudgetsByUserId.fulfilled,
				(state, action: PayloadAction<BudgetModel[]>) => {
					state.budgets = action.payload;
				}
			)
			.addCase(
				addBudget.fulfilled,
				(state, action: PayloadAction<BudgetModel>) => {
					state.budgets.push(action.payload);
				}
			)
			.addCase(
				updateBudget.fulfilled,
				(state, action: PayloadAction<BudgetModel>) => {
					const index = state.budgets.findIndex(
						(b) => b.id === action.payload.id
					);
					if (index !== -1) {
						state.budgets[index] = action.payload;
					}
				}
			)
			.addCase(
				deleteBudget.fulfilled,
				(state, action: PayloadAction<number>) => {
					state.budgets = state.budgets.filter(
						(b) => b.id !== action.payload
					);
				}
			)
			// Listen to expense actions to update budget remaining amounts
			.addCase(
				addExpense.fulfilled,
				(state, action: PayloadAction<ExpenseModel>) => {
					const expense = action.payload;
					if (expense.budget) {
						const budget = state.budgets.find(
							(b) => b.id === expense.budget
						);
						if (budget) {
							budget.remaining_amount =
								Number(budget.remaining_amount) -
								Number(expense.amount);
						}
					}
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
					const deletedExpense = action.payload.deletedExpense;
					if (deletedExpense && deletedExpense.budget) {
						const budget = state.budgets.find(
							(b) => b.id === deletedExpense.budget
						);
						if (budget) {
							// Add the amount back to the budget
							budget.remaining_amount =
								Number(budget.remaining_amount) +
								Number(deletedExpense.amount);
						}
					}
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
					const newExpense = action.payload.expense;
					const oldExpense = action.payload.oldExpense;

					// Handle budget changes when updating expense
					if (oldExpense) {
						// If old expense had a budget, add the amount back
						if (oldExpense.budget) {
							const oldBudget = state.budgets.find(
								(b) => b.id === oldExpense.budget
							);
							if (oldBudget) {
								oldBudget.remaining_amount =
									Number(oldBudget.remaining_amount) +
									Number(oldExpense.amount);
							}
						}

						// If new expense has a budget, deduct the amount
						if (newExpense.budget) {
							const newBudget = state.budgets.find(
								(b) => b.id === newExpense.budget
							);
							if (newBudget) {
								newBudget.remaining_amount =
									Number(newBudget.remaining_amount) -
									Number(newExpense.amount);
							}
						}
					}
				}
			);
	},
});
export const fetchBudgetsByUserId = createAsyncThunk(
	"budgets/fetchBudgets",
	async (user_id: number) => {
		const response = await api.get(config.budgetsUrl);
		return response.data;
	}
);

export const addBudget = createAsyncThunk(
	"budgets/addBudget",
	async (budget: BudgetModel) => {
		const response = await api.post(config.budgetsUrl, budget);
		return response.data;
	}
);

export const updateBudget = createAsyncThunk(
	"budgets/updateBudget",
	async (budget: BudgetModel) => {
		const response = await api.put(config.budgetsUrl + budget.id, budget);
		return response.data;
	}
);

export const deleteBudget = createAsyncThunk(
	"budgets/deleteBudget",
	async (budgetId: number) => {
		await api.delete(config.budgetsUrl + budgetId);
		return budgetId;
	}
);

export default budgetSlice.reducer;
export const { resetBudgets } = budgetSlice.actions;
