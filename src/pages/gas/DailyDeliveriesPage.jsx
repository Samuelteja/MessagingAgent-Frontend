// In frontend/src/pages/gas/DailyDeliveriesPage.jsx

import React, { useState, useEffect, useCallback } from 'react';
import { getDeliveryList, updateDeliveryStatus } from '../../services/api';
import { FiCheckCircle, FiClock, FiXCircle, FiSearch } from 'react-icons/fi';
import Select from 'react-select';
import { useDebounce } from '../../hooks/useDebounce';

// Helper component to show a nice status badge
const StatusBadge = ({ status }) => {
    let icon, text, color;
    switch (status) {
        case 'reconciled_confirmed':
            icon = <FiCheckCircle />; text = 'Completed'; color = 'bg-green-100 text-green-800'; break;
        case 'reconciled_failed':
            icon = <FiXCircle />; text = 'Failed'; color = 'bg-red-100 text-red-800'; break;
        default: // pending_reconciliation
            icon = <FiClock />; text = 'Pending'; color = 'bg-yellow-100 text-yellow-800'; break;
    }
    return <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${color}`}>{icon}{text}</span>;
};

const statusFilterOptions = [
    { value: '', label: 'All Statuses' },
    { value: 'PENDING_CONFIRMATION', label: 'Pending' },
    { value: 'COMPLETED', label: 'Completed' },
    { value: 'FAILED', label: 'Failed' },
];

function DailyDeliveriesPage() {
    const [deliveries, setDeliveries] = useState([]);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const debouncedSearchTerm = useDebounce(searchTerm, 300);

    // Failure reason modal state
    const [showFailureModal, setShowFailureModal] = useState(false);
    const [failureReason, setFailureReason] = useState('');
    const [selectedDeliveryId, setSelectedDeliveryId] = useState(null);

    const fetchDeliveries = useCallback(async () => {
        if (!selectedDate) return;
        setIsLoading(true);
        setError(null);
        try {
            const filters = {
                searchTerm: debouncedSearchTerm,
                status: statusFilter,
            };
            const res = await getDeliveryList(selectedDate, filters);
            setDeliveries(res.data);
        } catch (err) {
            console.error("Failed to fetch deliveries:", err);
            setError("Could not load deliveries for the selected date.");
            setDeliveries([]);
        }
        setIsLoading(false);
    }, [selectedDate, debouncedSearchTerm, statusFilter]); // Re-fetch when any filter changes

    useEffect(() => {
        fetchDeliveries();
    }, [fetchDeliveries]);

    const handleStatusUpdate = async (deliveryId, newStatus, failureReason = null) => {
        // Optimistic UI Update: Update the state immediately for a snappy UX
        setDeliveries(currentDeliveries =>
            currentDeliveries.map(d =>
                d.id === deliveryId ? { ...d, status: newStatus } : d
            )
        );

        try {
            const payload = { status: newStatus };
            if (failureReason) {
                payload.failure_reason = failureReason;
            }
            // The API call happens in the background
            await updateDeliveryStatus(deliveryId, payload);
            // Optional: Re-fetch for full consistency, but optimistic update handles most cases.
            // fetchDeliveries(); 
        } catch (err) {
            console.error("Failed to update status:", err);
            alert("Failed to update status. Reverting change.");
            // Revert the change on API failure
            fetchDeliveries();
        }
    };

    const handleMarkAsFailed = (deliveryId) => {
        setSelectedDeliveryId(deliveryId);
        setShowFailureModal(true);
    };

    const handleFailureSubmit = () => {
        handleStatusUpdate(selectedDeliveryId, 'reconciled_failed', failureReason || null);
        setShowFailureModal(false);
        setFailureReason('');
        setSelectedDeliveryId(null);
    };

    const handleFailureCancel = () => {
        setShowFailureModal(false);
        setFailureReason('');
        setSelectedDeliveryId(null);
    };

    return (
        <div>
            {/* The header will be updated by Ankit to include filter controls */}
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Daily Reconciliation</h1>
                <div className="flex items-center gap-4">
                    {/* Search Input */}
                    <div className="relative">
                        <FiSearch className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search Customer/Phone..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-48 pl-10 pr-3 py-2 border border-gray-300 rounded-md"
                        />
                    </div>
                    
                    {/* Status Filter */}
                    <Select
                        options={statusFilterOptions}
                        // Find the object that matches the current statusFilter value
                        value={statusFilterOptions.find(opt => opt.value === statusFilter)}
                        onChange={(selectedOption) => setStatusFilter(selectedOption.value)}
                        className="w-48"
                        classNamePrefix="react-select"
                    />

                    {/* Date Picker (No changes, just moved into the flex container) */}
                    <div>
                        <label htmlFor="delivery_date_view" className="text-sm font-medium sr-only">Select Date:</label>
                        <input
                            type="date"
                            id="delivery_date_view"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-md"
                        />
                    </div>
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
                            {/* --- NEW COLUMN FOR ACTIONS --- */}
                            <th className="px-6 py-3 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <tr><td colSpan="5" className="text-center p-8">Loading deliveries...</td></tr>
                        ) : deliveries.length > 0 ? (
                            deliveries.map(delivery => (
                                <tr key={delivery.id} className="border-b hover:bg-gray-50">
                                    <td className="px-6 py-4 font-medium text-gray-900">{delivery.customer_name}</td>
                                    <td className="px-6 py-4">{delivery.customer_phone}</td>
                                    <td className="px-6 py-4">{delivery.customer_address}</td>
                                    <td className="px-6 py-4"><StatusBadge status={delivery.status} /></td>
                                    {/* --- NEW ACTION BUTTONS --- */}
                                    <td className="px-6 py-4 text-center">
                                        <div className="flex justify-center space-x-2">
                                            <button 
                                                onClick={() => handleStatusUpdate(delivery.id, 'reconciled_confirmed')}
                                                className="px-2 py-1 text-xs font-semibold text-green-800 bg-green-200 rounded-full hover:bg-green-300"
                                            >
                                                Mark Delivered
                                            </button>
                                            <button 
                                                onClick={() => handleMarkAsFailed(delivery.id)}
                                                className="px-2 py-1 text-xs font-semibold text-red-800 bg-red-200 rounded-full hover:bg-red-300"
                                            >
                                                Mark Failed
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr><td colSpan="5" className="text-center p-8">No deliveries found for the selected filters.</td></tr>
                        )}
                    </tbody>
                 </table>
            </div>

            {/* Failure Reason Modal */}
            {showFailureModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
                        <h3 className="text-lg font-bold mb-4">Mark Delivery as Failed</h3>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Reason for failure (optional):</label>
                        <textarea
                            value={failureReason}
                            onChange={(e) => setFailureReason(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            rows="3"
                            placeholder="Enter reason..."
                        />
                        <div className="flex justify-end space-x-2 mt-4">
                            <button
                                onClick={handleFailureCancel}
                                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleFailureSubmit}
                                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                            >
                                Mark as Failed
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default DailyDeliveriesPage;