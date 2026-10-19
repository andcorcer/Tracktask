// Import all dependencies
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

// Import Components
import HealthCard from "../../items/HealthCard/HealthCard";
import Loading from "../../states/Loading/Loading";
import Error from "../../states/Error/Error";

// Import Actions
import {
  fetchDailySummary,
  fetchActivitiesInTimeRange,
  fetchRecentActivities,
  fetchTrainingPlans,
  fetchUpcomingWorkouts,
  fetchWorkoutsForTrainingPlan,
} from "../../../store/slices/garminSlice";

// Import Styles
import "./HealthList.css";

// HealthList Component
const HealthList = ({ type, startDate, endDate, trainingPlan, itemLimit }) => {
  const dispatch = useDispatch(); // Get the dispatch function from Redux to dispatch actions

  // We get all 'Health' states from the store
  const healthMetrics = useSelector(
    (state) => state.garmin.healthMetrics.items,
  );
  const activities = useSelector((state) => state.garmin.activities.items || []);
  const trainingPlans = useSelector(
    (state) => state.garmin.trainingPlans.items || [],
  );
  const upcomingWorkouts = useSelector(
    (state) => state.garmin.upcomingWorkouts.items || [],
  );
  const isLoading = useSelector((state) => state.garmin.isLoading);
  const error = useSelector((state) => state.garmin.error);

  // We create a local state to pass onto the retry function so that it refetches all data
  const [retryCount, setRetryCount] = useState(0);

  const onRetry = () => {
    setRetryCount(prevCount => prevCount + 1);
  }

  // We dispatch the corresponding acton whenever one of the props changes
  useEffect(() => {
    switch (type) {
      case "summary":
        // We pass startDate as the target date for daily summary
        dispatch(fetchDailySummary(startDate));
        break;

      case "activity":
        // We either fetch activities in the provided time range or just fetch recent activities
        if (startDate || endDate) {
          dispatch(fetchActivitiesInTimeRange({ startDate, endDate }));
        } else {
          dispatch(fetchRecentActivities({ start: 0, limit: 30 }));
        }
        break;

      case "trainingPlan":
        dispatch(fetchTrainingPlans());
        break;

      case "workout":
        // We either fetch workouts using a given trainingPlan or without it
        if (trainingPlan) {
          dispatch(
            fetchWorkoutsForTrainingPlan({
              planId: trainingPlan,
              startDate,
              endDate,
            }),
          );
        } else {
          dispatch(fetchUpcomingWorkouts({ startDate, endDate }));
        }
        break;

      default:
        break;
    }
  }, [dispatch, type, startDate, endDate, trainingPlan, retryCount]);

  // Display error component if there is an error
  if (error) {
    return <Error error={error} onRetry={onRetry} />;
  }

  // If the data is still loading, display the loading component
  if (isLoading) {
    return <Loading />;
  }

  // We render the corresponding HealthCard using the type prop
  const renderList = () => {
    switch (type) {
      case "summary":
        return healthMetrics ? (
          <HealthCard type={type} data={healthMetrics} />
        ) : (
          <div className="empty-list">
            <p>No health metrics for this date.</p>
          </div>
        );

      case "activity":
        // Make sure that activities is always an array
        const safeActivities = Array.isArray(activities) ? activities : [];
        const displayedActivities = itemLimit ? safeActivities.slice(0, itemLimit) : safeActivities;
        return displayedActivities.length > 0 ? (
          displayedActivities.map((activity, index) => (
            <HealthCard
              key={activity.id || index}
              type={type}
              data={activity}
            />
          ))
        ) : (
          <div className="empty-list">
            <p>No activities found.</p>
          </div>
        );

      case "trainingPlan":
        // Make sure that trainingPlans is always an array
        const safeTrainingPlans = Array.isArray(trainingPlans) ? trainingPlans : [];
        const displayedTrainingPlans = itemLimit ? safeTrainingPlans.slice(0, itemLimit) : safeTrainingPlans;
        return displayedTrainingPlans.length > 0 ? (
          displayedTrainingPlans.map((trainingPlan, index) => (
            <HealthCard
              key={trainingPlan.id || index}
              type={type}
              data={trainingPlan}
            />
          ))
        ) : (
          <div className="empty-list">
            <p>No training plans found.</p>
          </div>
        );

      case "workout":
        // Make sure that upcomingWorkouts is always an array
        const safeUpcomingWorkouts = Array.isArray(upcomingWorkouts) ? upcomingWorkouts : [];
        const displayedUpcomingWorkouts = itemLimit ? safeUpcomingWorkouts.slice(0, itemLimit) : safeUpcomingWorkouts;
        return displayedUpcomingWorkouts.length > 0 ? (
          displayedUpcomingWorkouts.map((workout, index) => (
            <HealthCard
              key={workout.id || index}
              type={type}
              data={workout}
            />
          ))
        ) : (
          <div className="empty-list">
            <p>No upcoming workouts found.</p>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="health-list-container">
        {renderList()}
    </div>
  );
};

// Export the HealthList component
export default HealthList;
