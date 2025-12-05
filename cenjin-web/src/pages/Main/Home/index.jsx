import React, { useState, useEffect } from 'react';
import { getMemberCardStats, getChartData, getRankData } from '../../../api/memberCard';
import './Home.scss';

const Home = () => {
  const [stats, setStats] = useState({
    // 月度数据
    currentMonthCount: 0,
    currentMonthSalesAmount: 0,
    currentMonthProfit: 0,
    currentMonthPendingCount: 0,
    // 年度数据
    currentYearCount: 0,
    currentYearPurchaseAmount: 0,
    currentYearSalesAmount: 0,
    currentYearShippedCount: 0
  });
  const [loading, setLoading] = useState(true);
  
  // 图表数据状态
  const [chartTimeRange, setChartTimeRange] = useState('month'); // week | month | year
  const [chartData, setChartData] = useState([]);
  const [chartLoading, setChartLoading] = useState(true);

  // 排行榜数据状态
  const [rankData, setRankData] = useState([]);
  const [rankLoading, setRankLoading] = useState(true);

  // 加载统计数据
  useEffect(() => {
    loadStats();
    loadChartData(chartTimeRange);
    loadRankData();
  }, []);

  // 当图表时间范围变化时重新加载数据
  useEffect(() => {
    loadChartData(chartTimeRange);
  }, [chartTimeRange]);

  const loadStats = async () => {
    try {
      setLoading(true);
      const response = await getMemberCardStats();
      if (response.success) {
        setStats({
          // 月度数据
          currentMonthCount: response.data.currentMonthCount || 0,
          currentMonthSalesAmount: response.data.currentMonthSalesAmount || 0,
          currentMonthProfit: response.data.currentMonthProfit || 0,
          currentMonthPendingCount: response.data.currentMonthPendingCount || 0,
          // 年度数据
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

  const loadChartData = async (timeRange) => {
    try {
      setChartLoading(true);
      const response = await getChartData(timeRange);
      if (response.success) {
        setChartData(response.data.chartData || []);
      }
    } catch (error) {
      console.error('加载图表数据失败:', error);
    } finally {
      setChartLoading(false);
    }
  };

  const loadRankData = async () => {
    try {
      setRankLoading(true);
      console.log('开始加载排行榜数据...');
      const response = await getRankData();
      console.log('排行榜 API 响应:', response);
      if (response.success) {
        console.log('排行榜数据:', response.data);
        setRankData(response.data || []);
      } else {
        console.error('排行榜 API 返回失败:', response);
      }
    } catch (error) {
      console.error('加载排行数据失败:', error);
    } finally {
      setRankLoading(false);
    }
  };

  // 切换图表时间范围
  const handleChartTimeRangeChange = (range) => {
    setChartTimeRange(range);
  };

  // 格式化金额
  const formatAmount = (amount) => {
    return amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  return (
    <div className="home-dashboard">
      {/* Breadcrumb */}
      <div className="breadcrumb">
        <span className="breadcrumb-item active">首页</span>
      </div>

      {/* Title */}
      <div className="dashboard-title">
        <div className="title-decoration left"></div>
        <h1>数据分析驾驶舱</h1>
        <div className="title-decoration right"></div>
        <button className="fullscreen-btn">⛶</button>
      </div>

      {/* Stats Cards - 月度统计 */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">本月订单数量</div>
          <div className="stat-value">
            {loading ? '加载中...' : stats.currentMonthCount.toLocaleString()}
          </div>
          <div className="stat-badge" title="本月累计订单总数">订单数 · 月</div>
          <div className="stat-desc">权益卡订单总量统计</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">本月销售金额(元)</div>
          <div className="stat-value">
            {loading ? '加载中...' : formatAmount(stats.currentMonthSalesAmount)}
          </div>
          <div className="stat-badge" title="按售价统计的销售总额">销售额 · 月</div>
          <div className="stat-desc">所有订单售价总和</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">本月利润(元)</div>
          <div className="stat-value">
            {loading ? '加载中...' : formatAmount(stats.currentMonthProfit)}
          </div>
          <div className="stat-badge" title="销售额减去进货成本">利润 · 月</div>
          <div className="stat-desc">
            {stats.currentMonthSalesAmount > 0 
              ? `利润率 ${((stats.currentMonthProfit / stats.currentMonthSalesAmount) * 100).toFixed(1)}%`
              : '暂无数据'}
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-label">待发货数量</div>
          <div className="stat-value">
            {loading ? '加载中...' : stats.currentMonthPendingCount.toLocaleString()}
          </div>
          <div className="stat-badge" title="未出库的订单数量">库存 · 月</div>
          <div className="stat-desc">
            {stats.currentMonthCount > 0 
              ? `待发率 ${((stats.currentMonthPendingCount / stats.currentMonthCount) * 100).toFixed(1)}%`
              : '暂无数据'}
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="content-grid">
        {/* Left Column - Charts */}
        <div className="left-column">
          <div className="chart-panel">
            <div className="panel-header">
              <h3>订单统计分析</h3>
              <div className="chart-controls">
                <div className="chart-tabs">
                  <button 
                    className={`tab ${chartTimeRange === 'month' ? 'active' : ''}`}
                    onClick={() => handleChartTimeRangeChange('month')}
                  >
                    本月
                  </button>
                  <button 
                    className={`tab ${chartTimeRange === 'year' ? 'active' : ''}`}
                    onClick={() => handleChartTimeRangeChange('year')}
                  >
                    本年
                  </button>
                </div>
              </div>
            </div>
            <div className="chart-content">
              <div className="chart-title">订单成交趋势</div>
              {chartLoading ? (
                <div className="chart-loading">加载中...</div>
              ) : chartData.length === 0 ? (
                <div className="chart-empty">暂无数据</div>
              ) : (
                <div className="chart-placeholder">
                  <div className="chart-bars">
                    {chartData.map((item, i) => {
                      const maxCount = Math.max(...chartData.map(d => d.orderCount), 1);
                      const height = (item.orderCount / maxCount) * 100;
                      return (
                        <div key={i} className="bar" style={{ height: `${height}px` }}>
                          <div className="bar-fill" title={`${item.date}: ${item.orderCount} 单`}></div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="chart-axis">
                    {chartData.map((item, i) => (
                      <span key={i}>{item.date.substring(5)}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="chart-panel">
            <div className="panel-header">
              <h3>订单金额趋势</h3>
              <div className="chart-controls">
                <div className="chart-tabs">
                  <button 
                    className={`tab ${chartTimeRange === 'month' ? 'active' : ''}`}
                    onClick={() => handleChartTimeRangeChange('month')}
                  >
                    本月
                  </button>
                  <button 
                    className={`tab ${chartTimeRange === 'year' ? 'active' : ''}`}
                    onClick={() => handleChartTimeRangeChange('year')}
                  >
                    本年
                  </button>
                </div>
              </div>
            </div>
            <div className="chart-content">
              {chartLoading ? (
                <div className="chart-loading">加载中...</div>
              ) : chartData.length === 0 ? (
                <div className="chart-empty">暂无数据</div>
              ) : (
                <div className="chart-placeholder">
                  <div className="amount-chart">
                    {chartData.map((item, i) => {
                      const maxAmount = Math.max(...chartData.map(d => d.salesAmount), 1);
                      const height = (item.salesAmount / maxAmount) * 120;
                      const profitRate = item.salesAmount > 0 
                        ? ((item.profit / item.salesAmount) * 100).toFixed(1) 
                        : 0;
                      return (
                        <div key={i} className="amount-bar">
                          <div 
                            className="amount-fill" 
                            style={{ height: `${height}px` }}
                            title={`${item.date}\n销售额: ¥${item.salesAmount.toFixed(2)}\n利润: ¥${item.profit.toFixed(2)}\n利润率: ${profitRate}%`}
                          >
                            <span className="amount-value">¥{(item.salesAmount / 1000).toFixed(1)}k</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="chart-axis">
                    {chartData.map((item, i) => (
                      <span key={i}>{item.date.substring(5)}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="rank-panel">
            <div className="panel-header">
              <h3>商品卡类交付排行</h3>
              <div className="rank-controls">
                <button className="rank-tab">累计</button>
              </div>
            </div>
            <div className="rank-list">
              {rankLoading ? (
                <div className="chart-loading">加载中...</div>
              ) : rankData.length === 0 ? (
                <div className="empty-state">暂无交付数据</div>
              ) : (
                rankData.map((item) => {
                  const maxValue = rankData[0]?.deliveryCount || 1;
                  return (
                    <div key={item.rank} className="rank-item">
                      <span className="rank-number">{item.rank}</span>
                      <span className="rank-name">{item.productName}</span>
                      <div className="rank-bar">
                        <div className="rank-fill" style={{ width: `${(item.deliveryCount / maxValue) * 100}%` }}></div>
                      </div>
                      <span className="rank-value">{item.deliveryCount}</span>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Right Column - 3D Map Visualization */}
        <div className="right-column">
          <div className="map-panel">
            <div className="map-container">
              {/* 3D Map Placeholder - This would be a real 3D visualization in production */}
              <div className="map-background"></div>
              <div className="map-overlay">
                <div className="data-point" style={{ top: '30%', left: '40%' }}></div>
                <div className="data-point" style={{ top: '50%', left: '60%' }}></div>
                <div className="data-point" style={{ top: '70%', left: '35%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
