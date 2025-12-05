import React, { useState, useEffect } from 'react';
import { 
  getMemberCards, 
  getMemberCardStats, 
  createMemberCard,
  updateMemberCard,
  deleteMemberCard,
  exportMemberCards,
  importMemberCards 
} from '../../../../api/memberCard';
import { showToast } from '../../../../components/Toast/ToastContainer';
import './MemberCard.scss';

const MemberCard = () => {
  const [batchNumber, setBatchNumber] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [cardData, setCardData] = useState([]);
  const [stats, setStats] = useState({
    currentMonthCount: 0,
    currentMonthAmount: 0,
    lastMonthCount: 0,
    lastMonthAmount: 0
  });
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
    total: 0
  });
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' or 'edit'
  const [editingCard, setEditingCard] = useState(null);
  const [formData, setFormData] = useState({
    batchNumber: '',
    merchant: '',
    supplier: '',
    productName: '',
    faceValue: '',
    price: '',
    cardNumber: '',
    cardPassword: '',
    orderTime: '',
    status: '已出库',
    importPrice: ''
  });
  const [formErrors, setFormErrors] = useState({});

  // 加载会员卡数据（统一的获取方法）
  const loadMemberCards = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.page,
        pageSize: pagination.pageSize
      };

      // 添加筛选条件
      if (batchNumber) params.batchNumber = batchNumber;
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const response = await getMemberCards(params);
      
      if (response.success) {
        // 后端返回: { success, data: { list, pagination } }
        setCardData(response.data.list || []);
        setPagination(prev => ({
          ...prev,
          page: response.data.pagination.page,
          pageSize: response.data.pagination.pageSize,
          total: response.data.pagination.total
        }));
      } else {
        showToast.error(response.message || '加载失败');
      }
    } catch (error) {
      console.error('加载会员卡数据失败:', error);
      showToast.error('加载失败：' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // 加载统计数据
  const loadStats = async () => {
    try {
      const response = await getMemberCardStats();
      if (response.success) {
        setStats(response.data);
      }
    } catch (error) {
      console.error('加载统计数据失败:', error);
    }
  };

  // 初始化加载（进入路由时自动加载）
  useEffect(() => {
    loadMemberCards();
    loadStats();
  }, []);

  // 分页改变时重新加载
  useEffect(() => {
    if (pagination.page > 1 || pagination.pageSize !== 10) {
      loadMemberCards();
    }
  }, [pagination.page, pagination.pageSize]);

  const handleSearch = () => {
    // 重置到第一页并加载数据
    setPagination(prev => ({ ...prev, page: 1 }));
    loadMemberCards();
  };

  const handleReset = () => {
    setBatchNumber('');
    setPhoneNumber('');
    setStartDate('');
    setEndDate('');
    setPagination(prev => ({ ...prev, page: 1 }));
    // 重新加载数据
    setTimeout(() => loadMemberCards(), 0);
  };

  const handleImport = () => {
    // 创建文件选择器
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.xlsx,.xls,.csv';
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (file) {
        const formData = new FormData();
        formData.append('file', file);
        
        try {
          setLoading(true);
          const response = await importMemberCards(formData);
          if (response.success) {
            showToast.success('导入成功！');
            loadMemberCards();
            loadStats();
          }
        } catch (error) {
          showToast.error('导入失败：' + error.message);
        } finally {
          setLoading(false);
        }
      }
    };
    input.click();
  };

  const handleExport = async () => {
    try {
      setLoading(true);
      const params = {};
      if (batchNumber) params.batchNumber = batchNumber;
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const blob = await exportMemberCards(params);
      
      // 检查是否是有效的 blob
      if (!blob || !(blob instanceof Blob)) {
        throw new Error('导出数据格式错误');
      }

      // 如果 blob 是 JSON 错误响应（有时候后端错误会返回 JSON）
      if (blob.type === 'application/json') {
        const text = await blob.text();
        const errorData = JSON.parse(text);
        throw new Error(errorData.message || '导出失败');
      }
      
      // 创建下载链接
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `会员卡数据_${new Date().getTime()}.xlsx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      showToast.success('导出成功！');
    } catch (error) {
      console.error('导出错误:', error);
      showToast.error('导出失败：' + (error.message || '未知错误'));
    } finally {
      setLoading(false);
    }
  };

  // 打开创建弹窗
  const handleCreate = () => {
    setModalMode('create');
    setFormData({
      batchNumber: '',
      merchant: '',
      supplier: '',
      productName: '',
      faceValue: '',
      price: '',
      cardNumber: '',
      cardPassword: '',
      orderTime: new Date().toISOString().split('T')[0], // 默认今天
      status: '已出库',
      importPrice: ''
    });
    setFormErrors({});
    setShowModal(true);
  };

  // 打开编辑弹窗
  const handleEdit = (card) => {
    setModalMode('edit');
    setEditingCard(card);
    setFormData({
      batchNumber: card.batchNumber,
      merchant: card.merchant,
      supplier: card.supplier,
      productName: card.productName,
      faceValue: card.faceValue,
      price: card.price,
      cardNumber: card.cardNumber,
      cardPassword: card.cardPassword,
      orderTime: card.orderTime ? new Date(card.orderTime).toISOString().split('T')[0] : '',
      status: card.status,
      importPrice: card.importPrice
    });
    setFormErrors({});
    setShowModal(true);
  };

  // 删除会员卡
  const handleDelete = async (id) => {
    if (!window.confirm('确定要删除这条记录吗？')) {
      return;
    }

    try {
      setLoading(true);
      const response = await deleteMemberCard(id);
      if (response.success) {
        showToast.success('删除成功！');
        loadMemberCards();
        loadStats();
      }
    } catch (error) {
      showToast.error('删除失败：' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // 验证表单
  const validateForm = () => {
    const errors = {};
    const requiredFields = {
      batchNumber: '批次号',
      merchant: '商户',
      supplier: '供应商',
      productName: '商品名称',
      faceValue: '面值',
      price: '售价',
      cardNumber: '卡号',
      cardPassword: '卡密',
      orderTime: '订单时间',
      importPrice: '进价'
    };

    // 检查必填字段
    Object.keys(requiredFields).forEach(field => {
      if (!formData[field] || formData[field].toString().trim() === '') {
        errors[field] = true;
      }
    });

    // 检查数字字段
    if (formData.faceValue && isNaN(formData.faceValue)) {
      errors.faceValue = true;
    }
    if (formData.price && isNaN(formData.price)) {
      errors.price = true;
    }
    if (formData.importPrice && isNaN(formData.importPrice)) {
      errors.importPrice = true;
    }

    setFormErrors(errors);

    if (Object.keys(errors).length > 0) {
      showToast.error(`请正确填写表单`);
      return false;
    }

    return true;
  };

  // 提交表单
  const handleSubmit = async () => {
    // 验证表单
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      let response;
      
      // 格式化订单时间为 YYYY-MM-DD 00:00:00
      const submitData = {
        ...formData,
        orderTime: formData.orderTime ? `${formData.orderTime} 00:00:00` : ''
      };
      
      if (modalMode === 'create') {
        response = await createMemberCard(submitData);
      } else {
        response = await updateMemberCard(editingCard.id, submitData);
      }

      if (response.success) {
        showToast.success(modalMode === 'create' ? '创建成功！' : '更新成功！');
        setShowModal(false);
        setFormErrors({});
        loadMemberCards();
        loadStats();
      }
    } catch (error) {
      showToast.error(`${modalMode === 'create' ? '创建' : '更新'}失败：` + error.message);
    } finally {
      setLoading(false);
    }
  };

  // 表单字段变化
  const handleFormChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // 清除该字段的错误状态
    if (formErrors[field]) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  return (
    <div className="member-card-page">
      {/* Breadcrumb Navigation */}
      <div className="breadcrumb">
        <span className="breadcrumb-item">订单中心</span>
        <span className="breadcrumb-separator">›</span>
        <span className="breadcrumb-item active">权益卡收益</span>
      </div>

      {/* Search Panel */}
      <div className="search-panel">
        <h3 className="panel-title">查询列表</h3>
        <div className="search-form">
          <div className="form-row">
            <div className="form-group">
              <label>批次号</label>
              <input 
                type="text" 
                placeholder="请输入批次号"
                value={batchNumber}
                onChange={(e) => setBatchNumber(e.target.value)}
              />
            </div>
            <div className="form-group date-range">
              <label>日期</label>
              <div className="date-inputs">
                <input 
                  type="date" 
                  placeholder="开始日期"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
                <span className="separator">至</span>
                <input 
                  type="date" 
                  placeholder="结束日期"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>
          </div>
          <div className="search-actions">
            <button className="btn-create" onClick={handleCreate}>
              ➕ 新增
            </button>
            <button className="btn-search" onClick={handleSearch}>
              🔍 查询
            </button>
            <button className="btn-reset" onClick={handleReset}>
              🔄 重置
            </button>
            <button className="btn-import" onClick={handleImport}>
              📤 导入
            </button>
            <button className="btn-export" onClick={handleExport}>
              📥 导出
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-cards">
        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-info">
            <div className="stat-label">本月数量</div>
            <div className="stat-value">{stats.currentMonthCount || 0}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-info">
            <div className="stat-label">本月金额</div>
            <div className="stat-value">{stats.currentMonthAmount?.toFixed(2) || '0.00'}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📈</div>
          <div className="stat-info">
            <div className="stat-label">上月数量</div>
            <div className="stat-value">{stats.lastMonthCount || 0}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">💵</div>
          <div className="stat-info">
            <div className="stat-label">上月金额</div>
            <div className="stat-value">{stats.lastMonthAmount?.toFixed(2) || '0.00'}</div>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="data-table-container">
        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner">加载中...</div>
          </div>
        ) : (
          <>
            <div className="table-wrapper">
              <table className="data-table">
              <thead>
                <tr>
                  <th>批次号</th>
                  <th>商户</th>
                  <th>供应商</th>
                  <th>商品名称</th>
                  <th>面值</th>
                  <th>售价</th>
                  <th>卡号</th>
                  <th>卡密</th>
                  <th>订单时间 ↓</th>
                  <th>状态</th>
                  <th>进价</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                {cardData.length === 0 ? (
                  <tr>
                    <td colSpan="12" style={{ textAlign: 'center', padding: '40px' }}>
                      暂无数据
                    </td>
                  </tr>
                ) : (
                  cardData.map((item) => (
                    <tr key={item.id}>
                      <td>{item.batchNumber}</td>
                      <td>{item.merchant}</td>
                      <td>{item.supplier}</td>
                      <td>{item.productName}</td>
                      <td>{item.faceValue}</td>
                      <td>{parseFloat(item.price).toFixed(2)}</td>
                      <td>{item.cardNumber}</td>
                      <td>{item.cardPassword}</td>
                      <td>{new Date(item.orderTime).toLocaleString('zh-CN')}</td>
                      <td>
                        <span className="status-badge">{item.status}</span>
                      </td>
                      <td>{parseFloat(item.importPrice).toFixed(2)}</td>
                      <td>
                        <div className="action-buttons">
                          <button 
                            className="btn-edit" 
                            onClick={() => handleEdit(item)}
                            title="编辑"
                          >
                            ✏️
                          </button>
                          <button 
                            className="btn-delete" 
                            onClick={() => handleDelete(item.id)}
                            title="删除"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            </div>

            {/* Pagination */}
            {cardData.length > 0 && (
              <div className="pagination">
                <button 
                  disabled={pagination.page === 1}
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                >
                  上一页
                </button>
                <span>
                  第 {pagination.page} 页 / 共 {Math.ceil(pagination.total / pagination.pageSize)} 页
                </span>
                <button 
                  disabled={pagination.page >= Math.ceil(pagination.total / pagination.pageSize)}
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                >
                  下一页
                </button>
                <span style={{ marginLeft: '20px' }}>
                  共 {pagination.total} 条记录
                </span>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal for Create/Edit */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{modalMode === 'create' ? '新增会员卡' : '编辑会员卡'}</h3>
              <button className="close-btn" onClick={() => setShowModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="form-grid">
                <div className="form-field">
                  <label>批次号 <span className="required">*</span></label>
                  <input
                    type="text"
                    value={formData.batchNumber}
                    onChange={(e) => handleFormChange('batchNumber', e.target.value)}
                    placeholder="请输入批次号"
                    className={formErrors.batchNumber ? 'error' : ''}
                  />
                </div>
                <div className="form-field">
                  <label>商户 <span className="required">*</span></label>
                  <input
                    type="text"
                    value={formData.merchant}
                    onChange={(e) => handleFormChange('merchant', e.target.value)}
                    placeholder="请输入商户"
                    className={formErrors.merchant ? 'error' : ''}
                  />
                </div>
                <div className="form-field">
                  <label>供应商 <span className="required">*</span></label>
                  <input
                    type="text"
                    value={formData.supplier}
                    onChange={(e) => handleFormChange('supplier', e.target.value)}
                    placeholder="请输入供应商"
                    className={formErrors.supplier ? 'error' : ''}
                  />
                </div>
                <div className="form-field">
                  <label>商品名称 <span className="required">*</span></label>
                  <input
                    type="text"
                    value={formData.productName}
                    onChange={(e) => handleFormChange('productName', e.target.value)}
                    placeholder="请输入商品名称"
                    className={formErrors.productName ? 'error' : ''}
                  />
                </div>
                <div className="form-field">
                  <label>面值 <span className="required">*</span></label>
                  <input
                    type="number"
                    value={formData.faceValue}
                    onChange={(e) => handleFormChange('faceValue', e.target.value)}
                    placeholder="请输入面值"
                    className={formErrors.faceValue ? 'error' : ''}
                  />
                </div>
                <div className="form-field">
                  <label>售价 <span className="required">*</span></label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => handleFormChange('price', e.target.value)}
                    placeholder="请输入售价"
                    className={formErrors.price ? 'error' : ''}
                  />
                </div>
                <div className="form-field">
                  <label>卡号 <span className="required">*</span></label>
                  <input
                    type="text"
                    value={formData.cardNumber}
                    onChange={(e) => handleFormChange('cardNumber', e.target.value)}
                    placeholder="请输入卡号"
                    disabled={modalMode === 'edit'}
                    className={formErrors.cardNumber ? 'error' : ''}
                  />
                </div>
                <div className="form-field">
                  <label>卡密 <span className="required">*</span></label>
                  <input
                    type="text"
                    value={formData.cardPassword}
                    onChange={(e) => handleFormChange('cardPassword', e.target.value)}
                    placeholder="请输入卡密"
                    className={formErrors.cardPassword ? 'error' : ''}
                  />
                </div>
                <div className="form-field">
                  <label>订单时间 <span className="required">*</span></label>
                  <input
                    type="date"
                    value={formData.orderTime}
                    onChange={(e) => handleFormChange('orderTime', e.target.value)}
                    className={formErrors.orderTime ? 'error' : ''}
                  />
                </div>
                <div className="form-field">
                  <label>状态 <span className="required">*</span></label>
                  <select
                    value={formData.status}
                    onChange={(e) => handleFormChange('status', e.target.value)}
                    className={formErrors.status ? 'error' : ''}
                  >
                    <option value="已出库">已出库</option>
                    <option value="未出库">未出库</option>
                    <option value="已使用">已使用</option>
                    <option value="已过期">已过期</option>
                  </select>
                </div>
                <div className="form-field">
                  <label>进价 <span className="required">*</span></label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.importPrice}
                    onChange={(e) => handleFormChange('importPrice', e.target.value)}
                    placeholder="请输入进价"
                    className={formErrors.importPrice ? 'error' : ''}
                  />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setShowModal(false)}>
                取消
              </button>
              <button className="btn-submit" onClick={handleSubmit} disabled={loading}>
                {loading ? '提交中...' : '确定'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MemberCard;
