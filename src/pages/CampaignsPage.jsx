import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import { getTags, launchCampaign } from '../services/api';
import { FiSend } from 'react-icons/fi';

// A simple modal component for the disclaimer
const DisclaimerModal = ({ onAccept }) => (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50">
        <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-lg">
            <h2 className="text-2xl font-bold mb-4 text-red-600">Important Disclaimer</h2>
            <p className="text-gray-700 mb-6">
                The Broadcast Campaigns feature uses an unofficial WhatsApp channel. While we have built-in safety features (like daily limits and message delays) to minimize risk, sending proactive messages carries an inherent risk of your number being blocked by WhatsApp.
            </p>
            <p className="text-gray-700 font-semibold mb-6">
                To stay safe, please follow these best practices:
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-2 mb-8">
                <li>Only send valuable offers or important information.</li>
                <li>Do not send messages too frequently.</li>
                <li>Ensure your message is personalized and helpful.</li>
            </ul>
            <button
                onClick={onAccept}
                className="w-full px-6 py-3 bg-blue-500 text-white font-bold rounded-lg hover:bg-blue-600"
            >
                I Understand and Accept the Risks
            </button>
        </div>
    </div>
);

function CampaignsPage() {
    // State for the disclaimer
    const [disclaimerAccepted, setDisclaimerAccepted] = useState(localStorage.getItem('campaignDisclaimerAccepted') === 'true');

    // State for the form
    const [allTags, setAllTags] = useState([]);
    const [selectedTags, setSelectedTags] = useState([]);
    const [campaignName, setCampaignName] = useState('');
    const [messageTemplate, setMessageTemplate] = useState('');
    const [expiresAt, setExpiresAt] = useState('');

    // State for UI feedback
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [launchResult, setLaunchResult] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Fetch tags to populate the dropdown
        getTags().then(res => {
            const tagOptions = res.data.map(tag => ({ value: tag.name, label: tag.name }));
            setAllTags(tagOptions);
        });
    }, []);

    const handleAcceptDisclaimer = () => {
        localStorage.setItem('campaignDisclaimerAccepted', 'true');
        setDisclaimerAccepted(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setLaunchResult(null);
        setError(null);

        const campaignData = {
            name: campaignName,
            message_template: messageTemplate,
            target_tags: selectedTags.map(t => t.value),
            expires_at: new Date(expiresAt).toISOString(), // Convert to ISO string for the backend
        };

        try {
            const res = await launchCampaign(campaignData);
            setLaunchResult(res.data);
            // Reset form on success
            setCampaignName('');
            setMessageTemplate('');
            setSelectedTags([]);
            setExpiresAt('');
        } catch (err) {
            setError(err.response?.data?.detail || "An unexpected error occurred.");
        }
        setIsSubmitting(false);
    };

    // If disclaimer is not accepted, show the modal and nothing else.
    if (!disclaimerAccepted) {
        return <DisclaimerModal onAccept={handleAcceptDisclaimer} />;
    }

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Launch a New Campaign</h1>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Form Section */}
                <div className="p-6 bg-white rounded-lg shadow-md">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Campaign Name</label>
                            <input type="text" value={campaignName} onChange={(e) => setCampaignName(e.target.value)} required placeholder="e.g., Weekend Discount Offer" className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md" />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Target Customers With Tags</label>
                            <Select isMulti options={allTags} value={selectedTags} onChange={setSelectedTags} placeholder="Select tags..." className="mt-1" />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Message Template</label>
                            <textarea value={messageTemplate} onChange={(e) => setMessageTemplate(e.target.value)} required placeholder="e.g., Hi {customer_name}! Get 15% off this week." className="mt-1 w-full p-3 border border-gray-300 rounded-md" rows="5" />
                            <p className="text-xs text-gray-500 mt-1">Use <code className="bg-gray-200 px-1 rounded">{'{customer_name}'}</code> for personalization.</p>
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Campaign Expires At</label>
                            <input type="datetime-local" value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)} required className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md" />
                        </div>

                        <button type="submit" disabled={isSubmitting} className="w-full flex justify-center items-center px-6 py-3 bg-blue-500 text-white font-bold rounded-md hover:bg-blue-600 disabled:bg-gray-400">
                            <FiSend className="mr-2" />
                            {isSubmitting ? 'Launching...' : 'Launch Campaign'}
                        </button>
                    </form>
                </div>

                {/* Result Section */}
                <div className="p-6">
                    {error && (
                        <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                            <strong className="font-bold">Launch Failed:</strong>
                            <span className="block sm:inline ml-2">{error}</span>
                        </div>
                    )}
                    {launchResult && (
                        <div className="p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
                            <strong className="font-bold">{launchResult.message}</strong>
                            <ul className="list-disc list-inside mt-2 text-sm">
                                <li>Total customers targeted: {launchResult.summary.total_targets_found}</li>
                                <li>Eligible after safety checks: {launchResult.summary.eligible_after_safety_check}</li>
                                <li>Messages scheduled for today: {launchResult.summary.messages_scheduled_for_today}</li>
                                <li>Messages queued for tomorrow: {launchResult.summary.messages_queued_for_tomorrow}</li>
                            </ul>
                        </div>
                    )}
                    {!error && !launchResult && (
                         <div className="p-4 bg-gray-100 border border-gray-200 text-gray-600 rounded-lg text-center">
                            <p className="font-semibold">Ready to Launch</p>
                            <p className="text-sm">The results of your campaign launch will appear here.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default CampaignsPage;