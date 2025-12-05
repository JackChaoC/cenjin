import React, { createContext, useState, useContext, useEffect } from 'react';
import { getCurrentUser } from '../api/auth';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // 初始化时从 localStorage 读取认证信息
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
      
      // 验证 token 是否仍然有效
      verifyAuth(storedToken);
    } else {
      setLoading(false);
    }
  }, []);

  // 验证认证信息
  const verifyAuth = async (tokenToVerify) => {
    try {
      const response = await getCurrentUser();
      if (response.success) {
        setUser(response.data);
      } else {
        // Token 无效，清除认证信息
        clearAuth();
      }
    } catch (error) {
      console.error('验证认证失败:', error);
      clearAuth();
    } finally {
      setLoading(false);
    }
  };

  // 登录
  const loginAuth = (userData, userToken) => {
    setUser(userData);
    setToken(userToken);
    localStorage.setItem('token', userToken);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  // 登出
  const logoutAuth = () => {
    clearAuth();
    window.location.href = '/login';
  };

  // 清除认证信息
  const clearAuth = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!token && !!user,
    login: loginAuth,
    logout: logoutAuth
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// 自定义 Hook 方便使用
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth 必须在 AuthProvider 内部使用');
  }
  return context;
};

export default AuthContext;
