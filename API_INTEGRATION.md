# 前后端对接说明

## 环境配置

### 后端（cenjin-service）

1. 启动 MySQL 数据库（Docker）:
```bash
cd /Users/user/Desktop/projects/cenjin-service
docker-compose up -d
```

2. 运行数据库迁移:
```bash
yarn db:migrate
```

3. 启动后端服务:
```bash
yarn dev
```

后端将运行在 `http://localhost:3000`

### 前端（cenjin-web）

1. 确保后端已经启动

2. 启动前端开发服务器:
```bash
cd /Users/user/Desktop/projects/cenjin-web
yarn dev
```

前端将运行在 `http://localhost:5173`

## API 配置

前端默认连接到 `http://localhost:3000/api`

如需修改，可以创建 `.env` 文件：
```env
VITE_API_BASE_URL=http://localhost:3000/api
```

## 登录测试

使用超级管理员账号登录：
- **账号**: admin
- **密码**: admin
- **验证码**: 6 (固定值 8 - 2 = 6)

## 功能说明

### 前端
- ✅ 登录页面 UI
- ✅ 表单验证
- ✅ 错误提示
- ✅ Loading 状态
- ✅ 记住密码功能
- ✅ 回车键登录
- ✅ 认证状态管理（AuthContext）
- ✅ 私有路由保护
- ✅ Token 自动携带
- ✅ 401 自动登出

### 后端
- ✅ JWT 认证服务
- ✅ 登录 API (`POST /api/auth/login`)
- ✅ 注册 API (`POST /api/auth/register`)
- ✅ 验证 Token (`POST /api/auth/verify`)
- ✅ 刷新 Token (`POST /api/auth/refresh`)
- ✅ 获取用户信息 (`GET /api/auth/me`)
- ✅ 认证中间件
- ✅ 密码加密（bcrypt）
- ✅ Token 过期时间（7天）

## API 端点

### 认证相关

#### 登录
```
POST /api/auth/login
Content-Type: application/json

{
  "account": "admin",
  "password": "admin"
}

Response:
{
  "success": true,
  "message": "登录成功",
  "data": {
    "user": {
      "id": 1,
      "username": "超级管理员",
      "account": "admin",
      "createdAt": "2025-12-03T07:44:42.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### 获取当前用户
```
GET /api/auth/me
Authorization: Bearer <token>

Response:
{
  "success": true,
  "data": {
    "id": 1,
    "account": "admin",
    "username": "超级管理员",
    "iat": 1701590682,
    "exp": 1702195482
  }
}
```

## 文件结构

### 前端
```
src/
├── api/
│   └── auth.js              # 认证相关 API
├── contexts/
│   └── AuthContext.jsx      # 认证状态管理
├── components/
│   └── PrivateRoute.jsx     # 私有路由组件
├── utils/
│   └── request.js           # Axios 封装
└── pages/
    └── Login/
        ├── index.jsx        # 登录页面
        └── Login.scss       # 登录样式
```

### 后端
```
src/
├── utils/
│   └── jwt.js               # JWT 工具类
├── services/
│   └── auth/
│       └── login.service.js # 认证服务层
├── routes/
│   ├── auth/
│   │   └── index.js         # 认证路由
│   └── index.js             # 路由聚合
└── middlewares/
    └── auth.middleware.js   # 认证中间件
```

## 注意事项

1. 确保后端服务先启动
2. 检查数据库连接是否正常
3. 确保超级管理员已经通过 migration 创建
4. 前端会自动处理 401 错误并跳转到登录页
5. Token 会自动保存在 localStorage 中
6. 刷新页面不会丢失登录状态
