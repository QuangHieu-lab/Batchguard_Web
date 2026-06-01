import axios from 'axios';

// 🚀 Cú pháp chuẩn của Vite (Đã bỏ hẳn process.env để triệt tiêu lỗi TypeScript)
const BASE_URL =  (import.meta as any).env.VITE_WEATHER_BASE_URL || 'https://mylongaiv2.onrender.com';

// =======================================================
// TẠO INSTANCE AXIOS MẶC ĐỊNH
// =======================================================
export const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 15000, // Tự động hủy nếu API phản hồi quá 15 giây
  headers: {
    'Content-Type': 'application/json',
  },
});

// =======================================================
// INTERCEPTORS: XỬ LÝ TRƯỚC KHI GỬI REQUEST
// =======================================================
apiClient.interceptors.request.use(
  (config) => {
    // 💡 Nếu dự án có đăng nhập, bạn mở comment đoạn dưới để tự động nhét Token vào mọi API
    /*
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    */
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// =======================================================
// INTERCEPTORS: XỬ LÝ LỖI TRẢ VỀ TỪ RESPONSE
// =======================================================
apiClient.interceptors.response.use(
  (response) => {
    // Trả về thẳng data để lúc gọi API không cần viết res.data thêm lần nữa
    return response.data;
  },
  (error) => {
    // Bắt và in lỗi rõ ràng ra console để dễ Debug
    console.error('🔥 Lỗi Axios:', error.response?.data || error.message);
    
    // Nếu token hết hạn (401), có thể viết logic tự động Logout hoặc Refresh Token ở đây
    if (error.response?.status === 401) {
      console.warn("Token hết hạn hoặc không hợp lệ!");
      // window.location.href = '/login'; 
    }

    return Promise.reject(error);
  }
);

export default apiClient;