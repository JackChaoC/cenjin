const express = require('express');
const router = express.Router();
const multer = require('multer');
const xlsx = require('xlsx');
const path = require('path');
const fs = require('fs');
const memberCardService = require('../../services/memberCard/memberCard.service');
const { authMiddleware } = require('../../middlewares/auth.middleware');

// 配置文件上传
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'membercard-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext !== '.xlsx' && ext !== '.xls') {
      return cb(new Error('只支持 Excel 文件格式'));
    }
    cb(null, true);
  }
});

// 所有会员卡路由都需要认证
router.use(authMiddleware);

/**
 * @route   GET /member-card/stats
 * @desc    获取统计信息
 * @access  Private
 * 注意：必须在 /:id 路由之前定义
 */
router.get('/stats', async (req, res) => {
  try {
    // 获取本月、上月和本年的数据统计
    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
    const currentYearStart = new Date(now.getFullYear(), 0, 1); // 本年1月1日

    const MemberCard = require('../../models/MemberCard');
    const { Op } = require('sequelize');

    // 本月统计
    const currentMonthCards = await MemberCard.findAll({
      where: {
        orderTime: {
          [Op.gte]: currentMonthStart
        }
      }
    });

    // 上月统计
    const lastMonthCards = await MemberCard.findAll({
      where: {
        orderTime: {
          [Op.gte]: lastMonthStart,
          [Op.lte]: lastMonthEnd
        }
      }
    });

    // 本年统计
    const currentYearCards = await MemberCard.findAll({
      where: {
        orderTime: {
          [Op.gte]: currentYearStart
        }
      }
    });

    // 本月数据
    const currentMonthCount = currentMonthCards.length;
    const currentMonthSalesAmount = currentMonthCards.reduce((sum, card) => sum + parseFloat(card.price || 0), 0); // 本月销售额(售价)
    const currentMonthPurchaseAmount = currentMonthCards.reduce((sum, card) => sum + parseFloat(card.importPrice || 0), 0); // 本月进货额(进价)
    const currentMonthProfit = currentMonthSalesAmount - currentMonthPurchaseAmount; // 本月利润
    const currentMonthShippedCount = currentMonthCards.filter(card => card.status === '已出库').length; // 本月已出库
    const currentMonthPendingCount = currentMonthCount - currentMonthShippedCount; // 本月待发货
    
    const lastMonthCount = lastMonthCards.length;
    const lastMonthAmount = lastMonthCards.reduce((sum, card) => sum + parseFloat(card.price || 0), 0);

    // 本年数据
    const currentYearCount = currentYearCards.length; // 本年订单数量
    const currentYearPurchaseAmount = currentYearCards.reduce((sum, card) => sum + parseFloat(card.importPrice || 0), 0); // 本年购买金额(进价)
    const currentYearSalesAmount = currentYearCards.reduce((sum, card) => sum + parseFloat(card.price || 0), 0); // 本年销售金额(售价)
    const currentYearShippedCount = currentYearCards.filter(card => card.status === '已出库').length; // 已出库数量

    return res.status(200).json({
      success: true,
      data: {
        // 月度数据
        currentMonthCount,
        currentMonthSalesAmount,
        currentMonthPurchaseAmount,
        currentMonthProfit,
        currentMonthPendingCount,
        lastMonthCount,
        lastMonthAmount,
        // 年度数据
        currentYearCount,
        currentYearPurchaseAmount,
        currentYearSalesAmount,
        currentYearShippedCount
      }
    });
  } catch (error) {
    console.error('获取统计信息错误:', error);
    return res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
});

/**
 * @route   GET /member-card/chart-data
 * @desc    获取图表数据（按时间范围统计订单数和金额）
 * @access  Private
 * @query   timeRange: week | month | year
 */
router.get('/chart-data', async (req, res) => {
  try {
    const { timeRange = 'week' } = req.query;
    const MemberCard = require('../../models/MemberCard');
    const { Op } = require('sequelize');
    const { sequelize } = require('../../config/database');

    const now = new Date();
    let startDate, groupFormat, labelFormat;

    // 根据时间范围设置开始日期和分组格式
    switch (timeRange) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        groupFormat = '%Y-%m-%d'; // 按天分组
        labelFormat = 'day';
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
        groupFormat = '%Y-%m-%d'; // 按天分组
        labelFormat = 'day';
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        groupFormat = '%Y-%m'; // 按月分组
        labelFormat = 'month';
        break;
      default:
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        groupFormat = '%Y-%m-%d';
        labelFormat = 'day';
    }

    // 查询订单数据
    const chartData = await MemberCard.findAll({
      attributes: [
        [sequelize.fn('DATE_FORMAT', sequelize.col('orderTime'), groupFormat), 'date'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'orderCount'],
        [sequelize.fn('SUM', sequelize.col('price')), 'salesAmount'],
        [sequelize.fn('SUM', sequelize.col('importPrice')), 'purchaseAmount']
      ],
      where: {
        orderTime: {
          [Op.gte]: startDate,
          [Op.lte]: now
        }
      },
      group: [sequelize.fn('DATE_FORMAT', sequelize.col('orderTime'), groupFormat)],
      order: [[sequelize.fn('DATE_FORMAT', sequelize.col('orderTime'), groupFormat), 'ASC']],
      raw: true
    });

    // 格式化返回数据
    const formattedData = chartData.map(item => ({
      date: item.date,
      orderCount: parseInt(item.orderCount) || 0,
      salesAmount: parseFloat(item.salesAmount) || 0,
      purchaseAmount: parseFloat(item.purchaseAmount) || 0,
      profit: (parseFloat(item.salesAmount) || 0) - (parseFloat(item.purchaseAmount) || 0)
    }));

    return res.status(200).json({
      success: true,
      data: {
        timeRange,
        labelFormat,
        chartData: formattedData
      }
    });
  } catch (error) {
    console.error('获取图表数据错误:', error);
    return res.status(500).json({
      success: false,
      message: '服务器错误',
      error: error.message
    });
  }
});

/**
 * @route   GET /member-card/rank
 * @desc    获取商品卡类交付排行（按产品名称统计已出库数量）
 * @access  Private
 */
router.get('/rank', async (req, res) => {
  try {
    // 统计各产品已出库数量
    const rankData = await MemberCard.findAll({
      attributes: [
        'productName',
        [sequelize.fn('COUNT', sequelize.col('productName')), 'deliveryCount']
      ],
      where: {
        status: '已出库'
      },
      group: ['productName'],
      order: [[sequelize.literal('deliveryCount'), 'DESC']],
      limit: 10,
      raw: true
    });

    // 格式化数据并添加排名
    const formattedData = rankData.map((item, index) => ({
      rank: index + 1,
      productName: item.productName || '未知产品',
      deliveryCount: parseInt(item.deliveryCount) || 0
    }));

    return res.json({
      success: true,
      data: formattedData
    });
  } catch (error) {
    console.error('获取排行数据错误:', error);
    return res.status(500).json({
      success: false,
      message: '服务器错误',
      error: error.message
    });
  }
});

/**
 * @route   GET /member-card/export
 * @desc    导出会员卡数据为Excel
 * @access  Private
 * 注意：必须在 /:id 路由之前定义
 */
router.get('/export', async (req, res) => {
  try {
    const result = await memberCardService.export(req.query);

    if (!result.success) {
      return res.status(400).json(result);
    }

    // 转换数据为Excel格式
    const excelData = result.data.map(card => ({
      '批次号': card.batchNumber,
      '商户名称': card.merchant,
      '供应商名称': card.supplier,
      '商品名称': card.productName,
      '面值': card.faceValue,
      '售价': card.price,
      '进价': card.importPrice,
      '卡号': card.cardNumber,
      '卡密': card.cardPassword,
      '订单时间': card.orderTime,
      '状态': card.status
    }));

    // 创建工作簿
    const worksheet = xlsx.utils.json_to_sheet(excelData);
    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, worksheet, '会员卡数据');

    // 生成Excel文件
    const buffer = xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    // 设置响应头
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=membercard-${Date.now()}.xlsx`);

    return res.send(buffer);
  } catch (error) {
    console.error('导出会员卡错误:', error);
    return res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
});

/**
 * @route   GET /member-card/card/:cardNumber
 * @desc    根据卡号查询会员卡
 * @access  Private
 * 注意：必须在 /:id 路由之前定义
 */
router.get('/card/:cardNumber', async (req, res) => {
  try {
    const { cardNumber } = req.params;
    const result = await memberCardService.findByCardNumber(cardNumber);

    if (result.success) {
      return res.status(200).json(result);
    } else {
      return res.status(404).json(result);
    }
  } catch (error) {
    console.error('查询会员卡错误:', error);
    return res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
});

/**
 * @route   GET /member-card
 * @desc    获取会员卡列表（分页、筛选）
 * @access  Private
 */
router.get('/', async (req, res) => {
  try {
    const result = await memberCardService.findAll(req.query);

    if (result.success) {
      return res.status(200).json(result);
    } else {
      return res.status(400).json(result);
    }
  } catch (error) {
    console.error('获取会员卡列表错误:', error);
    return res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
});

/**
 * @route   GET /member-card/:id
 * @desc    根据 ID 获取单个会员卡
 * @access  Private
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await memberCardService.findById(id);

    if (result.success) {
      return res.status(200).json(result);
    } else {
      return res.status(404).json(result);
    }
  } catch (error) {
    console.error('获取会员卡错误:', error);
    return res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
});

/**
 * @route   GET /member-card/card/:cardNumber
 * @desc    根据卡号查询会员卡
 * @access  Private
 */
router.get('/card/:cardNumber', async (req, res) => {
  try {
    const { cardNumber } = req.params;
    const result = await memberCardService.findByCardNumber(cardNumber);

    if (result.success) {
      return res.status(200).json(result);
    } else {
      return res.status(404).json(result);
    }
  } catch (error) {
    console.error('查询会员卡错误:', error);
    return res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
});

/**
 * @route   POST /member-card
 * @desc    创建单个会员卡
 * @access  Private
 */
router.post('/', async (req, res) => {
  try {
    const result = await memberCardService.create(req.body);

    if (result.success) {
      return res.status(201).json(result);
    } else {
      return res.status(400).json(result);
    }
  } catch (error) {
    console.error('创建会员卡错误:', error);
    return res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
});

/**
 * @route   POST /member-card/bulk
 * @desc    批量导入会员卡
 * @access  Private
 */
router.post('/bulk', async (req, res) => {
  try {
    const { cards } = req.body;
    
    if (!cards || !Array.isArray(cards)) {
      return res.status(400).json({
        success: false,
        message: '无效的数据格式'
      });
    }

    const result = await memberCardService.bulkCreate(cards);

    if (result.success) {
      return res.status(201).json(result);
    } else {
      return res.status(400).json(result);
    }
  } catch (error) {
    console.error('批量导入会员卡错误:', error);
    return res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
});

/**
 * @route   PUT /member-card/:id
 * @desc    更新会员卡
 * @access  Private
 */
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await memberCardService.update(id, req.body);

    if (result.success) {
      return res.status(200).json(result);
    } else {
      return res.status(400).json(result);
    }
  } catch (error) {
    console.error('更新会员卡错误:', error);
    return res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
});

/**
 * @route   DELETE /member-card/:id
 * @desc    删除单个会员卡
 * @access  Private
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await memberCardService.delete(id);

    if (result.success) {
      return res.status(200).json(result);
    } else {
      return res.status(404).json(result);
    }
  } catch (error) {
    console.error('删除会员卡错误:', error);
    return res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
});

/**
 * @route   DELETE /member-card/bulk/delete
 * @desc    批量删除会员卡
 * @access  Private
 */
router.delete('/bulk/delete', async (req, res) => {
  try {
    const { ids } = req.body;
    
    if (!ids || !Array.isArray(ids)) {
      return res.status(400).json({
        success: false,
        message: '无效的 ID 列表'
      });
    }

    const result = await memberCardService.bulkDelete(ids);

    if (result.success) {
      return res.status(200).json(result);
    } else {
      return res.status(400).json(result);
    }
  } catch (error) {
    console.error('批量删除会员卡错误:', error);
    return res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
});

/**
 * @route   POST /member-card/import
 * @desc    导入会员卡Excel文件
 * @access  Private
 */
router.post('/import', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: '请上传文件'
      });
    }

    // 读取Excel文件
    const workbook = xlsx.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(worksheet);

    // 删除上传的临时文件
    fs.unlinkSync(req.file.path);

    if (!data || data.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Excel文件为空'
      });
    }

    // 转换Excel数据为数据库格式
    const cardsData = data.map(row => {
      return {
        batchNumber: row['批次号']?.toString() || '',
        merchant: row['商户名称']?.toString() || '',
        supplier: row['供应商名称']?.toString() || '',
        productName: row['商品名称']?.toString() || '',
        faceValue: parseFloat(row['面值']) || 0,
        price: parseFloat(row['售价']) || 0,
        importPrice: parseFloat(row['进价']) || 0,
        cardNumber: row['卡号']?.toString() || '',
        cardPassword: row['卡密']?.toString() || '',
        orderTime: row['订单时间'] || new Date(),
        status: row['状态']?.toString() || '已出库'
      };
    });

    // 批量创建
    const result = await memberCardService.bulkCreate(cardsData);

    if (result.success) {
      return res.status(201).json(result);
    } else {
      return res.status(400).json(result);
    }
  } catch (error) {
    // 清理上传的文件
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    console.error('导入会员卡错误:', error);
    return res.status(500).json({
      success: false,
      message: error.message || '服务器错误'
    });
  }
});

module.exports = router;
