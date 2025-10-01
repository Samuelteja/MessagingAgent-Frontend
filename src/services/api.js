// frontend/src/services/api.js

import axios from 'axios';

// The backend is running on port 8000
const API_URL = 'http://127.0.0.1:8000/api';

const toLocalDateString = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

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

// --- AI Tagging Rules API Functions ---

export const getAITagRules = () => {
  return apiClient.get('/tag-rules/');
};

export const deleteAITagRule = (ruleId) => {
  return apiClient.delete(`/tag-rules/${ruleId}`);
};

// --- Staff API Functions ---
export const getStaff = () => apiClient.get('/staff/');
export const createStaff = (staffMember) => apiClient.post('/staff/', staffMember);


// --- Business Hours API Functions ---
export const getHours = () => apiClient.get('/hours/');
export const updateHours = (hoursData) => apiClient.post('/hours/', hoursData);

// --- Backend Endpoint for Bulk Upload ---
export const bulkUploadKnowledge = (items) => apiClient.post('/knowledge/bulk-upload', items);

// --- DEDICATED FUNCTION FOR MENU UPLOAD ---
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

export const getScheduledTasks = () => {
  return apiClient.get('/scheduled-tasks/');
};

// --- APIs for Manual Booking ---
export const getMenuForDropdown = () => {
  return apiClient.get('/menu/for-dropdown');
};

export const getStaffForDropdown = () => {
  return apiClient.get('/staff/for-dropdown');
};

export const createBooking = (bookingData) => {
  return apiClient.post('/bookings', bookingData);
};

export const uploadDeliveryList = (formData) => {
  // We must set the Content-Type header to multipart/form-data for file uploads
  return apiClient.post('/delivery-lists/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export const getBookings = (startDate, endDate) => {
  return apiClient.get(`/bookings`, {
    params: {
      start_date: startDate,
      end_date: endDate,
    }
  });
};

export const getDeliveryList = (date, filters = {}) => {
  const params = new URLSearchParams();
  if (filters.searchTerm) {
    params.append('search_term', filters.searchTerm);
  }
  if (filters.status) {
    params.append('status', filters.status);
  }
  
  const queryString = params.toString();
  const url = `/delivery-lists/${date}${queryString ? `?${queryString}` : ''}`;
  
  return apiClient.get(url);
};

export const updateDeliveryStatus = (deliveryId, payload) => {
  return apiClient.patch(`/deliveries/${deliveryId}/status`, payload);
};

export const updateBooking = (bookingId, bookingData) => {
  return apiClient.put(`/bookings/${bookingId}`, bookingData);
};

export const getAllBookings = (filters) => {
  const params = new URLSearchParams();

  if (filters.startDate) {
    // Use our new, safe helper function
    params.append('start_date', toLocalDateString(filters.startDate));
  }
  if (filters.endDate) {
    // Use our new, safe helper function
    params.append('end_date', toLocalDateString(filters.endDate));
  }
  if (filters.searchTerm) {
    params.append('search_term', filters.searchTerm);
  }
  if (filters.staffId) {
    params.append('staff_id', filters.staffId);
  }
  if (filters.serviceId) {
    params.append('service_id', filters.serviceId);
  }
  if (filters.status) {
    params.append('status', filters.status);
  }

  return apiClient.get('/bookings/all', { params });
};


export const updateMenuItem = (itemId, itemData) => {
  return apiClient.put(`/menu/${itemId}`, itemData);
};