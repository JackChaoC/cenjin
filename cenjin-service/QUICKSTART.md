# 快速开始指南

## 步骤 1: 安装依赖

```bash
cd cenjin-service
yarn install
```

## 步骤 2: 配置环境变量

```bash
# 复制环境变量示例文件
cp .env.example .env

# 根据需要修改 .env 文件中的配置
```

## 步骤 3: 启动 MySQL 服务

确保你的 MySQL 服务器正在运行。

**macOS (使用 Homebrew):**
```bash
brew services start mysql
# 或者
mysql.server start
```

**Windows:**
- 打开服务管理器，启动 MySQL 服务
- 或使用 MySQL Workbench

**Linux:**
```bash
sudo systemctl start mysql
# 或
sudo service mysql start
```

## 步骤 4: 创建数据库

**方式 1 - 使用 SQL 脚本:**
```bash
mysql -u root -p < scripts/create_database.sql
```

**方式 2 - 使用 Sequelize CLI:**
```bash
yarn db:create
```

**方式 3 - 手动创建:**
```bash
mysql -u root -p
# 然后在 MySQL 命令行中执行:
CREATE DATABASE cenjin_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
exit;
```

## 步骤 5: 运行数据库迁移

```bash
yarn db:migrate
```

这将创建 `user` 表。

## 步骤 6: 启动服务器

```bash
# 开发模式（带热重载）
yarn dev

# 或生产模式
yarn start
```

## 步骤 7: 测试 API

打开浏览器访问：
- http://localhost:3000 - 欢迎页面
- http://localhost:3000/api/health - 健康检查

## 验证数据库连接

启动服务器后，你应该在控制台看到：
```
🚀 岑津科技服务端运行在 http://localhost:3000
✅ 数据库连接成功！
```

如果看到 "❌ 数据库连接失败"，请检查：
1. MySQL 服务是否运行
2. config/config.json 中的数据库配置是否正确
3. 数据库 cenjin_db 是否已创建

## 常见问题

### MySQL 连接被拒绝 (ECONNREFUSED)

**原因:** MySQL 服务未启动

**解决:**
```bash
# macOS
brew services start mysql

# Linux
sudo systemctl start mysql
```

### Access denied for user 'root'

**原因:** 密码不正确

**解决:** 修改 `config/config.json` 中的 password 字段

### Database 'cenjin_db' doesn't exist

**原因:** 数据库未创建

**解决:** 执行步骤 4 创建数据库

## 下一步

- 查看 [DATABASE.md](./DATABASE.md) 了解更多数据库操作
- 查看 [README.md](./README.md) 了解项目详情
- 开始开发你的 API 接口！
