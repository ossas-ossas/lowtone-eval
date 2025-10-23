// pages/admin/admin.js
import { getBandName } from '../../utils/scoring';

const app = getApp();

Page({
  data: {
    records: [],
    filteredRecords: [],
    loading: false,
    exporting: false,
    totalRecords: 0,
    totalChildren: 0,
    todayRecords: 0,
    monthRecords: 0,
    filterStartDate: '',
    filterEndDate: '',
    filterChildName: '',
    filterChildIndex: -1,
    childNames: []
  },

  onLoad() {
    this.loadData();
  },

  onShow() {
    this.loadData();
  },

  // 加载数据
  async loadData() {
    this.setData({ loading: true });

    try {
      const result = await wx.cloud.callFunction({
        name: 'listSubmissions',
        data: {
          openId: app.globalData.openId,
          role: app.globalData.userRole,
          page: 1,
          pageSize: 1000, // 管理后台获取更多数据
          orgId: app.globalData.orgId
        }
      });

      if (result.result.success) {
        const records = result.result.data;
        
        // 计算统计数据
        const stats = this.calculateStats(records);
        
        // 提取儿童姓名列表
        const childNames = [...new Set(records.map(record => record.childName))];
        
        this.setData({
          records,
          filteredRecords: records,
          ...stats,
          childNames
        });
      } else {
        throw new Error(result.result.message || '加载失败');
      }
    } catch (error) {
      console.error('加载数据失败:', error);
      wx.showToast({
        title: '加载失败',
        icon: 'error'
      });
    } finally {
      this.setData({ loading: false });
    }
  },

  // 计算统计数据
  calculateStats(records) {
    const totalRecords = records.length;
    const totalChildren = new Set(records.map(record => record.childName)).size;
    
    const today = new Date().toISOString().split('T')[0];
    const todayRecords = records.filter(record => record.assessmentDate === today).length;
    
    const thisMonth = new Date().toISOString().substring(0, 7);
    const monthRecords = records.filter(record => 
      record.assessmentDate.startsWith(thisMonth)
    ).length;

    return {
      totalRecords,
      totalChildren,
      todayRecords,
      monthRecords
    };
  },

  // 筛选开始日期变化
  onFilterStartDateChange(e) {
    this.setData({
      filterStartDate: e.detail.value
    });
  },

  // 筛选结束日期变化
  onFilterEndDateChange(e) {
    this.setData({
      filterEndDate: e.detail.value
    });
  },

  // 筛选儿童变化
  onFilterChildChange(e) {
    const index = e.detail.value;
    this.setData({
      filterChildIndex: index,
      filterChildName: this.data.childNames[index] || ''
    });
  },

  // 应用筛选
  applyFilter() {
    const { filterStartDate, filterEndDate, filterChildName, records } = this.data;
    
    let filteredRecords = records;
    
    // 按日期筛选
    if (filterStartDate) {
      filteredRecords = filteredRecords.filter(record => 
        record.assessmentDate >= filterStartDate
      );
    }
    
    if (filterEndDate) {
      filteredRecords = filteredRecords.filter(record => 
        record.assessmentDate <= filterEndDate
      );
    }
    
    // 按儿童筛选
    if (filterChildName) {
      filteredRecords = filteredRecords.filter(record => 
        record.childName === filterChildName
      );
    }
    
    this.setData({
      filteredRecords
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

  // 生成报告
  async generateReport(e) {
    const record = e.currentTarget.dataset.record;
    
    try {
      wx.showLoading({
        title: '生成报告中...'
      });

      const result = await wx.cloud.callFunction({
        name: 'generateReport',
        data: {
          submissionId: record._id
        }
      });

      if (result.result.success) {
        wx.showModal({
          title: '报告生成成功',
          content: '报告已生成，是否立即下载？',
          success: (res) => {
            if (res.confirm) {
              // 下载报告
              wx.downloadFile({
                url: result.result.downloadUrl,
                success: (downloadRes) => {
                  wx.openDocument({
                    filePath: downloadRes.tempFilePath,
                    success: () => {
                      wx.showToast({
                        title: '报告已打开',
                        icon: 'success'
                      });
                    }
                  });
                },
                fail: () => {
                  wx.showToast({
                    title: '下载失败',
                    icon: 'error'
                  });
                }
              });
            }
          }
        });
      } else {
        throw new Error(result.result.message || '生成失败');
      }
    } catch (error) {
      console.error('生成报告失败:', error);
      wx.showToast({
        title: '生成失败',
        icon: 'error'
      });
    } finally {
      wx.hideLoading();
    }
  },

  // 导出全部数据
  async exportAllData() {
    if (this.data.exporting) return;

    this.setData({ exporting: true });

    try {
      wx.showLoading({
        title: '导出中...'
      });

      const result = await wx.cloud.callFunction({
        name: 'adminExport',
        data: {
          orgId: app.globalData.orgId,
          records: this.data.filteredRecords
        }
      });

      if (result.result.success) {
        wx.showModal({
          title: '导出成功',
          content: '数据已导出，请查看云存储',
          showCancel: false
        });
      } else {
        throw new Error(result.result.message || '导出失败');
      }
    } catch (error) {
      console.error('导出失败:', error);
      wx.showToast({
        title: '导出失败',
        icon: 'error'
      });
    } finally {
      wx.hideLoading();
      this.setData({ exporting: false });
    }
  },

  // 刷新数据
  refreshData() {
    this.loadData();
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
