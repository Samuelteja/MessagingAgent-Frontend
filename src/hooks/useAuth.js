// In frontend/src/hooks/useAuth.js

import { useState, useEffect } from 'react';
// import { getBusinessProfile } from '../services/api'; // Assuming you have a way to fetch this

// This is a placeholder for your real authentication context.
// It simulates fetching the user's business type.
export function useAuth() {
  const [user, setUser] = useState({ business_type: null, isLoading: true });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setUser({ business_type: 'SALON', isLoading: false }); // Default to SALON for now
      } catch (error) {
        console.error("Auth Error: Could not fetch user profile.", error);
        setUser({ business_type: 'SALON', isLoading: false });
      }
    };
    fetchProfile();
  }, []);

  return user;
}