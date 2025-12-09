import { configureStore } from "@reduxjs/toolkit";
import expensesReducer from "./slicers/expensesSlicer";
import incomesReducer from "./slicers/incomesSlicer";
import recurringExpenseReducer from "./slicers/recurringExpenseSlicer";
import recurringIncomesReducer from "./slicers/recurringIncomesSlicer";
import tasksReducer from "./slicers/tasksSlicer";
import userCategoriesSlicer from "./slicers/userCategoriesSlicer";
import budgetsReducer from "./slicers/budgetSlicer";

export const financeContext = configureStore({
	reducer: {
		expenses: expensesReducer,
		incomes: incomesReducer,
		recurringExpenses: recurringExpenseReducer,
		recurringIncomes: recurringIncomesReducer,
		tasks: tasksReducer,
		userCategories: userCategoriesSlicer,
		budgets: budgetsReducer,
	},
});

export type ExpensesState = ReturnType<typeof financeContext.getState>;
export type ExpensesDispatch = typeof financeContext.dispatch;

export type IncomesState = ReturnType<typeof financeContext.getState>;
export type IncomesDispatch = typeof financeContext.dispatch;

export type RecurringExpensesState = ReturnType<typeof financeContext.getState>;
export type RecurringExpensesDispatch = typeof financeContext.dispatch;

export type RecurringIncomesState = ReturnType<typeof financeContext.getState>;
export type RecurringIncomesDispatch = typeof financeContext.dispatch;

export type TasksState = ReturnType<typeof financeContext.getState>;
export type TasksDispatch = typeof financeContext.dispatch;

export type UserCategoriesState = ReturnType<typeof financeContext.getState>;
export type UserCategoriesDispatch = typeof financeContext.dispatch;

export type BudgetsState = ReturnType<typeof financeContext.getState>;
export type BudgetsDispatch = typeof financeContext.dispatch;
