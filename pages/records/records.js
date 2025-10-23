// pages/records/records.js
import { getBandName } from '../../utils/scoring';

const app = getApp();

Page({
  data: {
    records: [],
    loading: false,
    hasMore: true,
    page: 1,
    pageSize: 10,
    filterDate: '',
    filterChildName: '',
    filterChildIndex: -1,
    childNames: []
  },

  onLoad() {
    this.loadRecords();
  },

  onShow() {
    // 刷新数据
    this.setData({
      page: 1,
      records: [],
      hasMore: true
    });
    this.loadRecords();
  },

  // 加载记录
  async loadRecords() {
    if (this.data.loading) return;

    this.setData({ loading: true });

    try {
      const result = await wx.cloud.callFunction({
        name: 'listSubmissions',
        data: {
          openId: app.globalData.openId,
          role: app.globalData.userRole,
          page: this.data.page,
          pageSize: this.data.pageSize,
          orgId: app.globalData.orgId
        }
      });

      if (result.result.success) {
        const newRecords = result.result.data;
        const records = this.data.page === 1 ? newRecords : [...this.data.records, ...newRecords];
        
        // 提取儿童姓名列表
        const childNames = [...new Set(records.map(record => record.childName))];
        
        this.setData({
          records,
          hasMore: this.data.page < result.result.pagination.totalPages,
          childNames
        });
      } else {
        throw new Error(result.result.message || '加载失败');
      }
    } catch (error) {
      console.error('加载记录失败:', error);
      wx.showToast({
        title: '加载失败',
        icon: 'error'
      });
    } finally {
      this.setData({ loading: false });
    }
  },

  // 加载更多
  loadMore() {
    if (!this.data.hasMore || this.data.loading) return;
    
    this.setData({
      page: this.data.page + 1
    });
    this.loadRecords();
  },

  // 筛选日期变化
  onFilterDateChange(e) {
    this.setData({
      filterDate: e.detail.value
    });
    this.applyFilter();
  },

  // 筛选儿童变化
  onFilterChildChange(e) {
    const index = e.detail.value;
    this.setData({
      filterChildIndex: index,
      filterChildName: this.data.childNames[index] || ''
    });
    this.applyFilter();
  },

  // 应用筛选
  applyFilter() {
    const { filterDate, filterChildName, records } = this.data;
    
    // 这里可以实现客户端筛选，或者重新调用服务端接口
    // 为了简化，这里使用客户端筛选
    let filteredRecords = records;
    
    if (filterDate) {
      filteredRecords = filteredRecords.filter(record => 
        record.assessmentDate === filterDate
      );
    }
    
    if (filterChildName) {
      filteredRecords = filteredRecords.filter(record => 
        record.childName === filterChildName
      );
    }
    
    this.setData({
      records: filteredRecords
    });
  },

  // 查看记录详情
  viewRecord(e) {
    const record = e.currentTarget.dataset.record;
    
    // 保存到全局数据
    app.globalData.currentSubmission = record;
    
    wx.navigateTo({
      url: '/pages/detail/detail'
    });
  },

  // 开始评估
  startAssessment() {
    wx.navigateTo({
      url: '/pages/form/form'
    });
  },

  // 格式化时间
  formatTime(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleString();
  },

  // 获取分档名称
  getBandName(band) {
    return getBandName(band);
  }
});
