// In frontend/src/pages/operations/ScheduledOutreachPage.jsx

import React, { useState, useEffect, useCallback } from 'react';
import { getScheduledTasks } from '../../services/api';
import { FiClock, FiSend, FiRepeat } from 'react-icons/fi';

// Helper to render a nice icon and label for each task type
const TaskTypeDisplay = ({ type }) => {
    let icon, text, color;
    switch (type) {
        case 'APPOINTMENT_REMINDER':
            icon = <FiClock className="mr-2 text-blue-500" />;
            text = 'Appointment Reminder';
            color = 'bg-blue-100 text-blue-800';
            break;
        case 'LEAD_FOLLOWUP':
            icon = <FiRepeat className="mr-2 text-orange-500" />;
            text = 'Lead Follow-up';
            color = 'bg-orange-100 text-orange-800';
            break;
        default:
            icon = <FiSend className="mr-2 text-gray-500" />;
            text = 'General Follow-up';
            color = 'bg-gray-100 text-gray-800';
    }
    return <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${color}`}>{icon}{text}</span>;
};


function ScheduledOutreachPage() {
    const [tasks, setTasks] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchTasks = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const res = await getScheduledTasks();
            // Sort tasks by scheduled time, soonest first
            const sortedTasks = res.data.sort((a, b) => new Date(a.scheduled_time) - new Date(b.scheduled_time));
            setTasks(sortedTasks);
        } catch (err) {
            console.error("Failed to fetch scheduled tasks:", err);
            setError("Could not load the scheduled outreach tasks.");
        }
        setIsLoading(false);
    }, []);

    useEffect(() => {
        fetchTasks();
    }, [fetchTasks]);

    const formatTimestamp = (ts) => {
        if (!ts) return 'N/A';
        return new Date(ts).toLocaleString(undefined, {
            year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
        });
    };

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Scheduled Outreach</h1>
            <div className="p-4 bg-gray-50 border-l-4 border-gray-400 text-gray-800 mb-8 rounded-md">
                <p className="font-bold">What is this?</p>
                <p className="text-sm">This is a read-only log of all proactive messages the AI has scheduled to send in the future. This includes appointment reminders and follow-ups for potential leads.</p>
            </div>

            {error && <div className="p-4 mb-4 bg-red-100 text-red-700 rounded-md">{error}</div>}

            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <table className="w-full text-sm text-left text-gray-600">
                    <thead className="bg-gray-100 text-xs text-gray-700 uppercase">
                        <tr>
                            <th scope="col" className="px-6 py-3">Recipient</th>
                            <th scope="col" className="px-6 py-3">Type</th>
                            <th scope="col" className="px-6 py-3">Message Content</th>
                            <th scope="col" className="px-6 py-3">Scheduled To Send At</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <tr><td colSpan="4" className="text-center p-8">Loading scheduled tasks...</td></tr>
                        ) : tasks.length > 0 ? (
                            tasks.map(task => (
                                <tr key={task.id} className="bg-white border-b hover:bg-gray-50">
                                    <td className="px-6 py-4 font-medium text-gray-900">{task.contact_id}</td>
                                    <td className="px-6 py-4"><TaskTypeDisplay type={task.task_type} /></td>
                                    <td className="px-6 py-4 text-gray-500 italic">"{task.content || 'Default message content'}"</td>
                                    <td className="px-6 py-4 font-medium">{formatTimestamp(task.scheduled_time)}</td>
                                </tr>
                            ))
                        ) : (
                            <tr><td colSpan="4" className="text-center p-8">No proactive messages are currently scheduled.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default ScheduledOutreachPage;