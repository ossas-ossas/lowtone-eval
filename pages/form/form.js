// pages/form/form.js
import { summarizeByCategory, validateSubmission, getBandName } from '../../utils/scoring';
import { getCategories, getItemsByCategory, getAllItems } from '../../utils/database';

const app = getApp();

Page({
  data: {
    formData: {
      childName: '',
      dob: '',
      assessmentDate: ''
    },
    answers: {},
    categories: [],
    allItems: [],
    expandedCategories: [],
    summary: [],
    submitting: false,
    canSubmit: false
  },

  onLoad() {
    this.initData();
    this.setDefaultDate();
  },

  // 初始化数据
  initData() {
    const categories = getCategories();
    const allItems = getAllItems();
    
    this.setData({
      categories,
      allItems
    });
  },

  // 设置默认日期
  setDefaultDate() {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    
    this.setData({
      'formData.assessmentDate': todayStr
    });
  },

  // 儿童姓名输入
  onChildNameInput(e) {
    this.setData({
      'formData.childName': e.detail.value
    });
    this.checkCanSubmit();
  },

  // 出生日期选择
  onDobChange(e) {
    this.setData({
      'formData.dob': e.detail.value
    });
    this.checkCanSubmit();
  },

  // 评估日期选择
  onAssessmentDateChange(e) {
    this.setData({
      'formData.assessmentDate': e.detail.value
    });
    this.checkCanSubmit();
  },

  // 切换类别展开/收起
  toggleCategory(e) {
    const category = e.currentTarget.dataset.category;
    const expandedCategories = [...this.data.expandedCategories];
    const index = expandedCategories.indexOf(category);
    
    if (index > -1) {
      expandedCategories.splice(index, 1);
    } else {
      expandedCategories.push(category);
    }
    
    this.setData({
      expandedCategories
    });
  },

  // 选择答案
  selectAnswer(e) {
    const { category, itemCode, value } = e.currentTarget.dataset;
    const answers = { ...this.data.answers };
    
    if (!answers[category]) {
      answers[category] = {};
    }
    
    answers[category][itemCode] = value;
    
    this.setData({
      answers
    });
    
    this.updateSummary();
    this.checkCanSubmit();
  },

  // 获取类别下的题目
  getItemsByCategory(category) {
    return getItemsByCategory(category);
  },

  // 获取答案值
  getAnswerValue(category, itemCode) {
    return this.data.answers[category]?.[itemCode] || '';
  },

  // 获取类别进度
  getCategoryProgress(category) {
    const items = getItemsByCategory(category);
    let count = 0;
    
    items.forEach(item => {
      if (this.data.answers[category]?.[item.itemCode]) {
        count++;
      }
    });
    
    return count;
  },

  // 获取类别总数
  getCategoryTotal(category) {
    return getItemsByCategory(category).length;
  },

  // 更新汇总
  updateSummary() {
    const answers = this.data.answers;
    const answerArray = [];
    
    // 转换为答案数组格式
    Object.keys(answers).forEach(category => {
      Object.keys(answers[category]).forEach(itemCode => {
        answerArray.push({
          category,
          value: answers[category][itemCode]
        });
      });
    });
    
    if (answerArray.length > 0) {
      const summary = summarizeByCategory(answerArray);
      this.setData({
        summary
      });
    } else {
      this.setData({
        summary: []
      });
    }
  },

  // 检查是否可以提交
  checkCanSubmit() {
    const { formData, answers } = this.data;
    
    // 检查基本信息
    const hasBasicInfo = formData.childName.trim() && 
                        formData.dob && 
                        formData.assessmentDate;
    
    // 检查是否有答案
    const hasAnswers = Object.keys(answers).length > 0;
    
    // 检查是否所有类别都有答案
    const categories = getCategories();
    const allCategoriesAnswered = categories.every(category => {
      const items = getItemsByCategory(category);
      return items.every(item => answers[category]?.[item.itemCode]);
    });
    
    this.setData({
      canSubmit: hasBasicInfo && hasAnswers && allCategoriesAnswered
    });
  },

  // 提交表单
  async submitForm() {
    if (!this.data.canSubmit || this.data.submitting) return;
    
    this.setData({ submitting: true });
    
    try {
      // 验证数据
      const answers = this.data.answers;
      const answerArray = [];
      
      Object.keys(answers).forEach(category => {
        Object.keys(answers[category]).forEach(itemCode => {
          answerArray.push({
            category,
            value: answers[category][itemCode]
          });
        });
      });
      
      const submission = {
        childName: this.data.formData.childName.trim(),
        dob: this.data.formData.dob,
        assessmentDate: this.data.formData.assessmentDate,
        answers: answerArray,
        ownerOpenId: app.globalData.openId
      };
      
      const validation = validateSubmission(submission);
      if (!validation.valid) {
        wx.showModal({
          title: '数据验证失败',
          content: validation.errors.join('\n'),
          showCancel: false
        });
        return;
      }
      
      // 计算汇总
      const summary = summarizeByCategory(answerArray);
      submission.summary = summary;
      
      // 调用云函数保存数据
      const result = await wx.cloud.callFunction({
        name: 'upsertSubmission',
        data: submission
      });
      
      if (result.result.success) {
        wx.showToast({
          title: '提交成功',
          icon: 'success'
        });
        
        // 跳转到成功页面
        setTimeout(() => {
          wx.redirectTo({
            url: `/pages/submit_success/submit_success?submissionId=${result.result.submissionId}`
          });
        }, 1500);
      } else {
        throw new Error(result.result.message || '提交失败');
      }
      
    } catch (error) {
      console.error('提交失败:', error);
      wx.showToast({
        title: '提交失败',
        icon: 'error'
      });
    } finally {
      this.setData({ submitting: false });
    }
  },

  // 获取分档名称
  getBandName(band) {
    return getBandName(band);
  }
});
