# Cenjin 项目 Docker 统一部署

## 📦 项目结构

```
projects/
├── docker-compose.yml          # 统一的 Docker Compose 配置
├── cenjin-service/            # 后端服务 (Node 20)
│   ├── Dockerfile
│   └── ...
└── cenjin-web/                # 前端服务 (Node 20)
    ├── Dockerfile
    └── ...
```

## 🚀 快速启动

### 启动所有服务（推荐）

```bash
# 在 /projects 目录下
cd /Users/user/Desktop/projects

# 首次启动（构建镜像）
docker-compose up --build

# 后台运行
docker-compose up -d

# 查看日志
docker-compose logs -f
```

### 启动单个服务

```bash
# 只启动数据库
docker-compose up mysql

# 只启动后端（会自动启动依赖的 mysql）
docker-compose up backend

# 只启动前端（会自动启动依赖的 backend 和 mysql）
docker-compose up frontend
```

## 🔗 服务访问

| 服务 | 地址 | 说明 |
|------|------|------|
| **前端** | http://localhost:5173 | Vite 开发服务器 |
| **后端 API** | http://localhost:3000 | Express 服务器 |
| **MySQL** | localhost:3306 | 数据库服务 |

## 📊 服务详情

### 1. MySQL 数据库

```yaml
容器名: cenjin_mysql
端口: 3306:3306
数据库: cenjin_db
用户名: root
密码: root
```

**特性：**
- ✅ 数据持久化（使用 Docker 卷）
- ✅ 自动执行初始化脚本
- ✅ 健康检查机制

### 2. 后端服务 (cenjin-service)

```yaml
容器名: cenjin_backend
端口: 3000:3000
Node 版本: 20
```

**特性：**
- ✅ 代码热更新（nodemon）
- ✅ 自动运行数据库迁移
- ✅ 依赖隔离（node_modules 使用镜像内的）

**环境变量：**
```
DB_HOST=mysql          # Docker 网络内的服务名
DB_PORT=3306
DB_NAME=cenjin_db
DB_USER=root
DB_PASSWORD=root
```

### 3. 前端服务 (cenjin-web)

```yaml
容器名: cenjin_frontend
端口: 5173:5173
Node 版本: 20
```

**特性：**
- ✅ 代码热更新（Vite HMR）
- ✅ 依赖隔离（node_modules 使用镜像内的）
- ✅ 自动连接后端服务

## 🛠️ 常用命令

### 查看服务状态

```bash
# 查看所有容器
docker-compose ps

# 查看详细状态
docker ps
```

### 查看日志

```bash
# 查看所有服务日志
docker-compose logs

# 查看特定服务日志
docker-compose logs backend
docker-compose logs frontend
docker-compose logs mysql

# 实时查看日志
docker-compose logs -f backend
```

### 停止和启动

```bash
# 停止所有服务
docker-compose stop

# 启动已停止的服务
docker-compose start

# 重启服务
docker-compose restart

# 重启特定服务
docker-compose restart backend
```

### 进入容器

```bash
# 进入后端容器
docker exec -it cenjin_backend sh

# 进入前端容器
docker exec -it cenjin_frontend sh

# 进入数据库容器
docker exec -it cenjin_mysql mysql -uroot -proot cenjin_db
```

### 清理和重建

```bash
# 停止并删除容器
docker-compose down

# 停止并删除容器、网络、卷
docker-compose down -v

# 删除镜像
docker-compose down --rmi all

# 完全清理后重建
docker-compose down -v
docker-compose up --build
```

## 🔄 开发工作流

### 日常开发

1. **启动环境**
   ```bash
   docker-compose up -d
   ```

2. **修改代码**
   - 前端代码：保存后自动热更新（1-2秒）
   - 后端代码：保存后自动重启（1-2秒）

3. **查看日志**
   ```bash
   docker-compose logs -f
   ```

4. **停止环境**
   ```bash
   docker-compose stop
   ```

### 添加新依赖

**后端添加依赖：**
```bash
cd cenjin-service
# 修改 package.json

# 重建后端镜像
cd ..
docker-compose up --build backend
```

**前端添加依赖：**
```bash
cd cenjin-web
# 修改 package.json

# 重建前端镜像
cd ..
docker-compose up --build frontend
```

### 数据库操作

**运行新的迁移：**
```bash
docker exec -it cenjin_backend yarn db:migrate
```

**回滚迁移：**
```bash
docker exec -it cenjin_backend yarn db:migrate:undo
```

**查看数据库：**
```bash
docker exec -it cenjin_mysql mysql -uroot -proot cenjin_db
```

## 🌐 网络架构

```
┌─────────────────────────────────────────────────────────────┐
│                     cenjin_network                          │
│                                                             │
│  ┌──────────────┐      ┌──────────────┐      ┌──────────┐ │
│  │   Frontend   │─────>│   Backend    │─────>│  MySQL   │ │
│  │  (5173)      │      │   (3000)     │      │  (3306)  │ │
│  └──────────────┘      └──────────────┘      └──────────┘ │
│         ↑                     ↑                     ↑      │
└─────────┼─────────────────────┼─────────────────────┼──────┘
          │                     │                     │
     localhost:5173        localhost:3000        localhost:3306
```

**特点：**
- 容器间通过服务名通信（如 `mysql`, `backend`）
- 外部通过 `localhost:端口` 访问
- 所有服务在同一个 Docker 网络中

## ⚙️ 配置说明

### Node 版本统一

所有服务统一使用 **Node 20**：
- ✅ 支持最新的 Vite 7
- ✅ 向后兼容 Node 18 代码
- ✅ 性能和安全性提升

### 卷挂载策略

```yaml
volumes:
  - ./cenjin-service:/app      # 挂载代码目录
  - /app/node_modules          # 保护 node_modules
```

**为什么这样配置？**
- 代码挂载：实现热更新
- node_modules 保护：避免宿主机和容器的依赖冲突

### 依赖顺序

```
MySQL → Backend → Frontend
```

- Frontend 依赖 Backend
- Backend 依赖 MySQL
- Docker Compose 自动处理启动顺序

## 🐛 故障排除

### 问题 1：端口被占用

```bash
# 检查端口占用
lsof -i :3000
lsof -i :5173
lsof -i :3306

# 杀死进程或修改 docker-compose.yml 中的端口映射
```

### 问题 2：容器无法启动

```bash
# 查看详细错误
docker-compose logs backend

# 重建镜像
docker-compose up --build backend
```

### 问题 3：数据库连接失败

```bash
# 检查 MySQL 是否健康
docker-compose ps

# 查看 MySQL 日志
docker-compose logs mysql

# 等待 MySQL 完全启动（健康检查通过）
```

### 问题 4：前端无法访问后端

**检查：**
1. 后端是否正常运行：`curl http://localhost:3000`
2. 网络是否正常：`docker network inspect projects_cenjin_network`
3. 环境变量是否正确

**解决：**
```bash
# 重启所有服务
docker-compose restart
```

### 问题 5：热更新不工作

**前端：**
- 检查 `vite.config.js` 中是否有 `usePolling: true`

**后端：**
- 检查是否使用 `nodemon`
- 查看日志确认文件变化被检测到

### 问题 6：依赖安装失败

```bash
# 清理并重建
docker-compose down -v
docker-compose build --no-cache
docker-compose up
```

## 📈 性能优化

### 1. 使用 Docker 缓存

Dockerfile 已优化，先复制 `package.json`，再安装依赖：
```dockerfile
COPY package*.json ./
RUN npm install
COPY . .
```

### 2. 开发环境 vs 生产环境

当前配置是**开发环境**，生产环境建议：
- 使用多阶段构建
- 前端构建静态文件
- 使用 Nginx 提供静态文件
- 环境变量使用 `.env` 文件

### 3. 数据卷管理

```bash
# 查看卷
docker volume ls

# 清理未使用的卷
docker volume prune
```

## 🔒 安全建议

### 开发环境

当前配置适用于**本地开发**，已包含：
- ✅ 服务隔离（Docker 网络）
- ✅ 依赖锁定（yarn.lock / package-lock.json）

### 生产环境

部署到生产环境时需要：
- ⚠️ 修改数据库密码
- ⚠️ 使用环境变量管理敏感信息
- ⚠️ 启用 HTTPS
- ⚠️ 配置防火墙规则
- ⚠️ 使用 secrets 管理密钥

## 📚 相关文档

- [Docker Compose 官方文档](https://docs.docker.com/compose/)
- [Node.js 官方文档](https://nodejs.org/)
- [Vite 官方文档](https://vitejs.dev/)
- [Express 官方文档](https://expressjs.com/)

## ✅ 验证清单

启动后验证：

- [ ] MySQL 容器运行正常：`docker-compose ps`
- [ ] 后端服务响应：`curl http://localhost:3000`
- [ ] 前端页面可访问：http://localhost:5173
- [ ] 前端能调用后端 API
- [ ] 代码修改后热更新生效
- [ ] 数据库数据持久化

## 🎯 总结

**优点：**
- ✅ 一键启动所有服务
- ✅ 服务间自动连接
- ✅ 统一的 Node 版本（20）
- ✅ 代码热更新支持
- ✅ 数据持久化
- ✅ 易于开发和调试

**使用建议：**
```bash
# 日常开发
docker-compose up -d && docker-compose logs -f

# 停止工作
docker-compose stop

# 清理环境
docker-compose down -v
```

---

**创建时间**：2025-12-05  
**Node 版本**：20  
**Docker Compose 版本**：3.8
