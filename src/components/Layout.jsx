// frontend/src/components/Layout.js
import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useLayout } from '../context/LayoutContext';
import clsx from 'clsx';

function Layout() {
  const { isSidebarOpen } = useLayout();
  return (
    <div className="flex bg-gray-100 min-h-screen">
      <Sidebar />
      {/* --- USE CLSX FOR DYNAMIC MARGIN --- */}
      <main className={clsx(
          "flex-1 p-8 transition-all duration-300 ease-in-out",
          {
            "ml-64": isSidebarOpen,
            "ml-20": !isSidebarOpen,
          }
        )}>
        <Outlet />
      </main>
    </div>
  );
}
export default Layout;