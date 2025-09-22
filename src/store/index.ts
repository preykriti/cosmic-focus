import { configureStore, freeze } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import taskReducer from './slices/taskSlice';
import friendsReducer from './slices/friendsSlice';
import focusSessionReducer from './slices/focusSessionSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    tasks: taskReducer,
    friends: friendsReducer,
    focusSession: focusSessionReducer,
  },
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      // serializableCheck: {
      //   ignoredActions: [
      //     'auth/setUser',
      //     'tasks/fetchTasks/fulfilled',
      //     'tasks/addTask/fulfilled',
      //     'tasks/editTask/fulfilled',
      //   ],
      //   ignoredPaths: ['auth.user', 'tasks.tasks', 'friends.friends'],
      // },
      serializableCheck: false,
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
