// frontend/src/pages/knowledge/TagsPage.jsx
import React, { useState, useEffect } from 'react';
import { getTags, createTag } from '../../services/api';

function TagsPage() {
    const [tags, setTags] = useState([]);
    const [tagName, setTagName] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const res = await getTags();
            setTags(res.data);
        } catch (error) {
            console.error("Failed to fetch tags:", error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await createTag({ name: tagName });
            setTagName('');
            fetchData();
        } catch (error) {
            console.error("Failed to create tag:", error);
            alert("Error: " + (error.response?.data?.detail || "Could not save tag."));
        }
    };

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Customer Tag Management</h1>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-1">
                    <div className="p-6 bg-white rounded-lg shadow-md">
                        <h2 className="text-xl font-bold mb-4">Add New Tag</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <input type="text" placeholder="Tag Name (e.g., VIP, student)" value={tagName} onChange={(e) => setTagName(e.target.value)} required className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                            <button type="submit" className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">Add Tag</button>
                        </form>
                    </div>
                </div>
                <div className="md:col-span-2 p-6 bg-white rounded-lg shadow-md">
                    <h2 className="text-xl font-bold mb-4">Available Tags</h2>
                    <div className="flex flex-wrap gap-2">
                        {tags.map(tag => (
                            <span key={tag.id} className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full">
                                {tag.name}
                            </span>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
export default TagsPage;