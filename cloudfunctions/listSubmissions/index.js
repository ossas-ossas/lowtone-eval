// cloudfunctions/listSubmissions/index.js
const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

const db = cloud.database();

exports.main = async (event, context) => {
  const { openId, role, page = 1, pageSize = 10, orgId } = event;
  
  try {
    if (!openId || !role) {
      return {
        success: false,
        message: '缺少必要参数'
      };
    }

    let query = db.collection('submissions');
    
    // 根据角色设置查询条件
    if (role === 'parent') {
      // 家长只能查看自己的记录
      query = query.where({
        ownerOpenId: openId
      });
    } else if (role === 'staff') {
      // 机构工作人员可以查看所有记录
      if (orgId) {
        // 如果指定了机构ID，可以添加机构过滤条件
        // 这里需要根据实际业务逻辑调整
      }
    }

    // 分页查询
    const skip = (page - 1) * pageSize;
    const result = await query
      .orderBy('createdAt', 'desc')
      .skip(skip)
      .limit(pageSize)
      .get();

    // 获取总数
    const countResult = await query.count();
    const total = countResult.total;

    return {
      success: true,
      data: result.data,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize)
      }
    };
  } catch (error) {
    console.error('获取提交列表失败:', error);
    return {
      success: false,
      message: '获取数据失败'
    };
  }
};
