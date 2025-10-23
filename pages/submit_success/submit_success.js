// pages/submit_success/submit_success.js
import { getBandName } from '../../utils/scoring';

const app = getApp();

Page({
  data: {
    submission: null,
    generatingReport: false
  },

  onLoad(options) {
    const submissionId = options.submissionId;
    if (submissionId) {
      this.loadSubmission(submissionId);
    }
  },

  // 加载提交数据
  async loadSubmission(submissionId) {
    try {
      wx.showLoading({
        title: '加载中...'
      });

      const result = await wx.cloud.callFunction({
        name: 'getSubmission',
        data: { submissionId }
      });

      if (result.result.success) {
        const submission = result.result.data;
        // 格式化时间
        submission.createdAt = new Date(submission.createdAt).toLocaleString();
        
        this.setData({
          submission
        });
      } else {
        throw new Error(result.result.message || '加载失败');
      }
    } catch (error) {
      console.error('加载失败:', error);
      wx.showToast({
        title: '加载失败',
        icon: 'error'
      });
    } finally {
      wx.hideLoading();
    }
  },

  // 生成报告
  async generateReport() {
    if (this.data.generatingReport || !this.data.submission) return;

    this.setData({ generatingReport: true });

    try {
      wx.showLoading({
        title: '生成报告中...'
      });

      const result = await wx.cloud.callFunction({
        name: 'generateReport',
        data: {
          submissionId: this.data.submission._id
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
      this.setData({ generatingReport: false });
    }
  },

  // 查看预览
  viewPreview() {
    if (!this.data.submission) return;
    
    // 保存到全局数据
    app.globalData.currentSubmission = this.data.submission;
    
    wx.navigateTo({
      url: '/pages/preview/preview'
    });
  },

  // 返回首页
  goHome() {
    wx.switchTab({
      url: '/pages/home/home'
    });
  },

  // 获取分档名称
  getBandName(band) {
    return getBandName(band);
  }
});
