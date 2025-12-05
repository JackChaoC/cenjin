const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { testConnection } = require('./config/database');
const { authRoutes, memberCardRoutes } = require('./routes');
const logger = require('./middlewares/logger.middleware');

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 日志中间件（放在路由之前）
app.use(logger);

// 路由
app.get('/', (req, res) => {
  res.json({ 
    message: '欢迎使用岑津科技管理系统 API',
    version: '1.0.0'
  });
});

// 示例 API 路由
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok',
    timestamp: new Date().toISOString()
  });
});

// 认证路由
app.use('/api/auth', authRoutes);

// 会员卡路由
app.use('/api/member-card', memberCardRoutes);

// 启动服务器
app.listen(PORT, async () => {
  console.log(`🚀 岑津科技服务端运行在 http://localhost:${PORT}`);
  // 测试数据库连接
  await testConnection();
});
