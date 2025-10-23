// cloudfunctions/adminExport/index.js
const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

const db = cloud.database();

exports.main = async (event, context) => {
  const { orgId, records } = event;
  
  try {
    if (!records || records.length === 0) {
      return {
        success: false,
        message: '没有数据可导出'
      };
    }

    // 生成CSV格式的数据
    const csvData = generateCSV(records);
    
    // 上传到云存储
    const fileName = `评估数据导出_${new Date().toISOString().split('T')[0]}.csv`;
    const uploadResult = await cloud.uploadFile({
      cloudPath: `exports/${fileName}`,
      fileContent: Buffer.from(csvData, 'utf8')
    });

    // 获取下载链接
    const downloadUrl = await cloud.getTempFileURL({
      fileList: [uploadResult.fileID]
    });

    return {
      success: true,
      downloadUrl: downloadUrl.fileList[0].tempFileURL,
      fileName: fileName,
      recordCount: records.length,
      message: '导出成功'
    };
  } catch (error) {
    console.error('导出数据失败:', error);
    return {
      success: false,
      message: '导出失败'
    };
  }
};

// 生成CSV数据
function generateCSV(records) {
  const headers = [
    '儿童姓名',
    '出生日期',
    '评估日期',
    '评估年龄(月)',
    '听知觉',
    '触知觉',
    '视觉',
    '前庭/本体',
    '粗大动作',
    '精细动作',
    '社会互动',
    '认知',
    '口腔动作',
    '语言',
    '总体水平',
    '提交时间'
  ];

  const rows = records.map(record => {
    const ageInMonths = calculateAge(record.dob, record.assessmentDate);
    const summaryMap = {};
    
    // 将summary转换为映射
    record.summary.forEach(item => {
      summaryMap[item.category] = `${item.numerator}/${item.denominator} (${(item.ratio * 100).toFixed(1)}%)`;
    });

    return [
      record.childName,
      record.dob,
      record.assessmentDate,
      ageInMonths,
      summaryMap['听知觉'] || '',
      summaryMap['触知觉'] || '',
      summaryMap['视觉'] || '',
      summaryMap['前庭/本体'] || '',
      summaryMap['粗大动作'] || '',
      summaryMap['精细动作'] || '',
      summaryMap['社会互动'] || '',
      summaryMap['认知'] || '',
      summaryMap['口腔动作'] || '',
      summaryMap['语言'] || '',
      calculateOverallLevel(record.summary),
      new Date(record.createdAt).toLocaleString()
    ];
  });

  // 生成CSV内容
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');

  return csvContent;
}

// 计算年龄
function calculateAge(dob, assessmentDate) {
  const dobDate = new Date(dob);
  const assessmentDateObj = new Date(assessmentDate);
  const ageInMonths = Math.floor((assessmentDateObj - dobDate) / (1000 * 60 * 60 * 24 * 30.44));
  return ageInMonths;
}

// 计算总体水平
function calculateOverallLevel(summary) {
  if (summary.length === 0) {
    return '无法评估';
  }

  const avgRatio = summary.reduce((sum, item) => sum + item.ratio, 0) / summary.length;
  
  if (avgRatio >= 0.9) {
    return '发育正常';
  } else if (avgRatio >= 0.7) {
    return '发育良好';
  } else if (avgRatio >= 0.5) {
    return '发育一般';
  } else {
    return '发育迟缓';
  }
}
