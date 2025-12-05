import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { login } from '../../api/auth';
import './Login.scss';

const Login = () => {
  const navigate = useNavigate();
  const { login: authLogin, isAuthenticated } = useAuth();
  const [account, setAccount] = useState('');
  const [password, setPassword] = useState('');
  const [captcha, setCaptcha] = useState('');
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // 如果已经登录，重定向到主页
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/main/home', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // 初始化时从 localStorage 读取记住的账号
  useEffect(() => {
    const rememberedAccount = localStorage.getItem('rememberedAccount');
    if (rememberedAccount) {
      setAccount(rememberedAccount);
      setRemember(true);
    }
  }, []);

  const handleLogin = async () => {
    try {
      // 清除之前的错误信息
      setError('');
      
      // 验证表单
      if (!account) {
        setError('请输入账号');
        return;
      }
      if (!password) {
        setError('请输入密码');
        return;
      }
      if (!captcha) {
        setError('请输入验证码');
        return;
      }
      
      // 简单的验证码校验（8 - 2 = ?）
      if (captcha !== '6') {
        setError('验证码错误');
        return;
      }

      setLoading(true);

      // 调用登录 API
      const response = await login(account, password);

      if (response.success) {
        // 使用 AuthContext 保存认证信息
        authLogin(response.data.user, response.data.token);
        
        // 如果选择记住密码
        if (remember) {
          localStorage.setItem('rememberedAccount', account);
        } else {
          localStorage.removeItem('rememberedAccount');
        }

        // 跳转到主页
        navigate('/main/home');
      }
    } catch (err) {
      setError(err.message || '登录失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  // 处理回车键登录
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleLogin();
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-left">
        <div className="login-left-content">
          <h1>欢迎回来</h1>
          <p>登录以继续访问你的账户</p>
        </div>
      </div>
      <div className="login-right">
        <h2 className="login-title">岑津管理系统</h2>
        <div className="login-form">
          <div className="form-item">
            <div className="input-wrapper">
              {/* User Icon SVG */}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '10px' }}>
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
              <input 
                type="text" 
                placeholder="账号" 
                value={account}
                onChange={(e) => setAccount(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={loading}
              />
            </div>
          </div>
          <div className="form-item">
            <div className="input-wrapper">
              {/* Lock Icon SVG */}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '10px' }}>
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
              <input 
                type="password" 
                placeholder="密码" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={loading}
              />
              <span className="forgot-password">忘记密码?</span>
            </div>
          </div>
          <div className="form-item">
            <div className="captcha-wrapper">
              <div className="input-wrapper captcha-input">
                <input 
                  type="text" 
                  placeholder="验证码" 
                  value={captcha}
                  onChange={(e) => setCaptcha(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={loading}
                />
              </div>
              <div className="captcha-image">
                {/* Placeholder for captcha image */}
                <span style={{ fontStyle: 'italic', fontWeight: 'bold', color: '#40a9ff' }}>8 - 2 = ?</span>
              </div>
            </div>
          </div>
          <div className="remember-me">
            <input 
              type="checkbox" 
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              id="remember"
              disabled={loading}
            />
            <label htmlFor="remember">记住密码</label>
          </div>
          
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}
          
          <button 
            className="login-button" 
            onClick={handleLogin}
            disabled={loading}
          >
            {loading ? '登录中...' : '登 录'}
          </button>
        </div>
        <div className="copyright">
          © 岑津科技 版权所有
        </div>
      </div>
    </div>
    </div>
  );
};

export default Login;
