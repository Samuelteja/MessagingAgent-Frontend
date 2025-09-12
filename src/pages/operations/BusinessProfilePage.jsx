import React, { useState, useEffect } from 'react';
import { getBusinessProfile, updateBusinessProfile } from '../../services/api';
import { FiSave } from 'react-icons/fi';

function BusinessProfilePage() {
    const [profile, setProfile] = useState({
        business_name: '',
        business_description: '',
        address: '',
        phone_number: ''
    });
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState(null); // For success/error messages

    useEffect(() => {
        // Fetch the profile data when the component loads
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const res = await getBusinessProfile();
                setProfile(res.data);
            } catch (error) {
                console.error("Failed to fetch profile:", error);
                setMessage({ type: 'error', text: 'Could not load business profile.' });
            }
            setIsLoading(false);
        };
        fetchData();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setProfile(prevState => ({ ...prevState, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        setMessage(null);
        try {
            await updateBusinessProfile(profile);
            setMessage({ type: 'success', text: 'Profile updated successfully!' });
        } catch (error) {
            console.error("Failed to update profile:", error);
            setMessage({ type: 'error', text: 'Failed to update profile. Please try again.' });
        }
        setIsSaving(false);
    };

    if (isLoading) {
        return <div className="text-center p-8">Loading Business Profile...</div>;
    }

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Business Profile</h1>
            <p className="text-gray-600 mb-8">This information is used by the AI to identify your business and answer customer questions about your location and contact details.</p>
            
            <div className="max-w-2xl">
                <form onSubmit={handleSubmit} className="p-8 bg-white rounded-lg shadow-md space-y-6">
                    {/* Business Name */}
                    <div>
                        <label htmlFor="business_name" className="block text-sm font-medium text-gray-700">Business Name</label>
                        <input
                            type="text"
                            name="business_name"
                            id="business_name"
                            value={profile.business_name}
                            onChange={handleChange}
                            required
                            className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-md"
                        />
                    </div>

                    {/* Business Description */}
                    <div>
                        <label htmlFor="business_description" className="block text-sm font-medium text-gray-700">Business Description</label>
                        <textarea
                            name="business_description"
                            id="business_description"
                            value={profile.business_description || ''}
                            onChange={handleChange}
                            rows="4"
                            placeholder="e.g., A premium hair and beauty salon in Hyderabad."
                            className="mt-1 w-full p-4 border border-gray-300 rounded-md"
                        />
                    </div>
                    
                    {/* Address */}
                    <div>
                        <label htmlFor="address" className="block text-sm font-medium text-gray-700">Address</label>
                        <input
                            type="text"
                            name="address"
                            id="address"
                            value={profile.address || ''}
                            onChange={handleChange}
                            className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-md"
                        />
                    </div>
                    
                    {/* Phone Number */}
                    <div>
                        <label htmlFor="phone_number" className="block text-sm font-medium text-gray-700">Public Phone Number</label>
                        <input
                            type="text"
                            name="phone_number"
                            id="phone_number"
                            value={profile.phone_number || ''}
                            onChange={handleChange}
                            className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-md"
                        />
                    </div>
                    
                    {/* Submit Button */}
                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={isSaving}
                            className="flex justify-center items-center px-6 py-2 bg-blue-500 text-white font-bold rounded-md hover:bg-blue-600 disabled:bg-gray-400"
                        >
                            <FiSave className="mr-2" />
                            {isSaving ? 'Saving...' : 'Save Profile'}
                        </button>
                    </div>

                    {/* Feedback Message */}
                    {message && (
                        <div className={`mt-4 p-3 rounded-md text-sm ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {message.text}
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
}

export default BusinessProfilePage;