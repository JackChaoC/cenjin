const { Sequelize } = require('sequelize');
require('dotenv').config();

// 从环境变量或配置文件读取数据库配置
const config = require('../../config/config.js')[process.env.NODE_ENV || 'development'];

// 创建 Sequelize 实例
const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  {
    host: config.host,
    port: config.port,
    dialect: config.dialect,
    logging: false, // 设置为 console.log 可以看到 SQL 语句
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

// 测试数据库连接
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ 数据库连接成功！');
  } catch (error) {
    console.error('❌ 数据库连接失败:', error.message);
  }
};

module.exports = {
  sequelize,
  testConnection
};
