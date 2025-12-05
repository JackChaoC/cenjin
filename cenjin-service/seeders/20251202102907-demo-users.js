'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // 注意：在生产环境中，密码应该使用 bcrypt 等加密库进行哈希处理
    await queryInterface.bulkInsert('user', [
      {
        username: 'admin',
        account: 'admin',
        password: 'admin123', // 实际应用中应该加密
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        username: '测试用户',
        account: 'test',
        password: 'test123', // 实际应用中应该加密
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        username: '岑津管理员',
        account: 'cenjin_admin',
        password: 'cenjin123', // 实际应用中应该加密
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('user', null, {});
  }
};
