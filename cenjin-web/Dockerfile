# 使用官方 Node.js 镜像作为基础镜像（Vite 7 需要 Node 20+）
FROM node:20-alpine

# 设置工作目录
WORKDIR /app

# 复制 package.json 和 package-lock.json（如果存在）
COPY package*.json ./

# 安装依赖
RUN npm install

# 复制项目文件
COPY . .

# 暴露 Vite 默认端口
EXPOSE 5173

# 启动开发服务器
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
