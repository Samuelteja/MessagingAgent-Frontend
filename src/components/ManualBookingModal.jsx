// In frontend/src/components/ManualBookingModal.jsx

import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import { getMenuForDropdown, getStaffForDropdown, createBooking } from '../services/api';
import { FiX, FiSave } from 'react-icons/fi';

function ManualBookingModal({ isOpen, onClose, onBookingCreated }) {
  // State for form fields
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [selectedService, setSelectedService] = useState(null);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [bookingDate, setBookingDate] = useState('');
  const [bookingTime, setBookingTime] = useState('');
  const [notes, setNotes] = useState('');

  // State for populating dropdowns
  const [serviceOptions, setServiceOptions] = useState([]);
  const [staffOptions, setStaffOptions] = useState([]);

  // UI State
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);

  // Fetch data for dropdowns when the modal is opened
  useEffect(() => {
    // Only fetch if the modal is open to avoid unnecessary API calls
    if (isOpen) {
      const fetchData = async () => {
        try {
          const [menuRes, staffRes] = await Promise.all([
            getMenuForDropdown(),
            getStaffForDropdown()
          ]);
          setServiceOptions(menuRes.data.map(item => ({ value: item.id, label: item.name })));
          setStaffOptions(staffRes.data.map(staff => ({ value: staff.id, label: staff.name })));
        } catch (err) {
          console.error("Failed to fetch dropdown data:", err);
          setError("Could not load services or staff. Please try again.");
        }
      };
      fetchData();
    }
  }, [isOpen]);

  const resetForm = () => {
      setCustomerPhone('');
      setCustomerName('');
      setSelectedService(null);
      setSelectedStaff(null);
      setBookingDate('');
      setBookingTime('');
      setNotes('');
      setError(null);
  };

  const handleClose = () => {
      resetForm();
      onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);

    // Combine date and time into a single ISO 8601 string for the backend
    const bookingDateTime = `${bookingDate}T${bookingTime}:00`;

    const bookingPayload = {
      customer_phone: customerPhone,
      customer_name: customerName,
      // The backend needs the service name, not the ID, as per the spec.
      // We find the label (name) from the selected option.
      service_name: selectedService?.label,
      staff_id: selectedStaff?.value, // Staff ID is optional
      booking_datetime: bookingDateTime,
      notes: notes,
    };

    try {
      await createBooking(bookingPayload);
      onBookingCreated(); // This will tell the parent (Calendar page) to refresh
      handleClose();
    } catch (err) {
      console.error("Failed to create booking:", err);
      setError(err.response?.data?.detail || "An unexpected error occurred. Please check the details and try again.");
    }
    setIsSaving(false);
  };

  // Prevent rendering the modal if it's not open
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-2xl">
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">New Manual Booking</h2>
            <button onClick={handleClose} className="p-2 rounded-full hover:bg-gray-200">
                <FiX size={24} />
            </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="p-3 bg-red-100 text-red-700 rounded-md">{error}</div>}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Customer Phone</label>
              <input type="tel" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} required className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Customer Name</label>
              <input type="text" value={customerName} onChange={(e) => setCustomerName(e.target.value)} required className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md" />
            </div>
          </div>

          <div>
              <label className="block text-sm font-medium text-gray-700">Service</label>
              <Select
                options={serviceOptions}
                value={selectedService}
                onChange={setSelectedService}
                placeholder="Select a service..."
                required
                className="mt-1"
                classNamePrefix="react-select"
              />
          </div>
           <div>
              <label className="block text-sm font-medium text-gray-700">Assign Staff (Optional)</label>
              <Select
                options={staffOptions}
                value={selectedStaff}
                onChange={setSelectedStaff}
                placeholder="Select staff..."
                isClearable
                className="mt-1"
                classNamePrefix="react-select"
              />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <label className="block text-sm font-medium text-gray-700">Date</label>
                <input type="date" value={bookingDate} onChange={(e) => setBookingDate(e.target.value)} required className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md" />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Time</label>
                <input type="time" value={bookingTime} onChange={(e) => setBookingTime(e.target.value)} required className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Notes (Optional)</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows="3" className="mt-1 w-full p-3 border border-gray-300 rounded-md" />
          </div>

          <div className="flex justify-end pt-4">
            <button type="submit" disabled={isSaving} className="flex justify-center items-center px-6 py-2 bg-blue-500 text-white font-bold rounded-md hover:bg-blue-600 disabled:bg-gray-400">
                <FiSave className="mr-2" />
                {isSaving ? 'Saving...' : 'Save Booking'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ManualBookingModal;