import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authApi } from '../../services/endpoints';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'customer' | 'producer' | 'premium' | 'disabled'; 
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
  refetchUser: () => Promise<void>; // 🚀 THÊM HÀM NÀY ĐỂ GỌI SAU KHI THANH TOÁN
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const logout = () => {
    setUser(null);
    localStorage.removeItem('mylongai_user');
    localStorage.removeItem('access_token');
  };

  // 🚀 Tách riêng logic lấy Profile để tái sử dụng
  const refetchUser = async () => {
    try {
      const storedUser = localStorage.getItem('mylongai_user');
      if (!storedUser) return;

      const profile: any = await authApi.getProfile();
      
      if (profile.role === 'disabled') {
        logout(); 
      } else {
        // Lấy dữ liệu cũ, ghi đè role mới nhất từ API
        const updatedUser = {
          ...JSON.parse(storedUser),
          role: profile.role
        };
        
        // Lưu lại LocalStorage bản mới nhất
        localStorage.setItem('mylongai_user', JSON.stringify(updatedUser));
        setUser(updatedUser);
      }
    } catch (error) {
      console.error("Lỗi đồng bộ profile:", error);
      // logout(); // Tùy chọn: Bạn có thể bật lại dòng này nếu muốn ép logout khi API sập
    }
  };

  useEffect(() => {
    const checkSession = async () => {
      const storedUser = localStorage.getItem('mylongai_user');
      const token = localStorage.getItem('access_token');

      if (storedUser && token) {
        // Nạp tạm dữ liệu cũ để giao diện load nhanh
        setUser(JSON.parse(storedUser));
        // Sau đó âm thầm gọi API đồng bộ lại Role mới nhất
        await refetchUser();
      }
      setIsLoading(false);
    };

    checkSession();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);

    try {
      const response: any = await authApi.login({ email, password });
      
      if (response.role === 'disabled') {
        throw new Error('Tài khoản của bạn đã bị khóa bởi Quản trị viên');
      }

      const loggedInUser: User = {
        id: response.user_id,
        email: email,
        name: response.name,
        role: response.role
      };

      localStorage.setItem('access_token', response.access_token);
      localStorage.setItem('mylongai_user', JSON.stringify(loggedInUser));

      setUser(loggedInUser);
    } catch (error: any) {
      console.error('Login error:', error);
      throw error; 
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, password: string, name: string) => {
    setIsLoading(true);

    try {
      const response: any = await authApi.register({ email, password, name });
      
      if (response.success) {
        await login(email, password);
      } else {
        throw new Error('Registration failed');
      }
    } catch (error: any) {
      console.error('Register error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        refetchUser, // 🚀 Cung cấp hàm này ra ngoài
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}