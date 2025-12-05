/**
 * 接口访问日志中间件
 * 以 JSON 格式记录每个 API 请求的信息到控制台
 */
const logger = (req, res, next) => {
  const startTime = Date.now();
  
  // 获取请求信息
  const requestLog = {
    time: new Date().toISOString(),
    method: req.method,
    path: req.path,
    query: req.query,
    params: req.params,
    body: sanitizeBody(req.body)
  };

  // 打印请求日志
  console.log('\n' + '━'.repeat(80));
  console.log('� REQUEST:', JSON.stringify(requestLog, null, 2));

  // 监听响应完成
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const statusCode = res.statusCode;
    
    // 根据状态码选择不同的图标
    let statusIcon = '✅';
    if (statusCode >= 400 && statusCode < 500) {
      statusIcon = '⚠️';
    } else if (statusCode >= 500) {
      statusIcon = '❌';
    }
    
    const responseLog = {
      time: new Date().toISOString(),
      status: statusCode,
      duration: `${duration}ms`,
      method: req.method,
      path: req.path
    };
    
    console.log(`${statusIcon} RESPONSE:`, JSON.stringify(responseLog, null, 2));
    console.log('━'.repeat(80) + '\n');
  });

  next();
};

/**
 * 清理敏感信息
 * @param {Object} body - 请求体
 * @returns {Object} 清理后的请求体
 */
function sanitizeBody(body) {
  if (!body || typeof body !== 'object') {
    return body;
  }

  const sanitized = { ...body };
  
  // 隐藏敏感字段
  const sensitiveFields = ['password', 'cardPassword', 'token', 'secret'];
  sensitiveFields.forEach(field => {
    if (sanitized[field]) {
      sanitized[field] = '***';
    }
  });

  return sanitized;
}

module.exports = logger;
