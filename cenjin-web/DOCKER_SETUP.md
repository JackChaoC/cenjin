# cenjin-web Docker 开发环境

## 📦 文件说明

### 1. Dockerfile
基于 Node.js 18 Alpine 的轻量级镜像，包含：
- 安装项目依赖
- 复制项目文件
- 暴露 Vite 端口 5173
- 启动开发服务器

### 2. docker-compose.yml
Docker Compose 配置，提供：
- 自动构建镜像
- 端口映射 (5173:5173)
- 代码目录挂载（热更新）
- node_modules 保护（使用镜像内的依赖）

### 3. vite.config.js
Vite 开发服务器配置：
- `host: '0.0.0.0'` - 允许 Docker 容器外部访问
- `usePolling: true` - Docker 环境下的文件监听
- `hmr` - 热模块替换配置

### 4. .dockerignore
排除不需要复制到镜像的文件：
- node_modules（会在镜像内重新安装）
- dist（构建输出）
- IDE 配置文件
- 系统文件

## 🚀 使用方法

### 启动开发环境

```bash
# 进入前端项目目录
cd cenjin-web

# 构建并启动容器
docker-compose up --build

# 或者后台运行
docker-compose up -d --build
```

### 访问应用

```
http://localhost:5173
```

### 查看日志

```bash
# 实时查看日志
docker-compose logs -f

# 只查看前端日志
docker-compose logs -f web
```

### 停止容器

```bash
# 停止容器
docker-compose down

# 停止并删除卷
docker-compose down -v
```

## 🔧 常用命令

### 进入容器

```bash
docker exec -it cenjin_web sh
```

### 重启容器

```bash
docker-compose restart web
```

### 重新构建镜像

```bash
# 添加新依赖后需要重建
docker-compose up --build
```

### 查看容器状态

```bash
docker-compose ps
```

## 🎯 开发特性

### ✅ 热更新 (HMR)
- 修改 `.jsx`、`.js`、`.scss` 文件后自动刷新
- 保存文件后 1-2 秒生效
- 无需重启容器

### ✅ 代码挂载
- 宿主机代码实时同步到容器
- 修改即生效，无需重新构建

### ✅ 依赖隔离
- node_modules 使用镜像内的版本
- 避免宿主机与容器的依赖冲突

## 📊 配置说明

### Dockerfile

```dockerfile
FROM node:18-alpine          # 基础镜像
WORKDIR /app                 # 工作目录
COPY package*.json ./        # 复制依赖文件
RUN npm install              # 安装依赖
COPY . .                     # 复制项目文件
EXPOSE 5173                  # 暴露端口
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
```

### docker-compose.yml

```yaml
services:
  web:
    build: .
    container_name: cenjin_web
    ports:
      - "5173:5173"           # 端口映射
    volumes:
      - .:/app                # 挂载代码
      - /app/node_modules     # 保护依赖
    command: npm run dev -- --host 0.0.0.0
```

### vite.config.js

```javascript
export default defineConfig({
  server: {
    host: '0.0.0.0',          // 允许外部访问
    port: 5173,
    watch: {
      usePolling: true,       // Docker 文件监听
    },
    hmr: {
      host: 'localhost',      // 热更新主机
    },
  },
})
```

## ⚠️ 注意事项

### 1. 添加新依赖后需要重建

```bash
# 修改 package.json 后
docker-compose down
docker-compose up --build
```

### 2. 端口占用

确保 5173 端口未被占用：
```bash
lsof -i :5173
```

### 3. 文件权限

如果遇到权限问题：
```bash
sudo chown -R $USER:$USER .
```

### 4. 热更新不生效

检查 Vite 配置：
```javascript
watch: {
  usePolling: true,  // 确保开启轮询
}
```

## 🔄 与后端集成

### 同时运行前后端

```bash
# 在不同终端分别启动

# 终端 1：启动后端
cd cenjin-service
docker-compose up

# 终端 2：启动前端
cd cenjin-web
docker-compose up
```

### 网络连接

前端访问后端 API：
```javascript
// src/utils/request.js
const baseURL = 'http://localhost:3000';
```

## 🐛 故障排除

### 问题 1：容器无法启动

**解决：**
```bash
# 查看详细日志
docker-compose logs web

# 删除旧容器和镜像
docker-compose down
docker rmi cenjin-web-web
docker-compose up --build
```

### 问题 2：热更新不工作

**解决：**
1. 确保 `vite.config.js` 中有 `usePolling: true`
2. 检查文件挂载是否正确
3. 重启容器

### 问题 3：依赖安装失败

**解决：**
```bash
# 清理 Docker 缓存
docker system prune -a

# 重新构建
docker-compose build --no-cache
docker-compose up
```

### 问题 4：Cannot find module

**解决：**
```bash
# 重新构建镜像
docker-compose up --build
```

## 📈 性能优化

### 1. 使用 .dockerignore

确保 `.dockerignore` 排除了不必要的文件，加快构建速度。

### 2. 多阶段构建（生产环境）

```dockerfile
# 开发环境：当前配置
# 生产环境：可以添加 build 阶段
FROM node:18-alpine as builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
```

### 3. 缓存优化

Docker 会缓存每一层，所以先 COPY package.json 再 RUN npm install 可以利用缓存。

## ✅ 总结

```
开发流程：
1. docker-compose up --build    # 首次启动
2. 修改代码                     # 自动热更新
3. 添加依赖后重建               # docker-compose up --build
4. docker-compose down          # 停止

特点：
✅ 热更新支持
✅ 依赖隔离
✅ 简单易用
✅ 与后端 Docker 配置一致
```

---

**创建时间**：2025-12-05
**作者**：GitHub Copilot
