import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import * as tasksService from '../../firebase/firestore/tasks';
import { Timestamp } from '@react-native-firebase/firestore';

interface Task {
  id: string;
  title: string;
  description?: string;
  tag: string;
  priority: 'low' | 'medium' | 'high';
  pomodoroLength: 25 | 50;
  breakLength: 5 | 10;
  plannedPomodoros: number;
  completedPomodoros: number;
  userId: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

interface TasksState {
  tasks: Task[];
  loading: boolean;
  error: string | null;
}

const initialState: TasksState = {
  tasks: [],
  loading: false,
  error: null,
};

export const fetchTasks = createAsyncThunk(
  'tasks/fetchTasks',
  async (userId: string, { rejectWithValue }) => {
    try {
      return await tasksService.getUserTasks(userId);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  },
);

export const addTask = createAsyncThunk(
  'tasks/addTask',
  async (
    { userId, taskData }: { userId: string; taskData: Omit<Task, 'id'> },
    { rejectWithValue },
  ) => {
    try {
      return await tasksService.createTask(userId, taskData);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  },
);

export const editTask = createAsyncThunk(
  'tasks/editTask',
  async (
    {
      taskId,
      userId,
      updatedData,
    }: { taskId: string; userId: string; updatedData: Partial<Task> },
    { rejectWithValue },
  ) => {
    try {
      await tasksService.updateTask(taskId, userId, updatedData);
      return { taskId, updatedData };
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  },
);

export const removeTask = createAsyncThunk(
  'tasks/removeTask',
  async (
    { taskId, userId }: { taskId: string; userId: string },
    { rejectWithValue },
  ) => {
    try {
      await tasksService.deleteTask(taskId, userId);
      return taskId;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  },
);

const tasksSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    clearTasksError: state => {
      state.error = null;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(fetchTasks.pending, state => {
        state.loading = true;
      })
      .addCase(fetchTasks.fulfilled, (state, action: PayloadAction<Task[]>) => {
        state.loading = false;
        state.tasks = action.payload;
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(addTask.fulfilled, (state, action: PayloadAction<Task>) => {
        state.tasks.unshift(action.payload);
      })
      .addCase(addTask.rejected, (state, action) => {
        state.error = action.payload as string;
      })

      .addCase(editTask.fulfilled, (state, action) => {
        const index = state.tasks.findIndex(
          t => t.id === action.payload.taskId,
        );
        if (index !== -1)
          state.tasks[index] = {
            ...state.tasks[index],
            ...action.payload.updatedData,
          };
      })
      .addCase(editTask.rejected, (state, action) => {
        state.error = action.payload as string;
      })

      .addCase(removeTask.fulfilled, (state, action: PayloadAction<string>) => {
        state.tasks = state.tasks.filter(t => t.id !== action.payload);
      })
      .addCase(removeTask.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

export const { clearTasksError } = tasksSlice.actions;
export default tasksSlice.reducer;
