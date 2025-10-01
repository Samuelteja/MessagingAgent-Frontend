// frontend/src/pages/knowledge/MenuPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { getMenu, createMenu, bulkUploadMenu } from '../../services/api';
import * as XLSX from 'xlsx';
import UpsellModal from './UpsellModal'; // Sarthak's overhauled modal
import EditMenuModal from '../../components/EditMenuModal'; // <-- IMPORT THE NEW MODAL
import { FiEdit } from 'react-icons/fi';
import { useAuth } from '../../hooks/useAuth';

function MenuPage() {
    const { business_type } = useAuth();
    const [menuItems, setMenuItems] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedService, setSelectedService] = useState(null);

    // Conditional labels based on business type
    const itemLabel = business_type === 'GAS_DISTRIBUTOR' ? 'Product' : 'Service Name';
    const categoryPlaceholder = business_type === 'GAS_DISTRIBUTOR' ? 'Category (e.g., Gas, ARB)' : 'Category (e.g., Hair, Nails)';
    const columnName = business_type === 'GAS_DISTRIBUTOR' ? 'Product' : 'ServiceName';

    // State for the new, detailed single-add form
    const [name, setName] = useState('');
    const [category, setCategory] = useState('');
    const [price, setPrice] = useState('');
    const [description, setDescription] = useState('');

    // --- STATE FOR THE EDIT MODAL ---
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);

    const fetchMenuData = useCallback(async () => {
        setIsLoading(true);
        try {
            const res = await getMenu();
            setMenuItems(res.data);
        } catch (error) {
            console.error("Failed to fetch menu items:", error);
            alert("Could not load menu data.");
        }
        setIsLoading(false);
    }, []);

    useEffect(() => {
        fetchMenuData();
    }, [fetchMenuData]);

    const handleSingleSubmit = async (e) => {
        e.preventDefault();
        const newItem = {
            name,
            category,
            price: parseFloat(price),
            description
        };
        try {
            await createMenu(newItem);
            // Reset form
            setName('');
            setCategory('');
            setPrice('');
            setDescription('');
            fetchMenuData(); // Refresh the list
        } catch (error) {
            console.error("Failed to add menu item:", error);
            alert("Error: " + (error.response?.data?.detail || "Could not save item."));
        }
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (event) => {
            try {
                const data = new Uint8Array(event.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                const json = XLSX.utils.sheet_to_json(worksheet);

                // Validation for the new, detailed format
                if (json.length > 0 && (!json[0][columnName] || !json[0].Category || !json[0].Price)) {
                    alert(`Upload failed! Make sure your Excel file has at least these columns: ${columnName}, Category, Price.`);
                    return;
                }

                const itemsToUpload = json.map(item => ({
                    name: String(item[columnName]),
                    category: String(item.Category),
                    price: parseFloat(item.Price),
                    description: item.Description ? String(item.Description) : '',
                }));

                await bulkUploadMenu(itemsToUpload);

                alert("Bulk upload successful!");
                fetchMenuData(); // Refresh the list

            } catch (error) {
                console.error("Failed to process Excel file:", error);
                alert("Error processing file. Please ensure it is a valid Excel file.");
            }
        };
        reader.readAsArrayBuffer(file);
        e.target.value = null;
    };

    const openEditModal = (item) => {
        setEditingItem(item);
        setIsEditModalOpen(true);
    };

    const closeEditModal = () => {
        setIsEditModalOpen(false);
        setEditingItem(null);
    };
    
    const handleMenuUpdate = () => {
        // After an item is successfully updated, just refresh the whole list
        fetchMenuData();
    };

    const openUpsellModal = (service) => {
        setSelectedService(service);
    };

    const closeUpsellModal = () => {
        setSelectedService(null);
    };
    
    const handleUpsellSave = () => {
        // After an upsell is saved, we need to refresh the menu data to show the update
        fetchMenuData();
    };

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-6">{business_type === 'GAS_DISTRIBUTOR' ? 'Product Management' : 'Menu & Service Management'}</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Add/Upload Section */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="p-6 bg-white rounded-lg shadow-md">
                        <h2 className="text-xl font-bold mb-4">Add Single {itemLabel}</h2>
                        <form onSubmit={handleSingleSubmit} className="space-y-4">
                            <input type="text" placeholder={itemLabel} value={name} onChange={(e) => setName(e.target.value)} required className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                            <input type="text" placeholder={categoryPlaceholder} value={category} onChange={(e) => setCategory(e.target.value)} required className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                            <input type="number" step="0.01" placeholder="Price" value={price} onChange={(e) => setPrice(e.target.value)} required className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                            <textarea placeholder="Description (optional)" value={description} onChange={(e) => setDescription(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md" rows="3" />
                            <button type="submit" className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">Add {itemLabel}</button>
                        </form>
                    </div>

                    <div className="p-6 bg-white rounded-lg shadow-md">
                        <h2 className="text-xl font-bold mb-4">Bulk Upload from Excel</h2>
                        <p className="text-sm text-gray-600 mb-2">Columns: <strong>{columnName}, Category, Price, Description</strong> (optional).</p>
                        <input type="file" onChange={handleFileUpload} accept=".xlsx, .xls" className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"/>
                    </div>
                </div>

                {/* Menu List Section */}
                <div className="lg:col-span-2 p-6 bg-white rounded-lg shadow-md">
                    <h2 className="text-xl font-bold mb-4">{business_type === 'GAS_DISTRIBUTOR' ? 'Current Products' : 'Current Menu'}</h2>
                    <div className="space-y-4">
                        {isLoading ? <p>Loading menu...</p> : menuItems.map(item => (
                            <div key={item.id} className="p-4 bg-gray-50 rounded-md">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="text-sm text-gray-500">{item.category}</p>
                                        <strong className="text-lg text-gray-800">{item.name}</strong>
                                        <p className="font-semibold text-gray-700">Rs. {item.price}</p>
                                        <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                                    </div>
                                    <div className="flex items-center space-x-2 flex-shrink-0">
                                        <button onClick={() => openEditModal(item)} className="p-2 text-gray-500 hover:bg-gray-200 rounded-full" title={`Edit ${itemLabel}`}>
                                            <FiEdit />
                                        </button>
                                        <button onClick={() => openUpsellModal(item)} className="px-3 py-1 bg-green-500 text-white text-xs font-bold rounded-full hover:bg-green-600 transition-colors">
                                            Edit Upsell
                                        </button>
                                    </div>
                                </div>
                                {item.upsell_rule && (
                                    <div className="mt-2 p-2 bg-green-50 border-l-2 border-green-400 text-xs text-green-800">
                                        <strong>Upsell Rule:</strong> Suggests Item ID #{item.upsell_rule.upsell_menu_item_id} - "{item.upsell_rule.suggestion_text}"
                                    </div>
                                )}
                            </div>
                        ))}
                         {menuItems.length === 0 && !isLoading && (
                            <p className="text-center text-gray-500 py-4">No menu items found.</p>
                        )}
                    </div>
                </div>
            </div>
            
            {selectedService && (
                <UpsellModal 
                    service={selectedService} 
                    onClose={closeUpsellModal} 
                    onSave={handleUpsellSave}
                />
            )}
            {isEditModalOpen && (
                <EditMenuModal 
                    isOpen={isEditModalOpen}
                    itemToEdit={editingItem} 
                    onClose={closeEditModal} 
                    onSave={handleMenuUpdate}
                />
            )}
        </div>
    );
}

export default MenuPage;