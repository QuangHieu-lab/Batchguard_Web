import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authApi } from '../../services/endpoints';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'customer' | 'producer' | 'disabled'; // Thêm disabled vào type để khỏi lỗi TS
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Dời hàm logout lên đây để useEffect bên dưới có thể gọi được khi phát hiện user bị khóa
  const logout = () => {
    setUser(null);
    localStorage.removeItem('mylongai_user');
    localStorage.removeItem('access_token');
  };

  // Check for existing session on mount
  useEffect(() => {
    const checkSession = async () => {
      const storedUser = localStorage.getItem('mylongai_user');
      const token = localStorage.getItem('access_token');

      if (storedUser && token) {
        try {
          // Gọi API để check xem user có đang bị admin khóa không
          const profile: any = await authApi.getProfile();
          
          if (profile.role === 'disabled') {
            logout(); // Bị admin khóa -> Xóa session
          } else {
            setUser(JSON.parse(storedUser));
          }
        } catch (error) {
          logout(); // Token lỗi hoặc hết hạn -> Xóa session
        }
      }
      setIsLoading(false);
    };

    checkSession();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);

    try {
      const response: any = await authApi.login({ email, password });
      
      // 🚀 CHẶN NGAY TẠI ĐÂY NẾU ROLE BỊ KHÓA
      if (response.role === 'disabled') {
        throw new Error('Tài khoản của bạn đã bị khóa bởi Quản trị viên');
      }

      const loggedInUser: User = {
        id: response.user_id,
        email: email,
        name: response.name,
        role: response.role
      };

      // Save token and user
      localStorage.setItem('access_token', response.access_token);
      localStorage.setItem('mylongai_user', JSON.stringify(loggedInUser));

      setUser(loggedInUser);
    } catch (error: any) {
      console.error('Login error:', error);
      throw error; // Quăng lỗi ra để Login screen hiện thông báo
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