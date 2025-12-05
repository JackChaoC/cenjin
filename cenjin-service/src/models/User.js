const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },
  username: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
    comment: '用户名'
  },
  account: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
    comment: '账号'
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: false,
    comment: '密码'
  }
}, {
  tableName: 'user',
  timestamps: true,
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
});

module.exports = User;
