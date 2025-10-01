// In frontend/src/pages/salon/AllBookingsPage.jsx (REVISED)

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import Select from 'react-select';
import { FiSearch, FiXCircle, FiDownload, FiEdit, FiAlertTriangle } from 'react-icons/fi';
import { getAllBookings, getStaffForDropdown, getMenuForDropdown } from '../../services/api';
import { useDebounce } from '../../hooks/useDebounce';
import EditBookingModal from '../../components/EditBookingModal';

const statusOptions = [
    { value: 'Confirmed', label: 'Confirmed' },
    { value: 'Cancelled', label: 'Cancelled' },
    // Add more statuses as the system evolves
];

function AllBookingsPage() {
    // --- State for Filters ---
    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(new Date());
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedStaff, setSelectedStaff] = useState(null);
    const [selectedService, setSelectedService] = useState(null);
    const [selectedStatus, setSelectedStatus] = useState(null);

    // --- State for Data & UI ---
    const [bookings, setBookings] = useState([]);
    const [staffOptions, setStaffOptions] = useState([]);
    const [serviceOptions, setServiceOptions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // --- State for Edit Modal ---
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState(null);

    // --- Debounce the search term ---
    const debouncedSearchTerm = useDebounce(searchTerm, 300);

    // --- Fetch initial data for dropdowns ---
    useEffect(() => {
        const fetchDropdownData = async () => {
            try {
                const [staffRes, menuRes] = await Promise.all([
                    getStaffForDropdown(),
                    getMenuForDropdown()
                ]);
                setStaffOptions(staffRes.data.map(s => ({ value: s.id, label: s.name })));
                setServiceOptions(menuRes.data.map(m => ({ value: m.id, label: m.name })));
            } catch (err) {
                console.error("Failed to load filter options:", err);
                setError("Could not load filter options. Please refresh the page.");
            }
        };
        fetchDropdownData();
    }, []);

    // --- Main data fetching logic ---
    const fetchBookings = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        const filters = {
            startDate,
            endDate,
            searchTerm: debouncedSearchTerm,
            staffId: selectedStaff?.value,
            serviceId: selectedService?.value,
            status: selectedStatus?.value,
        };

        try {
            const res = await getAllBookings(filters);
            setBookings(res.data);
        } catch (err) {
            console.error("Failed to fetch bookings:", err);
            setError("An error occurred while fetching bookings. Please try again.");
        } finally {
            setIsLoading(false);
        }
    }, [startDate, endDate, debouncedSearchTerm, selectedStaff, selectedService, selectedStatus]);

    // --- Trigger fetch when any filter changes ---
    useEffect(() => {
        fetchBookings();
    }, [fetchBookings]);

    const handleClearFilters = () => {
        setStartDate(new Date());
        setEndDate(new Date());
        setSearchTerm('');
        setSelectedStaff(null);
        setSelectedService(null);
        setSelectedStatus(null);
    };

    const formatTimestamp = (ts) => new Date(ts).toLocaleString();

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">All Bookings History</h1>
                <button className="flex items-center px-4 py-2 bg-green-600 text-white font-bold rounded-md hover:bg-green-700 shadow-sm">
                    <FiDownload className="mr-2" />
                    Export to Excel
                </button>
            </div>

            {/* Filter Controls */}
            <div className="p-6 bg-white rounded-lg shadow-md mb-8">
                {/* ... (The filter layout from the previous step remains the same) ... */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4 items-end">
                    <div className="lg:col-span-2">
                        <label className="block text-sm font-medium text-gray-700">Search</label>
                        <div className="relative mt-1">
                            <FiSearch className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400" />
                            <input type="text" placeholder="Name/Phone..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Staff</label>
                        <Select options={staffOptions} value={selectedStaff} onChange={setSelectedStaff} isClearable placeholder="All" className="mt-1" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Service</label>
                        <Select options={serviceOptions} value={selectedService} onChange={setSelectedService} isClearable placeholder="All" className="mt-1" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Status</label>
                        <Select options={statusOptions} value={selectedStatus} onChange={setSelectedStatus} isClearable placeholder="All" className="mt-1" />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Start</label>
                            <DatePicker selected={startDate} onChange={(date) => setStartDate(date)} className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">End</label>
                            <DatePicker selected={endDate} onChange={(date) => setEndDate(date)} className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md" />
                        </div>
                    </div>
                    <button onClick={handleClearFilters} className="flex items-center justify-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 h-10">
                        <FiXCircle className="mr-2" />
                        Clear
                    </button>
                </div>
            </div>
            
            {error && (
                <div className="p-4 mb-4 bg-red-100 border-l-4 border-red-400 text-red-700 rounded-md flex items-center">
                    <FiAlertTriangle className="h-6 w-6 mr-3"/>
                    <p>{error}</p>
                </div>
            )}

            {/* Data Table */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <table className="w-full text-sm text-left text-gray-600">
                    <thead className="bg-gray-100 text-xs text-gray-700 uppercase">
                        <tr>
                            <th className="px-6 py-3">Customer</th>
                            <th className="px-6 py-3">Service</th>
                            <th className="px-6 py-3">Staff</th>
                            <th className="px-6 py-3">Date & Time</th>
                            <th className="px-6 py-3">Price</th>
                            <th className="px-6 py-3">Status</th>
                            <th className="px-6 py-3">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <tr><td colSpan="7" className="text-center p-8 text-gray-500">Loading bookings...</td></tr>
                        ) : bookings.length > 0 ? (
                            bookings.map(booking => (
                                <tr key={booking.id} className="border-b hover:bg-gray-50">
                                    <td className="px-6 py-4">
                                        <p className="font-medium text-gray-900">{booking.contact?.name || 'N/A'}</p>
                                        <p className="text-gray-500">{booking.contact?.contact_id || 'N/A'}</p>
                                    </td>
                                    <td className="px-6 py-4">{booking.service_name || booking.service?.name || 'N/A'}</td>
                                    <td className="px-6 py-4">{booking.staff?.name || 'N/A'}</td>
                                    <td className="px-6 py-4">{formatTimestamp(booking.booking_datetime)}</td>
                                    <td className="px-6 py-4">Rs. {booking.service?.price || 'N/A'}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${booking.status === 'Confirmed' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                            {booking.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <button onClick={() => { setSelectedBooking(booking); setIsEditModalOpen(true); }} className="flex items-center px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600">
                                            <FiEdit className="mr-1" />
                                            Edit
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr><td colSpan="7" className="text-center p-8 text-gray-500">No bookings match the current filters.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            <EditBookingModal
                isOpen={isEditModalOpen}
                item={selectedBooking}
                onClose={() => setIsEditModalOpen(false)}
                onSave={fetchBookings}
            />
        </div>
    );
}

export default AllBookingsPage;