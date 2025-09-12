// frontend/src/pages/operations/StaffPage.jsx
import React, { useState, useEffect } from 'react';
import { getStaff, createStaff } from '../../services/api';

function StaffPage() {
    const [staffList, setStaffList] = useState([]);
    const [staffName, setStaffName] = useState('');
    const [staffSpecialties, setStaffSpecialties] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const res = await getStaff();
            setStaffList(res.data);
        } catch (error) {
            console.error("Failed to fetch staff:", error);
        }
        setIsLoading(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // For now, the schedule is a default JSON object.
            // A future enhancement could be a UI to build this schedule.
            const defaultSchedule = { "Note": "Schedule not configured" };
            await createStaff({ name: staffName, specialties: staffSpecialties, schedule: defaultSchedule });
            setStaffName('');
            setStaffSpecialties('');
            fetchData();
        } catch (error) {
            console.error("Failed to add staff member:", error);
            alert("Error: " + (error.response?.data?.detail || "Could not save staff member."));
        }
    };

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Staff Roster Management</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-1">
                    <div className="p-6 bg-white rounded-lg shadow-md">
                        <h2 className="text-xl font-bold mb-4">Add New Staff Member</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <input type="text" placeholder="Staff Name" value={staffName} onChange={(e) => setStaffName(e.target.value)} required className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                            <input type="text" placeholder="Specialties (comma-separated)" value={staffSpecialties} onChange={(e) => setStaffSpecialties(e.target.value)} required className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                            <button type="submit" className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">Add Staff Member</button>
                        </form>
                    </div>
                </div>
                <div className="md:col-span-2 p-6 bg-white rounded-lg shadow-md">
                    <h2 className="text-xl font-bold mb-4">Current Staff</h2>
                    <div className="space-y-2">
                        {isLoading ? <p>Loading staff...</p> : staffList.map(staff => (
                            <div key={staff.id} className="p-3 bg-gray-50 rounded-md">
                                <strong className="text-gray-700">{staff.name}</strong>
                                <p className="text-sm text-gray-500">Specialties: {staff.specialties}</p>
                            </div>
                        ))}
                         {staffList.length === 0 && !isLoading && (
                            <p className="text-center text-gray-500 py-4">No staff members found. Add one using the form.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default StaffPage;