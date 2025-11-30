import { projectId, publicAnonKey } from './supabase/info';

const API_BASE_URL = `https://${projectId}.supabase.co/functions/v1/make-server-593da926`;

export async function apiRequest(
  endpoint: string,
  options: RequestInit = {},
  accessToken?: string
) {
  const authHeader = `Bearer ${accessToken || publicAnonKey}`;
  console.log('API Request:', endpoint, 'Auth:', authHeader.substring(0, 30) + '...');
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'Authorization': authHeader,
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json();
    console.error('API Request Failed:', endpoint, 'Status:', response.status, 'Error:', error);
    throw new Error(error.error || 'API request failed');
  }

  return response.json();
}

// Inventory API
export const inventoryAPI = {
  getAll: (accessToken: string) =>
    apiRequest('/inventory', { method: 'GET' }, accessToken),

  updateStock: (itemId: string, stock: number, accessToken: string) =>
    apiRequest(`/inventory/${itemId}`, {
      method: 'PUT',
      body: JSON.stringify({ stock }),
    }, accessToken),
};

// Sourcing List API
export const sourcingAPI = {
  getList: (accessToken: string) =>
    apiRequest('/sourcing-list', { method: 'GET' }, accessToken),

  addItem: (itemData: any, accessToken: string) =>
    apiRequest('/sourcing-list', {
      method: 'POST',
      body: JSON.stringify(itemData),
    }, accessToken),

  removeItem: (itemId: string, accessToken: string) =>
    apiRequest(`/sourcing-list/${itemId}`, { method: 'DELETE' }, accessToken),

  submitSourced: (items: any[], accessToken: string) =>
    apiRequest('/sourcing-list/submit', {
      method: 'POST',
      body: JSON.stringify({ items }),
    }, accessToken),

  getAllLogs: (accessToken: string) =>
    apiRequest('/sourcing-logs', { method: 'GET' }, accessToken),
};

// Tasks API
export const tasksAPI = {
  getAll: (accessToken: string) =>
    apiRequest('/tasks', { method: 'GET' }, accessToken),

  create: (taskData: any, accessToken: string) =>
    apiRequest('/tasks', {
      method: 'POST',
      body: JSON.stringify(taskData),
    }, accessToken),

  update: (taskId: string, updates: any, accessToken: string) =>
    apiRequest(`/tasks/${taskId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    }, accessToken),

  delete: (taskId: string, accessToken: string) =>
    apiRequest(`/tasks/${taskId}`, { method: 'DELETE' }, accessToken),
};

// Email API
export const emailAPI = {
  getAll: (accessToken: string) =>
    apiRequest('/emails', { method: 'GET' }, accessToken),

  getForwarded: (accessToken: string) =>
    apiRequest('/emails/forwarded', { method: 'GET' }, accessToken),

  forward: (emailId: string, volunteerId: string, accessToken: string) =>
    apiRequest(`/emails/${emailId}/forward`, {
      method: 'POST',
      body: JSON.stringify({ volunteerId }),
    }, accessToken),
};

// Calendar API
export const calendarAPI = {
  getEvents: (accessToken: string) =>
    apiRequest('/calendar', { method: 'GET' }, accessToken),

  createFromEmail: (eventData: any, accessToken: string) =>
    apiRequest('/calendar/from-email', {
      method: 'POST',
      body: JSON.stringify(eventData),
    }, accessToken),
};

// Profile API
export const profileAPI = {
  get: (accessToken: string) =>
    apiRequest('/auth/profile', { method: 'GET' }, accessToken),

  update: (updates: any, accessToken: string) =>
    apiRequest('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(updates),
    }, accessToken),
};

// Volunteers API
export const volunteersAPI = {
  getAll: (accessToken: string) =>
    apiRequest('/volunteers', { method: 'GET' }, accessToken),
};

// Init data
export const initData = () =>
  apiRequest('/init-data', { method: 'POST' }, publicAnonKey);