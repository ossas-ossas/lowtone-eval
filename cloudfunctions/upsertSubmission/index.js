// cloudfunctions/upsertSubmission/index.js
const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

const db = cloud.database();

exports.main = async (event, context) => {
  const { childName, dob, assessmentDate, answers, summary, ownerOpenId } = event;
  
  try {
    // 验证数据
    if (!childName || !dob || !assessmentDate || !answers || !summary || !ownerOpenId) {
      return {
        success: false,
        message: '缺少必要参数'
      };
    }

    // 生成唯一ID
    const submissionId = db.generateId();
    
    // 准备数据
    const submissionData = {
      _id: submissionId,
      childName: childName.trim(),
      dob,
      assessmentDate,
      answers,
      summary,
      ownerOpenId,
      createdAt: new Date()
    };

    // 保存到数据库
    await db.collection('submissions').add({
      data: submissionData
    });

    return {
      success: true,
      submissionId,
      message: '保存成功'
    };
  } catch (error) {
    console.error('保存提交数据失败:', error);
    return {
      success: false,
      message: '保存失败'
    };
  }
};
