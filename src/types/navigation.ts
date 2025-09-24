import { Task } from './task';

export type AuthStackParamList = {
  Login: undefined;
  Signup: undefined;
};

export type MainStackParamList = {
  MainTabs: undefined;
  Pomodoro: {
    task: {
      id: string;
      title: string;
      tag: string;
      pomodoroLength: 25 | 50;
      breakLength: 5 | 10;
      plannedPomodoros: number;
    };
    autoStartNext: boolean;
    isGroupSession?: boolean;
    groupSessionId?: string;
  };
  GroupSessionSetup: undefined;
  GroupLobby: {
    sessionId: string;
    selectedFriends: string[];
    pomodoroLength: '25/5' | '50/10';
    hostUser: {
      id: string;
      username: string;
      email: string;
    };
  };
  Lobby: {
    sessionId: string;
  };
  
};

export type TabParamList = {
  Home: undefined;
  Friends: undefined;
  Report: undefined;
  Profile: undefined;
  Tasks: undefined;
  Feed: undefined;
};
