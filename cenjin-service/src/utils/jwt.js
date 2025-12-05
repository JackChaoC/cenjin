const jwt = require('jsonwebtoken');

/**
 * JWT 工具类
 * 统一管理 token 的生成、验证等操作
 */
class JwtService {
  constructor() {
    // JWT 密钥，优先使用环境变量，否则使用默认值
    this.secret = process.env.JWT_SECRET || 'cenjin-secret-key';
    // Token 过期时间，默认 7 天
    this.expiresIn = process.env.JWT_EXPIRES_IN || '7d';
  }

  /**
   * 生成 JWT token
   * @param {Object} payload - 要加密的数据（用户信息等）
   * @param {Object} options - 可选配置（过期时间等）
   * @returns {String} JWT token
   */
  encrypt(payload, options = {}) {
    try {
      const tokenOptions = {
        expiresIn: options.expiresIn || this.expiresIn,
        ...options
      };

      const token = jwt.sign(payload, this.secret, tokenOptions);
      return token;
    } catch (error) {
      console.error('JWT 加密错误:', error);
      throw new Error('Token 生成失败');
    }
  }

  /**
   * 验证 JWT token
   * @param {String} token - 要验证的 token
   * @returns {Object} 包含验证结果的对象 { success: Boolean, data: Object, message: String }
   */
  validate(token) {
    try {
      if (!token) {
        return {
          success: false,
          message: 'Token 不能为空'
        };
      }

      // 验证 token
      const decoded = jwt.verify(token, this.secret);

      return {
        success: true,
        data: decoded,
        message: 'Token 验证成功'
      };
    } catch (error) {
      // 处理不同类型的错误
      if (error.name === 'TokenExpiredError') {
        return {
          success: false,
          message: 'Token 已过期'
        };
      } else if (error.name === 'JsonWebTokenError') {
        return {
          success: false,
          message: 'Token 无效'
        };
      } else {
        return {
          success: false,
          message: 'Token 验证失败'
        };
      }
    }
  }

  /**
   * 解码 JWT token（不验证签名）
   * @param {String} token - 要解码的 token
   * @returns {Object} 解码后的数据
   */
  decode(token) {
    try {
      return jwt.decode(token);
    } catch (error) {
      console.error('JWT 解码错误:', error);
      return null;
    }
  }

  /**
   * 从 HTTP 请求头中提取 token
   * @param {Object} req - Express request 对象
   * @returns {String|null} token 或 null
   */
  extractTokenFromHeader(req) {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return null;
    }

    // 支持 "Bearer <token>" 格式
    if (authHeader.startsWith('Bearer ')) {
      return authHeader.substring(7);
    }

    return authHeader;
  }

  /**
   * 刷新 token（重新生成新的 token）
   * @param {String} oldToken - 旧的 token
   * @returns {Object} 包含新 token 的对象 { success: Boolean, token: String, message: String }
   */
  refresh(oldToken) {
    try {
      // 验证旧 token
      const decoded = jwt.verify(oldToken, this.secret, {
        ignoreExpiration: true // 忽略过期检查
      });

      // 移除 JWT 自动添加的字段
      delete decoded.iat;
      delete decoded.exp;

      // 生成新 token
      const newToken = this.encrypt(decoded);

      return {
        success: true,
        token: newToken,
        message: 'Token 刷新成功'
      };
    } catch (error) {
      return {
        success: false,
        message: 'Token 刷新失败'
      };
    }
  }
}

// 导出单例
module.exports = new JwtService();
