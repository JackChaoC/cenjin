.PHONY: help build up down restart logs clean migrate seed

help: ## 显示帮助信息
	@echo "岑津科技管理系统 - Docker 命令"
	@echo ""
	@echo "使用方法: make [命令]"
	@echo ""
	@echo "可用命令:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2}'

build: ## 构建 Docker 镜像
	docker-compose build

up: ## 启动所有服务
	docker-compose up -d
	@echo "✅ 服务已启动！"
	@echo "应用: http://localhost:3000"
	@echo "查看日志: make logs"

down: ## 停止所有服务
	docker-compose down
	@echo "✅ 服务已停止！"

restart: ## 重启所有服务
	docker-compose restart
	@echo "✅ 服务已重启！"

logs: ## 查看日志
	docker-compose logs -f

clean: ## 清理所有容器和数据卷
	docker-compose down -v
	@echo "✅ 已清理所有数据！"

migrate: ## 运行数据库迁移
	docker exec -it cenjin_app yarn db:migrate
	@echo "✅ 迁移完成！"

seed: ## 运行种子文件
	docker exec -it cenjin_app yarn db:seed
	@echo "✅ 种子数据已插入！"

shell-app: ## 进入应用容器
	docker exec -it cenjin_app sh

shell-db: ## 进入数据库容器
	docker exec -it cenjin_mysql bash

mysql: ## 连接 MySQL 数据库
	docker exec -it cenjin_mysql mysql -u root -proot cenjin_db

status: ## 查看服务状态
	docker-compose ps

rebuild: ## 重建并启动服务
	docker-compose up -d --build
	@echo "✅ 服务已重建并启动！"
