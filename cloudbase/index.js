// cloudbase/index.js - 云托管主服务文件
const express = require('express');
const cors = require('cors');
const { initializeApp } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

const app = express();

// 中间件配置
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 初始化 Firebase Admin SDK
const serviceAccount = require('./serviceAccountKey.json');
initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://your-project-id.firebaseio.com'
});

const db = getFirestore();

// 健康检查接口
app.get('/', (req, res) => {
  res.json({
    message: '低张儿综合功能发育量表API服务',
    version: '1.0.0',
    status: 'running',
    timestamp: new Date().toISOString()
  });
});

// 获取量表字典数据
app.get('/api/dictionary', async (req, res) => {
  try {
    const snapshot = await db.collection('dictionary').get();
    const dictionary = [];
    snapshot.forEach(doc => {
      dictionary.push({ id: doc.id, ...doc.data() });
    });
    
    res.json({
      success: true,
      data: dictionary
    });
  } catch (error) {
    console.error('获取字典数据失败:', error);
    res.status(500).json({
      success: false,
      message: '获取数据失败'
    });
  }
});

// 提交评估数据
app.post('/api/submissions', async (req, res) => {
  try {
    const { childName, dob, assessmentDate, answers, ownerOpenId } = req.body;
    
    // 验证数据
    if (!childName || !dob || !assessmentDate || !answers || !ownerOpenId) {
      return res.status(400).json({
        success: false,
        message: '缺少必要参数'
      });
    }

    // 计算汇总数据
    const summary = calculateSummary(answers);
    
    // 保存到数据库
    const docRef = await db.collection('submissions').add({
      childName: childName.trim(),
      dob,
      assessmentDate,
      answers,
      summary,
      ownerOpenId,
      createdAt: new Date()
    });

    res.json({
      success: true,
      submissionId: docRef.id,
      message: '保存成功'
    });
  } catch (error) {
    console.error('保存评估数据失败:', error);
    res.status(500).json({
      success: false,
      message: '保存失败'
    });
  }
});

// 获取评估记录列表
app.get('/api/submissions', async (req, res) => {
  try {
    const { openId, role, page = 1, pageSize = 10 } = req.query;
    
    if (!openId || !role) {
      return res.status(400).json({
        success: false,
        message: '缺少必要参数'
      });
    }

    let query = db.collection('submissions');
    
    // 根据角色设置查询条件
    if (role === 'parent') {
      query = query.where('ownerOpenId', '==', openId);
    }
    // 机构工作人员可以查看所有记录

    // 分页查询
    const skip = (page - 1) * pageSize;
    const snapshot = await query
      .orderBy('createdAt', 'desc')
      .offset(skip)
      .limit(parseInt(pageSize))
      .get();

    const submissions = [];
    snapshot.forEach(doc => {
      submissions.push({ id: doc.id, ...doc.data() });
    });

    res.json({
      success: true,
      data: submissions,
      pagination: {
        page: parseInt(page),
        pageSize: parseInt(pageSize),
        total: submissions.length
      }
    });
  } catch (error) {
    console.error('获取评估记录失败:', error);
    res.status(500).json({
      success: false,
      message: '获取数据失败'
    });
  }
});

// 获取单个评估记录
app.get('/api/submissions/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const doc = await db.collection('submissions').doc(id).get();
    
    if (!doc.exists) {
      return res.status(404).json({
        success: false,
        message: '未找到相关数据'
      });
    }

    res.json({
      success: true,
      data: { id: doc.id, ...doc.data() }
    });
  } catch (error) {
    console.error('获取评估记录失败:', error);
    res.status(500).json({
      success: false,
      message: '获取数据失败'
    });
  }
});

// 生成报告
app.post('/api/reports/generate', async (req, res) => {
  try {
    const { submissionId } = req.body;
    
    if (!submissionId) {
      return res.status(400).json({
        success: false,
        message: '缺少提交ID'
      });
    }

    // 获取提交数据
    const doc = await db.collection('submissions').doc(submissionId).get();
    
    if (!doc.exists) {
      return res.status(404).json({
        success: false,
        message: '未找到相关数据'
      });
    }

    const submission = doc.data();
    
    // 生成报告
    const reportData = generateReport(submission);
    
    // 这里可以集成文件存储服务，生成并返回报告下载链接
    res.json({
      success: true,
      reportUrl: 'https://your-domain.com/reports/' + submissionId + '.pdf',
      message: '报告生成成功'
    });
  } catch (error) {
    console.error('生成报告失败:', error);
    res.status(500).json({
      success: false,
      message: '生成报告失败'
    });
  }
});

// 计算汇总数据的辅助函数
function calculateSummary(answers) {
  const map = new Map();
  
  answers.forEach(answer => {
    if (!map.has(answer.category)) {
      map.set(answer.category, { num: 0, den: 0 });
    }
    
    const agg = map.get(answer.category);
    agg.den += 1;
    
    if (answer.value === 'yes') {
      agg.num += 1;
    }
  });
  
  return [...map.entries()].map(([category, { num, den }]) => {
    const ratio = den ? Number((num / den).toFixed(4)) : 0;
    const band = ratioToBand(ratio);
    
    return {
      category,
      numerator: num,
      denominator: den,
      ratio,
      band
    };
  });
}

// 分档计算函数
function ratioToBand(ratio) {
  const eps = 1e-6;
  
  if (Math.abs(ratio - 1) < eps) return 'N';
  if (ratio >= (2/3 - eps) && ratio < (1 - eps)) return 'G';
  if (Math.abs(ratio - 0.5) < eps) return 'F';
  if (ratio < 0.5 - eps) return 'P';
  if (ratio >= 0.5 && ratio < 2/3) return 'F';
  
  return 'N';
}

// 生成报告的辅助函数
function generateReport(submission) {
  // 这里实现报告生成逻辑
  return {
    childName: submission.childName,
    dob: submission.dob,
    assessmentDate: submission.assessmentDate,
    summary: submission.summary,
    createdAt: submission.createdAt
  };
}

// 错误处理中间件
app.use((error, req, res, next) => {
  console.error('服务器错误:', error);
  res.status(500).json({
    success: false,
    message: '服务器内部错误'
  });
});

// 404处理
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: '接口不存在'
  });
});

// 启动服务器
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`服务器运行在端口 ${PORT}`);
});

module.exports = app;
