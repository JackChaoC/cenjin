const User = require('../../models/User');
const bcrypt = require('bcryptjs');
const jwtService = require('../../utils/jwt');

/**
 * 用户登录服务
 */
class LoginService {
  /**
   * 用户登录
   * @param {string} account - 账号
   * @param {string} password - 密码
   * @returns {Object} - 返回用户信息和 token
   */
  async login(account, password) {
    try {
      // 1. 验证参数
      if (!account || !password) {
        throw new Error('账号和密码不能为空');
      }

      // 2. 查找用户（通过 account 或 username）
      const user = await User.findOne({
        where: {
          account: account
        }
      });

      if (!user) {
        throw new Error('账号或密码错误');
      }

      // 3. 验证密码
      const isPasswordValid = await bcrypt.compare(password, user.password);
      
      if (!isPasswordValid) {
        throw new Error('账号或密码错误');
      }

      // 4. 生成 JWT token
      const token = jwtService.encrypt({
        id: user.id,
        account: user.account,
        username: user.username
      });

      // 5. 返回用户信息（不包含密码）
      return {
        success: true,
        message: '登录成功',
        data: {
          user: {
            id: user.id,
            username: user.username,
            account: user.account,
            createdAt: user.createdAt
          },
          token
        }
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || '登录失败'
      };
    }
  }

  /**
   * 用户注册
   * @param {string} username - 用户名
   * @param {string} account - 账号
   * @param {string} password - 密码
   * @returns {Object} - 返回注册结果
   */
  async register(username, account, password) {
    try {
      // 1. 验证参数
      if (!username || !account || !password) {
        throw new Error('用户名、账号和密码不能为空');
      }

      // 2. 检查账号是否已存在
      const existingUser = await User.findOne({
        where: { account }
      });

      if (existingUser) {
        throw new Error('账号已存在');
      }

      // 3. 加密密码
      const hashedPassword = await bcrypt.hash(password, 10);

      // 4. 创建用户
      const user = await User.create({
        username,
        account,
        password: hashedPassword
      });

      // 5. 生成 token
      const token = jwtService.encrypt({
        id: user.id,
        account: user.account,
        username: user.username
      });

      return {
        success: true,
        message: '注册成功',
        data: {
          user: {
            id: user.id,
            username: user.username,
            account: user.account,
            createdAt: user.createdAt
          },
          token
        }
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || '注册失败'
      };
    }
  }

  /**
   * 验证 token
   * @param {string} token - JWT token
   * @returns {Object} - 解码后的用户信息
   */
  verifyToken(token) {
    return jwtService.validate(token);
  }
}

module.exports = new LoginService();
