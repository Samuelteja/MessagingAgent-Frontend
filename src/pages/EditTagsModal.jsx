import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import { getTags, updateContactTags } from '../services/api';

// --- The modal now accepts a 'conversation' prop ---
function EditTagsModal({ conversation, onClose, onSave }) {
    const [allTags, setAllTags] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedTags, setSelectedTags] = useState(
        (conversation?.contact?.tags || []).map(tag => ({ value: tag.name, label: tag.name }))
    );

    useEffect(() => {
        // Fetch all available tags to populate the dropdown.
        getTags().then(res => {
            const tagOptions = res.data.map(tag => ({ value: tag.name, label: tag.name }));
            setAllTags(tagOptions);
            setIsLoading(false);
        });
    }, []);

    const handleSave = async () => {
        const tagNames = selectedTags.map(t => t.value);
        try {
            // We use the contact_id from the nested contact object to make the API call.
            const response  = await updateContactTags(conversation.contact.contact_id, tagNames);
            onSave(response.data);
            onClose();
        } catch (error) {
            console.error("Failed to update tags:", error);
            alert("Could not save tags.");
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50">
            <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
                <h2 className="text-2xl font-bold mb-2 text-gray-800">Edit Tags</h2>
                <p className="mb-6 text-gray-600">
                    For: <strong>{conversation.contact.name || conversation.contact.contact_id}</strong>
                </p>
                
                {isLoading ? <p>Loading tags...</p> : (
                    <Select
                        isMulti
                        options={allTags}
                        value={selectedTags}
                        onChange={setSelectedTags}
                        placeholder="Select tags..."
                        className="mt-1"
                        classNamePrefix="react-select"
                    />
                )}
                
                <div className="flex justify-end space-x-4 pt-6 mt-4 border-t">
                    <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400">
                        Cancel
                    </button>
                    <button type="button" onClick={handleSave} className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">
                        Save Tags
                    </button>
                </div>
            </div>
        </div>
    );
}

export default EditTagsModal;