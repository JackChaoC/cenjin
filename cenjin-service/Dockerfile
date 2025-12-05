# 使用官方 Node.js 镜像作为基础镜像（统一使用 Node 20）
FROM node:20-alpine

# 设置工作目录
WORKDIR /app

# 安装 MySQL 客户端（用于健康检查和数据库操作）
RUN apk add --no-cache mysql-client

# 复制 package.json 和 yarn.lock
COPY package.json yarn.lock ./

# 安装依赖
RUN yarn install --frozen-lockfile

# 复制项目文件
COPY . .

# 暴露端口
EXPOSE 3000

# 启动命令（会在 docker-compose.yml 中覆盖）
CMD ["yarn", "start"]
