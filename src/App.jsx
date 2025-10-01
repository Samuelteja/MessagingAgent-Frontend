// In frontend/src/App.jsx

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Import Core Layout & Context
import Layout from './components/Layout';
import { LayoutProvider } from './context/LayoutContext';
import { useAuth } from './hooks/useAuth';

// Import ALL page components here, as App.js is now the central router
import SalonCalendarPage from './pages/salon/SalonCalendarPage';
import AllBookingsPage from './pages/salon/AllBookingsPage';
import MenuPage from './pages/knowledge/MenuPage';
import QAPage from './pages/knowledge/QAPage';
import AITaggingRulesPage from './pages/knowledge/AITaggingRulesPage';
import BusinessProfilePage from './pages/operations/BusinessProfilePage';
import BusinessHoursPage from './pages/operations/BusinessHoursPage';
import StaffPage from './pages/operations/StaffPage';
import ScheduledOutreachPage from './pages/operations/ScheduledOutreachPage';
import InboxPage from './pages/InboxPage';
import ImportCustomersPage from './pages/ImportCustomersPage';
import CampaignsPage from './pages/CampaignsPage';
import TagsPage from './pages/knowledge/TagsPage';
import AnalyticsPage from './pages/AnalyticsPage';
import BookingImportPage from './pages/gas/BookingImportPage';
import DailyDeliveriesPage from './pages/gas/DailyDeliveriesPage';

const UpsellRulesPage = () => <h1 className="text-3xl font-bold">Upsell Rules are now managed inside the Menu page.</h1>;

// The main App component now handles everything
function App() {
  const { business_type, isLoading } = useAuth();

  // If we are still determining the user's role, show a global loading screen.
  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold' }}>Loading Application...</h1>
      </div>
    );
  }

  return (
    <LayoutProvider>
      <BrowserRouter>
        <Routes>
          {/* 
            This is the new, correct structure.
            The parent route renders the Layout. 
            ALL nested child routes will render inside the Layout's <Outlet />.
          */}
          <Route path="/" element={<Layout />}>
            {/* 
              Inside the parent route, we place our conditional logic.
              This dynamically inserts the correct set of child <Route>s.
            */}
            {business_type === 'SALON' && (
              <>
                <Route index element={<Navigate to="salon/calendar" replace />} />
                <Route path="salon/calendar" element={<SalonCalendarPage />} />
                <Route path="salon/bookings" element={<AllBookingsPage />} />
                <Route path="knowledge/menu" element={<MenuPage />} />
                <Route path="knowledge/qa" element={<QAPage />} />
                <Route path="knowledge/ai-rules" element={<AITaggingRulesPage />} />
                <Route path="knowledge/upsell" element={<UpsellRulesPage />} />
                <Route path="operations/profile" element={<BusinessProfilePage />} />
                <Route path="operations/hours" element={<BusinessHoursPage />} />
                <Route path="operations/scheduled-outreach" element={<ScheduledOutreachPage />} />
                <Route path="inbox" element={<InboxPage />} />
                <Route path="import" element={<ImportCustomersPage />} />
                <Route path="campaigns" element={<CampaignsPage />} />
                <Route path="tags" element={<TagsPage />} />
                <Route path="analytics" element={<AnalyticsPage />} />
              </>
            )}

            {business_type === 'GAS_DISTRIBUTOR' && (
              <>
                <Route index element={<Navigate to="gas/import" replace />} />
                <Route path="gas/import" element={<BookingImportPage />} />
                <Route path="gas/deliveries" element={<DailyDeliveriesPage />} />
                <Route path="knowledge/menu" element={<MenuPage />} />
                <Route path="knowledge/qa" element={<QAPage />} />
                <Route path="knowledge/ai-rules" element={<AITaggingRulesPage />} />
                <Route path="knowledge/upsell" element={<UpsellRulesPage />} />
                <Route path="operations/profile" element={<BusinessProfilePage />} />
                <Route path="operations/hours" element={<BusinessHoursPage />} />
                <Route path="operations/staff" element={<StaffPage />} />
                <Route path="inbox" element={<InboxPage />} />
                <Route path="campaigns" element={<CampaignsPage />} />
                <Route path="import" element={<ImportCustomersPage />} />
                <Route path="tags" element={<TagsPage />} />
                <Route path="analytics" element={<AnalyticsPage />} />
              </>
            )}
            
            {/* The 404 Not Found route */}
            <Route path="*" element={<h1 className="text-3xl font-bold">404 - Page Not Found</h1>} />
          </Route>

        </Routes>
      </BrowserRouter>
    </LayoutProvider>
  );
}

export default App;