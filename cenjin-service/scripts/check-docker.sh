#!/bin/bash

echo "🐳 岑津科技 Docker 环境测试"
echo "================================"
echo ""

# 检查 Docker 是否安装
echo "1️⃣  检查 Docker..."
if command -v docker &> /dev/null; then
    echo "✅ Docker 已安装: $(docker --version)"
else
    echo "❌ Docker 未安装"
    exit 1
fi

# 检查 Docker Compose 是否安装
echo ""
echo "2️⃣  检查 Docker Compose..."
if command -v docker-compose &> /dev/null; then
    echo "✅ Docker Compose 已安装: $(docker-compose --version)"
else
    echo "❌ Docker Compose 未安装"
    exit 1
fi

# 检查 Docker 服务是否运行
echo ""
echo "3️⃣  检查 Docker 服务..."
if docker info &> /dev/null; then
    echo "✅ Docker 服务正在运行"
else
    echo "❌ Docker 服务未运行，请启动 Docker Desktop"
    exit 1
fi

# 检查配置文件
echo ""
echo "4️⃣  检查配置文件..."
files=("Dockerfile" "docker-compose.yml" "config/config.js" ".dockerignore")
all_exist=true

for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file 存在"
    else
        echo "❌ $file 不存在"
        all_exist=false
    fi
done

if [ "$all_exist" = false ]; then
    echo "❌ 部分配置文件缺失"
    exit 1
fi

# 检查端口占用
echo ""
echo "5️⃣  检查端口占用..."
if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo "⚠️  端口 3000 已被占用"
    echo "   运行以下命令释放端口："
    echo "   lsof -ti:3000 | xargs kill -9"
else
    echo "✅ 端口 3000 可用"
fi

if lsof -Pi :3306 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo "⚠️  端口 3306 已被占用"
    echo "   运行以下命令释放端口："
    echo "   lsof -ti:3306 | xargs kill -9"
else
    echo "✅ 端口 3306 可用"
fi

echo ""
echo "================================"
echo "✨ 环境检查完成！"
echo ""
echo "下一步："
echo "1. 构建镜像: docker-compose build"
echo "2. 启动服务: docker-compose up -d"
echo "3. 查看日志: docker-compose logs -f"
echo "4. 访问应用: http://localhost:3000"
echo ""
echo "或使用 Makefile:"
echo "  make build"
echo "  make up"
echo "  make logs"
