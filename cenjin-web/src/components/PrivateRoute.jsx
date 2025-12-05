import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

/**
 * 私有路由组件
 * 用于保护需要认证才能访问的页面
 */
const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  // 如果正在加载认证状态，显示加载中
  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '16px',
        color: '#666'
      }}>
        加载中...
      </div>
    );
  }

  // 如果未认证，重定向到登录页
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // 已认证，渲染子组件
  return children;
};

export default PrivateRoute;
