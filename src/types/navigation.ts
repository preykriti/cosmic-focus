import { Task } from "./task";

export type AuthStackParamList = {
  Login: undefined;
  Signup: undefined;
};

export type MainStackParamList = {
  MainTabs: undefined;
  Pomodoro: {
    task: Task;
    autoStartNext: boolean;
  };
};

export type TabParamList = {
  Home: undefined;
  Friends: undefined;
  Report: undefined;
  Profile: undefined;
  Tasks: undefined;
};
