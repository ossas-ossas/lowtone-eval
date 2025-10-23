// cloudfunctions/generateReport/index.js
const cloud = require('wx-server-sdk');
const PizZip = require('pizzip');
const Docxtemplater = require('docx-templater');

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
    const submissionResult = await db.collection('submissions').doc(submissionId).get();
    
    if (!submissionResult.data) {
      return {
        success: false,
        message: '未找到相关数据'
      };
    }

    const submission = submissionResult.data;
    
    // 计算年龄
    const dob = new Date(submission.dob);
    const assessmentDate = new Date(submission.assessmentDate);
    const ageInMonths = Math.floor((assessmentDate - dob) / (1000 * 60 * 60 * 24 * 30.44));
    
    // 生成建议
    const advice = generateAdvice(submission.summary, ageInMonths);
    
    // 准备报告数据
    const reportData = {
      childName: submission.childName,
      dob: submission.dob,
      assessmentDate: submission.assessmentDate,
      ageInMonths: ageInMonths,
      summary: submission.summary,
      advice: advice,
      overallLevel: calculateOverallLevel(submission.summary)
    };

    // 生成Word文档
    const docxBuffer = await generateDocxReport(reportData);
    
    // 上传到云存储
    const fileName = `评估报告_${submission.childName}_${submission.assessmentDate}.docx`;
    const uploadResult = await cloud.uploadFile({
      cloudPath: `reports/${fileName}`,
      fileContent: docxBuffer
    });

    // 获取下载链接
    const downloadUrl = await cloud.getTempFileURL({
      fileList: [uploadResult.fileID]
    });

    return {
      success: true,
      downloadUrl: downloadUrl.fileList[0].tempFileURL,
      fileName: fileName,
      message: '报告生成成功'
    };
  } catch (error) {
    console.error('生成报告失败:', error);
    return {
      success: false,
      message: '生成报告失败'
    };
  }
};

// 生成建议
function generateAdvice(summary, ageInMonths) {
  const advice = [];
  
  // 获取各类别的数据
  const getCategory = (categoryName) => 
    summary.find(item => item.category === categoryName);

  const touch = getCategory('触知觉');
  const vestibular = getCategory('前庭/本体');
  const social = getCategory('社会互动');
  const cognitive = getCategory('认知');
  const language = getCategory('语言');
  const grossMotor = getCategory('粗大动作');
  const fineMotor = getCategory('精细动作');

  // 根据评估结果生成建议
  if (touch && vestibular && touch.ratio < 0.5 && vestibular.ratio < 0.5) {
    advice.push('建议重点加强触觉及前庭刺激训练，如使用深压按摩、平衡垫训练、摇摆活动、旋转游戏等，帮助改善感觉统合能力。');
  }

  if (social && social.ratio < 0.5) {
    advice.push('需降低社交场景要求，鼓励亲子互动、减少陌生环境刺激，可通过游戏、音乐、绘本等方式增进社交能力。');
  }

  if (cognitive && cognitive.ratio < 0.5) {
    advice.push('建议加强认知训练，包括注意力集中练习、记忆游戏、分类排序活动、问题解决训练等，提升认知发展水平。');
  }

  if (language && language.ratio < 0.5) {
    advice.push('需要加强语言刺激和训练，多与孩子对话交流，鼓励表达，可通过儿歌、故事、角色扮演等方式促进语言发展。');
  }

  if (grossMotor && grossMotor.ratio < 0.5) {
    advice.push('建议加强粗大动作训练，包括爬行、走路、跑步、跳跃、平衡等练习，可通过户外活动和运动游戏进行训练。');
  }

  if (fineMotor && fineMotor.ratio < 0.5) {
    advice.push('需要加强精细动作训练，如抓握、捏取、穿珠、画画、剪纸等活动，提升手眼协调和手指灵活性。');
  }

  // 根据年龄提供特定建议
  if (ageInMonths < 12) {
    advice.push('此年龄段重点发展基础感觉和动作能力，建议多进行触觉、前庭刺激和基础动作练习。');
  } else if (ageInMonths < 24) {
    advice.push('此年龄段是语言和认知发展的关键期，建议加强语言刺激和认知训练。');
  } else if (ageInMonths < 36) {
    advice.push('此年龄段重点发展社交能力和精细动作，建议多进行社交互动和手部精细动作训练。');
  } else {
    advice.push('此年龄段应全面发展各项能力，建议制定综合性的训练计划。');
  }

  return advice;
}

// 计算总体水平
function calculateOverallLevel(summary) {
  if (summary.length === 0) {
    return {
      level: '无法评估',
      description: '暂无评估数据'
    };
  }

  const avgRatio = summary.reduce((sum, item) => sum + item.ratio, 0) / summary.length;
  
  if (avgRatio >= 0.9) {
    return {
      level: '发育正常',
      description: '各项功能发育良好，符合年龄发展水平'
    };
  } else if (avgRatio >= 0.7) {
    return {
      level: '发育良好',
      description: '大部分功能发育良好，个别项目需要关注'
    };
  } else if (avgRatio >= 0.5) {
    return {
      level: '发育一般',
      description: '部分功能需要加强训练和干预'
    };
  } else {
    return {
      level: '发育迟缓',
      description: '多项功能发育滞后，建议及时干预'
    };
  }
}

// 生成Word文档
async function generateDocxReport(data) {
  // 这里需要准备Word模板文件
  // 由于模板文件较大，这里提供一个简化的实现
  
  const template = `
低张儿综合功能发育量表评估报告

基本信息：
姓名：{{childName}}
出生日期：{{dob}}
评估日期：{{assessmentDate}}
评估年龄：{{ageInMonths}}个月

评估结果：
{{#summary}}
{{category}}：{{numerator}}/{{denominator}}（{{ratio}}）→ {{band}}
{{/summary}}

总体评估：
{{overallLevel.level}}
{{overallLevel.description}}

建议：
{{#advice}}
• {{.}}
{{/advice}}

报告生成时间：${new Date().toLocaleString()}
  `;

  // 简单的文本替换
  let content = template;
  content = content.replace(/\{\{childName\}\}/g, data.childName);
  content = content.replace(/\{\{dob\}\}/g, data.dob);
  content = content.replace(/\{\{assessmentDate\}\}/g, data.assessmentDate);
  content = content.replace(/\{\{ageInMonths\}\}/g, data.ageInMonths);
  content = content.replace(/\{\{overallLevel\.level\}\}/g, data.overallLevel.level);
  content = content.replace(/\{\{overallLevel\.description\}\}/g, data.overallLevel.description);
  
  // 替换汇总数据
  let summaryText = '';
  data.summary.forEach(item => {
    summaryText += `${item.category}：${item.numerator}/${item.denominator}（${(item.ratio * 100).toFixed(1)}%）→ ${item.band}\n`;
  });
  content = content.replace(/\{\{#summary\}\}[\s\S]*?\{\{\/summary\}\}/g, summaryText);
  
  // 替换建议
  let adviceText = '';
  data.advice.forEach(item => {
    adviceText += `• ${item}\n`;
  });
  content = content.replace(/\{\{#advice\}\}[\s\S]*?\{\{\/advice\}\}/g, adviceText);

  // 转换为Buffer
  return Buffer.from(content, 'utf8');
}
