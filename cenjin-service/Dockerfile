# === 阶段 1: 依赖安装与打包编译 ===
FROM node:20-alpine AS builder

WORKDIR /app

# 复制 Yarn 的依赖描述文件
COPY package.json yarn.lock ./

# 【修改】严格按照 yarn.lock 安装全部依赖（包含开发依赖，用于跑 build）
RUN yarn --frozen-lockfile

# 复制源码
COPY . .

# 执行你刚刚加上的 build 脚本（会打印一条提示并成功退出）
RUN yarn build

# 【修改】斩断开发依赖！只留下生产环境必需的包（实现镜像瘦身）
RUN yarn install --production --frozen-lockfile --ignore-scripts

# === 阶段 2: 最终运行镜像 ===
FROM node:20-alpine AS runner

WORKDIR /app

# 设置为生产环境环境变量
ENV NODE_ENV=production

# 【修改】从 builder 复制精简后的生产依赖和所有源码文件
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app ./

EXPOSE 3000

# 【修改】启动命令改回 yarn start
CMD ["yarn", "start"]