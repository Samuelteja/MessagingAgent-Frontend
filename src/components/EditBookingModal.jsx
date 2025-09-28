// In frontend/src/components/EditBookingModal.jsx

import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import { getMenuForDropdown, getStaffForDropdown, updateBooking } from '../services/api';
import { FiX, FiSave } from 'react-icons/fi';

function EditBookingModal({ isOpen, event, onClose, onSave }) {
  // Form field state
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [selectedService, setSelectedService] = useState(null);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [bookingDate, setBookingDate] = useState('');
  const [bookingTime, setBookingTime] = useState('');
  const [notes, setNotes] = useState('');

  // Dropdown options state
  const [serviceOptions, setServiceOptions] = useState([]);
  const [staffOptions, setStaffOptions] = useState([]);
  
  // UI state
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);

  // This effect runs when the modal is opened.
  // It fetches dropdown data AND populates the form with the event's details.
  useEffect(() => {
    if (isOpen && event) {
      const initializeForm = async () => {
        try {
          const [menuRes, staffRes] = await Promise.all([
            getMenuForDropdown(),
            getStaffForDropdown()
          ]);
          
          const menuOpts = menuRes.data.map(item => ({ value: item.id, label: item.name }));
          const staffOpts = staffRes.data.map(staff => ({ value: staff.id, label: staff.name }));
          setServiceOptions(menuOpts);
          setStaffOptions(staffOpts);

          const eventProps = event.extendedProps;
          setCustomerPhone(eventProps.customer_phone || '');
          setCustomerName(eventProps.customer_name || '');
          setNotes(eventProps.notes || '');

          const serviceId = eventProps.service_id;
          const currentService = menuOpts.find(opt => opt.value === serviceId);
          setSelectedService(currentService);
          
          const currentStaff = staffOpts.find(opt => opt.label === eventProps.staff_name);
          setSelectedStaff(currentStaff);

          const startDate = new Date(event.start);
          setBookingDate(startDate.toISOString().split('T')[0]);
          setBookingTime(startDate.toTimeString().substring(0, 5));

        } catch (err) {
          console.error("Failed to initialize edit form:", err);
          setError("Could not load necessary data for editing.");
        }
      };
      initializeForm();
    }
  }, [isOpen, event]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);

    const bookingDateTime = `${bookingDate}T${bookingTime}:00`;
    const duration = new Date(event.end) - new Date(event.start);
    const endDateTime = new Date(new Date(bookingDateTime).getTime() + duration).toISOString();
    const staffIdAsInt = selectedStaff ? parseInt(selectedStaff.value, 10) : null;

    const payload = {
      customer_phone: customerPhone,
      customer_name: customerName,
      service_id: parseInt(selectedService.value, 10),
      staff_id: staffIdAsInt,
      booking_datetime: bookingDateTime,
      end_datetime: endDateTime,
      notes: notes,
    };

    try {
      await updateBooking(event.id, payload);
      onSave();
      onClose();
    } catch (err) {
      console.error("Failed to update booking:", err);
      setError(err.response?.data?.detail || "An unexpected error occurred.");
    }
    setIsSaving(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-2xl">
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Edit Booking</h2>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200"><FiX size={24} /></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="p-3 bg-red-100 text-red-700 rounded-md">{error}</div>}

          {/* --- THIS IS THE MISSING FORM SECTION --- */}
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
          {/* --- END OF MISSING SECTION --- */}

          <div className="flex justify-end pt-4">
            <button type="submit" disabled={isSaving} className="flex justify-center items-center px-6 py-2 bg-blue-500 text-white font-bold rounded-md hover:bg-blue-600 disabled:bg-gray-400">
                <FiSave className="mr-2" />
                {isSaving ? 'Saving Changes...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditBookingModal;