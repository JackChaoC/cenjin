const express = require('express');
const router = express.Router();
const loginService = require('../../services/auth/login.service');
const jwtService = require('../../utils/jwt');
const { authMiddleware } = require('../../middlewares/auth.middleware');

/**
 * @route   POST /auth/login
 * @desc    用户登录
 * @access  Public
 */
router.post('/login', async (req, res) => {
  try {
    const { account, password } = req.body;

    // 调用登录服务
    const result = await loginService.login(account, password);

    if (result.success) {
      return res.status(200).json(result);
    } else {
      return res.status(401).json(result);
    }
  } catch (error) {
    console.error('登录错误:', error);
    return res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
});

/**
 * @route   POST /auth/register
 * @desc    用户注册
 * @access  Public
 */
router.post('/register', async (req, res) => {
  try {
    const { username, account, password } = req.body;

    // 调用注册服务
    const result = await loginService.register(username, account, password);

    if (result.success) {
      return res.status(201).json(result);
    } else {
      return res.status(400).json(result);
    }
  } catch (error) {
    console.error('注册错误:', error);
    return res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
});

/**
 * @route   POST /auth/verify
 * @desc    验证 token
 * @access  Public
 */
router.post('/verify', (req, res) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Token 不能为空'
      });
    }

    const result = loginService.verifyToken(token);

    if (result.success) {
      return res.status(200).json(result);
    } else {
      return res.status(401).json(result);
    }
  } catch (error) {
    console.error('验证错误:', error);
    return res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
});

/**
 * @route   POST /auth/refresh
 * @desc    刷新 token
 * @access  Public
 */
router.post('/refresh', (req, res) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Token 不能为空'
      });
    }

    const result = jwtService.refresh(token);

    if (result.success) {
      return res.status(200).json(result);
    } else {
      return res.status(401).json(result);
    }
  } catch (error) {
    console.error('刷新 Token 错误:', error);
    return res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
});

/**
 * @route   GET /auth/me
 * @desc    获取当前用户信息
 * @access  Private (需要 token)
 */
router.get('/me', authMiddleware, async (req, res) => {
  try {
    // 用户信息已经通过中间件附加到 req.user
    return res.status(200).json({
      success: true,
      data: req.user
    });
  } catch (error) {
    console.error('获取用户信息错误:', error);
    return res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
});

module.exports = router;
