import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import config, { api } from "../../Utils/Config";
import TaskModel from "../../Models/TaskModel";

interface TasksState {
	value: TaskModel[];
}

const initialState: TasksState = {
	value: [],
};

export const tasksSlicer = createSlice({
	name: "tasks",
	initialState,
	reducers: {},
	extraReducers: (builder) => {
		builder
			.addCase(fetchTasks.fulfilled, (state, action) => {
				state.value = action.payload.filter(
					(task: TaskModel) => task.is_done === false
				);
			})
			.addCase(addTask.fulfilled, (state, action) => {
				state.value.push(action.payload);
			})
			.addCase(updateTask.fulfilled, (state, action) => {
				const index = state.value.findIndex(
					(income) => income.id === action.payload.id
				);

				// If the task is done, remove it from the array
				if (action.payload.is_done === true) {
					state.value.splice(index, 1); // Remove task at that index
				} else {
					// If the task is not done, just update it
					state.value[index] = action.payload;
				}
			})
			.addCase(deleteTask.fulfilled, (state, action) => {
				const index = state.value.findIndex(
					(income) => income.id === action.payload
				);
				state.value.splice(index, 1);
			});
	},
});

export const fetchTasks = createAsyncThunk("tasks/fetchTasks", async () => {
	const response = await api.get(config.tasksUrl);
	return response.data;
});

export const addTask = createAsyncThunk(
	"tasks/addTask",
	async (task: TaskModel) => {
		const response = await api.post(config.tasksUrl, task);
		return response.data;
	}
);

export const createTask = createAsyncThunk(
	"tasks/createTask",
	async (task: TaskModel) => {
		const response = await api.post(`${config.tasksUrl}`, task);
		return response.data;
	}
);

export const updateTask = createAsyncThunk(
	"tasks/updateTask",
	async (task: TaskModel) => {
		const response = await api.put<TaskModel>(
			config.tasksUrl + task.id,
			task
		);
		return response.data;
	}
);

export const deleteTask = createAsyncThunk(
	"tasks/deleteTask",
	async (id: number) => {
		await api.delete(config.tasksUrl + id);
		return id;
	}
);

export default tasksSlicer.reducer;
