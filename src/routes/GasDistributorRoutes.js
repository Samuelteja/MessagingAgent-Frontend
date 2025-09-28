// In frontend/src/routes/GasDistributorRoutes.js

import React from 'react';
import { Route, Navigate } from 'react-router-dom';

// Import pages relevant to the Gas Distributor workflow
import BookingImportPage from '../pages/gas/BookingImportPage';
import DailyDeliveriesPage from '../pages/gas/DailyDeliveriesPage';

function GasDistributorRoutes() {
  return (
    <>
      <Route index element={<Navigate to="/gas/import" replace />} />
      <Route path="gas/import" element={<BookingImportPage />} />
      <Route path="gas/deliveries" element={<DailyDeliveriesPage />} />
      
      <Route path="*" element={<h1 className="text-3xl font-bold">404 - Page Not Found</h1>} />
    </>
  );
}

export default GasDistributorRoutes;