// frontend/src/services/api.js

import axios from 'axios';

// The backend is running on port 8000
const API_URL = 'http://127.0.0.1:8000/api';

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// --- Knowledge API Functions ---
export const getKnowledgeItems = () => apiClient.get('/knowledge/');
export const createKnowledgeItem = (item) => apiClient.post('/knowledge/', item);
// A new function Sarthak will need for the Upsell Modal
export const getMenuItems = async () => {
    const response = await apiClient.get('/knowledge/');
    return response.data.filter(item => item.type === 'MENU');
};


// --- Tags API Functions ---
export const getTags = () => apiClient.get('/tags/');
export const createTag = (tag) => apiClient.post('/tags/', tag);


// --- Staff API Functions ---
export const getStaff = () => apiClient.get('/staff/');
export const createStaff = (staffMember) => apiClient.post('/staff/', staffMember);


// --- Business Hours API Functions ---
export const getHours = () => apiClient.get('/hours/');
export const updateHours = (hoursData) => apiClient.post('/hours/', hoursData);

// --- NEW Backend Endpoint for Bulk Upload ---
// The lead dev needs to create this endpoint in Python.
// For now, the frontend will call it.
export const bulkUploadKnowledge = (items) => apiClient.post('/knowledge/bulk-upload', items);

// --- ADD THIS NEW, DEDICATED FUNCTION FOR MENU UPLOAD ---
export const bulkUploadMenu = (items) => apiClient.post('/menu/bulk-upload', items);

export const getInboxConversations = () => {
  return apiClient.get('/contacts/inbox');
};

export const getConversationHistory = (contactId) => {
  return apiClient.get(`/contacts/${contactId}/history`); // <-- NEW PATH
};

export const updateContactTags = (contactId, tags) => {
  return apiClient.post(`/contacts/${contactId}/tags`, { tags });
};

export const sendManualReply = (contactId, message) => {
  return apiClient.post(`/contacts/${contactId}/send-manual-reply`, { message });
};

export const pauseAi = (contactId) => {
  return apiClient.post(`/contacts/${contactId}/pause-ai`);
};

export const releaseAi = (contactId) => {
  return apiClient.post(`/contacts/${contactId}/release-ai`);
};
export const getAnalyticsSummary = () => apiClient.get('/analytics/summary');
export const getMenu = () => apiClient.get('/menu/');
export const createMenu = (item) => apiClient.post('/menu/', item);
export const setUpsell = (triggerId, rule) => apiClient.post(`/menu/${triggerId}/upsell`, rule);

// --- Campaign API Functions ---
export const launchCampaign = (campaignData) => {
  return apiClient.post('/campaigns/broadcast', campaignData);
};

export const getAdvancedAnalytics = () => {
  return apiClient.get('/analytics/advanced');
};

export const getBusinessProfile = () => {
  return apiClient.get('/profile/');
};

export const updateBusinessProfile = (profileData) => {
  return apiClient.put('/profile/', profileData);
};

export const bulkImportContacts = (contacts) => {
  return apiClient.post('/contacts/import', { contacts });
};

export const getAllContacts = () => {
  return apiClient.get('/contacts/');
};