# Cosmic Focus: A Gamified Pomodoro and Productivity App

**Cosmic Focus** Cosmic is a React Native (Community CLI) app designed to enhance productivity through focus, consistency, and accountability.
It helps users manage tasks, track their progress, and grow their own galaxy of focus, earning celestial rewards as they stay committed to their goals.

---

## Features

### Productivity
- Create and manage tasks with title, description, and customizable tags (e.g., Study, Work, Sleep, etc.).
- Choose between **Pomodoro cycles** (25/5 or 50/10) and set the number of focus sessions.
- Option to automatically start the next cycle after each break.
- Play **white noise** during focus sessions for improved concentration.
- Toggle between **Normal Mode** and **Deep Focus Mode**:
  - In Deep Focus Mode, if the user opens another app, an overlay appears saying:  
    *“Is this app distracting you? Return to focus app.”*

### Gamification
- Earn stars and maintain daily streaks by completing focus sessions.
- Spend stars in the **Shop Page** to unlock new:
  - Ambient music  
  - Planets, suns, and moons for your galaxy
- Accumulate and explore your own Galaxy Dashboard.

### Social Accountability
- Send and receive friend requests, or search for new friends.
- **Focus Together in Real-Time**:  
  Collaborate in focus sessions where if even one friend quits, everyone loses the reward and earns a “Dead Star.”  

### Insights & Reports
- Track focus performance through daily, weekly, and monthly reports.
  

---

## Tech Stack

| Category | Technologies |
|-----------|---------------|
| **Frontend** | React Native CLI (v0.81.4) |
| **State Management** | Redux Toolkit|
| **Backend** | Firebase Authentication, Firestore Database |
| **Charts & Visualization** | react-native-chart-kit |
| **Sound & Effects** | react-native-sound |
| **Notifications** | @notifee/react-native |

---

## Platform
**Android Only**

---

## Installation & Setup

### 1. Clone the repository
```bash
git clone https://github.com/preykriti/cosmic-focus.git
cd cosmic-focus
```
### 2. Install dependencies
```bash
npm install
```
### 3. Run the app
```bash
npm run android
```


