const jwtService = require('../utils/jwt');

/**
 * 认证中间件
 * 验证请求中的 JWT token
 */
const authMiddleware = (req, res, next) => {
  try {
    // 从请求头中提取 token
    const token = jwtService.extractTokenFromHeader(req);

    if (!token) {
      return res.status(401).json({
        success: false,
        message: '未提供认证信息'
      });
    }

    // 验证 token
    const result = jwtService.validate(token);

    if (!result.success) {
      return res.status(401).json(result);
    }

    // 将用户信息附加到 req 对象上
    req.user = result.data;
    
    // 继续执行下一个中间件或路由处理器
    next();
  } catch (error) {
    console.error('认证中间件错误:', error);
    return res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
};

/**
 * 可选认证中间件
 * 如果有 token 则验证，没有则继续
 */
const optionalAuthMiddleware = (req, res, next) => {
  try {
    const token = jwtService.extractTokenFromHeader(req);

    if (token) {
      const result = jwtService.validate(token);
      if (result.success) {
        req.user = result.data;
      }
    }

    next();
  } catch (error) {
    // 可选认证失败不影响请求继续
    next();
  }
};

module.exports = {
  authMiddleware,
  optionalAuthMiddleware
};
