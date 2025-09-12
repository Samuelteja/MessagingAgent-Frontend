import React from 'react';
import { NavLink } from 'react-router-dom';
import { useLayout } from '../context/LayoutContext';
import clsx from 'clsx';
import { 
    FiChevronLeft, FiChevronRight, FiInbox, FiTag, 
    FiBarChart2, FiSettings, FiClock, FiUsers, FiMessageSquare, FiClipboard
} from 'react-icons/fi'; // Assuming you have `npm install react-icons`

function Sidebar() {
  const { isSidebarOpen, toggleSidebar } = useLayout();

  const getNavLinkClass = ({ isActive }) =>
    clsx(
      // --- REFACTOR ---: Reduced padding for a more compact feel.
      "flex items-center p-2 rounded-md text-gray-200 hover:bg-gray-700 transition-colors",
      {
        "bg-blue-500 font-bold": isActive,
        "justify-center": !isSidebarOpen,
      }
    );

  return (
    <nav className={clsx(
        "fixed top-0 left-0 h-full bg-gray-800 text-white flex flex-col transition-all duration-300 ease-in-out",
        {
          "w-52 p-4": isSidebarOpen, // Reduced padding
          "w-16 p-2": !isSidebarOpen, // Reduced padding
        }
      )}>
      
      {/* Header */}
      <div className={clsx(
          "flex items-center mb-6 flex-shrink-0", // <-- flex-shrink-0 is important
          {
            "justify-between": isSidebarOpen,
            "justify-center": !isSidebarOpen,
          }
        )}>
        {isSidebarOpen && <h2 className="text-xl font-bold">AI Assistant</h2>}
        <button onClick={toggleSidebar} className="p-1 rounded-full hover:bg-gray-700">
          {isSidebarOpen ? <FiChevronLeft size={22} /> : <FiChevronRight size={22} />}
        </button>
      </div>

      {/* ========================================================================= */}
      {/* --- THIS IS THE SCROLLBAR FIX --- */}
      {/* We wrap the navigation list in a div that will handle the scrolling. */}
      <div className="flex-grow overflow-y-auto">
        <ul className="space-y-2">
            {/* Knowledge Section */}
            {isSidebarOpen && <strong className="text-xs text-gray-400 uppercase px-2 pt-2">AI & Knowledge</strong>}
            <li>
                <NavLink to="/knowledge/menu" className={getNavLinkClass}>
                    <FiClipboard size={20} />
                    {isSidebarOpen && <span className="ml-3">Menu</span>}
                </NavLink>
            </li>
            <li>
                <NavLink to="/knowledge/qa" className={getNavLinkClass}>
                    <FiMessageSquare size={20} />
                    {isSidebarOpen && <span className="ml-3">Q&A</span>}
                </NavLink>
            </li>

            {/* Operations Section */}
            {isSidebarOpen && <strong className="text-xs text-gray-400 uppercase px-2 pt-4">Operations</strong>}
            <li>
                <NavLink to="/operations/profile" className={getNavLinkClass}>
                    <FiSettings size={20} />
                    {isSidebarOpen && <span className="ml-3">Business Profile</span>}
                </NavLink>
            </li>
            <li>
                <NavLink to="/operations/hours" className={getNavLinkClass}>
                    <FiClock size={20} />
                    {isSidebarOpen && <span className="ml-3">Hours</span>}
                </NavLink>
            </li>
            <li>
                <NavLink to="/operations/staff" className={getNavLinkClass}>
                    <FiUsers size={20} />
                    {isSidebarOpen && <span className="ml-3">Staff</span>}
                </NavLink>
            </li>
            
            {/* Customer Engagement Section */}
            {isSidebarOpen && <strong className="text-xs text-gray-400 uppercase px-2 pt-4">Engagement</strong>}
            <li>
                <NavLink to="/inbox" className={getNavLinkClass}>
                    <FiInbox size={20} />
                    {isSidebarOpen && <span className="ml-3">Inbox</span>}
                </NavLink>
            </li>
            <li>
                <NavLink to="/campaigns" className={getNavLinkClass}>
                    <FiTag size={20} /> {/* We can use FiSend or FiMegaphone later */}
                    {isSidebarOpen && <span className="ml-3">Campaigns</span>}
                </NavLink>
            </li>
            <li>
                <NavLink to="/import" className={getNavLinkClass}>
                    <FiUsers size={20} />
                    {isSidebarOpen && <span className="ml-3">Customers</span>}
                </NavLink>
            </li>
            <li>
                <NavLink to="/tags" className={getNavLinkClass}>
                    <FiTag size={20} />
                    {isSidebarOpen && <span className="ml-3">Tags</span>}
                </NavLink>
            </li>
            
            {/* Performance Section */}
            {isSidebarOpen && <strong className="text-xs text-gray-400 uppercase px-2 pt-4">Performance</strong>}
            <li>
                <NavLink to="/analytics" className={getNavLinkClass}>
                    <FiBarChart2 size={20} />
                    {isSidebarOpen && <span className="ml-3">Analytics</span>}
                </NavLink>
            </li>
        </ul>
      </div>
      {/* ========================================================================= */}
    </nav>
  );
}

export default Sidebar;