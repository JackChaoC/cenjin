# 首页统计数据功能完成 ✅

## 📊 功能说明

在首页添加了实时统计数据，展示以下四个关键指标：

1. **本年订单数量** - 统计从今年 1 月 1 日至今的所有订单数量
2. **本年购买金额(元)** - 统计所有订单的进价总和（importPrice）
3. **本年销售金额(元)** - 统计所有订单的售价总和（price）
4. **已出库数量** - 统计状态为"已出库"的订单数量

## 🔧 实现细节

### 1. 后端 API 增强

#### 文件：`/cenjin-service/src/routes/memberCard/index.js`

**修改内容**：
- 扩展了 `/member-card/stats` 接口，增加年度统计数据
- 保留了原有的月度统计（不影响其他功能）

**新增统计字段**：
```javascript
// 年度统计
const currentYearStart = new Date(now.getFullYear(), 0, 1); // 本年1月1日

// 本年所有订单
const currentYearCards = await MemberCard.findAll({
  where: {
    orderTime: {
      [Op.gte]: currentYearStart
    }
  }
});

// 计算统计数据
const currentYearCount = currentYearCards.length; // 订单数量
const currentYearPurchaseAmount = currentYearCards.reduce(
  (sum, card) => sum + parseFloat(card.importPrice || 0), 0
); // 购买金额(进价)
const currentYearSalesAmount = currentYearCards.reduce(
  (sum, card) => sum + parseFloat(card.price || 0), 0
); // 销售金额(售价)
const currentYearShippedCount = currentYearCards.filter(
  card => card.status === '已出库'
).length; // 已出库数量
```

**返回数据结构**：
```json
{
  "success": true,
  "data": {
    // 月度数据（原有）
    "currentMonthCount": 100,
    "currentMonthAmount": 50000.00,
    "lastMonthCount": 95,
    "lastMonthAmount": 48000.00,
    
    // 年度数据（新增）
    "currentYearCount": 1200,
    "currentYearPurchaseAmount": 580000.00,
    "currentYearSalesAmount": 600000.00,
    "currentYearShippedCount": 1100
  }
}
```

### 2. 前端数据获取

#### 文件：`/cenjin-web/src/pages/Main/Home/index.jsx`

**新增功能**：

1. **引入依赖**
```jsx
import React, { useState, useEffect } from 'react';
import { getMemberCardStats } from '../../../api/memberCard';
```

2. **状态管理**
```jsx
const [stats, setStats] = useState({
  currentYearCount: 0,
  currentYearPurchaseAmount: 0,
  currentYearSalesAmount: 0,
  currentYearShippedCount: 0
});
const [loading, setLoading] = useState(true);
```

3. **数据加载**
```jsx
useEffect(() => {
  loadStats();
}, []);

const loadStats = async () => {
  try {
    setLoading(true);
    const response = await getMemberCardStats();
    if (response.success) {
      setStats({
        currentYearCount: response.data.currentYearCount || 0,
        currentYearPurchaseAmount: response.data.currentYearPurchaseAmount || 0,
        currentYearSalesAmount: response.data.currentYearSalesAmount || 0,
        currentYearShippedCount: response.data.currentYearShippedCount || 0
      });
    }
  } catch (error) {
    console.error('加载统计数据失败:', error);
  } finally {
    setLoading(false);
  }
};
```

4. **金额格式化**
```jsx
const formatAmount = (amount) => {
  return amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};
```

5. **UI 展示**
```jsx
<div className="stats-grid">
  <div className="stat-card">
    <div className="stat-label">本年订单数量</div>
    <div className="stat-value">
      {loading ? '加载中...' : stats.currentYearCount.toLocaleString()}
    </div>
    <div className="stat-badge">年</div>
  </div>
  
  <div className="stat-card">
    <div className="stat-label">本年购买金额(元)</div>
    <div className="stat-value">
      {loading ? '加载中...' : formatAmount(stats.currentYearPurchaseAmount)}
    </div>
    <div className="stat-badge">年</div>
  </div>
  
  <div className="stat-card">
    <div className="stat-label">本年销售金额(元)</div>
    <div className="stat-value">
      {loading ? '加载中...' : formatAmount(stats.currentYearSalesAmount)}
    </div>
    <div className="stat-badge">年</div>
  </div>
  
  <div className="stat-card">
    <div className="stat-label">已出库数量</div>
    <div className="stat-value">
      {loading ? '加载中...' : stats.currentYearShippedCount.toLocaleString()}
    </div>
    <div className="stat-badge">年</div>
  </div>
</div>
```

## 📈 数据说明

### 统计维度

| 指标 | 数据源 | 计算方式 | 说明 |
|------|--------|----------|------|
| 本年订单数量 | MemberCard 表 | COUNT(*) WHERE orderTime >= 本年1月1日 | 统计所有订单 |
| 本年购买金额 | importPrice 字段 | SUM(importPrice) | 统计进价总和 |
| 本年销售金额 | price 字段 | SUM(price) | 统计售价总和 |
| 已出库数量 | status 字段 | COUNT(*) WHERE status = '已出库' | 只统计已出库订单 |

### 时间范围

- **本年**：当前年份的 1 月 1 日 00:00:00 至当前时间
- **动态更新**：每次访问首页时重新加载最新数据

### 数据格式化

1. **数量格式化**
   - 使用 `toLocaleString()` 添加千位分隔符
   - 例如：`1200` → `1,200`

2. **金额格式化**
   - 保留两位小数
   - 添加千位分隔符
   - 例如：`580000.5` → `580,000.50`

## 🎨 UI 展示

### 统计卡片布局

```
┌─────────────────────────────────────────────────────────────┐
│                    首页 - 数据分析驾驶舱                     │
├─────────────┬─────────────┬─────────────┬─────────────────┤
│ 本年订单数量 │ 本年购买金额 │ 本年销售金额 │   已出库数量     │
│             │     (元)     │     (元)     │                 │
│   1,200     │ 580,000.50  │ 600,000.50  │     1,100       │
│     年      │     年      │     年      │       年        │
└─────────────┴─────────────┴─────────────┴─────────────────┘
```

### 样式特点

- **背景渐变**：蓝色科技感渐变
- **发光效果**：数值带有发光阴影
- **响应式布局**：4 列网格自适应
- **加载状态**：显示"加载中..."提示

## 🔄 数据流程

```
┌──────────────┐     HTTP GET      ┌──────────────┐
│   前端首页    │ ───────────────> │  后端 API     │
│  Home.jsx    │                   │  /stats       │
└──────────────┘                   └──────────────┘
       ↑                                  │
       │                                  │ SQL 查询
       │                                  ↓
       │                           ┌──────────────┐
       │          JSON 响应         │  MySQL 数据库 │
       └───────────────────────── │  MemberCard  │
                                   └──────────────┘
```

### 完整流程

1. **用户访问首页**
   - 组件挂载时触发 `useEffect`
   
2. **调用 API**
   - `getMemberCardStats()` 发送 GET 请求到 `/member-card/stats`
   
3. **后端查询**
   - 计算本年 1 月 1 日时间戳
   - 查询所有本年订单
   - 计算各项统计数据
   
4. **返回数据**
   - JSON 格式返回统计结果
   
5. **前端渲染**
   - 更新 state
   - 格式化数据
   - 展示在统计卡片上

## 🚀 使用方式

### 启动项目

1. **启动后端服务**
```bash
cd cenjin-service
npm start
# 或使用 Docker
docker-compose up
```

2. **启动前端服务**
```bash
cd cenjin-web
npm run dev
```

3. **访问首页**
```
http://localhost:5173/main/home
```

### 查看统计数据

- 首页会自动加载并显示统计数据
- 数据每次进入首页时刷新
- 如果加载失败，会显示默认值 0

## 📊 测试数据

### 生成测试数据

使用之前创建的假数据生成脚本：

```bash
cd cenjin-service
npm run generate:fake-data
```

然后在前端导入生成的 `data.xlsx` 文件，即可看到统计数据变化。

### 验证统计准确性

1. **订单数量验证**
   - 在权益卡收益页面查看总记录数
   - 应与首页"本年订单数量"一致

2. **金额验证**
   - 导出 Excel 文件
   - 使用 Excel 的 SUM 函数验证进价和售价总和

3. **出库数量验证**
   - 在列表中筛选"已出库"状态
   - 统计数量应与首页一致

## 🔍 常见问题

### Q: 统计数据不更新？
**A**: 检查以下几点：
1. 确保后端服务正常运行
2. 检查浏览器控制台是否有错误
3. 验证 JWT token 是否有效（未过期）
4. 刷新页面重新加载数据

### Q: 金额显示为 0？
**A**: 可能原因：
1. 数据库中没有本年度的订单
2. `orderTime` 字段为空
3. `importPrice` 或 `price` 字段为空或 0

### Q: 加载很慢？
**A**: 优化建议：
1. 在数据库中为 `orderTime` 字段添加索引
2. 考虑添加缓存机制（Redis）
3. 使用 SQL 聚合函数代替 JS 计算

## 🎯 未来优化建议

### 1. 添加缓存
```javascript
// 使用 Redis 缓存统计数据，5分钟过期
const cacheKey = 'stats:yearly';
const cachedData = await redis.get(cacheKey);
if (cachedData) {
  return JSON.parse(cachedData);
}
// 查询数据库...
await redis.setex(cacheKey, 300, JSON.stringify(stats));
```

### 2. 数据库优化
```sql
-- 添加索引提升查询性能
CREATE INDEX idx_order_time ON member_cards(order_time);
CREATE INDEX idx_status ON member_cards(status);
```

### 3. 使用 SQL 聚合
```javascript
// 直接在数据库层面计算，性能更好
const stats = await MemberCard.findOne({
  where: { orderTime: { [Op.gte]: currentYearStart } },
  attributes: [
    [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
    [sequelize.fn('SUM', sequelize.col('importPrice')), 'purchaseAmount'],
    [sequelize.fn('SUM', sequelize.col('price')), 'salesAmount'],
    [sequelize.literal("SUM(CASE WHEN status = '已出库' THEN 1 ELSE 0 END)"), 'shippedCount']
  ],
  raw: true
});
```

### 4. 实时刷新
```javascript
// 使用 WebSocket 或轮询实现数据实时更新
useEffect(() => {
  const interval = setInterval(() => {
    loadStats();
  }, 60000); // 每分钟刷新一次
  
  return () => clearInterval(interval);
}, []);
```

### 5. 图表展示
- 添加订单趋势折线图
- 添加金额对比柱状图
- 添加出库率饼图

## ✅ 完成清单

- [x] 后端添加年度统计接口
- [x] 前端集成 API 调用
- [x] 实现数据加载和状态管理
- [x] 金额和数量格式化
- [x] 加载状态提示
- [x] 错误处理
- [x] UI 优化

---

**更新时间**：2025-12-04
**更新人**：GitHub Copilot
**版本**：v1.0.0
