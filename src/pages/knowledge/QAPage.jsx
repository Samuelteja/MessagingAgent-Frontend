// frontend/src/pages/knowledge/QAPage.jsx
import React, {useState, useEffect } from 'react';
import { getKnowledgeItems, createKnowledgeItem, bulkUploadKnowledge  } from '../../services/api';
import * as XLSX from 'xlsx'; // And the Excel library

function QAPage() {
    const [qaItems, setQaItems] = useState([]);
    const [question, setQuestion] = useState('');
    const [answer, setAnswer] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const res = await getKnowledgeItems();
            setQaItems(res.data.filter(item => item.type === 'QA'));
        } catch (error) {
            console.error("Failed to fetch Q&A items:", error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await createKnowledgeItem({ type: 'QA', key: question, value: answer });
            setQuestion('');
            setAnswer('');
            fetchData();
        } catch (error) {
            console.error("Failed to add Q&A item:", error);
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

                // Validation for Q&A file format
                if (json.length > 0 && (!json[0].Question || !json[0].Answer)) {
                    alert("Upload failed! Make sure your Excel file has columns named 'Question' and 'Answer'.");
                    return;
                }

                const itemsToUpload = json.map(item => ({
                    type: 'QA',
                    key: String(item.Question),
                    value: String(item.Answer),
                }));

                // We can reuse the 'bulkUploadMenu' name, as it points to the generic endpoint
                await bulkUploadKnowledge(itemsToUpload);

                alert("Q&A bulk upload successful!");
                fetchData(); // Refresh the list

            } catch (error) {
                console.error("Failed to process Excel file:", error);
                alert("Error processing file. Please ensure it is a valid Excel file.");
            }
        };
        reader.readAsArrayBuffer(file);
        e.target.value = null;
    };

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Q&A Management</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-1 space-y-6">
                    {/* --- Single Add Form (Unchanged) --- */}
                    <div className="p-6 bg-white rounded-lg shadow-md">
                        <h2 className="text-xl font-bold mb-4">Add Single Q&A</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <input type="text" placeholder="Question" value={question} onChange={(e) => setQuestion(e.target.value)} required className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                            <textarea placeholder="Answer" value={answer} onChange={(e) => setAnswer(e.target.value)} required className="w-full px-3 py-2 border border-gray-300 rounded-md" rows="4" />
                            <button type="submit" className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">Add Q&A</button>
                        </form>
                    </div>

                    {/* --- NEW: Bulk Upload Section --- */}
                    <div className="p-6 bg-white rounded-lg shadow-md">
                        <h2 className="text-xl font-bold mb-4">Bulk Upload from Excel</h2>
                        <p className="text-sm text-gray-600 mb-2">File must have columns: <strong>Question</strong> and <strong>Answer</strong>.</p>
                        <input 
                            type="file" 
                            onChange={handleFileUpload} 
                            accept=".xlsx, .xls" 
                            className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        />
                    </div>
                </div>

                {/* --- List Section (Unchanged) --- */}
                <div className="md:col-span-2 p-6 bg-white rounded-lg shadow-md">
                    <h2 className="text-xl font-bold mb-4">Current Q&A Items</h2>
                    <div className="space-y-2">
                        {qaItems.map(item => (
                            <div key={item.id} className="p-3 bg-gray-50 rounded-md">
                                <strong className="text-gray-700">{item.key}</strong>
                                <p className="text-sm text-gray-500">{item.value}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
export default QAPage;