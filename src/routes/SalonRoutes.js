// In frontend/src/routes/SalonRoutes.js

import React from 'react';
import { Route, Navigate } from 'react-router-dom';

// Import all the pages that the Salon workflow uses
import SalonCalendarPage from '../pages/salon/SalonCalendarPage';
import MenuPage from '../pages/knowledge/MenuPage';
import QAPage from '../pages/knowledge/QAPage';
import AITaggingRulesPage from '../pages/knowledge/AITaggingRulesPage';
import BusinessProfilePage from '../pages/operations/BusinessProfilePage';
import BusinessHoursPage from '../pages/operations/BusinessHoursPage';
import StaffPage from '../pages/operations/StaffPage';
import ScheduledOutreachPage from '../pages/operations/ScheduledOutreachPage';
import InboxPage from '../pages/InboxPage';
import ImportCustomersPage from '../pages/ImportCustomersPage';
import CampaignsPage from '../pages/CampaignsPage';
import TagsPage from '../pages/knowledge/TagsPage';
import AnalyticsPage from '../pages/AnalyticsPage';

const UpsellRulesPage = () => <h1 className="text-3xl font-bold">Upsell Rules are now managed inside the Menu page.</h1>;

// This component defines all the possible URL paths for a SALON user
function SalonRoutes() {
  return (
    <>
      {/* Set the default page for a salon user to the calendar */}
      <Route index element={<Navigate to="/salon/calendar" replace />} />
      <Route path="salon/calendar" element={<SalonCalendarPage />} />
      <Route path="knowledge/menu" element={<MenuPage />} />
      <Route path="knowledge/qa" element={<QAPage />} />
      <Route path="knowledge/ai-rules" element={<AITaggingRulesPage />} />
      <Route path="knowledge/upsell" element={<UpsellRulesPage />} />
      <Route path="operations/profile" element={<BusinessProfilePage />} />
      <Route path="operations/hours" element={<BusinessHoursPage />} />
      <Route path="operations/staff" element={<StaffPage />} />
      <Route path="operations/scheduled-outreach" element={<ScheduledOutreachPage />} />
      <Route path="inbox" element={<InboxPage />} />
      <Route path="import" element={<ImportCustomersPage />} />
      <Route path="campaigns" element={<CampaignsPage />} />
      <Route path="tags" element={<TagsPage />} />
      <Route path="analytics" element={<AnalyticsPage />} />

      {/* A specific 404 for this route group */}
      <Route path="*" element={<h1 className="text-3xl font-bold">404 - Page Not Found</h1>} />
    </>
  );
}

export default SalonRoutes;