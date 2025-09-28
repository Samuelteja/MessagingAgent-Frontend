// In frontend/src/components/EventDetailModal.jsx

import React from 'react';
import { FiX, FiClock, FiUser, FiClipboard, FiEdit, FiPhone } from 'react-icons/fi';

function EventDetailModal({ isOpen, event, onClose, onEdit }) {
  if (!isOpen || !event) {
    return null;
  }

  const formatTime = (date) => new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const { title, start, end } = event;
  const { staff_name, customer_name, customer_phone } = event.extendedProps;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-lg">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Booking Details</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200"><FiX size={24} /></button>
        </div>

        <div className="space-y-4 text-gray-700">
          <div className="flex items-center"><FiClipboard className="mr-3 text-gray-500" /><span><strong>Service:</strong> {title}</span></div>
          <div className="flex items-center"><FiClock className="mr-3 text-gray-500" /><span><strong>Time:</strong> {formatTime(start)} - {formatTime(end)}</span></div>
          {staff_name && (<div className="flex items-center"><FiUser className="mr-3 text-gray-500" /><span><strong>Staff:</strong> {staff_name}</span></div>)}
          <div className="flex items-center"><FiUser className="mr-3 text-gray-500" /><span><strong>Customer:</strong> {customer_name || 'N/A'}</span></div>
          <div className="flex items-center"><FiPhone className="mr-3 text-gray-500" /><span><strong>Phone:</strong> {customer_phone || 'N/A'}</span></div>
        </div>

        <div className="flex justify-between items-center pt-6 mt-4 border-t">
          <button onClick={onEdit} className="flex items-center px-4 py-2 bg-yellow-500 text-white font-bold rounded-md hover:bg-yellow-600">
            <FiEdit className="mr-2" /> Edit Booking
          </button>
          <button onClick={onClose} className="px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default EventDetailModal;