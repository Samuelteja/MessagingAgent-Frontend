// frontend/src/pages/knowledge/UpsellModal.jsx
import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import { getMenu, setUpsell } from '../../services/api';

function UpsellModal({ service, onClose, onSave }) {
    const [allMenuItems, setAllMenuItems] = useState([]);
    const [suggestion, setSuggestion] = useState('');
    const [selectedUpsellItem, setSelectedUpsellItem] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    // useEffect to fetch data and pre-fill the form when the modal opens or the service changes.
    useEffect(() => {
        const fetchDataAndSetState = async () => {
            setIsLoading(true);
            try {
                const menuItemsRes = await getMenu();
                // Create options for the react-select dropdown
                const menuOptions = menuItemsRes.data
                    .filter(item => item.id !== service.id) // Can't upsell a service to itself
                    .map(item => ({ value: item.id, label: `${item.name} (Rs. ${item.price})` }));
                setAllMenuItems(menuOptions);

                // If the service already has an upsell rule, pre-populate the form
                if (service.upsell_rule) {
                    setSuggestion(service.upsell_rule.suggestion_text);
                    // Find the corresponding menu item in the options to set the default value for react-select
                    const currentUpsell = menuOptions.find(opt => opt.value === service.upsell_rule.upsell_menu_item_id);
                    setSelectedUpsellItem(currentUpsell);
                } else {
                    // If no rule exists, reset the form
                    setSuggestion('');
                    setSelectedUpsellItem(null);
                }

            } catch (error) {
                console.error("Failed to fetch menu items for modal:", error);
            }
            setIsLoading(false);
        };

        fetchDataAndSetState();
    }, [service]);

    const handleSave = async () => {
        if (!selectedUpsellItem || !suggestion) {
            alert("Please select a service to upsell and provide a suggestion message.");
            return;
        }

        setIsSaving(true);
        const rulePayload = {
            suggestion_text: suggestion,
            upsell_menu_item_id: selectedUpsellItem.value // The ID of the item to upsell
        };

        try {
            await setUpsell(service.id, rulePayload); // service.id is the trigger ID
            onSave(); // Tell the parent page to refresh
            onClose(); // Close the modal
        } catch (error) {
            console.error("Failed to save upsell rule:", error);
            alert("Error: " + (error.response?.data?.detail || "Could not save rule."));
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50">
            <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-lg">
                <h2 className="text-2xl font-bold mb-2 text-gray-800">Upsell Rule</h2>
                <p className="mb-6 text-gray-600">For when a customer books: <strong>{service.name}</strong></p>
                
                {isLoading ? <p>Loading...</p> : (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Then, offer this service as an upsell:</label>
                            <Select
                                options={allMenuItems}
                                value={selectedUpsellItem}
                                onChange={setSelectedUpsellItem}
                                placeholder="-- Select a service to upsell --"
                                className="mt-1"
                                classNamePrefix="react-select"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Using this suggestion message:</label>
                            <textarea
                                placeholder="e.g., Many clients who get this also add our relaxing head massage..."
                                value={suggestion}
                                onChange={(e) => setSuggestion(e.target.value)}
                                required
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                rows="4"
                            />
                        </div>
                    </div>
                )}
                
                <div className="flex justify-end space-x-4 pt-6 mt-4 border-t">
                    <button type="button" onClick={onClose} disabled={isSaving} className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 disabled:opacity-50">
                        Cancel
                    </button>
                    <button type="button" onClick={handleSave} disabled={isSaving || isLoading} className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50">
                        {isSaving ? 'Saving...' : 'Save Rule'}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default UpsellModal;