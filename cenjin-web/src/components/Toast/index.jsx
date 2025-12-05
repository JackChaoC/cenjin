import React, { useEffect, useState } from 'react';
import './Toast.scss';

/**
 * Toast 提示组件
 * @param {string} message - 提示消息
 * @param {string} type - 类型: 'success' | 'error' | 'warning' | 'info'
 * @param {number} duration - 停留时间（毫秒），默认 3000ms
 * @param {function} onClose - 关闭回调
 */
const Toast = ({ message, type = 'info', duration = 3000, onClose }) => {
  const [visible, setVisible] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    // 设置淡出动画
    const fadeTimer = setTimeout(() => {
      setFadeOut(true);
    }, duration - 500); // 提前 500ms 开始淡出

    // 设置关闭
    const closeTimer = setTimeout(() => {
      setVisible(false);
      if (onClose) onClose();
    }, duration);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(closeTimer);
    };
  }, [duration, onClose]);

  if (!visible) return null;

  // 根据类型选择图标
  const getIcon = () => {
    switch (type) {
      case 'success':
        return '✓';
      case 'error':
        return '✕';
      case 'warning':
        return '⚠';
      case 'info':
      default:
        return 'ℹ';
    }
  };

  return (
    <div className={`toast toast-${type} ${fadeOut ? 'toast-fade-out' : ''}`}>
      <span className="toast-icon">{getIcon()}</span>
      <span className="toast-message">{message}</span>
    </div>
  );
};

export default Toast;
