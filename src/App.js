// frontend/src/App.js
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Import Core Layout
import Layout from './components/Layout';
import { LayoutProvider } from './context/LayoutContext';

// Import All Page Components
import MenuPage from './pages/knowledge/MenuPage';
import QAPage from './pages/knowledge/QAPage';
import TagsPage from './pages/knowledge/TagsPage';
import BusinessHoursPage from './pages/operations/BusinessHoursPage';
import BusinessProfilePage from './pages/operations/BusinessProfilePage';
import StaffPage from './pages/operations/StaffPage';
import InboxPage from './pages/InboxPage';
import AnalyticsPage from './pages/AnalyticsPage';
import CampaignsPage from './pages/CampaignsPage';
import ImportCustomersPage from './pages/ImportCustomersPage';
import AITaggingRulesPage from './pages/knowledge/AITaggingRulesPage';
import ScheduledOutreachPage from './pages/operations/ScheduledOutreachPage';

const UpsellRulesPage = () => <h1 className="text-3xl font-bold">Upsell Rules are now managed inside the Menu page.</h1>;


function App() {
  return (
    <LayoutProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Navigate to="/knowledge/menu" replace />} />
            
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

            <Route path="*" element={<h1 className="text-3xl font-bold">444 - Page Not Found</h1>} />
          </Route>
        </Routes>
      </BrowserRouter>
    </LayoutProvider>
  );
}

export default App;