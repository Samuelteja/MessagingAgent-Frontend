// frontend/src/pages/AnalyticsPage.jsx
import React, { useState, useEffect } from 'react';
import { getAnalyticsSummary, getAdvancedAnalytics  } from '../services/api';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';
import { FiTrendingUp, FiCheckCircle, FiDollarSign } from 'react-icons/fi';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

function AnalyticsPage() {
    const [summary, setSummary] = useState(null);
    const [advanced, setAdvanced] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                // Fetch both basic and advanced analytics in parallel
                const [summaryRes, advancedRes] = await Promise.all([
                    getAnalyticsSummary(),
                    getAdvancedAnalytics()
                ]);
                setSummary(summaryRes.data);
                setAdvanced(advancedRes.data);
            } catch (error) {
                console.error("Failed to fetch analytics:", error);
            }
            setIsLoading(false);
        };
        fetchData();
    }, []);

    if (isLoading) {
        return <div className="text-center p-8">Loading analytics...</div>;
    }

    if (!summary) {
        return <div className="text-center p-8 text-red-500">Could not load analytics data.</div>;
    }

    /*const barChartData = {
        labels: summary.conversations_per_day.map(d => new Date(d.date).toLocaleDateString()),
        datasets: [{
            label: '# of Conversations',
            data: summary.conversations_per_day.map(d => d.count),
            backgroundColor: 'rgba(54, 162, 235, 0.6)',
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 1,
        }],
    }; */

    const pieChartData = {
        labels: summary.outcomes_breakdown.map(o => o.outcome.replace('_', ' ').toUpperCase()),
        datasets: [{
            label: 'Conversation Outcomes',
            data: summary.outcomes_breakdown.map(o => o.count),
            backgroundColor: [
                'rgba(255, 206, 86, 0.6)', // Yellow for pending
                'rgba(75, 192, 192, 0.6)', // Green for booking_confirmed
                'rgba(255, 99, 132, 0.6)',  // Red for human_handoff
            ],
            borderColor: [
                'rgba(255, 206, 86, 1)',
                'rgba(75, 192, 192, 1)',
                'rgba(255, 99, 132, 1)',
            ],
            borderWidth: 1,
        }],
    };

    const topServicesData = advanced ? {
        labels: advanced.top_booked_services.map(s => s.service_name),
        datasets: [{
            label: 'Number of Bookings',
            data: advanced.top_booked_services.map(s => s.booking_count),
            backgroundColor: 'rgba(75, 192, 192, 0.6)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1,
        }],
    } : null;

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Analytics Dashboard</h1>

            {/* --- REVISED KPI Cards Section --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {/* --- NEW REVENUE CARD --- */}
                <div className="bg-white p-6 rounded-lg shadow-md text-center">
                    <FiDollarSign className="mx-auto text-3xl text-green-500 mb-2" />
                    <h3 className="text-gray-500 text-lg">Total Estimated Revenue</h3>
                    <p className="text-4xl font-bold text-gray-800 mt-2">
                        Rs. {advanced ? advanced.total_estimated_revenue.toFixed(2) : '...'}
                    </p>
                </div>
                 <div className="bg-white p-6 rounded-lg shadow-md text-center">
                    <FiCheckCircle className="mx-auto text-3xl text-blue-500 mb-2" />
                    <h3 className="text-gray-500 text-lg">Bookings Confirmed by AI</h3>
                    <p className="text-4xl font-bold text-blue-600 mt-2">{summary.total_bookings_confirmed}</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md text-center">
                    <FiTrendingUp className="mx-auto text-3xl text-indigo-500 mb-2" />
                    <h3 className="text-gray-500 text-lg">Avg. Revenue / Booking</h3>
                    <p className="text-4xl font-bold text-gray-800 mt-2">
                         Rs. {advanced ? advanced.avg_revenue_per_booking.toFixed(2) : '...'}
                    </p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md text-center">
                    <h3 className="text-gray-500 text-lg">Handoffs to Staff</h3>
                    <p className="text-4xl font-bold text-red-500 mt-2">{summary.total_handoffs}</p>
                </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* --- NEW Top Services Chart --- */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-xl font-bold mb-4">Top 5 Services Booked by AI</h3>
                    {topServicesData && <Bar data={topServicesData} />}
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-xl font-bold mb-4">Conversation Outcomes</h3>
                    <div className="w-full h-64 flex justify-center"><Pie data={pieChartData} options={{ maintainAspectRatio: false }} /></div>
                </div>
            </div>
        </div>
    );
}

export default AnalyticsPage;