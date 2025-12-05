import request from '../utils/request';

/**
 * 用户登录
 * @param {string} account - 账号
 * @param {string} password - 密码
 * @returns {Promise}
 */
export const login = (account, password) => {
  return request({
    url: '/auth/login',
    method: 'post',
    data: { account, password }
  });
};

/**
 * 用户注册
 * @param {string} username - 用户名
 * @param {string} account - 账号
 * @param {string} password - 密码
 * @returns {Promise}
 */
export const register = (username, account, password) => {
  return request({
    url: '/auth/register',
    method: 'post',
    data: { username, account, password }
  });
};

/**
 * 验证 token
 * @param {string} token - JWT token
 * @returns {Promise}
 */
export const verifyToken = (token) => {
  return request({
    url: '/auth/verify',
    method: 'post',
    data: { token }
  });
};

/**
 * 获取当前用户信息
 * @returns {Promise}
 */
export const getCurrentUser = () => {
  return request({
    url: '/auth/me',
    method: 'get'
  });
};

/**
 * 刷新 token
 * @param {string} token - 旧的 token
 * @returns {Promise}
 */
export const refreshToken = (token) => {
  return request({
    url: '/auth/refresh',
    method: 'post',
    data: { token }
  });
};

/**
 * 用户登出
 */
export const logout = () => {
  // 清除本地存储
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  // 跳转到登录页
  window.location.href = '/login';
};
