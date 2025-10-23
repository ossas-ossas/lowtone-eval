// cloudfunctions/getSubmission/index.js
const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

const db = cloud.database();

exports.main = async (event, context) => {
  const { submissionId } = event;
  
  try {
    if (!submissionId) {
      return {
        success: false,
        message: '缺少提交ID'
      };
    }

    // 获取提交数据
    const result = await db.collection('submissions').doc(submissionId).get();
    
    if (!result.data) {
      return {
        success: false,
        message: '未找到相关数据'
      };
    }

    return {
      success: true,
      data: result.data
    };
  } catch (error) {
    console.error('获取提交数据失败:', error);
    return {
      success: false,
      message: '获取数据失败'
    };
  }
};
