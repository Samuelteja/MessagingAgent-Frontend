// In frontend/src/pages/salon/SalonCalendarPage.jsx

import React, { useState, useMemo } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';

// Import our new custom hook and the modal
import { useCalendar } from '../../hooks/useCalendar';
import ManualBookingModal from '../../components/ManualBookingModal';
import { FiUser, FiPlusCircle, FiAlertTriangle } from 'react-icons/fi';
import EventDetailModal from '../../components/EventDetailModal';
import EditBookingModal from '../../components/EditBookingModal';

function SalonCalendarPage() {
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const { state, refreshCalendar, handleDatesSet } = useCalendar();
  const { events, isLoading, error } = state;

  const handleBookingCreated = () => {
    refreshCalendar();
  };

  const handleBookingUpdated = () => {
    refreshCalendar();
  };
  
  const handleEventClick = (clickInfo) => {
    setSelectedEvent(clickInfo.event);
    setIsDetailModalOpen(true);
  };

  const handleCloseDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedEvent(null);
  };


  const handleEditBooking = () => {
    setIsDetailModalOpen(false); // Close the detail view
    setIsEditModalOpen(true);   // Immediately open the edit view with the same event data
  };

  const initialScrollTime = useMemo(() => {
    const now = new Date();
    const scrollTime = new Date(now.getTime() - 60 * 60 * 1000); // Subtract 1 hour
    const hour = scrollTime.getHours();
    const minute = scrollTime.getMinutes();
    return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:00`;
  }, []);

  const renderEventContent = (eventInfo) => {
    const staffName = eventInfo.event.extendedProps.staff_name;
    return (
      <div className="flex flex-col p-1 w-full h-full overflow-hidden">
        <p className="font-semibold text-sm truncate">{eventInfo.event.title}</p>
        {/* 
          <div className="flex justify-between items-center text-xs font-bold">
          <span>{eventInfo.timeText}</span>
        </div>  */}
      </div>
    );
  };


  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Digital Appointment Book</h1>
        <button
          onClick={() => setIsBookingModalOpen(true)}
          className="flex items-center px-4 py-2 bg-blue-500 text-white font-bold rounded-md hover:bg-blue-600 shadow-sm"
          data-testid="new-booking-button"
        >
          <FiPlusCircle className="mr-2" />
          New Booking
        </button>
      </div>

      {error && (
        <div className="p-4 mb-4 bg-red-100 border-l-4 border-red-400 text-red-700 rounded-md flex items-center">
            <FiAlertTriangle className="h-6 w-6 mr-3"/>
            <p>{error}</p>
        </div>
      )}

      <div className="p-6 bg-white rounded-lg shadow-md relative">
        {isLoading && (
            <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
                <p className="text-lg font-semibold text-gray-600">Loading Appointments...</p>
            </div>
        )}
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="timeGridWeek" // Default view
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay'
          }}
          events={events} // Pass the events from our custom hook's state
          datesSet={handleDatesSet} // The core function to trigger data fetching
          eventClick={handleEventClick} // Handle clicks on existing events
          height="75vh" // Use viewport height for a responsive calendar
          slotMinTime="00:00:00"
          slotMaxTime="21:00:00"
          allDaySlot={false} // Typically not needed for salon bookings
          eventContent={renderEventContent}
          scrollTime={initialScrollTime}
          nowIndicator={true}
        />
      </div>

      <ManualBookingModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        onBookingCreated={handleBookingCreated}
      />
      <EventDetailModal
        isOpen={isDetailModalOpen}
        event={selectedEvent}
        onClose={handleCloseDetailModal}
        onEdit={handleEditBooking}
      />

      <EditBookingModal
        isOpen={isEditModalOpen}
        item={selectedEvent}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleBookingUpdated}
      />
    </div>
  );
}

export default SalonCalendarPage;