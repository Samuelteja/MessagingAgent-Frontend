// frontend/src/pages/operations/BusinessHoursPage.jsx
import React, { useState, useEffect } from 'react';
import { getHours, updateHours } from '../../services/api';

const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

function BusinessHoursPage() {
    const [hours, setHours] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const hoursRes = await getHours();
            // Ensure we have a full 7-day structure for the form
            const fullWeekHours = daysOfWeek.map((_, index) => {
                const dayData = hoursRes.data.find(d => d.day_of_week === index);
                // Provide default empty strings for controlled inputs
                return {
                    day_of_week: index,
                    open_time: dayData?.open_time || '',
                    close_time: dayData?.close_time || '',
                    quiet_hours_start: dayData?.quiet_hours_start || '',
                    quiet_hours_end: dayData?.quiet_hours_end || '',
                };
            });
            setHours(fullWeekHours);
        } catch (error) {
            console.error("Failed to fetch business hours:", error);
            alert("Could not fetch business hours.");
        }
        setIsLoading(false);
    };

    const handleHoursChange = (dayIndex, field, value) => {
        const newHours = [...hours];
        // Use null if the value is empty, which is what the backend expects for optional fields
        newHours[dayIndex] = { ...newHours[dayIndex], [field]: value || null };
        setHours(newHours);
    };

    const handleHoursSubmit = async (e) => {
        e.preventDefault();
        try {
            // Filter out any null values before sending to backend, just in case
            const payload = {
                hours: hours.map(h => ({
                    ...h,
                    open_time: h.open_time || null,
                    close_time: h.close_time || null,
                    quiet_hours_start: h.quiet_hours_start || null,
                    quiet_hours_end: h.quiet_hours_end || null,
                }))
            }
            await updateHours(payload);
            alert("Business hours updated successfully!");
            fetchData();
        } catch (error) {
            console.error("Failed to update hours:", error);
            alert("Error: Could not update hours.");
        }
    };

    if (isLoading) {
        return <div>Loading business hours...</div>;
    }

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Business Hours Management</h1>
            <div className="p-6 bg-white rounded-lg shadow-md">
                <form onSubmit={handleHoursSubmit}>
                    <div className="grid grid-cols-5 gap-x-6 gap-y-4 items-center mb-6">
                        <div className="font-bold text-gray-600">Day</div>
                        <div className="font-bold text-gray-600">Open Time</div>
                        <div className="font-bold text-gray-600">Close Time</div>
                        <div className="font-bold text-gray-600">Quiet Hours Start</div>
                        <div className="font-bold text-gray-600">Quiet Hours End</div>
                        
                        {hours.map((day, index) => (
                            <React.Fragment key={index}>
                                <div className="font-medium text-gray-800">{daysOfWeek[index]}</div>
                                <input type="time" value={day.open_time || ''} onChange={(e) => handleHoursChange(index, 'open_time', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                                <input type="time" value={day.close_time || ''} onChange={(e) => handleHoursChange(index, 'close_time', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                                <input type="time" value={day.quiet_hours_start || ''} onChange={(e) => handleHoursChange(index, 'quiet_hours_start', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                                <input type="time" value={day.quiet_hours_end || ''} onChange={(e) => handleHoursChange(index, 'quiet_hours_end', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                            </React.Fragment>
                        ))}
                    </div>
                    <div className="flex justify-end">
                        <button type="submit" className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">Save All Hours</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default BusinessHoursPage;