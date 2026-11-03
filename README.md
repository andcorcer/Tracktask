# TrackTask

[**Live Demo »**](https://tracktask-app.netlify.app) &nbsp;·&nbsp; [**Bug Report**](https://github.com/andcorcer/Tracktask/issues) &nbsp;·&nbsp; [**New Features**](https://github.com/andcorcer/Tracktask/issues)

A responsive React and Redux web application built with Vite and a python microservice backend with fastAPI that gets items from 3 different APIs (Google Calendar, Google Tasks and Garmin) as well as custom todos and shows them all in one view to make a wel rounded daily planning app.

---

## Features

- **Home Page**: Displays a day view calendar component with interactive date as well as health metrics and todos for that given date.
- **Calendar View Mode**: Calendar components for day, week and month view that render their corresponding events, tasks, activities and workouts inside the selected timeframe.
- **Health Page**: Access any recent activities, workouts a full display of health metrics and different training plans.
- **Todo Management**: Add, archive or remove todos from local storage memory with a full view to see them ordered by date or their state.
- **Settings Page**: Complete settings page with Google and Garmin authentication, theme selection and cache memory liberation.
- **Details Access**: Modal card for events, todos, tasks, activities, workouts, etc. to view them in detail upon clicking them.
- **Responsive Dark UI**: Fully accessible, design built with modern CSS custom properties and box-sizing normalization.

## Tech Stack

- **Frontend**: React 18, Redux Toolkit, Vite, Modern CSS

- **Backend Service**: Python 3.12, FastAPI, Uvicorn, GarminConnect (garth)

- **Deployment**: Netlify (Frontend), Render (Backend Microservice)

## Project Structure

```text
garmin-service/
├── .python-version
├── main.py
└── requirements.txt
src/
├── components/
│   ├── App/
│   ├── calendar/
│   │   ├── CalendarContainer/
│   │   ├── CalendarHeader/
│   │   ├── DayView/
│   │   ├── MonthView/
│   │   └── WeekView/
│   ├── details/
│   │   ├── DetailsCard/
│   │   └── Modal/
│   ├── inputs/
│   │   ├── CalendarInput/
│   │   └── TodoInput/
│   ├── items/
│   │   ├── CalendarCard/
│   │   ├── HealthCard/
│   │   └── TodoCard/
│   ├── layout/
│   │   ├── Header/
│   │   ├── Layout/
│   │   └── Navbar/
│   ├── lists/
│   │   ├── CalendarList/
│   │   ├── HealthList/
│   │   └── TodoList/
│   └── states/
        ├── Error/
        └── Loading/
├── pages/
│   ├── CalendarPage/
│   ├── HealthPage/
│   ├── HomePage/
│   ├── NotFoundPage/
│   ├── SettingsPage/
│   └── TodosPage/
├── store/
│   ├── slices/
│   │   ├── authenticationSlice.js
│   │   ├── calendarSlice.js
│   │   ├── dateSlice.js
│   │   ├── garminSlice.js
│   │   └── todosSlice.js
│   └── store.js
├── utilities/
│   ├── garminApi.js
│   ├── googleCalendarApi.js
│   └── googleTasks.js
├── index.css
└── main.jsx
```

## Application Routes

| Path        | Component          | Description                                                  |
| :---------- | :----------------- | :----------------------------------------------------------- |
| `/`         | `<HomePage />`     | Displays daily data for the selected date                    |
| `/calendar` | `<CalendarPage />` | Day, week and month calendar data displayed                  |
| `/health`   | `<HealthPage />`   | Daily summary, activities, workouts and training plans data  |
| `/todos`    | `<TodosPage />`    | Todos data and filtering for date, active and archived todos |
| `/settings` | `<SettingsPage />` | Authentication, theme and memory handling settings           |
| `*`         | `<NotFoundPage />` | Fallback page for handling invalid or outdated URLs          |

## State Management

The application uses Redux Toolkit to manage global state across 5 slices (`authentication`, `calendar`, `date`, `garmin` and `todos`):

```js
state = {
  authentication: {
    garmin: {
      status: "disconnected", // connected || disconnected
      message: "Not logged in with Garmin",
      user: null,
    },
    google: {
      status: "disconnected", // connected || disconnected
      message: "Not logged in with Google",
      accessToken: null,
      user: null,
    },
    isLoading: false,
    error: null,
  },
  calendar: {
    calendarList: {
      selectedListId: "primary",
      items: [],
    },
    tasksList: {
      selectedListId: "@default",
      items: [],
    },
    tasks: {
      selectedTaskId: null,
      items: [],
    },
    events: {
      selectedEventId: null,
      items: [],
    },
    isLoading: false,
    error: null,
  },
  date: {
    selectedDate: new Date().toISOString().split("T")[0],
    startDate: new Date().toISOString().split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
  },
  garmin: {
    healthMetrics: {
      selectedMetricId: null,
      summaryDate: null,
      items: [],
    },
    activities: {
      selectedActivityId: null,
      items: [],
    },
    trainingPlans: {
      selectedPlanId: null,
      items: [],
    },
    upcomingWorkouts: {
      selectedWorkoutId: null,
      items: [],
    },
    isLoading: false,
    error: null,
  },
  todos: {
    items: [],
  },
};
```

## Getting Started

### Prerequisites

- **Node.js:** `v18.0.0` or higher
- **Python:** 3.12.x` (for running the Garmin backend locally)
- **Google Cloud Console Credentials:** OAuth 2.0 Web Client ID (Google Calendar & Tasks API enabled for that Client ID)

### Local Setup

1. **Clone the Repository**:

   ```bash
   git clone https://github.com/andcorcer/Tracktask.git
   cd Tracktask
   ```

2. **Frontend Setup**:

   ```bash
   # Install all Dependencies
   npm install

   # Run the Vite server (runs at http://localhost:5173)
   npm run dev
   ```

3. **Backend Setup (FastAPI)**
   ```bash
   cd garmin-service

  # Create and activate a virtual environment

  python -m venv venv
  source venv/bin/activate # On Windows: venv\Scripts\activate

  # Install backend dependencies

  pip install -r requirements.txt

  # Start the server (runs at http://localhost:8000)

  uvicorn main:app --reload --port 8000
  ```

## Deployment Configuration 

### Netlify (Frontend)

Configure the following environment variables in your Netlify project settings (**Site settings > Environment variables**):

| Variable                   | Value                                               | Description                   |
| :------------------------- | :-------------------------------------------------- | :---------------------------- |
| `VITE_GOOGLE_CLIENT_ID`    | `your_google_client_id.apps.googleusercontent.com`  | Google OAuth Client ID        |
| `VITE_API_URL`             | `https://tracktask-backend.onrender.com`            | Production Render backend URL |

**Build Settings**

- **Build Command:** `npm run build`
- **Publish Directory:** `dist`

### Render (Backend)

- **Environment:** Python 3.12 (Enforced via `.python-version`)
- **Build Command:** `pip install -r requirements.txt`
- **Start Command:** `uvicorn main:app --host 0.0.0.0 --port $PORT`