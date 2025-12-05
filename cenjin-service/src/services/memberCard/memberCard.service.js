const MemberCard = require('../../models/MemberCard');
const { Op } = require('sequelize');

/**
 * 会员卡服务
 */
class MemberCardService {
  /**
   * 创建会员卡
   * @param {Object} cardData - 会员卡数据
   * @returns {Object}
   */
  async create(cardData) {
    try {
      const {
        batchNumber,
        merchant,
        supplier,
        productName,
        faceValue,
        price,
        cardNumber,
        cardPassword,
        orderTime,
        status,
        importPrice
      } = cardData;

      // 验证必填字段
      if (!batchNumber || !merchant || !supplier || !productName || 
          !faceValue || !price || !cardNumber || !cardPassword || 
          !orderTime || !importPrice) {
        throw new Error('缺少必填字段');
      }

      // 检查卡号是否已存在
      const existingCard = await MemberCard.findOne({
        where: { cardNumber }
      });

      if (existingCard) {
        throw new Error('卡号已存在');
      }

      // 创建会员卡
      const card = await MemberCard.create({
        batchNumber,
        merchant,
        supplier,
        productName,
        faceValue,
        price,
        cardNumber,
        cardPassword,
        orderTime,
        status: status || '已出库',
        importPrice
      });

      return {
        success: true,
        message: '会员卡创建成功',
        data: card
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || '会员卡创建失败'
      };
    }
  }

  /**
   * 批量创建会员卡
   * @param {Array} cardsData - 会员卡数据数组
   * @returns {Object}
   */
  async bulkCreate(cardsData) {
    try {
      if (!Array.isArray(cardsData) || cardsData.length === 0) {
        throw new Error('无效的会员卡数据');
      }

      // 批量创建
      const cards = await MemberCard.bulkCreate(cardsData, {
        validate: true,
        ignoreDuplicates: true
      });

      return {
        success: true,
        message: `成功导入 ${cards.length} 张会员卡`,
        data: cards
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || '批量创建失败'
      };
    }
  }

  /**
   * 查询会员卡列表（支持分页和筛选）
   * @param {Object} query - 查询条件
   * @returns {Object}
   */
  async findAll(query = {}) {
    try {
      const {
        page = 1,
        pageSize = 20,
        batchNumber,
        cardNumber,
        status,
        startDate,
        endDate,
        sortBy = 'orderTime',
        sortOrder = 'DESC'
      } = query;

      // 构建查询条件
      const where = {};

      if (batchNumber) {
        where.batchNumber = {
          [Op.like]: `%${batchNumber}%`
        };
      }

      if (cardNumber) {
        where.cardNumber = {
          [Op.like]: `%${cardNumber}%`
        };
      }

      if (status) {
        where.status = status;
      }

      // 日期范围查询
      if (startDate || endDate) {
        where.orderTime = {};
        if (startDate) {
          // 开始日期：从当天 00:00:00 开始
          where.orderTime[Op.gte] = new Date(startDate + ' 00:00:00');
        }
        if (endDate) {
          // 结束日期：到当天 23:59:59 结束
          where.orderTime[Op.lte] = new Date(endDate + ' 23:59:59');
        }
      }

      // 计算偏移量
      const offset = (page - 1) * pageSize;

      // 查询数据
      const { count, rows } = await MemberCard.findAndCountAll({
        where,
        limit: parseInt(pageSize),
        offset: parseInt(offset),
        order: [[sortBy, sortOrder]]
      });

      return {
        success: true,
        data: {
          list: rows,
          pagination: {
            total: count,
            page: parseInt(page),
            pageSize: parseInt(pageSize),
            totalPages: Math.ceil(count / pageSize)
          }
        }
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || '查询失败'
      };
    }
  }

  /**
   * 根据 ID 查询单个会员卡
   * @param {number} id - 会员卡 ID
   * @returns {Object}
   */
  async findById(id) {
    try {
      const card = await MemberCard.findByPk(id);

      if (!card) {
        throw new Error('会员卡不存在');
      }

      return {
        success: true,
        data: card
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || '查询失败'
      };
    }
  }

  /**
   * 根据卡号查询
   * @param {string} cardNumber - 卡号
   * @returns {Object}
   */
  async findByCardNumber(cardNumber) {
    try {
      const card = await MemberCard.findOne({
        where: { cardNumber }
      });

      if (!card) {
        throw new Error('会员卡不存在');
      }

      return {
        success: true,
        data: card
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || '查询失败'
      };
    }
  }

  /**
   * 更新会员卡
   * @param {number} id - 会员卡 ID
   * @param {Object} updateData - 更新数据
   * @returns {Object}
   */
  async update(id, updateData) {
    try {
      const card = await MemberCard.findByPk(id);

      if (!card) {
        throw new Error('会员卡不存在');
      }

      // 如果更新卡号，检查是否重复
      if (updateData.cardNumber && updateData.cardNumber !== card.cardNumber) {
        const existingCard = await MemberCard.findOne({
          where: { 
            cardNumber: updateData.cardNumber,
            id: { [Op.ne]: id }
          }
        });

        if (existingCard) {
          throw new Error('卡号已存在');
        }
      }

      // 更新会员卡
      await card.update(updateData);

      return {
        success: true,
        message: '会员卡更新成功',
        data: card
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || '更新失败'
      };
    }
  }

  /**
   * 删除会员卡
   * @param {number} id - 会员卡 ID
   * @returns {Object}
   */
  async delete(id) {
    try {
      const card = await MemberCard.findByPk(id);

      if (!card) {
        throw new Error('会员卡不存在');
      }

      await card.destroy();

      return {
        success: true,
        message: '会员卡删除成功'
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || '删除失败'
      };
    }
  }

  /**
   * 批量删除会员卡
   * @param {Array} ids - 会员卡 ID 数组
   * @returns {Object}
   */
  async bulkDelete(ids) {
    try {
      if (!Array.isArray(ids) || ids.length === 0) {
        throw new Error('无效的 ID 列表');
      }

      const deletedCount = await MemberCard.destroy({
        where: {
          id: {
            [Op.in]: ids
          }
        }
      });

      return {
        success: true,
        message: `成功删除 ${deletedCount} 张会员卡`
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || '批量删除失败'
      };
    }
  }

  /**
   * 获取统计信息
   * @returns {Object}
   */
  async getStatistics() {
    try {
      const total = await MemberCard.count();
      
      const statusStats = await MemberCard.findAll({
        attributes: [
          'status',
          [sequelize.fn('COUNT', sequelize.col('id')), 'count']
        ],
        group: ['status']
      });

      return {
        success: true,
        data: {
          total,
          statusStats
        }
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || '统计失败'
      };
    }
  }

  /**
   * 导出会员卡数据
   * @param {Object} query - 查询条件
   * @returns {Object}
   */
  async export(query = {}) {
    try {
      const {
        batchNumber,
        cardNumber,
        status,
        startDate,
        endDate
      } = query;

      // 构建查询条件
      const where = {};

      if (batchNumber) {
        where.batchNumber = {
          [Op.like]: `%${batchNumber}%`
        };
      }

      if (cardNumber) {
        where.cardNumber = {
          [Op.like]: `%${cardNumber}%`
        };
      }

      if (status) {
        where.status = status;
      }

      if (startDate || endDate) {
        where.orderTime = {};
        if (startDate) {
          where.orderTime[Op.gte] = new Date(startDate);
        }
        if (endDate) {
          where.orderTime[Op.lte] = new Date(endDate);
        }
      }

      // 查询所有符合条件的数据
      const cards = await MemberCard.findAll({
        where,
        order: [['orderTime', 'DESC']]
      });

      return {
        success: true,
        data: cards
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || '导出失败'
      };
    }
  }
}

module.exports = new MemberCardService();
