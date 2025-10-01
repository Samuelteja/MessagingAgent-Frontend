// In frontend/src/components/EditMenuModal.jsx

import React, { useState, useEffect } from 'react';
import { updateMenuItem } from '../services/api';
import { FiX, FiSave } from 'react-icons/fi';

function EditMenuModal({ isOpen, itemToEdit, onClose, onSave }) {
    // Form field state
    const [name, setName] = useState('');
    const [category, setCategory] = useState('');
    const [price, setPrice] = useState('');
    const [description, setDescription] = useState('');
    
    // UI state
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState(null);

    // This effect runs when the modal opens or the item to edit changes.
    // It populates the form with the existing data.
    useEffect(() => {
        if (itemToEdit) {
            setName(itemToEdit.name);
            setCategory(itemToEdit.category);
            setPrice(itemToEdit.price);
            setDescription(itemToEdit.description || '');
        }
    }, [itemToEdit]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        setError(null);

        const updatedItemData = {
            name,
            category,
            price: parseFloat(price),
            description,
        };

        try {
            await updateMenuItem(itemToEdit.id, updatedItemData);
            onSave(); // Tell the parent page to refresh its data
            onClose(); // Close the modal
        } catch (err) {
            console.error("Failed to update menu item:", err);
            setError(err.response?.data?.detail || "An unexpected error occurred.");
        }
        setIsSaving(false);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50">
            <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-lg">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">Edit Service</h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200"><FiX size={24} /></button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && <div className="p-3 bg-red-100 text-red-700 rounded-md">{error}</div>}
                    
                    <input type="text" placeholder="Service Name" value={name} onChange={(e) => setName(e.target.value)} required className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                    <input type="text" placeholder="Category" value={category} onChange={(e) => setCategory(e.target.value)} required className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                    <input type="number" step="0.01" placeholder="Price" value={price} onChange={(e) => setPrice(e.target.value)} required className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                    <textarea placeholder="Description (optional)" value={description} onChange={(e) => setDescription(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md" rows="3" />
                    
                    <div className="flex justify-end pt-4">
                        <button type="submit" disabled={isSaving} className="flex justify-center items-center px-6 py-2 bg-blue-500 text-white font-bold rounded-md hover:bg-blue-600 disabled:bg-gray-400">
                            <FiSave className="mr-2" />
                            {isSaving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default EditMenuModal;