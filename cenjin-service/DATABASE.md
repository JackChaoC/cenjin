# 数据库迁移指南

## 前置条件

确保你已经安装并运行了 MySQL 服务器。

## 配置数据库

1. 编辑 `.env` 文件（如果不存在，复制 `.env.example`）：
```bash
cp .env.example .env
```

2. 修改数据库配置（如需要）：
```
DB_HOST=127.0.0.1
DB_PORT=3306
DB_NAME=cenjin_db
DB_USER=root
DB_PASSWORD=root
```

3. 配置文件位置：`config/config.json`

## 创建数据库

首先需要创建数据库（如果还不存在）：

```bash
# 方式1: 使用 Sequelize CLI
yarn db:create

# 方式2: 手动在 MySQL 中创建
mysql -u root -p
CREATE DATABASE cenjin_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

## 运行迁移

执行所有待执行的迁移：

```bash
yarn db:migrate
```

## 回滚迁移

回滚最近一次迁移：

```bash
yarn db:migrate:undo
```

回滚所有迁移：

```bash
yarn db:migrate:undo:all
```

## 当前数据表结构

### user 表

| 字段 | 类型 | 说明 | 约束 |
|------|------|------|------|
| id | INTEGER | 主键 | PRIMARY KEY, AUTO_INCREMENT |
| username | VARCHAR(50) | 用户名 | NOT NULL, UNIQUE |
| account | VARCHAR(50) | 账号 | NOT NULL, UNIQUE |
| password | VARCHAR(255) | 密码 | NOT NULL |
| createdAt | DATETIME | 创建时间 | NOT NULL |
| updatedAt | DATETIME | 更新时间 | NOT NULL |

## 创建新的迁移

```bash
npx sequelize-cli migration:generate --name <migration-name>
```

例如：
```bash
npx sequelize-cli migration:generate --name add-email-to-user
```

## 使用 Sequelize Model

在代码中使用 User 模型：

```javascript
const User = require('./src/models/User');

// 创建用户
const user = await User.create({
  username: 'admin',
  account: 'admin@cenjin.com',
  password: 'hashed_password'
});

// 查询用户
const users = await User.findAll();
const user = await User.findOne({ where: { account: 'admin@cenjin.com' } });

// 更新用户
await User.update(
  { username: 'new_username' },
  { where: { id: 1 } }
);

// 删除用户
await User.destroy({ where: { id: 1 } });
```

## 常见问题

### 1. 连接数据库失败

检查：
- MySQL 服务是否运行
- 数据库配置是否正确
- 用户权限是否足够

### 2. 迁移失败

检查：
- 数据库是否已创建
- 迁移文件语法是否正确
- 是否有权限创建表

### 3. 密码错误

如果 MySQL 密码不是 'root'，需要修改 `config/config.json` 中的密码配置。
