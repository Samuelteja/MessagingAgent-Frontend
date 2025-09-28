// In frontend/src/pages/gas/DailyDeliveriesPage.jsx

import React, { useState, useEffect } from 'react';
import { getDeliveryList } from '../../services/api';
import { FiCheckCircle, FiClock, FiXCircle } from 'react-icons/fi';

// Helper component to show a nice status badge
const StatusBadge = ({ status }) => {
    let icon, text, color;
    switch (status) {
        case 'COMPLETED':
            icon = <FiCheckCircle />; text = 'Completed'; color = 'bg-green-100 text-green-800'; break;
        case 'FAILED':
            icon = <FiXCircle />; text = 'Failed'; color = 'bg-red-100 text-red-800'; break;
        default: // PENDING_CONFIRMATION
            icon = <FiClock />; text = 'Pending'; color = 'bg-yellow-100 text-yellow-800'; break;
    }
    return <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${color}`}>{icon}{text}</span>;
};


function DailyDeliveriesPage() {
    const [deliveries, setDeliveries] = useState([]);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchDeliveries = async () => {
            if (!selectedDate) return;
            setIsLoading(true);
            setError(null);
            try {
                const res = await getDeliveryList(selectedDate);
                setDeliveries(res.data);
            } catch (err) {
                console.error("Failed to fetch deliveries:", err);
                setError("Could not load deliveries for the selected date.");
                setDeliveries([]); // Clear old data on error
            }
            setIsLoading(false);
        };
        fetchDeliveries();
    }, [selectedDate]); // Re-fetch whenever the date changes

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Daily Reconciliation</h1>
                <div>
                    <label htmlFor="delivery_date_view" className="text-sm font-medium mr-2">Select Date:</label>
                    <input
                        type="date"
                        id="delivery_date_view"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-md"
                    />
                </div>
            </div>

            {error && <div className="p-4 mb-4 bg-red-100 text-red-700 rounded-md">{error}</div>}

            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                 <table className="w-full text-sm text-left text-gray-600">
                    <thead className="bg-gray-100 text-xs text-gray-700 uppercase">
                        <tr>
                            <th className="px-6 py-3">Customer Name</th>
                            <th className="px-6 py-3">Phone</th>
                            <th className="px-6 py-3">Address</th>
                            <th className="px-6 py-3">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <tr><td colSpan="4" className="text-center p-8">Loading deliveries...</td></tr>
                        ) : deliveries.length > 0 ? (
                            deliveries.map(delivery => (
                                <tr key={delivery.id} className="border-b hover:bg-gray-50">
                                    <td className="px-6 py-4 font-medium text-gray-900">{delivery.customer_name}</td>
                                    <td className="px-6 py-4">{delivery.phone_number}</td>
                                    <td className="px-6 py-4">{delivery.address}</td>
                                    <td className="px-6 py-4"><StatusBadge status={delivery.status} /></td>
                                </tr>
                            ))
                        ) : (
                            <tr><td colSpan="4" className="text-center p-8">No deliveries found for this date.</td></tr>
                        )}
                    </tbody>
                 </table>
            </div>
        </div>
    );
}

export default DailyDeliveriesPage;