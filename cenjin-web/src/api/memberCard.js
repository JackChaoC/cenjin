import request from '../utils/request';

/**
 * 获取会员卡列表
 * @param {Object} params - 查询参数
 * @returns {Promise}
 */
export const getMemberCards = (params) => {
  return request({
    url: '/member-card',
    method: 'get',
    params
  });
};

/**
 * 获取单个会员卡详情
 * @param {number} id - 会员卡ID
 * @returns {Promise}
 */
export const getMemberCardById = (id) => {
  return request({
    url: `/member-card/${id}`,
    method: 'get'
  });
};

/**
 * 创建会员卡
 * @param {Object} data - 会员卡数据
 * @returns {Promise}
 */
export const createMemberCard = (data) => {
  return request({
    url: '/member-card',
    method: 'post',
    data
  });
};

/**
 * 更新会员卡
 * @param {number} id - 会员卡ID
 * @param {Object} data - 更新的数据
 * @returns {Promise}
 */
export const updateMemberCard = (id, data) => {
  return request({
    url: `/member-card/${id}`,
    method: 'put',
    data
  });
};

/**
 * 删除会员卡
 * @param {number} id - 会员卡ID
 * @returns {Promise}
 */
export const deleteMemberCard = (id) => {
  return request({
    url: `/member-card/${id}`,
    method: 'delete'
  });
};

/**
 * 批量导入会员卡
 * @param {FormData} formData - 包含文件的表单数据
 * @returns {Promise}
 */
export const importMemberCards = (formData) => {
  return request({
    url: '/member-card/import',
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
};

/**
 * 导出会员卡数据
 * @param {Object} params - 查询参数
 * @returns {Promise}
 */
export const exportMemberCards = (params) => {
  return request({
    url: '/member-card/export',
    method: 'get',
    params,
    responseType: 'blob'
  });
};

/**
 * 获取统计数据
 * @returns {Promise}
 */
export const getMemberCardStats = () => {
  return request({
    url: '/member-card/stats',
    method: 'get'
  });
};

/**
 * 获取图表数据
 * @param {string} timeRange - 时间范围：week | month | year
 * @returns {Promise}
 */
export const getChartData = (timeRange = 'week') => {
  return request({
    url: '/member-card/chart-data',
    method: 'get',
    params: { timeRange }
  });
};

/**
 * 获取商品卡类交付排行
 * @returns {Promise}
 */
export const getRankData = () => {
  return request({
    url: '/member-card/rank',
    method: 'get'
  });
};
