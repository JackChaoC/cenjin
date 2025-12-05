# 数据库迁移设置完成 ✅

## 已完成的工作

### 1. ✅ 安装依赖
- **sequelize** (6.37.7) - Node.js ORM
- **mysql2** (3.15.3) - MySQL 驱动
- **sequelize-cli** (6.6.3) - 命令行工具

### 2. ✅ 项目结构初始化
```
cenjin-service/
├── config/
│   └── config.json              # Sequelize 配置（开发/测试/生产环境）
├── migrations/
│   └── 20251202102417-create-user-table.js  # User 表迁移文件
├── seeders/
│   └── 20251202102907-demo-users.js         # 示例用户数据
├── src/
│   ├── config/
│   │   └── database.js          # 数据库连接配置
│   └── models/
│       └── User.js              # User Sequelize 模型
└── scripts/
    └── create_database.sql      # 创建数据库 SQL 脚本
```

### 3. ✅ 数据库配置
**数据库名称:** `cenjin_db`  
**字符集:** `utf8mb4`  
**排序规则:** `utf8mb4_unicode_ci`

**连接配置 (config/config.json):**
- Host: 127.0.0.1
- Port: 3306
- Username: root
- Password: root (可根据实际情况修改)

### 4. ✅ User 表结构

| 字段 | 类型 | 说明 | 约束 |
|------|------|------|------|
| **id** | INTEGER | 用户ID | PRIMARY KEY, AUTO_INCREMENT |
| **username** | VARCHAR(50) | 用户名 | NOT NULL, UNIQUE |
| **account** | VARCHAR(50) | 账号 | NOT NULL, UNIQUE |
| **password** | VARCHAR(255) | 密码 | NOT NULL |
| **createdAt** | DATETIME | 创建时间 | NOT NULL |
| **updatedAt** | DATETIME | 更新时间 | NOT NULL |

### 5. ✅ 可用命令

```bash
# 数据库操作
yarn db:create              # 创建数据库
yarn db:migrate             # 运行迁移
yarn db:migrate:undo        # 回滚最近一次迁移
yarn db:migrate:undo:all    # 回滚所有迁移
yarn db:seed                # 运行种子文件（插入示例数据）

# 服务器运行
yarn dev                    # 开发模式
yarn start                  # 生产模式
```

### 6. ✅ 示例数据（种子文件）

已创建 3 个测试用户：
1. admin / admin123
2. test / test123
3. cenjin_admin / cenjin123

**⚠️ 注意:** 生产环境中密码必须加密！

### 7. ✅ 文档

- **README.md** - 项目主文档
- **DATABASE.md** - 数据库操作详细说明
- **QUICKSTART.md** - 快速开始指南
- **SETUP.md** - 本文档（设置总结）

## 下一步操作

### 必须完成（在运行项目前）：

1. **启动 MySQL 服务**
   ```bash
   # macOS
   brew services start mysql
   
   # Linux
   sudo systemctl start mysql
   ```

2. **创建数据库**
   ```bash
   mysql -u root -p < scripts/create_database.sql
   ```

3. **运行迁移**
   ```bash
   yarn db:migrate
   ```

4. **（可选）插入示例数据**
   ```bash
   yarn db:seed
   ```

5. **启动服务器**
   ```bash
   yarn dev
   ```

### 验证

启动服务器后，应该看到：
```
🚀 岑津科技服务端运行在 http://localhost:3000
✅ 数据库连接成功！
```

### 检查数据库

```bash
mysql -u root -p
USE cenjin_db;
SHOW TABLES;
DESCRIBE user;
SELECT * FROM user;
```

## 技术栈总结

- **Node.js** - 运行时环境
- **Express 5.x** - Web 框架
- **Sequelize 6.x** - ORM（对象关系映射）
- **MySQL 8.x** - 数据库
- **Sequelize CLI** - 迁移管理工具

## 常见问题

### Q: ECONNREFUSED 127.0.0.1:3306
**A:** MySQL 服务未启动，使用 `brew services start mysql` 启动

### Q: Access denied for user 'root'
**A:** 修改 `config/config.json` 中的 password 字段

### Q: Database 'cenjin_db' doesn't exist
**A:** 执行 `mysql -u root -p < scripts/create_database.sql` 创建数据库

### Q: 如何修改数据库密码？
**A:** 编辑 `config/config.json` 文件中的 password 字段

## 代码使用示例

### 使用 User 模型

```javascript
const User = require('./src/models/User');

// 创建用户
const newUser = await User.create({
  username: '新用户',
  account: 'newuser',
  password: 'hashed_password_here'
});

// 查询所有用户
const users = await User.findAll();

// 根据账号查询用户
const user = await User.findOne({ 
  where: { account: 'admin' } 
});

// 更新用户
await User.update(
  { username: '更新后的用户名' },
  { where: { id: 1 } }
);

// 删除用户
await User.destroy({ 
  where: { id: 1 } 
});
```

## 生产环境注意事项

1. ⚠️ **密码加密**: 使用 bcrypt 加密密码
2. ⚠️ **环境变量**: 不要提交 .env 文件到版本控制
3. ⚠️ **数据库配置**: 生产环境使用不同的数据库和凭据
4. ⚠️ **错误处理**: 添加适当的错误处理和日志记录
5. ⚠️ **SQL 注入**: Sequelize 已防护，但仍需注意原始查询

---

🎉 **迁移设置已完成！** 按照"下一步操作"部分的步骤运行项目。
