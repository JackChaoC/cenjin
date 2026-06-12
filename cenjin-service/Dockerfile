# === 阶段 1: 依赖安装与打包编译 ===
FROM node:20-alpine AS builder

WORKDIR /app

# 【修改】全面拥抱 NPM，复制 package-lock.json 而不是 yarn.lock
COPY package.json package-lock.json ./

# 安装全部依赖（包含 devDependencies，用于 build）
RUN npm ci

# 复制源码并打包
COPY . .
RUN npm run build

# 【修改】使用 npm prune 代替 yarn install --production
# 它会自动帮你删掉 node_modules 里的 devDependencies，只留下生产依赖，极为优雅且安全
RUN npm prune --production

# === 阶段 2: 最终运行镜像 ===
FROM node:20-alpine AS runner

WORKDIR /app

# 设置为生产环境环境变量
ENV NODE_ENV=production

# 从 builder 复制生产依赖和打包产物
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY package.json ./

EXPOSE 3000

# 【修改】启动命令改为 npm start
CMD ["npm", "start"]