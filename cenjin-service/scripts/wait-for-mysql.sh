#!/bin/sh
# wait-for-mysql.sh

set -e

host="$1"
shift
cmd="$@"

echo "等待 MySQL 启动..."

until mysql -h"$host" -u"$DB_USER" -p"$DB_PASSWORD" -e "SELECT 1" > /dev/null 2>&1; do
  >&2 echo "MySQL 未就绪 - 等待中..."
  sleep 2
done

>&2 echo "✅ MySQL 已就绪！"
exec $cmd
