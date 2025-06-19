import { useState, useEffect, createContext, useContext } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { AuthFunctionalService, User } from '../../lib/new/AuthFunctionalService';
import { useToast } from '../use-toast';
import { queryClient } from '../../lib/queryClient';

// Tạo context để quản lý và chia sẻ trạng thái đăng nhập
interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  error: Error | null;
  login: (credentials: { username: string; password: string }) => Promise<void>;
  register: (userData: any) => Promise<void>;
  logout: () => Promise<void>;
  forgotPassword: (username: string) => Promise<{ success: boolean; message: string }>;
  updateUser: (userData: Partial<User>) => Promise<void>;
  hasRole: (role: string) => boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

// Provider component để bao bọc ứng dụng
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [sessionRestored, setSessionRestored] = useState(false);

  // Khôi phục session từ localStorage khi component mount
  useEffect(() => {
    const restoredUser = AuthFunctionalService.restoreSession();
    if (restoredUser) {
      setUser(restoredUser);
    }
    setSessionRestored(true);
  }, []);

  // Query để lấy thông tin người dùng hiện tại (chỉ chạy khi đã restore session và có token)
  const {
    data: currentUser,
    isLoading,
    error
  } = useQuery({
    queryKey: ['/api/user'],
    queryFn: () => AuthFunctionalService.getCurrentUser(),
    enabled: sessionRestored && AuthFunctionalService.hasValidSession(), // Chỉ chạy khi có session hợp lệ
    retry: false, // Không retry nếu fail
    staleTime: 5 * 60 * 1000, // Cache 5 phút
  });

  // Cập nhật state khi có dữ liệu từ query
  useEffect(() => {
    if (currentUser) {
      setUser(currentUser);
    } else if (error && sessionRestored) {
      // Nếu có lỗi authentication, clear session
      console.log('Auth error detected, clearing session:', error);
      AuthFunctionalService.restoreSession(); // Reset lại session
      setUser(null);
    }
  }, [currentUser, error, sessionRestored]);

  // Mutation đăng nhập
  const loginMutation = useMutation({
    mutationFn: (credentials: { username: string; password: string }) => 
      AuthFunctionalService.login(credentials),
    onSuccess: (data) => {
      setUser(data);
      queryClient.invalidateQueries({ queryKey: ['/api/user'] });
      toast({
        title: "Đăng nhập thành công",
        description: `Chào mừng trở lại, ${data.username}!`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Đăng nhập thất bại",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Mutation đăng ký
  const registerMutation = useMutation({
    mutationFn: (userData: any) => AuthFunctionalService.register(userData),
    onSuccess: (data) => {
      setUser(data);
      queryClient.invalidateQueries({ queryKey: ['/api/user'] });
      toast({
        title: "Đăng ký thành công",
        description: "Tài khoản của bạn đã được tạo thành công",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Đăng ký thất bại",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Mutation đăng xuất
  const logoutMutation = useMutation({
    mutationFn: () => AuthFunctionalService.logout(),
    onSuccess: () => {
      setUser(null);
      queryClient.invalidateQueries({ queryKey: ['/api/user'] });
      toast({
        title: "Đăng xuất thành công",
        description: "Bạn đã đăng xuất khỏi hệ thống",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Đăng xuất thất bại",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Mutation quên mật khẩu
  const forgotPasswordMutation = useMutation({
    mutationFn: (username: string) => AuthFunctionalService.forgotPassword(username),
    onSuccess: (data) => {
      toast({
        title: "Yêu cầu thành công",
        description: data.message,
      });
      return data;
    },
    onError: (error: Error) => {
      toast({
        title: "Yêu cầu thất bại",
        description: error.message,
        variant: "destructive",
      });
      return { success: false, message: error.message };
    }
  });

  // Mutation cập nhật thông tin người dùng
  const updateUserMutation = useMutation({
    mutationFn: (userData: Partial<User>) => AuthFunctionalService.updateUser(userData),
    onSuccess: (data) => {
      setUser(data);
      queryClient.invalidateQueries({ queryKey: ['/api/user'] });
      toast({
        title: "Cập nhật thành công",
        description: "Thông tin tài khoản của bạn đã được cập nhật",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Cập nhật thất bại",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Hàm kiểm tra quyền
  const hasRole = (role: string) => {
    return AuthFunctionalService.hasRole(role, user);
  };

  // Các hàm wrapper
  const login = async (credentials: { username: string; password: string }) => {
    await loginMutation.mutateAsync(credentials);
  };

  const register = async (userData: any) => {
    await registerMutation.mutateAsync(userData);
  };

  const logout = async () => {
    await logoutMutation.mutateAsync();
  };

  const forgotPassword = async (username: string) => {
    return await forgotPasswordMutation.mutateAsync(username);
  };

  const updateUser = async (userData: Partial<User>) => {
    await updateUserMutation.mutateAsync(userData);
  };

  const value = {
    user,
    isLoading,
    error: error as Error | null,
    login,
    register,
    logout,
    forgotPassword,
    updateUser,
    hasRole
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Hook để sử dụng Auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  // Helper function to get user initials
  const getInitials = () => {
  if (!context.user) return '';

  // Vẫn destructure như bình thường
  const { firstName, lastName } = context.user;

  // Sử dụng || '' để đảm bảo biến luôn là một chuỗi.
  // Nếu firstName là null, nó sẽ lấy giá trị là ''.
  const first = firstName || ''; 
  const last = lastName || '';

  // Bây giờ việc gọi .charAt(0) đã hoàn toàn an toàn
  return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase();
};

  return {
    ...context,
    user: context.user,
    getInitials
  };
}