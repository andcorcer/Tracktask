# Import all neccesary libraries and modules

# Allow reading environment variables from a .env file
import os
from dotenv import load_dotenv

# Gets dates
from datetime import date, timedelta

# Import FastAPI and HTTPException for building the API with it's backend routes and handling errors
from fastapi import FastAPI, HTTPException

# Allow Cross-Origin Resource Sharing (CORS) to enable requests from the frontend React app on another port
from fastapi.middleware.cors import CORSMiddleware

# Import Garmin client from the garminconnect library to interact with Garmin Connect API
from garminconnect import Garmin

# Gets environment variables from a .env file and loads them into the memory for os.getenv() to access them
load_dotenv()

# Get the port number from the environment variables, defaulting to 8000 if not set
PORT = int(os.getenv("PORT", 8000))

# Initialize FastAPI app with title, description, and version
app = FastAPI(
    title="TrackList Garmin Service",
    description="Backend service to fetch Garmin data for TrackList app",
    version="1.0.0",
)

# Allow requests from your React development app
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173"
    ],  # Allows requests from the React development server
    allow_credentials=True,  # Allows the transaction of authentication headers
    allow_methods=["*"],  # Allows all HTTP methods (GET, POST, etc.)
    allow_headers=["*"],  # Allows all headers (Authorization, Content-Type, etc.)
)

# Get the email and password from the environment variables for Garmin authentication
EMAIL = os.getenv("GARMIN_EMAIL")
PASSWORD = os.getenv("GARMIN_PASSWORD")

# Variable to hold the Garmin client instance, initialized as None
garmin_client = None


# Helper function to geta garmin_client instance, logging in if not already done
def get_garmin_client():
    global garmin_client

    # Check for missing environment variables before attempting authentication
    if not EMAIL or not PASSWORD:
        raise HTTPException(
            status_code=500,
            detail="Garmin credentials missing from environment variables (.env)",
        )

    if garmin_client is None:
        try:
            client = Garmin(EMAIL, PASSWORD)
            client.login()
            garmin_client = client
        except Exception as e:
            # Throw an HTTPException with status code 500 and a detailed error message if Garmin authentication fails
            raise HTTPException(
                status_code=500, detail=f"Garmin Authentication Failed: {str(e)}"
            )
    return garmin_client


# Route to fetch wellness summary for a given date (steps, heart rate, sleep, calories) for a specific date or today if no date is provided
@app.get("/api/garmin/summary")
def get_daily_summary(target_date: str = None):
    """Fetch daily wellness summary (steps, heart rate, sleep, calories)."""
    client = get_garmin_client()
    # Get the date to query form, default it to today if not provided as a parameter
    query_date = target_date if target_date else date.today().isoformat()

    try:
        data = client.get_user_summary(query_date)
        return data

    except Exception as e:
        # Throw an HTTPException with status code 500 and a detailed error message if Garmin fetching of data fails
        raise HTTPException(status_code=500, detail=str(e))


# Route to fetch recent activities/workouts, with a start and end date
@app.get("/api/garmin/activities")
def get_activities(start_date: str = None, end_date: str = None):
    """Fetch recent activities/workouts."""
    client = get_garmin_client()

    query_start = start_date or date.today().isoformat()
    query_end = end_date or date.today().isoformat()

    try:
        activities = client.get_activities_by_date(query_start, query_end)
        return activities

    except Exception as e:
        # Throw an HTTPException with status code 500 and a detailed error message if Garmin fetching of activities fails
        raise HTTPException(status_code=500, detail=str(e))


# Route to fetch the workouts and details for an active training plan
@app.get("/api/garmin/training-plans")
def get_training_plans():
    """Fetch active Garmin Coach or custom training programs."""
    client = get_garmin_client()

    try:
        plans = client.get_training_plans()
        return plans

    except Exception as e:
        # Throw an HTTPException with status code 500 and a detailed error message if Garmin fetching of activities fails
        raise HTTPException(status_code=500, detail=str(e))


# Route to fetch the workouts and details for an active training plan
@app.get("/api/garmin/workouts-in-time-range")
def get_workouts_in_time_range(start_date: str = None, end_date: str = None):
    """Fetch workouts in a given time range"""
    client = get_garmin_client()

    query_start = start_date or date.today().isoformat()
    query_end = end_date or (date.today() + timedelta(weeks=1)).isoformat()
    upcoming_workouts = []

    try:
        calendar_data = client.get_calendar(query_start, query_end)
        # We make events an array of the returned data
        events = (
            calendar_data.get("calendarItems", []) # Gets the calendarItems key if a dictionary is returned
            if isinstance(calendar_data, dict)
            else calendar_data # returns the fetched data as an array if it isn't a dicionary
        )
        for event in events:
            if isinstance(event, dict) and event.get("itemType") == "WORKOUT": # Only if event is a dictionary do we access it's 'itemType'
                upcoming_workouts.append(event)
        return upcoming_workouts

    except Exception as e:
        # Throw an HTTPException with status code 500 and a detailed error message if Garmin fetching of activities fails
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    # Run the FastAPI app using Uvicorn server on localhost at port 8000 with auto-reload enabled for development
    import uvicorn

    uvicorn.run("main:app", host="127.0.0.1", port=PORT, reload=True)
