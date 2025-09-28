// In frontend/src/hooks/useCalendar.js

import { useReducer, useCallback, useRef } from 'react';
import { getBookings } from '../services/api';

const staffColors = [
  'bg-blue-500 border-blue-500 text-blue-800 hover:bg-blue-200',
  'bg-green-500 border-green-500 text-green-800 hover:bg-green-200',
  'bg-purple-500 border-purple-500 text-purple-800 hover:bg-purple-200',
  'bg-pink-500 border-pink-500 text-pink-800 hover:bg-pink-200',
  'bg-indigo-500 border-indigo-500 text-indigo-800 hover:bg-indigo-200',
  'bg-teal-500 border-teal-500 text-teal-800 hover:bg-teal-200',
];

// This ensures each staff member always gets the same color
const colorMap = {};
let colorIndex = 0;

const getEventColorClasses = (staffName) => {
  // Return a default gray for bookings with no assigned staff
  if (!staffName) {
    return 'bg-green-500 border-green-500 text-green-600 hover:bg-green-200';
  }
  // If we haven't seen this staff member before, assign them the next color
  if (!colorMap[staffName]) {
    colorMap[staffName] = staffColors[colorIndex % staffColors.length];
    colorIndex++;
  }
  return colorMap[staffName];
};


// 1. Define the initial state for our calendar
const initialState = {
  events: [],
  isLoading: true,
  error: null,
  currentDateRange: null, // To keep track of the current view
};

// 2. Define the actions our reducer can handle
const actionTypes = {
  FETCH_START: 'FETCH_START',
  FETCH_SUCCESS: 'FETCH_SUCCESS',
  FETCH_ERROR: 'FETCH_ERROR',
  SET_DATE_RANGE: 'SET_DATE_RANGE',
};

// 3. Create the reducer function to manage state transitions
function calendarReducer(state, action) {
  switch (action.type) {
    case actionTypes.FETCH_START:
      return { ...state, isLoading: true, error: null };
    case actionTypes.FETCH_SUCCESS:
      return { ...state, isLoading: false, events: action.payload };
    case actionTypes.FETCH_ERROR:
      return { ...state, isLoading: false, error: action.payload };
    case actionTypes.SET_DATE_RANGE:
      return { ...state, currentDateRange: action.payload };
    default:
      throw new Error(`Unhandled action type: ${action.type}`);
  }
}

// 4. The custom hook itself
export function useCalendar() {
  const [state, dispatch] = useReducer(calendarReducer, initialState);
  const cache = useRef({}); // Use a ref for a simple in-memory cache

  const fetchBookings = useCallback(async (fetchInfo) => {
    dispatch({ type: actionTypes.FETCH_START });

    // Extract a clean date range for the cache key
    const startDate = fetchInfo.startStr.split('T')[0];
    const endDate = fetchInfo.endStr.split('T')[0];
    const cacheKey = `${startDate}_${endDate}`;
    
    // Check cache first to prevent redundant API calls
    if (cache.current[cacheKey]) {
      console.log("Serving from cache:", cacheKey);
      dispatch({ type: actionTypes.FETCH_SUCCESS, payload: cache.current[cacheKey] });
      return;
    }

    console.log("Fetching from API for:", cacheKey);
    try {
      const res = await getBookings(startDate, endDate);
      const styledEvents = res.data.map(event => ({
        ...event,
        className: getEventColorClasses(event.staff_name) + ' border-l-4 cursor-pointer',
      }));
      // Store the successful response in the cache
      cache.current[cacheKey] = styledEvents;
      dispatch({ type: 'FETCH_SUCCESS', payload: styledEvents });
    } catch (err) {
      console.error("Failed to fetch bookings:", err);
      const errorMessage = "Could not load appointment data. Please try refreshing.";
      dispatch({ type: actionTypes.FETCH_ERROR, payload: errorMessage });
    }
  }, []);

  // Function to manually trigger a refresh of the current view
  const refreshCalendar = useCallback(() => {
    if (state.currentDateRange) {
      // Invalidate the cache for the current view and re-fetch
      const startDate = state.currentDateRange.startStr.split('T')[0];
      const endDate = state.currentDateRange.endStr.split('T')[0];
      const cacheKey = `${startDate}_${endDate}`;
      delete cache.current[cacheKey];
      
      fetchBookings(state.currentDateRange);
    }
  }, [state.currentDateRange, fetchBookings]);
  
  const handleDatesSet = useCallback((dateInfo) => {
      // Store the current date range so we can refresh it later
      dispatch({ type: actionTypes.SET_DATE_RANGE, payload: dateInfo });
      // This is the primary trigger to fetch data
      fetchBookings(dateInfo);
  }, [fetchBookings]);

  return {
    state,
    refreshCalendar,
    handleDatesSet,
  };
}