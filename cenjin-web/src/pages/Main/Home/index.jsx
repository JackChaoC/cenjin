import React, { useState, useEffect, useRef } from 'react';
import * as echarts from 'echarts';
import { getMemberCardStats, getChartData, getRankData } from '../../../api/memberCard';
import './Home.scss';

const Home = () => {
  const chartRef = useRef(null);
  const chartInstanceRef = useRef(null);
  const cumulativeChartRef = useRef(null);
  const cumulativeChartInstanceRef = useRef(null);
  const dashboardRef = useRef(null);
  
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
  const [chartTimeRange, setChartTimeRange] = useState('week'); // week | year
  const [chartData, setChartData] = useState([]);
  const [chartLoading, setChartLoading] = useState(true);
  const [orderData, setOrderData] = useState(null); // 存储订单数据
  
  // 第二个图表数据状态
  const [cumulativeTimeRange, setCumulativeTimeRange] = useState('week'); // week | year
  const [cumulativeData, setCumulativeData] = useState([]);
  const [cumulativeLoading, setCumulativeLoading] = useState(true);

  // 排行榜数据状态
  const [rankData, setRankData] = useState([]);
  const [rankLoading, setRankLoading] = useState(true);
  const [rankYear, setRankYear] = useState('2025'); // 排行榜选择的年份
  const rankListRef = useRef(null);
  const [rankScrollPosition, setRankScrollPosition] = useState(0);

  // 全屏状态
  const [isFullscreen, setIsFullscreen] = useState(false);

  // 加载统计数据
  useEffect(() => {
    loadStats();
    loadOrderData();
    loadRankData();
  }, []);

  // 加载订单数据
  const loadOrderData = async () => {
    try {
      const response = await fetch('/OrderData/index.json');
      const data = await response.json();
      setOrderData(data);
      console.log('Order data loaded:', data);
    } catch (error) {
      console.error('加载订单数据失败:', error);
    }
  };

  // 当图表时间范围变化时重新加载数据
  useEffect(() => {
    if (orderData) {
      updateChartData();
    }
  }, [chartTimeRange, orderData]);

  // 当累积图表时间范围变化时重新加载数据
  useEffect(() => {
    if (orderData) {
      updateCumulativeData();
    }
  }, [cumulativeTimeRange, orderData]);

  // 更新图表数据
  const updateChartData = async () => {
    if (!orderData) return;

    setChartLoading(true);
    try {
      if (chartTimeRange === 'week') {
        // 获取最近7天的数据（从11月最后7天）
        const response = await fetch('/OrderData/2025-11.json');
        const monthData = await response.json();
        const last7Days = monthData.dailyData.slice(-7);
        setChartData(last7Days.map(item => ({
          label: item.date,
          value: item.amount
        })));
      } else {
        // year: 显示所有月份数据
        setChartData(orderData.months.map(item => ({
          label: item.month.split('-')[1] + '月',
          value: item.total
        })));
      }
    } catch (error) {
      console.error('更新图表数据失败:', error);
    } finally {
      setChartLoading(false);
    }
  };

  // 更新累积图表数据
  const updateCumulativeData = async () => {
    if (!orderData) return;

    setCumulativeLoading(true);
    try {
      if (cumulativeTimeRange === 'week') {
        // 获取最近7天的数据并计算累积
        const response = await fetch('/OrderData/2025-11.json');
        const monthData = await response.json();
        const last7Days = monthData.dailyData.slice(-7);
        
        let cumulative = 0;
        const cumulativeArray = last7Days.map(item => {
          cumulative += item.amount;
          return {
            label: item.date,
            value: cumulative
          };
        });
        setCumulativeData(cumulativeArray);
      } else {
        // year: 显示所有月份累积数据
        let cumulative = 0;
        const cumulativeArray = orderData.months.map(item => {
          cumulative += item.total;
          return {
            label: item.month.split('-')[1] + '月',
            value: cumulative
          };
        });
        setCumulativeData(cumulativeArray);
      }
    } catch (error) {
      console.error('更新累积图表数据失败:', error);
    } finally {
      setCumulativeLoading(false);
    }
  };

  // 初始化和更新 ECharts
  useEffect(() => {
    if (!chartRef.current || chartData.length === 0) {
      console.log('chartRef.current is null or no data');
      return;
    }

    // 初始化图表实例
    if (!chartInstanceRef.current) {
      console.log('Initializing ECharts instance');
      chartInstanceRef.current = echarts.init(chartRef.current);
    }

    // 准备数据
    const labels = chartData.map(item => item.label);
    const values = chartData.map(item => item.value);
    
    console.log('Chart data:', { labels, values, timeRange: chartTimeRange });

    // 配置选项
    const option = {
      backgroundColor: 'transparent',
      grid: {
        left: '3%',
        right: '4%',
        bottom: '15%',
        top: '10%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: labels,
        axisLine: {
          lineStyle: {
            color: 'rgba(0, 217, 255, 0.3)'
          }
        },
        axisLabel: {
          color: 'rgba(255, 255, 255, 0.7)',
          fontSize: 11
        }
      },
      yAxis: {
        type: 'value',
        axisLine: {
          show: false
        },
        axisTick: {
          show: false
        },
        axisLabel: {
          color: 'rgba(255, 255, 255, 0.5)',
          fontSize: 11
        },
        splitLine: {
          lineStyle: {
            color: 'rgba(0, 217, 255, 0.1)'
          }
        }
      },
      series: [
        {
          data: values,
          type: 'bar',
          barWidth: '50%',
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: '#00d9ff' },
              { offset: 1, color: '#0088ff' }
            ]),
            borderRadius: [4, 4, 0, 0],
            shadowColor: 'rgba(0, 217, 255, 0.3)',
            shadowBlur: 10
          },
          emphasis: {
            itemStyle: {
              shadowColor: 'rgba(0, 217, 255, 0.6)',
              shadowBlur: 20
            }
          },
          label: {
            show: true,
            position: 'top',
            color: '#ffffff',
            fontSize: 11,
            fontWeight: 500
          }
        }
      ]
    };

    chartInstanceRef.current.setOption(option, true);
    console.log('Chart option set successfully');

    // 响应式处理
    const handleResize = () => {
      chartInstanceRef.current?.resize();
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [chartData, chartTimeRange]);

  // 清理图表实例
  useEffect(() => {
    return () => {
      chartInstanceRef.current?.dispose();
      cumulativeChartInstanceRef.current?.dispose();
    };
  }, []);

  // 初始化和更新累积折线图
  useEffect(() => {
    if (!cumulativeChartRef.current || cumulativeData.length === 0) {
      console.log('cumulativeChartRef.current is null or no data');
      return;
    }

    // 初始化图表实例
    if (!cumulativeChartInstanceRef.current) {
      console.log('Initializing Cumulative ECharts instance');
      cumulativeChartInstanceRef.current = echarts.init(cumulativeChartRef.current);
    }

    // 准备数据
    const labels = cumulativeData.map(item => item.label);
    const values = cumulativeData.map(item => item.value);
    
    console.log('Cumulative chart data:', { labels, values, timeRange: cumulativeTimeRange });

    // 配置选项
    const option = {
      backgroundColor: 'transparent',
      grid: {
        left: '3%',
        right: '4%',
        bottom: '15%',
        top: '10%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: labels,
        axisLine: {
          lineStyle: {
            color: 'rgba(0, 217, 255, 0.3)'
          }
        },
        axisLabel: {
          color: 'rgba(255, 255, 255, 0.7)',
          fontSize: 11
        }
      },
      yAxis: {
        type: 'value',
        axisLine: {
          show: false
        },
        axisTick: {
          show: false
        },
        axisLabel: {
          color: 'rgba(255, 255, 255, 0.5)',
          fontSize: 11
        },
        splitLine: {
          lineStyle: {
            color: 'rgba(0, 217, 255, 0.1)'
          }
        }
      },
      series: [
        {
          data: values,
          type: 'line',
          smooth: true,
          lineStyle: {
            color: '#00d9ff',
            width: 2,
            shadowColor: 'rgba(0, 217, 255, 0.3)',
            shadowBlur: 10
          },
          itemStyle: {
            color: '#00d9ff'
          },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(0, 217, 255, 0.3)' },
              { offset: 1, color: 'rgba(0, 136, 255, 0.1)' }
            ])
          },
          emphasis: {
            itemStyle: {
              color: '#00d9ff',
              borderColor: '#00d9ff',
              borderWidth: 2,
              shadowColor: 'rgba(0, 217, 255, 0.6)',
              shadowBlur: 20
            }
          },
          label: {
            show: true,
            position: 'top',
            color: '#ffffff',
            fontSize: 11,
            fontWeight: 500
          }
        }
      ]
    };

    cumulativeChartInstanceRef.current.setOption(option, true);
    console.log('Cumulative chart option set successfully');

    // 响应式处理
    const handleResize = () => {
      cumulativeChartInstanceRef.current?.resize();
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [cumulativeData, cumulativeTimeRange]);

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
      const response = await fetch('/RankData/index.json');
      const data = await response.json();
      console.log('排行榜数据加载成功:', data);
      setRankData(data);
    } catch (error) {
      console.error('加载排行数据失败:', error);
    } finally {
      setRankLoading(false);
    }
  };

  // 排行榜滚动效果
  useEffect(() => {
    if (!rankListRef.current || rankLoading || !rankData.categories) return;

    const scrollInterval = setInterval(() => {
      setRankScrollPosition(prev => {
        const container = rankListRef.current;
        if (!container) return prev;
        
        const newPosition = prev + 1;
        const itemCount = getCurrentRankData().length;
        const itemHeight = 52; // 每个item高度约为 padding(10*2) + height(30) + gap(12) ≈ 52px
        const halfScrollHeight = itemCount * itemHeight;
        
        // 当滚动到一半位置时（第一组数据完全滚出），重置到开始
        if (newPosition >= halfScrollHeight) {
          return 0;
        }
        return newPosition;
      });
    }, 30); // 每30ms滚动1px，更流畅

    return () => clearInterval(scrollInterval);
  }, [rankLoading, rankData, rankYear]);

  // 切换年份时重置滚动位置
  useEffect(() => {
    setRankScrollPosition(0);
  }, [rankYear]);

  // 应用滚动位置
  useEffect(() => {
    if (rankListRef.current) {
      rankListRef.current.scrollTop = rankScrollPosition;
    }
  }, [rankScrollPosition]);

  // 获取当前年份的排行榜数据
  const getCurrentRankData = () => {
    if (!rankData.categories) return [];
    
    return rankData.categories
      .map(category => ({
        name: category.name,
        value: category.data[rankYear] || 0
      }))
      .sort((a, b) => b.value - a.value); // 按值降序排列
  };

  // 切换图表时间范围
  const handleChartTimeRangeChange = (range) => {
    setChartTimeRange(range);
  };

  // 全屏切换
  const toggleFullscreen = () => {
    if (!dashboardRef.current) return;

    if (!document.fullscreenElement) {
      // 进入全屏
      dashboardRef.current.requestFullscreen().then(() => {
        setIsFullscreen(true);
      }).catch(err => {
        console.error('进入全屏失败:', err);
      });
    } else {
      // 退出全屏
      document.exitFullscreen().then(() => {
        setIsFullscreen(false);
      }).catch(err => {
        console.error('退出全屏失败:', err);
      });
    }
  };

  // 监听全屏状态变化
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  // 格式化金额
  const formatAmount = (amount) => {
    return amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  return (
    <div className="home-dashboard" ref={dashboardRef}>
      {/* Background Video */}
      <video 
        className="background-video" 
        autoPlay 
        loop 
        muted 
        playsInline
      >
        <source src="https://pphd.fun/screen/media/bg.mp4" type="video/mp4" />
      </video>
      
      {/* Title with Header Image */}
      <div className="dashboard-title">
        <img 
          className="header-image" 
          src="https://www.pphd.fun/screen/img/head.png" 
          alt="header"
        />
        <h1>数据分析驾驶舱</h1>
        <button className="fullscreen-btn" onClick={toggleFullscreen}>
          {isFullscreen ? '⛶' : '⛶'}
        </button>
      </div>

      {/* 内容区域 - 三列布局 */}
      <div className="content-area">
        {/* 左侧数据面板区域 */}
        <div className="data-panel-section">
          <div className="title-wrapper">
            <img 
              className="title-background" 
              src="https://www.pphd.fun/screen/img/icon1.png" 
              alt="icon"
            />
            <h2 className="section-title">订单系统分析</h2>
          </div>
          
          {/* 订单成交趋势 */}
          <div className="chart-container">
          <div className="chart-header">
            <h3 className="chart-title">订单成交趋势</h3>
            <div className="chart-controls">
              <button 
                className={`control-btn ${chartTimeRange === 'week' ? 'active' : ''}`}
                onClick={() => setChartTimeRange('week')}
              >
                近7天
              </button>
              <button 
                className={`control-btn ${chartTimeRange === 'year' ? 'active' : ''}`}
                onClick={() => setChartTimeRange('year')}
              >
                近1年
              </button>
            </div>
          </div>
          
          <div className="chart-content">
            <div ref={chartRef} className="bar-chart"></div>
          </div>
        </div>

          {/* 累积订单金额趋势 */}
          <div className="chart-container">
          <div className="chart-header">
            <h3 className="chart-title">累积订单金额趋势</h3>
            <div className="chart-controls">
              <button 
                className={`control-btn ${cumulativeTimeRange === 'week' ? 'active' : ''}`}
                onClick={() => setCumulativeTimeRange('week')}
              >
                近7天
              </button>
              <button 
                className={`control-btn ${cumulativeTimeRange === 'year' ? 'active' : ''}`}
                onClick={() => setCumulativeTimeRange('year')}
              >
                近1年
              </button>
            </div>
          </div>
          
          <div className="chart-content">
            <div ref={cumulativeChartRef} className="bar-chart"></div>
          </div>
        </div>

          {/* 商品卡成交订单排行 */}
          <div className="chart-container rank-container">
            <div className="chart-header">
              <h3 className="chart-title">商品卡成交订单排行</h3>
              <div className="chart-controls">
                <select 
                  className="year-selector"
                  value={rankYear}
                  onChange={(e) => setRankYear(e.target.value)}
                >
                  {rankData.years && rankData.years.map(year => (
                    <option key={year} value={year}>
                      {year}年
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="rank-content" ref={rankListRef}>
              {rankLoading ? (
                <div className="rank-loading">加载中...</div>
              ) : (
                <div className="rank-list">
                  {getCurrentRankData().map((item, index) => {
                    const maxValue = getCurrentRankData()[0]?.value || 1;
                    const percentage = (item.value / maxValue) * 100;
                    
                    return (
                      <div key={index} className="rank-item">
                        <div className="rank-number">{index + 1}</div>
                        <div className="rank-name">{item.name}</div>
                        <div className="rank-bar">
                          <div 
                            className="rank-fill" 
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                        <div className="rank-value">{item.value}</div>
                      </div>
                    );
                  })}
                  {/* 复制一份数据用于无缝循环 */}
                  {getCurrentRankData().map((item, index) => {
                    const maxValue = getCurrentRankData()[0]?.value || 1;
                    const percentage = (item.value / maxValue) * 100;
                    
                    return (
                      <div key={`duplicate-${index}`} className="rank-item">
                        <div className="rank-number">{index + 1}</div>
                        <div className="rank-name">{item.name}</div>
                        <div className="rank-bar">
                          <div 
                            className="rank-fill" 
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                        <div className="rank-value">{item.value}</div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 右边区域 - 占3格 */}
        <div className="right-section">
          <div className="right-section-top">
              <div className="right-section-top-item">
                <p className='p1'>本年购买订单</p>
                <p className='p2'>18,987</p>
              </div>
              <div className="right-section-top-item">
                <p className='p1'>本年购买金额</p>
                <p className='p2'>6,268,162.70</p>
              </div>
              <div className="right-section-top-item">
                <p className='p1'>本年购买订单数量</p>
                <p className='p2'>18,987</p>
              </div>
              <div className="right-section-top-item">
                <p className='p1'>本年销售金额</p>
                <p className='p2'>5,995,102</p>
              </div>
          </div>
        </div>

      </div>

    </div>
  );
};

export default Home;
