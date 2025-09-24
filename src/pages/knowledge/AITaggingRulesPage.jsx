// In frontend/src/pages/knowledge/AITaggingRulesPage.jsx

import React, { useState, useEffect, useCallback } from 'react';
import { getAITagRules, deleteAITagRule } from '../../services/api';
import { FiRefreshCw, FiTrash2, FiCpu } from 'react-icons/fi';

function AITaggingRulesPage() {
    const [rules, setRules] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState(null);

    const fetchRules = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const res = await getAITagRules();
            setRules(res.data);
        } catch (err) {
            console.error("Failed to fetch AI tag rules:", err);
            setError("Could not load the AI tagging rules. Please try again later.");
        }
        setIsLoading(false);
    }, []);

    useEffect(() => {
        fetchRules();
    }, [fetchRules]);


    const handleDelete = async (ruleId) => {
        // Optional: Confirm before deleting
        if (!window.confirm("Are you sure you want to delete this rule? This cannot be undone.")) {
            return;
        }

        try {
            await deleteAITagRule(ruleId);
            // Re-fetch the data to update the list in the UI
            await fetchRules();
        } catch (err) {
            console.error("Failed to delete rule:", err);
            alert("Could not delete the rule.");
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">AI Tagging Rules</h1>
            </div>
             <div className="p-4 bg-blue-50 border-l-4 border-blue-400 text-blue-800 mb-8 rounded-md">
                <div className="flex">
                    <div className="py-1"><FiCpu className="h-6 w-6 text-blue-500 mr-4"/></div>
                    <div>
                        <p className="font-bold">How This Works</p>
                        <p className="text-sm">The backend automatically analyzes your Menu to create these rules. When a customer's message contains a "Keyword," the AI will automatically apply the corresponding "Tag" to them for powerful marketing segmentation.</p>
                    </div>
                </div>
            </div>

            {error && <div className="p-4 mb-4 bg-red-100 text-red-700 rounded-md">{error}</div>}

            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <table className="w-full text-sm text-left text-gray-600">
                    <thead className="bg-gray-100 text-xs text-gray-700 uppercase">
                        <tr>
                            <th scope="col" className="px-6 py-3">Keyword</th>
                            <th scope="col" className="px-6 py-3">Tag to Apply</th>
                            <th scope="col" className="px-6 py-3 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <tr><td colSpan="3" className="text-center p-8">Loading rules...</td></tr>
                        ) : rules.length > 0 ? (
                            rules.map(rule => (
                                <tr key={rule.id} className="bg-white border-b hover:bg-gray-50">
                                    <td className="px-6 py-4 font-medium text-gray-900">{rule.keyword}</td>
                                    <td className="px-6 py-4">
                                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">{rule.tag_to_apply}</span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            onClick={() => handleDelete(rule.id)}
                                            className="p-2 text-red-500 hover:bg-red-100 rounded-full"
                                            title="Delete Rule"
                                        >
                                            <FiTrash2 />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr><td colSpan="3" className="text-center p-8">No AI rules found. Click "Re-Generate Rules" to create them from your menu.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default AITaggingRulesPage;