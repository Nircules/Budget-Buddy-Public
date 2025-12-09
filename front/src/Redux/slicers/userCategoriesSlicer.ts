import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import config, { api } from "../../Utils/Config";
import UserCategory from "../../Models/UserCategoryModel";

interface UserCategoriesState {
	categories: UserCategory[];
}

const initialState: UserCategoriesState = {
	categories: [],
};

const userCategoriesSlicer = createSlice({
	name: "userCategories",
	initialState,
	reducers: {},
	extraReducers: (builder) => {
		builder
			.addCase(
				fetchUserCategories.fulfilled,
				(state, action: PayloadAction<UserCategory[]>) => {
					state.categories = action.payload;
				}
			)
			.addCase(
				addUserCategory.fulfilled,
				(state, action: PayloadAction<UserCategory>) => {
					state.categories.push(action.payload);
				}
			)
			.addCase(
				editUserCategory.fulfilled,
				(state, action: PayloadAction<UserCategory>) => {
					const index = state.categories.findIndex(
						(category) => category.id === action.payload.id
					);
					if (index !== -1) {
						state.categories[index] = action.payload;
					}
				}
			)
			.addCase(
				deleteUserCategory.fulfilled,
				(state, action: PayloadAction<number>) => {
					state.categories = state.categories.filter(
						(category) => category.id !== action.payload
					);
				}
			);
	},
});

export const fetchUserCategories = createAsyncThunk(
	"userCategories/fetchUserCategories",
	async (user_id: number) => {
		const response = await api.get<UserCategory[]>(
			`${config.userCategoriesUrl}`
		);
		return response.data;
	}
);

export const addUserCategory = createAsyncThunk(
	"userCategories/addUserCategory",
	async (category: UserCategory) => {
		const response = await api.post<UserCategory>(
			`${config.userCategoriesUrl}`,
			category
		);
		return response.data;
	}
);

export const editUserCategory = createAsyncThunk(
	"userCategories/editUserCategory",
	async (category: UserCategory) => {
		const response = await api.put<UserCategory>(
			`${config.userCategoriesUrl}${category.id}`,
			category
		);
		return response.data;
	}
);

export const deleteUserCategory = createAsyncThunk(
	"userCategories/deleteUserCategory",
	async (categoryId: number) => {
		await api.delete(`${config.userCategoriesUrl}${categoryId}`);
		return categoryId;
	}
);

export default userCategoriesSlicer.reducer;
