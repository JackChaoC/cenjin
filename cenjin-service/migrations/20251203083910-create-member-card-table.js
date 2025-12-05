'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('member_card', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      batchNumber: {
        type: Sequelize.STRING(50),
        allowNull: false,
        comment: '批次号'
      },
      merchant: {
        type: Sequelize.STRING(200),
        allowNull: false,
        comment: '商户'
      },
      supplier: {
        type: Sequelize.STRING(200),
        allowNull: false,
        comment: '供应商'
      },
      productName: {
        type: Sequelize.STRING(200),
        allowNull: false,
        comment: '商品名称'
      },
      faceValue: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        comment: '面值'
      },
      price: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        comment: '售价'
      },
      cardNumber: {
        type: Sequelize.STRING(100),
        allowNull: false,
        unique: true,
        comment: '卡号'
      },
      cardPassword: {
        type: Sequelize.STRING(100),
        allowNull: false,
        comment: '卡密'
      },
      orderTime: {
        type: Sequelize.DATE,
        allowNull: false,
        comment: '订单时间'
      },
      status: {
        type: Sequelize.STRING(20),
        allowNull: false,
        defaultValue: '已出库',
        comment: '状态'
      },
      importPrice: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        comment: '进价'
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
      }
    }, {
      charset: 'utf8mb4',
      collate: 'utf8mb4_unicode_ci',
      comment: '会员卡表'
    });

    // 添加索引
    await queryInterface.addIndex('member_card', ['batchNumber'], {
      name: 'idx_batch_number'
    });

    await queryInterface.addIndex('member_card', ['orderTime'], {
      name: 'idx_order_time'
    });

    await queryInterface.addIndex('member_card', ['status'], {
      name: 'idx_status'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('member_card');
  }
};
