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
  createEspData: (data: { camera_id: string; temperature: number; humidity: number }) => 
    apiClient.post('/iot/sensor-data', data),
};

// ============================================================================
// 4. DETECTION (YOLO AI)
// ============================================================================
export const detectionApi = {
  getLatest: (cameraId: string) => apiClient.get(`/detection/latest/${cameraId}`),
  // THÊM DÒNG NÀY ĐỂ PUSH DATA LÊN SERVER:
  create: (data: { camera_id: string; detected_count: number; confidence: number }) => 
    apiClient.post('/iot/detection-result', data),
};

// ============================================================================
// 5. PREDICTION (Dryness AI)
// ============================================================================
export const predictionApi = {
  getLatest: (cameraId: string) => apiClient.get(`/prediction/latest/${cameraId}`),
  create: (data: { camera_id: string; temperature: number; humidity: number; predicted_minutes: number }) => 
    apiClient.post('/iot/dryness-result', data),
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
  getOverview: () => apiClient.get('/dashboard/overview'),
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
  updateUser: (id: string, data: any) => apiClient.put(`/users/${id}`, data),
  deleteUser: (id: string) => apiClient.delete(`/users/${id}`),
};
export const paymentApi = {
  // Tạo đơn hàng mới (Lấy mã QR)
  createOrder: () => apiClient.post('/payment/create-order'),
  
  // Kiểm tra trạng thái đơn hàng (Đã chuyển khoản chưa)
  getStatus: () => apiClient.get('/payment/status'),
  
  // GHI CHÚ: Không đưa /payment/webhook vào đây vì Webhook là Server-to-Server, 
  // do ngân hàng/SePay gọi thẳng vào Backend, Frontend không sử dụng.
};
export const voiceApi = {
  getAlert: (level: 'low' | 'medium' | 'high') => 
    apiClient.get(`/voice/alert`, { 
      params: { level },
      responseType: 'blob' // Bắt buộc phải có dòng này để nhận file MP3
    }),
};