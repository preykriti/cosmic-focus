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
  Lobby: {
    sessionId: string;
  };
  Feed: undefined;
  Shop: undefined;
};

export type TabParamList = {
  Home: undefined;
  Friends: undefined;
  Report: undefined;
  Profile: undefined;
  Tasks: undefined;
};
