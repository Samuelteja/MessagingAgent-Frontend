import React, { createContext, useState, useContext } from 'react';

// 1. Create the context
const LayoutContext = createContext();

// 2. Create the provider component
export function LayoutProvider({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); // Default to open

  const toggleSidebar = () => {
    setIsSidebarOpen(prevState => !prevState);
  };

  const value = {
    isSidebarOpen,
    toggleSidebar,
  };

  return (
    <LayoutContext.Provider value={value}>
      {children}
    </LayoutContext.Provider>
  );
}

// 3. Create a custom hook for easy access to the context
export function useLayout() {
  return useContext(LayoutContext);
}