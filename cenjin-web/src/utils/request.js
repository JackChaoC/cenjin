import axios from 'axios';

// 创建 axios 实例
const request = axios.create({
  baseURL: 'http://localhost:3000/api', // Docker 环境下前端通过浏览器访问后端
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// 请求拦截器
request.interceptors.request.use(
  (config) => {
    // 从 localStorage 获取 token
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('请求错误:', error);
    return Promise.reject(error);
  }
);

// 响应拦截器
request.interceptors.response.use(
  (response) => {
    // 如果是文件下载（blob类型），直接返回
    if (response.config.responseType === 'blob') {
      return response.data;
    }
    
    const res = response.data;
    
    // 如果响应成功
    if (res.success) {
      return res;
    } else {
      // 业务错误
      console.error('业务错误:', res.message);
      return Promise.reject(new Error(res.message || '请求失败'));
    }
  },
  (error) => {
    // HTTP 错误
    console.error('HTTP 错误:', error);
    
    if (error.response) {
      const { status, data } = error.response;
      
      switch (status) {
        case 401:
          // 未授权，清除 token 并跳转到登录页
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
          break;
        case 403:
          console.error('没有权限访问');
          break;
        case 404:
          console.error('请求的资源不存在');
          break;
        case 500:
          console.error('服务器错误');
          break;
        default:
          console.error(`错误 ${status}: ${data?.message || '未知错误'}`);
      }
      
      return Promise.reject(new Error(data?.message || '请求失败'));
    } else if (error.request) {
      console.error('网络错误，请检查网络连接');
      return Promise.reject(new Error('网络错误，请检查网络连接'));
    } else {
      console.error('请求配置错误:', error.message);
      return Promise.reject(error);
    }
  }
);

export default request;
