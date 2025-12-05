import React, { useState, useCallback } from 'react';
import Toast from './index';

let toastId = 0;

/**
 * Toast 容器组件
 * 管理多个 Toast 的显示
 */
const ToastContainer = () => {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  // 暴露全局方法
  if (typeof window !== 'undefined') {
    window.showToast = (message, type = 'info', duration = 3000) => {
      const id = toastId++;
      setToasts((prev) => [...prev, { id, message, type, duration }]);
    };
  }

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 9999 }}>
      {toasts.map((toast, index) => (
        <div key={toast.id} style={{ marginTop: index > 0 ? '10px' : '0' }}>
          <Toast
            message={toast.message}
            type={toast.type}
            duration={toast.duration}
            onClose={() => removeToast(toast.id)}
          />
        </div>
      ))}
    </div>
  );
};

// 导出便捷方法
export const showToast = {
  success: (message, duration = 3000) => {
    if (window.showToast) window.showToast(message, 'success', duration);
  },
  error: (message, duration = 3000) => {
    if (window.showToast) window.showToast(message, 'error', duration);
  },
  warning: (message, duration = 3000) => {
    if (window.showToast) window.showToast(message, 'warning', duration);
  },
  info: (message, duration = 3000) => {
    if (window.showToast) window.showToast(message, 'info', duration);
  }
};

export default ToastContainer;
