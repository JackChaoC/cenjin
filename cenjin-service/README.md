# 岑津科技管理系统 - 后端服务

基于 Node.js + Express + Sequelize + MySQL 的后端 API 服务

## 技术栈

- Node.js
- Express 5.x
- Sequelize 6.x (ORM)
- MySQL 8.x
- Docker & Docker Compose
- CORS
- dotenv

## 🐳 快速开始（推荐使用 Docker）

### 方式 1: 使用 Docker（推荐）

```bash
# 1. 启动所有服务（MySQL + 应用）
docker-compose up -d

# 2. 查看日志
docker-compose logs -f

# 3. 访问应用
# http://localhost:3000
```

详细的 Docker 使用说明请查看 [DOCKER.md](./DOCKER.md)

### 方式 2: 本地开发

```bash
# 1. 安装依赖
yarn install

# 2. 配置数据库（见下方）
# 3. 运行迁移
yarn db:migrate

# 4. 启动服务
yarn dev
```

## 数据库设置

### 1. 启动 MySQL 服务

确保 MySQL 服务器正在运行。

### 2. 创建数据库

```bash
# 方式1: 使用 MySQL 命令行
mysql -u root -p < scripts/create_database.sql

# 方式2: 手动创建
mysql -u root -p
CREATE DATABASE cenjin_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
exit;
```

### 3. 运行数据库迁移

```bash
yarn db:migrate
```

这将创建 `user` 表及其结构。

详细的数据库操作说明请查看 [DATABASE.md](./DATABASE.md)

## 运行项目

### 开发模式（带热重载）
```bash
yarn dev
```

### 生产模式
```bash
yarn start
```

## API 文档

### 基础接口

- `GET /` - 欢迎页面
- `GET /api/health` - 健康检查

## 数据库脚本命令

- `yarn db:create` - 创建数据库
- `yarn db:migrate` - 运行所有迁移
- `yarn db:migrate:undo` - 回滚最近一次迁移
- `yarn db:migrate:undo:all` - 回滚所有迁移
- `yarn db:seed` - 运行种子文件

## 项目结构

```
cenjin-service/
├── src/
│   ├── index.js          # 入口文件
│   ├── config/
│   │   └── database.js   # 数据库连接配置
│   ├── routes/           # 路由
│   ├── controllers/      # 控制器
│   ├── models/           # Sequelize 数据模型
│   │   └── User.js       # User 模型
│   └── middleware/       # 中间件
├── config/
│   └── config.json       # Sequelize 配置文件
├── migrations/           # 数据库迁移文件
│   └── xxx-create-user-table.js
├── seeders/              # 数据库种子文件
├── scripts/
│   └── create_database.sql  # 创建数据库 SQL 脚本
├── .env                  # 环境变量
├── .env.example          # 环境变量示例
├── .gitignore           
├── package.json
├── README.md
└── DATABASE.md           # 数据库操作详细说明
```

## 环境变量

查看 `.env.example` 文件了解所需的环境变量

## 端口

默认端口：3000

访问地址：http://localhost:3000
