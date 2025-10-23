// cloudfunctions/getOpenId/index.js
const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

exports.main = async (event, context) => {
  const { code } = event;
  
  try {
    // 通过 code 获取 openId
    const result = await cloud.openapi.wx.getOpenId({
      code
    });
    
    return {
      success: true,
      openId: result.openid
    };
  } catch (error) {
    console.error('获取 openId 失败:', error);
    return {
      success: false,
      message: '获取用户信息失败'
    };
  }
};
