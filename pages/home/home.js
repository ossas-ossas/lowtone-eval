// pages/home/home.js
const app = getApp();

Page({
  data: {
    userInfo: null,
    userRole: 'parent',
    userRoleText: '家长',
    loginLoading: false
  },

  onLoad() {
    this.checkUserStatus();
  },

  onShow() {
    this.checkUserStatus();
  },

  // 检查用户状态
  checkUserStatus() {
    const userInfo = app.globalData.userInfo;
    const userRole = app.globalData.userRole;
    
    this.setData({
      userInfo,
      userRole,
      userRoleText: userRole === 'staff' ? '机构工作人员' : '家长'
    });
  },

  // 处理登录
  async handleLogin() {
    if (this.data.loginLoading) return;
    
    this.setData({ loginLoading: true });
    
    try {
      const openId = await app.wxLogin();
      if (openId) {
        this.setData({
          userInfo: app.globalData.userInfo,
          userRole: app.globalData.userRole,
          userRoleText: app.globalData.userRole === 'staff' ? '机构工作人员' : '家长'
        });
        
        wx.showToast({
          title: '登录成功',
          icon: 'success'
        });
      }
    } catch (error) {
      console.error('登录失败:', error);
      wx.showToast({
        title: '登录失败',
        icon: 'error'
      });
    } finally {
      this.setData({ loginLoading: false });
    }
  },

  // 开始评估
  startAssessment() {
    if (!this.data.userInfo) {
      wx.showToast({
        title: '请先登录',
        icon: 'none'
      });
      return;
    }
    
    wx.navigateTo({
      url: '/pages/form/form'
    });
  },

  // 查看记录
  viewRecords() {
    if (!this.data.userInfo) {
      wx.showToast({
        title: '请先登录',
        icon: 'none'
      });
      return;
    }
    
    wx.switchTab({
      url: '/pages/records/records'
    });
  },

  // 查看全部记录（机构功能）
  viewAllRecords() {
    if (!this.data.userInfo) {
      wx.showToast({
        title: '请先登录',
        icon: 'none'
      });
      return;
    }
    
    wx.switchTab({
      url: '/pages/admin/admin'
    });
  },

  // 导出数据（机构功能）
  async exportData() {
    if (!this.data.userInfo) {
      wx.showToast({
        title: '请先登录',
        icon: 'none'
      });
      return;
    }

    wx.showLoading({
      title: '导出中...'
    });

    try {
      const result = await wx.cloud.callFunction({
        name: 'adminExport',
        data: {
          orgId: app.globalData.orgId
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
    }
  },

  // 分享功能
  onShareAppMessage() {
    return {
      title: '低张儿综合功能发育量表',
      desc: '科学的儿童发育评估工具',
      path: '/pages/home/home'
    };
  },

  // 分享到朋友圈
  onShareTimeline() {
    return {
      title: '低张儿综合功能发育量表 - 科学的儿童发育评估工具'
    };
  }
});
