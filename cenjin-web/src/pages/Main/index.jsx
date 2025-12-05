import React, { useState, useEffect, useRef } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import './Main.scss';

const Main = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeMenu, setActiveMenu] = useState('home');
  const [expandedMenus, setExpandedMenus] = useState([]);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [username, setUsername] = useState('');
  const userMenuRef = useRef(null);

  const menuItems = [
    { id: 'home', label: '首页', icon: '🏠', path: '/main/home' },
    { id: 'client', label: '客户中心', icon: '👥', path: '/main/client' },
    {
      id: 'orders',
      label: '订单中心',
      icon: '📋',
      path: '/main/orders',
      children: [
        { id: 'member-card', label: '权益卡信息', icon: '💳', path: '/main/orders/member-card' }
      ]
    },
    { id: 'statistics', label: '数据中心', icon: '📊', path: '/main/statistics' },
  ];

  // 加载用户信息
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        setUsername(user.username || user.name || '用户');
      } catch (error) {
        console.error('解析用户信息失败:', error);
        setUsername('用户');
      }
    }
  }, []);

  // 路由变化时更新菜单状态
  useEffect(() => {
    const currentPath = location.pathname;
    // Check main menu items
    const currentItem = menuItems.find(item => item.path === currentPath);
    if (currentItem) {
      setActiveMenu(currentItem.id);
      return;
    }
    // Check sub menu items
    for (const item of menuItems) {
      if (item.children) {
        const subItem = item.children.find(child => child.path === currentPath);
        if (subItem) {
          setActiveMenu(subItem.id);
          if (!expandedMenus.includes(item.id)) {
            setExpandedMenus([...expandedMenus, item.id]);
          }
          return;
        }
      }
    }
  }, [location.pathname]);

  // 点击外部关闭用户菜单
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };

    if (showUserMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showUserMenu]);

  const handleMenuClick = (item) => {
    if (item.children) {
      // Toggle submenu
      if (expandedMenus.includes(item.id)) {
        setExpandedMenus(expandedMenus.filter(id => id !== item.id));
      } else {
        setExpandedMenus([...expandedMenus, item.id]);
      }
    } else {
      setActiveMenu(item.id);
      navigate(item.path);
    }
  };

  const handleSubMenuClick = (e, child) => {
    setActiveMenu(child.id);
    navigate(child.path);
  };

  const toggleUserMenu = () => {
    setShowUserMenu(!showUserMenu);
  };

  const handleLogout = () => {
    // 清除本地存储
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    // 跳转到登录页
    navigate('/login');
  };

  return (
    <div className="main-container">
      <aside className="sidebar">
        <div className="logo">
          <span className="logo-icon">🌊</span>
          <span className="logo-text">岑津科技</span>
        </div>
        <nav className="menu">
          {menuItems.map(item => (
            <div key={item.id}>
              <div
                className={`menu-item ${activeMenu === item.id ? 'active' : ''} ${item.children ? 'has-children' : ''}`}
                onClick={() => handleMenuClick(item)}
              >
                <span className="menu-icon">{item.icon}</span>
                <span className="menu-label">{item.label}</span>
                {item.children && (
                  <span className={`menu-arrow ${expandedMenus.includes(item.id) ? 'expanded' : ''}`}>
                    ▼
                  </span>
                )}
              </div>
              {item.children && expandedMenus.includes(item.id) && (
                <div className="submenu">
                  {item.children.map(child => (
                    <div
                      key={child.id}
                      className={`submenu-item ${activeMenu === child.id ? 'active' : ''}`}
                      onClick={(e) => handleSubMenuClick(e, child)}
                    >
                      <span className="menu-icon">{child.icon}</span>
                      <span className="menu-label">{child.label}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>
      </aside>
      <main className="content">
        <header className="header">
          <div className="breadcrumb">
            <span className="breadcrumb-icon">📍</span>
            <span className="breadcrumb-text">首页</span>
          </div>
          <div className="user-info" ref={userMenuRef}>
            <span className="username-text">Hi {username}</span>
            <span 
              className={`dropdown-arrow ${showUserMenu ? 'open' : ''}`}
              onClick={toggleUserMenu}
            >
              ▼
            </span>
            {showUserMenu && (
              <div className="user-dropdown-menu">
                <div className="dropdown-item" onClick={handleLogout}>
                  <span className="dropdown-icon">🚪</span>
                  <span>退出登录</span>
                </div>
              </div>
            )}
          </div>
        </header>
        <div className="main-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Main;
