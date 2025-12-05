# Docker 部署指南

## 📦 Docker 配置说明

本项目已配置完整的 Docker 环境，包括：
- **MySQL 8.0** 数据库服务
- **Node.js** 应用服务
- 自动化数据库迁移
- 数据持久化

## 🚀 快速开始

### 1. 前置要求

确保已安装：
- Docker Desktop (macOS/Windows)
- Docker Engine (Linux)
- Docker Compose

检查版本：
```bash
docker --version
docker-compose --version
```

### 2. 使用 Docker Compose 启动服务

```bash
# 构建并启动所有服务（开发环境）
docker-compose up -d

# 或使用 yarn 脚本
yarn docker:up
```

这将启动：
- ✅ MySQL 数据库（端口 3306）
- ✅ Node.js 应用（端口 3000）
- ✅ 自动运行数据库迁移
- ✅ 自动创建数据库和表

### 3. 查看日志

```bash
# 查看所有服务日志
docker-compose logs -f

# 只查看应用日志
docker-compose logs -f app

# 只查看数据库日志
docker-compose logs -f mysql

# 或使用 yarn 脚本
yarn docker:logs
```

### 4. 停止服务

```bash
# 停止服务（保留数据）
docker-compose down

# 停止服务并删除数据卷
docker-compose down -v

# 或使用 yarn 脚本
yarn docker:down
yarn docker:clean  # 删除所有数据
```

## 🛠️ Docker 命令说明

### 开发环境命令

```bash
# 构建镜像
yarn docker:build

# 启动服务（后台运行）
yarn docker:up

# 停止服务
yarn docker:down

# 查看日志
yarn docker:logs

# 重启服务
yarn docker:restart

# 清理所有容器和数据
yarn docker:clean
```

### 生产环境命令

```bash
# 使用生产配置启动
docker-compose -f docker-compose.prod.yml up -d

# 停止生产环境
docker-compose -f docker-compose.prod.yml down
```

## 📋 服务详情

### MySQL 服务

- **容器名**: cenjin_mysql
- **镜像**: mysql:8.0
- **端口**: 3306
- **数据库名**: cenjin_db
- **用户名**: root
- **密码**: root
- **字符集**: utf8mb4
- **排序规则**: utf8mb4_unicode_ci
- **数据卷**: mysql_data

### Node.js 应用服务

- **容器名**: cenjin_app
- **基础镜像**: node:18-alpine
- **端口**: 3000
- **启动流程**:
  1. 等待 MySQL 健康检查通过
  2. 自动运行数据库迁移
  3. 启动应用（开发模式 nodemon）

## 🔧 配置说明

### 环境变量

**docker-compose.yml** 中的环境变量：

```yaml
# MySQL 环境变量
MYSQL_ROOT_PASSWORD: root
MYSQL_DATABASE: cenjin_db
MYSQL_USER: root
MYSQL_PASSWORD: root

# 应用环境变量
NODE_ENV: development
PORT: 3000
DB_HOST: mysql        # Docker 内部使用服务名
DB_PORT: 3306
DB_NAME: cenjin_db
DB_USER: root
DB_PASSWORD: root
```

### 文件说明

| 文件 | 说明 |
|------|------|
| `Dockerfile` | 生产环境镜像配置 |
| `Dockerfile.dev` | 开发环境镜像配置 |
| `docker-compose.yml` | 开发环境编排配置 |
| `docker-compose.prod.yml` | 生产环境编排配置 |
| `.dockerignore` | Docker 构建忽略文件 |
| `.env.docker` | Docker 环境变量示例 |

## 🔍 常用操作

### 进入容器

```bash
# 进入应用容器
docker exec -it cenjin_app sh

# 进入 MySQL 容器
docker exec -it cenjin_mysql bash
```

### 连接数据库

```bash
# 在 MySQL 容器内连接
docker exec -it cenjin_mysql mysql -u root -proot cenjin_db

# 从宿主机连接
mysql -h 127.0.0.1 -P 3306 -u root -proot cenjin_db
```

### 手动运行迁移

```bash
# 在应用容器内执行
docker exec -it cenjin_app yarn db:migrate

# 运行种子文件
docker exec -it cenjin_app yarn db:seed
```

### 查看容器状态

```bash
# 查看运行中的容器
docker ps

# 查看所有容器（包括停止的）
docker ps -a

# 查看服务状态
docker-compose ps
```

### 重建镜像

```bash
# 重建并启动
docker-compose up -d --build

# 强制重建
docker-compose build --no-cache
```

## 🐛 故障排查

### 问题 1: MySQL 连接失败

**症状**: 应用无法连接到 MySQL

**解决方案**:
```bash
# 检查 MySQL 是否健康
docker-compose ps

# 查看 MySQL 日志
docker-compose logs mysql

# 等待 MySQL 完全启动（大约 30 秒）
```

### 问题 2: 端口占用

**症状**: `port is already allocated`

**解决方案**:
```bash
# 停止占用端口的服务
lsof -ti:3306 | xargs kill -9
lsof -ti:3000 | xargs kill -9

# 或修改 docker-compose.yml 中的端口映射
```

### 问题 3: 数据卷权限问题

**症状**: MySQL 无法写入数据

**解决方案**:
```bash
# 删除并重新创建数据卷
docker-compose down -v
docker-compose up -d
```

### 问题 4: 迁移失败

**症状**: 数据库表未创建

**解决方案**:
```bash
# 手动运行迁移
docker exec -it cenjin_app yarn db:migrate

# 查看应用日志
docker-compose logs app
```

## 📊 数据持久化

数据存储在 Docker 数据卷中，即使删除容器，数据也会保留。

**查看数据卷**:
```bash
docker volume ls
docker volume inspect cenjin-service_mysql_data
```

**备份数据**:
```bash
# 导出数据库
docker exec cenjin_mysql mysqldump -u root -proot cenjin_db > backup.sql

# 导入数据库
docker exec -i cenjin_mysql mysql -u root -proot cenjin_db < backup.sql
```

## 🔐 安全建议

⚠️ **生产环境注意事项**:

1. 修改默认密码
2. 使用环境变量文件（不提交到 Git）
3. 限制数据库端口暴露
4. 使用 Docker secrets 管理敏感信息
5. 定期更新基础镜像

## 📚 参考资源

- [Docker 官方文档](https://docs.docker.com/)
- [Docker Compose 文档](https://docs.docker.com/compose/)
- [MySQL Docker 镜像](https://hub.docker.com/_/mysql)
- [Node.js Docker 镜像](https://hub.docker.com/_/node)

---

## ✅ 验证安装

启动服务后，访问：

- **应用**: http://localhost:3000
- **健康检查**: http://localhost:3000/api/health
- **数据库**: mysql://root:root@localhost:3306/cenjin_db

应该看到：
```
🚀 岑津科技服务端运行在 http://localhost:3000
✅ 数据库连接成功！
```

🎉 **Docker 环境配置完成！**
