// pages/detail/detail.js
import * as echarts from '../../ec-canvas/echarts';
import { calculateOverallLevel, getBandName } from '../../utils/scoring';
import { generatePersonalizedAdvice } from '../../utils/rules';

const app = getApp();

Page({
  data: {
    submission: null,
    childAge: 0,
    overallLevel: null,
    advice: [],
    ecRadar: {
      onInit: null
    },
    ecBar: {
      onInit: null
    },
    generatingReport: false
  },

  onLoad() {
    const submission = app.globalData.currentSubmission;
    if (submission) {
      this.setData({
        submission
      });
      this.calculateAge();
      this.calculateOverall();
      this.generateAdvice();
      this.initCharts();
    } else {
      wx.showToast({
        title: '数据加载失败',
        icon: 'error'
      });
      setTimeout(() => {
        wx.navigateBack();
      }, 1500);
    }
  },

  // 计算年龄
  calculateAge() {
    const { submission } = this.data;
    if (!submission || !submission.dob) return;

    const dob = new Date(submission.dob);
    const assessmentDate = new Date(submission.assessmentDate);
    const ageInMonths = Math.floor((assessmentDate - dob) / (1000 * 60 * 60 * 24 * 30.44));

    this.setData({
      childAge: ageInMonths
    });
  },

  // 计算总体水平
  calculateOverall() {
    const { submission } = this.data;
    if (!submission || !submission.summary) return;

    const overallLevel = calculateOverallLevel(submission.summary);
    this.setData({
      overallLevel
    });
  },

  // 生成建议
  generateAdvice() {
    const { submission, childAge } = this.data;
    if (!submission || !submission.summary) return;

    const adviceResult = generatePersonalizedAdvice(submission.summary, childAge);
    this.setData({
      advice: adviceResult.generalAdvice
    });
  },

  // 初始化图表
  initCharts() {
    this.initRadarChart();
    this.initBarChart();
  },

  // 初始化雷达图
  initRadarChart() {
    const { submission } = this.data;
    if (!submission || !submission.summary) return;

    const ecRadar = {
      onInit: (canvas, width, height, dpr) => {
        const chart = echarts.init(canvas, null, {
          width: width,
          height: height,
          devicePixelRatio: dpr
        });

        // 准备雷达图数据
        const categories = submission.summary.map(item => item.category);
        const values = submission.summary.map(item => item.ratio);

        const option = {
          backgroundColor: 'transparent',
          title: {
            text: '功能发育水平',
            left: 'center',
            top: 20,
            textStyle: {
              fontSize: 16,
              color: '#333'
            }
          },
          tooltip: {
            trigger: 'item',
            formatter: function(params) {
              const data = submission.summary[params.dataIndex];
              return `${data.category}<br/>比例: ${(data.ratio * 100).toFixed(1)}%<br/>等级: ${getBandName(data.band)}`;
            }
          },
          radar: {
            indicator: categories.map(category => ({
              name: category,
              max: 1
            })),
            center: ['50%', '60%'],
            radius: '70%',
            name: {
              textStyle: {
                fontSize: 12,
                color: '#666'
              }
            }
          },
          series: [{
            name: '发育水平',
            type: 'radar',
            data: [{
              value: values,
              name: '当前水平',
              itemStyle: {
                color: '#4A90E2'
              },
              areaStyle: {
                color: 'rgba(74, 144, 226, 0.2)'
              }
            }]
          }]
        };

        chart.setOption(option);
        return chart;
      }
    };

    this.setData({
      ecRadar
    });
  },

  // 初始化柱状图
  initBarChart() {
    const { submission } = this.data;
    if (!submission || !submission.summary) return;

    const ecBar = {
      onInit: (canvas, width, height, dpr) => {
        const chart = echarts.init(canvas, null, {
          width: width,
          height: height,
          devicePixelRatio: dpr
        });

        // 准备柱状图数据
        const categories = submission.summary.map(item => item.category);
        const values = submission.summary.map(item => item.ratio * 100);
        const colors = submission.summary.map(item => {
          const colorMap = {
            'N': '#1890FF',
            'G': '#52C41A',
            'F': '#FAAD14',
            'P': '#FF4D4F'
          };
          return colorMap[item.band];
        });

        const option = {
          backgroundColor: 'transparent',
          title: {
            text: '功能发育比例',
            left: 'center',
            top: 20,
            textStyle: {
              fontSize: 16,
              color: '#333'
            }
          },
          tooltip: {
            trigger: 'axis',
            formatter: function(params) {
              const data = submission.summary[params[0].dataIndex];
              return `${data.category}<br/>比例: ${(data.ratio * 100).toFixed(1)}%<br/>等级: ${getBandName(data.band)}`;
            }
          },
          xAxis: {
            type: 'category',
            data: categories,
            axisLabel: {
              fontSize: 10,
              rotate: 45,
              color: '#666'
            }
          },
          yAxis: {
            type: 'value',
            max: 100,
            axisLabel: {
              formatter: '{value}%',
              fontSize: 10,
              color: '#666'
            }
          },
          series: [{
            name: '发育比例',
            type: 'bar',
            data: values.map((value, index) => ({
              value,
              itemStyle: {
                color: colors[index]
              }
            })),
            barWidth: '60%'
          }]
        };

        chart.setOption(option);
        return chart;
      }
    };

    this.setData({
      ecBar
    });
  },

  // 生成报告
  async generateReport() {
    if (this.data.generatingReport) return;

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

  // 返回
  goBack() {
    wx.navigateBack();
  },

  // 获取分档名称
  getBandName(band) {
    return getBandName(band);
  }
});
