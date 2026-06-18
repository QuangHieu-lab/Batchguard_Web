import apiClient from './api';

// ============================================================================
// 1. AUTHENTICATION
// ============================================================================
export const authApi = {
  login: (data: any) => apiClient.post('/auth/login', data),
  register: (data: any) => apiClient.post('/auth/register', data),
  getProfile: () => apiClient.get('/auth/profile'),
};

// ============================================================================
// 2. CAMERA MANAGEMENT
// ============================================================================
export const cameraApi = {
  create: (data: any) => apiClient.post('/camera', data),
  getAll: () => apiClient.get('/camera'),
  getById: (id: string) => apiClient.get(`/camera/${id}`),
  update: (id: string, data: any) => apiClient.put(`/camera/${id}`, data),
  delete: (id: string) => apiClient.delete(`/camera/${id}`),
};

// ============================================================================
// 3. SENSOR & ENVIRONMENT
// ============================================================================
export const sensorApi = {
  getLatest: (cameraId: string) => apiClient.get(`/sensor/latest/${cameraId}`),
  getHistory: (cameraId: string, limit: number = 50) => apiClient.get(`/sensor/history/${cameraId}?limit=${limit}`),
};

// ============================================================================
// 4. DETECTION (YOLO AI)
// ============================================================================
export const detectionApi = {
  getLatest: (cameraId: string) => apiClient.get(`/detection/latest/${cameraId}`),
};

// ============================================================================
// 5. PREDICTION (Dryness AI)
// ============================================================================
export const predictionApi = {
  getLatest: (cameraId: string) => apiClient.get(`/prediction/latest/${cameraId}`),
};

// ============================================================================
// 6. NOTIFICATION & WEATHER
// ============================================================================
export const notificationApi = {
  getByUserId: (userId: string) => apiClient.get(`/notification/${userId}`),
};

export const weatherApi = {
  analyze: (lat: number = 10.226, lon: number = 106.421, save: boolean = true) => 
    apiClient.get(`/weather/analyze?lat=${lat}&lon=${lon}&save=${save}`),
};

// ============================================================================
// 7. ADMIN DASHBOARD & REVENUE
// ============================================================================
export const adminApi = {
  getOverview: () => apiClient.get('/dashboard/admin'),
  getConfidenceChart: () => apiClient.get('/dashboard/admin/confidence-chart'),
  getDrynessChart: () => apiClient.get('/dashboard/admin/dryness-chart'),
  getSubscriptions: () => apiClient.get('/subscriptions'),
  getRevenueStatistics: () => apiClient.get('/subscriptions/statistics'),
};

// ============================================================================
// 8. USER MANAGEMENT
// ============================================================================
export const userApi = {
  getAll: () => apiClient.get('/users'),
  getById: (id: string) => apiClient.get(`/users/${id}`),
  disableUser: (id: string) => apiClient.patch(`/users/${id}/disable`),
  enableUser: (id: string) => apiClient.patch(`/users/${id}/enable`),
};
