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

# Import BaseModel for POST requests to be parsed automatically and EmailStr to ensure the given email has email syntax
from pydantic import BaseModel, EmailStr

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

# Path in the local computer to store Tokens for the session to persist while hasn't expired
SESSION_DIR = os.path.expanduser("~/.garminconnect")


# Class to create an object with login credentials from a post request
class GarminCredentials(BaseModel):
    email: EmailStr
    password: str


# Variable to hold the Garmin client instance, initialized as None
garmin_client = None


def get_garmin_client():
    """Helper function to log in via session tokens or return an error for the Front_end to request a log in"""
    global garmin_client

    # If already logged in just return the current profile
    if garmin_client is not None:
        return garmin_client

    # Uses session tokens in for logging in if they've been saved
    if os.path.exists(SESSION_DIR):
        try:
            client = Garmin()
            client.login(SESSION_DIR)
            garmin_client = client
            return garmin_client
        except Exception as e:
            # Throw an HTTPException with status code 401 for failed token and a detailed error message if tokens fail
            raise HTTPException(
                status_code=401, detail=f"Failed Token. Possible expiration"
            )
    # Throw an HTTPException with status code 401 error for users that haven't logged in
    raise HTTPException(
        status_code=401, detail=f"Garmin not Authenticated. Please log in."
    )


# Route to handle Logging In using an email and password passed in the POST request
@app.post("/api/garmin/login")
def login(credentials: GarminCredentials):
    """Authenticate with Garmin using email and password, then save session tokens for persistant access."""
    global garmin_client

    try:
        client = Garmin(email=credentials.email, password=credentials.password)
        client.login()

        # Makes a directory to dump the access credentials for persistant profile
        os.makedirs(SESSION_DIR, exist_ok=True)
        client.garth.dump(SESSION_DIR)

        garmin_client = client
        # Returns a JSON message for the Front-End
        return {
            "status": "connected",
            "message": "Successfully authenticated with Garmin",
        }

    except Exception as e:
        raise HTTPException(
            # Throw an HTTPException with status code 401 error for an error in the log in
            status_code=401,
            detail=f"Garmin Authentication Failed: {str(e)}",
        )


# Route to verify if a user has logged in for the clients and returns basic profile data
@app.get("/api/garmin/status")
def check_status():
    """Verify if active session exists without fetching too much data and returns basic profile details"""
    client = get_garmin_client()
    profile = getattr(client, "profile", {}) or {}

    # Return profile details with fallback values
    return {
        "status": "connected",
        "user": {
            "name": getattr(client, "full_name", "Garmin User"),
            "username": profile.get("userName", ""),
            "profileImageUrl": profile.get("profileImageUrlMedium")
            or profile.get("profileImageUrlSmall", None),
        },
    }


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
@app.get("/api/garmin/activities-in-time-range")
def get_activities_in_time_range(start_date: str = None, end_date: str = None):
    """Fetch activities in a time range"""
    client = get_garmin_client()

    query_start = start_date or date.today().isoformat()
    query_end = end_date or date.today().isoformat()

    try:
        activities = client.get_activities_by_date(query_start, query_end)
        return activities

    except Exception as e:
        # Throw an HTTPException with status code 500 and a detailed error message if Garmin fetching of activities fails
        raise HTTPException(status_code=500, detail=str(e))


# Route to fetch the most recent activities/workouts using a start index and limit
@app.get("/api/garmin/recent-activities")
def get_recent_activities(start: int = 0, limit: int = 10):
    """Fetch recent activities using a start index and limit"""
    client = get_garmin_client()

    try:
        activities = client.get_activities(start, limit)
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
def get_workouts_in_time_range(
    start_date: str = None, end_date: str = None, training_plan_id=None
):
    """Fetch workouts in a given time range"""
    client = get_garmin_client()

    query_start = start_date or date.today().isoformat()
    query_end = end_date or (date.today() + timedelta(weeks=1)).isoformat()
    upcoming_workouts = []

    try:
        calendar_data = client.get_calendar(query_start, query_end)
        # We make events an array of the returned data

        if isinstance(calendar_data, dict):
            events = calendar_data.get(
                "calendarItems", []
            )  # Gets the calendarItems key if a dictionary is returned
        elif isinstance(calendar_data, list):
            events = calendar_data  # returns the fetched data as an array if it isn't a dicionary
        else:
            events = []

        # Accepted "itemTypes" in Garmin's events returned
        WORKOUT_TYPES = {"WORKOUT", "WORKOUT_TASK"}

        for event in events:
            if not isinstance(event, dict):
                continue

            item_type = event.get("itemType")

            if item_type in WORKOUT_TYPES:
                # Logic to fetch workouts from a given training plan
                if training_plan_id:
                    event_training_plan_id = event.get("trainingPlanId") or event.get(
                        "planId"
                    )  # We get the plan id for the current event
                    if event_training_plan_id is not None and str(
                        event_training_plan_id
                    ) == str(
                        training_plan_id
                    ):  # We compare the wanted plan id with the current event's plan id
                        upcoming_workouts.append(event)
                else:
                    # If no training plan is provided we just return all workouts
                    upcoming_workouts.append(event)

        return upcoming_workouts

    except Exception as e:
        # Throw an HTTPException with status code 500 and a detailed error message if Garmin fetching of activities fails
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    # Run the FastAPI app using Uvicorn server on localhost at port 8000 with auto-reload enabled for development
    import uvicorn

    uvicorn.run("main:app", host="127.0.0.1", port=PORT, reload=True)
