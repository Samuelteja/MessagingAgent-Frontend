import React, { useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import { bulkImportContacts, getAllContacts } from '../services/api';
import { FiUploadCloud, FiCheckCircle, FiUsers } from 'react-icons/fi';

function ImportCustomersPage() {
    const [parsedData, setParsedData] = useState([]);
    const [fileName, setFileName] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    const [allContacts, setAllContacts] = useState([]);
    const [isLoadingContacts, setIsLoadingContacts] = useState(true);

    const fetchContacts = async () => {
        setIsLoadingContacts(true);
        try {
            const res = await getAllContacts();
            setAllContacts(res.data);
        } catch (err) {
            console.error("Failed to fetch contacts:", err);
        }
        setIsLoadingContacts(false);
    };

    useEffect(() => {
        fetchContacts();
    }, []);

    const onDrop = (acceptedFiles) => {
        const file = acceptedFiles[0];
        if (!file) return;

        setFileName(file.name);
        setParsedData([]);
        setResult(null);
        setError(null);

        const reader = new FileReader();

        reader.onload = (event) => {
            try {
                let data;
                if (file.name.endsWith('.csv')) {
                    const csvData = Papa.parse(event.target.result, { header: true, skipEmptyLines: true });
                    data = csvData.data;
                } else {
                    const workbook = XLSX.read(event.target.result, { type: 'binary' });
                    const sheetName = workbook.SheetNames[0];
                    const worksheet = workbook.Sheets[sheetName];
                    data = XLSX.utils.sheet_to_json(worksheet);
                }

                // --- Data Validation and Mapping ---
                const mappedData = data.map(row => {
                    // Look for common header variations (case-insensitive)
                    const nameKey = Object.keys(row).find(k => k.toLowerCase() === 'name');
                    const phoneKey = Object.keys(row).find(k => k.toLowerCase() === 'phone' || k.toLowerCase() === 'phone number');
                    
                    if (!nameKey || !phoneKey) {
                        throw new Error("File must contain 'Name' and 'Phone' columns.");
                    }
                    
                    // Format the phone number to match the WhatsApp ID format
                    let phone = String(row[phoneKey]).replace(/\D/g, ''); // Remove non-digits
                    if (!phone.startsWith('91')) phone = `91${phone}`; // Assume India country code if missing
                    
                    return { name: row[nameKey], contact_id: `${phone}@c.us` };
                });
                
                setParsedData(mappedData);

            } catch (err) {
                setError(`Error parsing file: ${err.message}`);
            }
        };

        if (file.name.endsWith('.csv')) {
            reader.readAsText(file);
        } else {
            reader.readAsBinaryString(file);
        }
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'text/csv': ['.csv'],
            'application/vnd.ms-excel': ['.xls'],
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
        },
        multiple: false,
    });
    
    const handleImport = async () => {
        setIsSubmitting(true);
        setResult(null);
        setError(null);
        try {
            const res = await bulkImportContacts(parsedData);
            setResult(res.data);
            setParsedData([]); // Clear the preview on success
            setFileName('');
            fetchContacts(); 
        } catch (err) {
            setError(err.response?.data?.detail || "An unexpected error occurred during import.");
        }
        setIsSubmitting(false);
    };

    const formatTimestamp = (ts) => new Date(ts).toLocaleString();
    
    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Customer Management</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                {/* Upload Section */}
                <div {...getRootProps()} className={`p-10 border-2 border-dashed rounded-lg cursor-pointer flex flex-col items-center justify-center text-center ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-gray-50'}`}>
                    <input {...getInputProps()} />
                    <FiUploadCloud className="text-4xl text-gray-400 mb-4" />
                    {isDragActive ? (
                        <p className="text-blue-600 font-semibold">Drop the file here...</p>
                    ) : (
                        <p className="text-gray-600">Drag & drop your file here, or click to select a file</p>
                    )}
                    <p className="text-xs text-gray-500 mt-2">Supports: .xlsx, .xls, .csv</p>
                    {fileName && <p className="text-sm font-semibold text-green-600 mt-4">File selected: {fileName}</p>}
                </div>
                
                {/* Preview and Result Section */}
                <div>
                    <div className="p-6 bg-white rounded-lg shadow-md">
                        <h2 className="text-xl font-bold mb-4">Preview & Import</h2>
                        {parsedData.length > 0 ? (
                            <>
                                <p className="text-sm text-gray-600 mb-4">Found {parsedData.length} customers to import. Please review the first few records before importing.</p>
                                <div className="max-h-60 overflow-y-auto border rounded-md">
                                    <table className="w-full text-sm">
                                        <thead className="bg-gray-100">
                                            <tr>
                                                <th className="p-2 text-left">Name</th>
                                                <th className="p-2 text-left">WhatsApp ID</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {parsedData.slice(0, 10).map((row, i) => (
                                                <tr key={i} className="border-t">
                                                    <td className="p-2">{row.name}</td>
                                                    <td className="p-2">{row.contact_id}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                <button onClick={handleImport} disabled={isSubmitting} className="mt-6 w-full flex justify-center items-center px-6 py-3 bg-green-600 text-white font-bold rounded-md hover:bg-green-700 disabled:bg-gray-400">
                                    {isSubmitting ? 'Importing...' : `Confirm & Import ${parsedData.length} Customers`}
                                </button>
                            </>
                        ) : (
                             <div className="text-center text-gray-500 py-4">Upload a file to see a preview.</div>
                        )}
                    </div>
                    {error && (
                        <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                            <strong className="font-bold">Import Failed:</strong>
                            <span className="block sm:inline ml-2">{error}</span>
                        </div>
                    )}
                    {result && (
                        <div className="mt-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
                            <strong className="font-bold flex items-center"><FiCheckCircle className="mr-2" /> {result.message}</strong>
                        </div>
                    )}
                </div>
            </div>
            <div className="mt-12">
                 <div className="flex items-center space-x-3 mb-6">
                    <FiUsers className="text-2xl text-gray-700" />
                    <h2 className="text-2xl font-bold text-gray-800">Your Customer List</h2>
                </div>
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="p-4 text-left font-semibold text-gray-600">Name</th>
                                    <th className="p-4 text-left font-semibold text-gray-600">WhatsApp ID</th>
                                    <th className="p-4 text-left font-semibold text-gray-600">Tags</th>
                                    <th className="p-4 text-left font-semibold text-gray-600">Date Added</th>
                                </tr>
                            </thead>
                            <tbody>
                                {isLoadingContacts ? (
                                    <tr><td colSpan="4" className="text-center p-8 text-gray-500">Loading contacts...</td></tr>
                                ) : (
                                    allContacts.map(contact => (
                                        <tr key={contact.id} className="border-t hover:bg-gray-50">
                                            <td className="p-4 font-medium text-gray-800">{contact.name || '-'}</td>
                                            <td className="p-4 text-gray-600">{contact.contact_id}</td>
                                            <td className="p-4">
                                                <div className="flex flex-wrap gap-1">
                                                    {contact.tags.map(tag => (
                                                        <span key={tag.id} className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                                                            {tag.name}
                                                        </span>
                                                    ))}
                                                </div>
                                            </td>
                                            <td className="p-4 text-gray-600">{formatTimestamp(contact.created_at)}</td>
                                        </tr>
                                    ))
                                )}
                                {!isLoadingContacts && allContacts.length === 0 && (
                                    <tr><td colSpan="4" className="text-center p-8 text-gray-500">No contacts found. Upload a file to get started.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ImportCustomersPage;