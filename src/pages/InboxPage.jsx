// frontend/src/pages/InboxPage.jsx
import React, { useState, useEffect, useMemo, useRef } from 'react';
import Select from 'react-select';
import useWebSocket from 'react-use-websocket';
import { getInboxConversations, getConversationHistory, getTags, sendManualReply, pauseAi, releaseAi } from '../services/api';
import { FaWhatsapp, FaInstagram, FaGoogle, FaEdit, FaPaperPlane, FaUserShield } from 'react-icons/fa';
import * as XLSX from 'xlsx';
import EditTagsModal from './EditTagsModal'; // Make sure this file exists

// Helper component to render the correct icon based on the channel name
const ChannelIcon = ({ channel }) => {
    switch (channel?.toLowerCase()) {
        case 'whatsapp':
            return <FaWhatsapp className="text-green-500 text-xl flex-shrink-0" />;
        case 'instagram':
            return <FaInstagram className="text-pink-500 text-xl flex-shrink-0" />;
        case 'googlemaps':
            return <FaGoogle className="text-blue-500 text-xl flex-shrink-0" />;
        default:
            return null;
    }
};

const WEBSOCKET_URL = 'ws://127.0.0.1:8000/ws/inbox-updates';

function InboxPage() {
    // Master data state
    const [allConversations, setAllConversations] = useState([]);
    const [allTags, setAllTags] = useState([]);

    // UI State
    const [selectedConversationDetails, setSelectedConversationDetails] = useState(null);
    const [selectedContactId, setSelectedContactId] = useState(null);
    const [messageHistory, setMessageHistory] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isHistoryLoading, setIsHistoryLoading] = useState(false);
    const [isTagModalOpen, setIsTagModalOpen] = useState(false);
    
    // Filter State
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedFilterTags, setSelectedFilterTags] = useState([]);
    
    const chatEndRef = useRef(null);

    // --- For Human Takeover ---
    const [isAiPaused, setIsAiPaused] = useState(false);
    const [manualReply, setManualReply] = useState('');
    const [isSending, setIsSending] = useState(false);

     useEffect(() => {
        const fetchInitialData = async () => {
            setIsLoading(true);
            try {
                // Fetch conversations and tags in parallel for speed
                const [convosRes, tagsRes] = await Promise.all([getInboxConversations(), getTags()]);
                setAllConversations(convosRes.data);
                setAllTags(tagsRes.data);
                
                // On the very first load, automatically select the first conversation in the list.
                if (convosRes.data.length > 0) {
                    setSelectedContactId(convosRes.data[0].contact.contact_id);
                    setSelectedConversationDetails(convosRes.data[0]);
                    const isPaused = convosRes.data[0].ai_is_paused_until && new Date(convosRes.data[0].ai_is_paused_until) > new Date();
                    setIsAiPaused(isPaused);
                }
            } catch (error) { 
                console.error("Failed to fetch initial data:", error); 
            }
            setIsLoading(false);
        };
        
        fetchInitialData();
    }, []); // <-- Empty dependency array is correct here, as this should only run once.

    // Effect 2: Fetch Chat History. Runs ONLY when `selectedContactId` changes.
    useEffect(() => {
        if (!selectedContactId) {
            setMessageHistory([]);
            return;
        }

        const fetchHistory = async () => {
            setIsHistoryLoading(true);
            try {
                const res = await getConversationHistory(selectedContactId);
                setMessageHistory(res.data);
            } catch (error) {
                console.error(`Failed to fetch history for ${selectedContactId}:`, error);
                setMessageHistory([]);
            }
            setIsHistoryLoading(false);
        };

        fetchHistory();
    }, [selectedContactId]); // <-- Correctly depends only on selectedContactId.

    // Effect 3: Handle WebSocket messages for live updates.
    const { lastJsonMessage } = useWebSocket(WEBSOCKET_URL, {
        onOpen: () => console.log('WebSocket connection established.'),
        shouldReconnect: () => true,
    });

    useEffect(() => {
        if (lastJsonMessage && lastJsonMessage.type === 'new_message') {
            console.log('WebSocket update received:', lastJsonMessage);
            
            // The most robust way to handle an update is to refresh the main list.
            // This ensures the new message snippet, timestamp, and order are correct.
            getInboxConversations().then(convosRes => {
                setAllConversations(convosRes.data);
                if (lastJsonMessage.contact?.contact_id === selectedContactId) {
                    getConversationHistory(selectedContactId).then(historyRes => setMessageHistory(historyRes.data));
                    // Also update the details view with any new tag/outcome info
                    const updatedDetails = convosRes.data.find(c => c.contact.contact_id === selectedContactId);
                    if(updatedDetails) setSelectedConversationDetails(updatedDetails);
                }
            });
        }
    }, [lastJsonMessage, selectedContactId]); // <-- Correctly depends on the message and the selected ID.

    // Effect 4: Scroll to the bottom of the chat. Runs ONLY when `messageHistory` changes.
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messageHistory]);

    const handleTagsSave = (updatedContactWithNewTags) => {
        console.log("handleTagsSave called with updated contact:", updatedContactWithNewTags);

        setAllConversations(currentConversations => {
            return currentConversations.map(convo => {
                if (convo.contact.contact_id === updatedContactWithNewTags.contact_id) {
                    return { ...convo, contact: updatedContactWithNewTags };
                }
                return convo;
            });
        });
        setSelectedConversationDetails(currentDetails => {
            if (!currentDetails) return null;

            return {
                ...currentDetails,
                contact: updatedContactWithNewTags
            };
        });
    };

    const filteredConversations = useMemo(() => {
        const filterTagValues = (selectedFilterTags || [])?.map(t => t.value);
        return allConversations
            .filter(convo => convo && convo.contact)
            .filter(convo => {
                const name = convo.contact.name || '';
                const id = convo.contact.contact_id || '';
                const lowerCaseSearch = searchTerm.toLowerCase();
                
                return (
                    name.toLowerCase().includes(lowerCaseSearch) ||
                    id.toLowerCase().includes(lowerCaseSearch)
                );
            })
            .filter(convo => {
                if (filterTagValues.length === 0) return true;
                const convoTags = convo.contact.tags || [];
                const convoTagNames = new Set(convoTags?.map(t => t.name));
                return filterTagValues.every(filterTag => convoTagNames.has(filterTag));
            });
    }, [allConversations, searchTerm, selectedFilterTags]);
    
    const tagOptions = useMemo(() => 
        (allTags || [])?.map(tag => ({ value: tag.name, label: tag.name })), 
        [allTags]
    );

    const handleExport = () => {
        const dataToExport = filteredConversations?.map(convo => ({
            Name: convo.contact.name || 'N/A',
            PhoneNumber: convo.contact.contact_id,
            LastMessage: convo.incoming_text,
            LastOutcome: convo.outcome,
            Tags: convo.tags?.map(t => t.name).join(', '),
            Channel: convo.channel,
            Timestamp: new Date(convo.timestamp).toLocaleString(),
        }));
        const worksheet = XLSX.utils.json_to_sheet(dataToExport);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Customers");
        XLSX.writeFile(workbook, "customer_export.xlsx");
    };

    const handleTakeover = async () => {
        if (!selectedContactId) return;
        try {
            await pauseAi(selectedContactId);
            setIsAiPaused(true); // Update the UI instantly on success
        } catch (error) {
            console.error("Failed to pause AI:", error);
            alert("Could not pause the AI. Please try again.");
        }
    };

    const handleReleaseTakeover = async () => {
        if (!selectedContactId) return;
        try {
            await releaseAi(selectedContactId);
            setIsAiPaused(false); // Update the UI instantly on success
        } catch (error) {
            console.error("Failed to release AI:", error);
            alert("Could not release the AI. Please try again.");
        }
    };

    const handleManualSend = async () => {
        if (!manualReply.trim() || !selectedContactId) return;
        setIsSending(true);
        try {
            await sendManualReply(selectedContactId, manualReply);
            setManualReply('');
            const res = await getConversationHistory(selectedContactId);
            setMessageHistory(res.data);
        } catch (error) { console.error("Failed to send manual reply:", error); }
        setIsSending(false);
    };

    const handleSelectContact = (conversationObject) => {
        if (!conversationObject || !conversationObject?.contact) return; // Safety guard
        setSelectedContactId(conversationObject.contact.contact_id);
        setSelectedConversationDetails(conversationObject);
        // Check if the pause timestamp is in the future
        const isPaused = conversationObject.contact.ai_is_paused_until && new Date(conversationObject.contact.ai_is_paused_until) > new Date();
        setIsAiPaused(isPaused);
    };

    const formatTimestamp = (ts) => new Date(ts).toLocaleString();

        return (
        <div className="flex flex-col h-[calc(100vh-6rem)]">
            <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Conversation Inbox</h1>
                <div className="flex items-center gap-2 flex-wrap">
                    <Select
                        isMulti
                        options={tagOptions}
                        onChange={setSelectedFilterTags}
                        placeholder="Filter by tag..."
                        className="w-64"
                        classNamePrefix="react-select"
                    />
                    <input
                        type="text"
                        placeholder="Search by name or phone..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full md:w-64 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button onClick={handleExport} disabled={filteredConversations.length === 0} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400">
                        Export List
                    </button>
                </div>
            </div>
            <div className="flex flex-grow bg-white rounded-lg shadow-md overflow-hidden">
                {/* Left Panel: Conversation List */}
                <div className="w-1/3 border-r border-gray-200 overflow-y-auto overflow-x-hidden">
                    {isLoading ? <div className="p-4 text-gray-500">Loading conversations...</div> : (
                        <>
                            {filteredConversations.length > 0 ? (
                                filteredConversations?.map(convo => (
                                    <div
                                        key={convo.id}
                                        className={`p-3 border-b cursor-pointer ${selectedContactId === convo.contact.contact_id ? 'bg-blue-100' : 'hover:bg-gray-50'}`}
                                        onClick={() => handleSelectContact(convo)}
                                    >
                                        <div className="flex justify-between items-center">
                                            <div className="flex items-center space-x-3 overflow-hidden">
                                                <ChannelIcon channel={convo.channel} />
                                                <p className="font-bold text-gray-800 truncate">
                                                    {convo.contact.name || convo.contact.contact_id}
                                                </p>
                                            </div>
                                            <p className="text-xs text-gray-400 flex-shrink-0 ml-2">
                                                {formatTimestamp(convo.timestamp)}
                                            </p>
                                        </div>
                                        <p className="text-sm text-gray-600 truncate mt-1 ml-9">
                                            {convo.incoming_text}
                                        </p>
                                    </div>
                                ))
                            ) : (
                                <div className="p-6 text-center text-gray-500">
                                    <h3 className="font-semibold">{searchTerm || selectedFilterTags.length > 0 ? 'No Results Found' : 'No Conversations Yet'}</h3>
                                    <p className="text-sm mt-1">{searchTerm || selectedFilterTags.length > 0 ? 'Try adjusting your filters.' : 'Chats will appear here as they arrive.'}</p>
                                </div>
                            )}
                        </>
                    )}
                </div>
                {/* Right Panel: Chat History & Manual Reply */}
                <div className="w-2/3 flex flex-col">
                     {selectedContactId ? (
                        <>
                            <div className="p-4 border-b bg-gray-50">
                                {/* Parent container for the top line */}
                                <div className="flex justify-between items-center">
                                    {/* Left-side container for name and icon */}
                                    <div className="flex items-center space-x-2">
                                        <ChannelIcon channel={selectedConversationDetails?.channel} />
                                        <h2 className="text-xl font-bold text-gray-800">
                                            Chat with {selectedConversationDetails?.contact?.name || selectedContactId}
                                        </h2>
                                    </div>

                                    {/* Right-side element: The Takeover Button */}
                                    {!isAiPaused && (
                                        <button 
                                            onClick={handleTakeover}
                                            className="flex items-center px-3 py-2 bg-orange-500 text-white text-sm font-bold rounded-lg hover:bg-orange-600 transition-colors flex-shrink-0"
                                        >
                                            <FaUserShield className="mr-2" /> Takeover
                                        </button>
                                    )}
                                </div>

                                {/* Container for the second line (tags and outcome) */}
                                {selectedConversationDetails && (
                                   <div className="flex items-center space-x-2 mt-2 flex-wrap gap-2">
                                       <span className={`px-2 py-1 text-xs font-semibold rounded-full ${selectedConversationDetails.outcome === 'booking_confirmed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                           Last Outcome: {selectedConversationDetails.outcome}
                                       </span>
                                       {selectedConversationDetails.contact.tags?.map(tag => (
                                           <span key={tag.id} className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                                               {tag.name}
                                           </span>
                                       ))}
                                       <button onClick={() => setIsTagModalOpen(true)} className="text-xs text-blue-600 hover:underline flex items-center">
                                           <FaEdit className="inline mr-1" /> Edit Tags
                                       </button>
                                   </div>
                                )}
                            </div>
                            
                            {/* Chat History Section */}
                            <div className="flex-grow p-6 overflow-y-auto space-y-4 bg-gray-100">
                               {isHistoryLoading ? <div className="text-center text-gray-500">Loading history...</div> : messageHistory?.map(msg => (
                                   <React.Fragment key={msg.id}>
                                       {/* Incoming Message */}
                                       <div className="flex justify-start min-w-0">
                                           <div className="bg-white p-3 rounded-lg max-w-xl shadow-sm">
                                               <p className="break-words">{msg.incoming_text}</p>
                                               <p className="text-xs text-gray-500 text-right mt-1">{formatTimestamp(msg.timestamp)}</p>
                                           </div>
                                       </div>
                                       {/* Outgoing Message */}
                                       {msg.outgoing_text && (
                                           <div className="flex justify-end min-w-0">
                                               <div className="bg-blue-500 text-white p-3 rounded-lg max-w-xl shadow-sm">
                                                   <p className="break-words">{msg.outgoing_text}</p>
                                                   <p className="text-xs text-blue-200 text-right mt-1">{formatTimestamp(msg.timestamp)}</p>
                                               </div>
                                           </div>
                                       )}
                                   </React.Fragment>
                               ))}
                               <div ref={chatEndRef} />
                            </div>

                            {/* Manual Reply Form Section */}
                            {isAiPaused && (
                                <div className="p-4 bg-orange-100 border-t-2 border-orange-300">
                                    <div className="flex justify-between items-center mb-2">
                                        <p className="text-sm font-bold text-orange-800">
                                            <FaUserShield className="inline mr-1" /> You are in control. AI is paused.
                                        </p>
                                        <button onClick={handleReleaseTakeover} className="text-xs text-blue-600 hover:underline">
                                            Release Control
                                        </button>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <textarea
                                            value={manualReply}
                                            onChange={(e) => setManualReply(e.target.value)}
                                            placeholder="Type your manual reply here..."
                                            className="w-full p-2 border border-gray-300 rounded-lg"
                                            rows="2"
                                            disabled={isSending}
                                        />
                                        <button onClick={handleManualSend} disabled={isSending || !manualReply.trim()} className="p-3 bg-blue-500 text-white rounded-full">
                                            <FaPaperPlane />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </>
                    ) : (
                        !isLoading && <div className="flex items-center justify-center h-full text-gray-500"><p>Select a conversation to view.</p></div>
                    )}
                </div>
            </div>
            {isTagModalOpen && selectedConversationDetails && (
                <EditTagsModal
                    conversation={selectedConversationDetails}
                    onClose={() => setIsTagModalOpen(false)}
                    onSave={handleTagsSave}
                />
            )}
        </div>
    );
}

export default InboxPage;