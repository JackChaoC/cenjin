const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

/**
 * 会员卡模型
 */
const MemberCard = sequelize.define('MemberCard', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },
  batchNumber: {
    type: DataTypes.STRING(50),
    allowNull: false,
    comment: '批次号'
  },
  merchant: {
    type: DataTypes.STRING(200),
    allowNull: false,
    comment: '商户'
  },
  supplier: {
    type: DataTypes.STRING(200),
    allowNull: false,
    comment: '供应商'
  },
  productName: {
    type: DataTypes.STRING(200),
    allowNull: false,
    comment: '商品名称'
  },
  faceValue: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    comment: '面值'
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    comment: '售价'
  },
  cardNumber: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
    comment: '卡号'
  },
  cardPassword: {
    type: DataTypes.STRING(100),
    allowNull: false,
    comment: '卡密'
  },
  orderTime: {
    type: DataTypes.DATE,
    allowNull: false,
    comment: '订单时间'
  },
  status: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: '已出库',
    comment: '状态'
  },
  importPrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    comment: '进价'
  }
}, {
  tableName: 'member_card',
  timestamps: true,
  comment: '会员卡表'
});

module.exports = MemberCard;
