'use strict';

const bcrypt = require('bcryptjs');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // 生成加密密码
    const hashedPassword = await bcrypt.hash('admin', 10);
    
    // 插入超级管理员
    await queryInterface.bulkInsert('user', [
      {
        username: '超级管理员',
        account: 'admin',
        password: hashedPassword,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  async down (queryInterface, Sequelize) {
    // 删除超级管理员
    await queryInterface.bulkDelete('user', {
      account: 'admin'
    }, {});
  }
};
