// cloudfunctions/seedDictionary/index.js
const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

const db = cloud.database();

// 量表字典数据
const dictionaryData = [
  // 听知觉类别
  { category: '听知觉', itemCode: 'AUD01', title: '能听到家长叫名字', weight: 1 },
  { category: '听知觉', itemCode: 'AUD02', title: '能辨别不同声音的方向', weight: 1 },
  { category: '听知觉', itemCode: 'AUD03', title: '能听懂简单的指令', weight: 1 },
  { category: '听知觉', itemCode: 'AUD04', title: '能区分音乐和噪音', weight: 1 },
  { category: '听知觉', itemCode: 'AUD05', title: '能模仿简单的声音', weight: 1 },
  { category: '听知觉', itemCode: 'AUD06', title: '能注意听故事或儿歌', weight: 1 },
  { category: '听知觉', itemCode: 'AUD07', title: '能辨别音调的高低', weight: 1 },
  { category: '听知觉', itemCode: 'AUD08', title: '能记住简单的旋律', weight: 1 },
  { category: '听知觉', itemCode: 'AUD09', title: '能理解语言的情感色彩', weight: 1 },
  { category: '听知觉', itemCode: 'AUD10', title: '能区分相似音素', weight: 1 },

  // 触知觉类别
  { category: '触知觉', itemCode: 'TAC01', title: '能感知不同材质的触感', weight: 1 },
  { category: '触知觉', itemCode: 'TAC02', title: '能区分冷热温度', weight: 1 },
  { category: '触知觉', itemCode: 'TAC03', title: '能感知轻重的压力', weight: 1 },
  { category: '触知觉', itemCode: 'TAC04', title: '能接受不同质地的食物', weight: 1 },
  { category: '触知觉', itemCode: 'TAC05', title: '能感知身体各部位的触觉', weight: 1 },
  { category: '触知觉', itemCode: 'TAC06', title: '能区分粗糙和光滑', weight: 1 },
  { category: '触知觉', itemCode: 'TAC07', title: '能感知疼痛和舒适', weight: 1 },
  { category: '触知觉', itemCode: 'TAC08', title: '能接受拥抱和抚摸', weight: 1 },
  { category: '触知觉', itemCode: 'TAC09', title: '能感知湿干状态', weight: 1 },
  { category: '触知觉', itemCode: 'TAC10', title: '能区分软硬程度', weight: 1 },

  // 视觉类别
  { category: '视觉', itemCode: 'VIS01', title: '能注视移动的物体', weight: 1 },
  { category: '视觉', itemCode: 'VIS02', title: '能区分不同的颜色', weight: 1 },
  { category: '视觉', itemCode: 'VIS03', title: '能追踪快速移动的物体', weight: 1 },
  { category: '视觉', itemCode: 'VIS04', title: '能识别简单的图形', weight: 1 },
  { category: '视觉', itemCode: 'VIS05', title: '能区分大小不同的物体', weight: 1 },
  { category: '视觉', itemCode: 'VIS06', title: '能注意细节变化', weight: 1 },
  { category: '视觉', itemCode: 'VIS07', title: '能识别熟悉的面孔', weight: 1 },
  { category: '视觉', itemCode: 'VIS08', title: '能区分远近距离', weight: 1 },
  { category: '视觉', itemCode: 'VIS09', title: '能识别文字符号', weight: 1 },
  { category: '视觉', itemCode: 'VIS10', title: '能进行视觉记忆', weight: 1 },

  // 前庭/本体类别
  { category: '前庭/本体', itemCode: 'VES01', title: '能保持坐姿平衡', weight: 1 },
  { category: '前庭/本体', itemCode: 'VES02', title: '能进行简单的旋转', weight: 1 },
  { category: '前庭/本体', itemCode: 'VES03', title: '能感知身体位置', weight: 1 },
  { category: '前庭/本体', itemCode: 'VES04', title: '能适应速度变化', weight: 1 },
  { category: '前庭/本体', itemCode: 'VES05', title: '能进行摇摆动作', weight: 1 },
  { category: '前庭/本体', itemCode: 'VES06', title: '能感知重力方向', weight: 1 },
  { category: '前庭/本体', itemCode: 'VES07', title: '能进行平衡训练', weight: 1 },
  { category: '前庭/本体', itemCode: 'VES08', title: '能感知运动方向', weight: 1 },
  { category: '前庭/本体', itemCode: 'VES09', title: '能进行协调动作', weight: 1 },
  { category: '前庭/本体', itemCode: 'VES10', title: '能适应空间变化', weight: 1 },

  // 粗大动作类别
  { category: '粗大动作', itemCode: 'GRO01', title: '能独立坐立', weight: 1 },
  { category: '粗大动作', itemCode: 'GRO02', title: '能独立站立', weight: 1 },
  { category: '粗大动作', itemCode: 'GRO03', title: '能独立行走', weight: 1 },
  { category: '粗大动作', itemCode: 'GRO04', title: '能跑步', weight: 1 },
  { category: '粗大动作', itemCode: 'GRO05', title: '能跳跃', weight: 1 },
  { category: '粗大动作', itemCode: 'GRO06', title: '能爬行', weight: 1 },
  { category: '粗大动作', itemCode: 'GRO07', title: '能踢球', weight: 1 },
  { category: '粗大动作', itemCode: 'GRO08', title: '能投掷', weight: 1 },
  { category: '粗大动作', itemCode: 'GRO09', title: '能攀爬', weight: 1 },
  { category: '粗大动作', itemCode: 'GRO10', title: '能进行体操动作', weight: 1 },

  // 精细动作类别
  { category: '精细动作', itemCode: 'FIN01', title: '能抓握小物体', weight: 1 },
  { category: '精细动作', itemCode: 'FIN02', title: '能捏取细小物品', weight: 1 },
  { category: '精细动作', itemCode: 'FIN03', title: '能使用勺子', weight: 1 },
  { category: '精细动作', itemCode: 'FIN04', title: '能使用筷子', weight: 1 },
  { category: '精细动作', itemCode: 'FIN05', title: '能握笔涂画', weight: 1 },
  { category: '精细动作', itemCode: 'FIN06', title: '能穿珠子', weight: 1 },
  { category: '精细动作', itemCode: 'FIN07', title: '能剪纸', weight: 1 },
  { category: '精细动作', itemCode: 'FIN08', title: '能搭积木', weight: 1 },
  { category: '精细动作', itemCode: 'FIN09', title: '能扣扣子', weight: 1 },
  { category: '精细动作', itemCode: 'FIN10', title: '能系鞋带', weight: 1 },

  // 社会互动类别
  { category: '社会互动', itemCode: 'SOC01', title: '能与他人眼神交流', weight: 1 },
  { category: '社会互动', itemCode: 'SOC02', title: '能回应他人的微笑', weight: 1 },
  { category: '社会互动', itemCode: 'SOC03', title: '能主动与他人互动', weight: 1 },
  { category: '社会互动', itemCode: 'SOC04', title: '能分享玩具或食物', weight: 1 },
  { category: '社会互动', itemCode: 'SOC05', title: '能理解他人的情绪', weight: 1 },
  { category: '社会互动', itemCode: 'SOC06', title: '能参与集体游戏', weight: 1 },
  { category: '社会互动', itemCode: 'SOC07', title: '能遵守游戏规则', weight: 1 },
  { category: '社会互动', itemCode: 'SOC08', title: '能表达自己的需求', weight: 1 },
  { category: '社会互动', itemCode: 'SOC09', title: '能安慰他人', weight: 1 },
  { category: '社会互动', itemCode: 'SOC10', title: '能进行角色扮演', weight: 1 },

  // 认知类别
  { category: '认知', itemCode: 'COG01', title: '能识别常见物品', weight: 1 },
  { category: '认知', itemCode: 'COG02', title: '能理解因果关系', weight: 1 },
  { category: '认知', itemCode: 'COG03', title: '能进行分类活动', weight: 1 },
  { category: '认知', itemCode: 'COG04', title: '能进行排序活动', weight: 1 },
  { category: '认知', itemCode: 'COG05', title: '能解决简单问题', weight: 1 },
  { category: '认知', itemCode: 'COG06', title: '能进行记忆游戏', weight: 1 },
  { category: '认知', itemCode: 'COG07', title: '能理解数量概念', weight: 1 },
  { category: '认知', itemCode: 'COG08', title: '能进行想象游戏', weight: 1 },
  { category: '认知', itemCode: 'COG09', title: '能理解时间概念', weight: 1 },
  { category: '认知', itemCode: 'COG10', title: '能进行逻辑推理', weight: 1 },

  // 口腔动作类别
  { category: '口腔动作', itemCode: 'ORA01', title: '能正常咀嚼食物', weight: 1 },
  { category: '口腔动作', itemCode: 'ORA02', title: '能正常吞咽', weight: 1 },
  { category: '口腔动作', itemCode: 'ORA03', title: '能吹泡泡', weight: 1 },
  { category: '口腔动作', itemCode: 'ORA04', title: '能吸吮', weight: 1 },
  { category: '口腔动作', itemCode: 'ORA05', title: '能舔舐', weight: 1 },
  { category: '口腔动作', itemCode: 'ORA06', title: '能进行口腔按摩', weight: 1 },
  { category: '口腔动作', itemCode: 'ORA07', title: '能控制口水', weight: 1 },
  { category: '口腔动作', itemCode: 'ORA08', title: '能进行口腔运动', weight: 1 },
  { category: '口腔动作', itemCode: 'ORA09', title: '能进行呼吸训练', weight: 1 },
  { category: '口腔动作', itemCode: 'ORA10', title: '能进行发音练习', weight: 1 },

  // 语言类别
  { category: '语言', itemCode: 'LAN01', title: '能发出简单音节', weight: 1 },
  { category: '语言', itemCode: 'LAN02', title: '能说出单词', weight: 1 },
  { category: '语言', itemCode: 'LAN03', title: '能说出短语', weight: 1 },
  { category: '语言', itemCode: 'LAN04', title: '能说出完整句子', weight: 1 },
  { category: '语言', itemCode: 'LAN05', title: '能理解简单指令', weight: 1 },
  { category: '语言', itemCode: 'LAN06', title: '能回答问题', weight: 1 },
  { category: '语言', itemCode: 'LAN07', title: '能表达需求', weight: 1 },
  { category: '语言', itemCode: 'LAN08', title: '能描述事件', weight: 1 },
  { category: '语言', itemCode: 'LAN09', title: '能进行对话', weight: 1 },
  { category: '语言', itemCode: 'LAN10', title: '能讲故事', weight: 1 }
];

exports.main = async (event, context) => {
  try {
    // 清空现有数据
    await db.collection('dictionary').where({}).remove();
    
    // 批量插入新数据
    const result = await db.collection('dictionary').add({
      data: dictionaryData
    });

    return {
      success: true,
      message: `成功初始化 ${dictionaryData.length} 条量表数据`,
      count: dictionaryData.length
    };
  } catch (error) {
    console.error('初始化量表数据失败:', error);
    return {
      success: false,
      message: '初始化失败'
    };
  }
};
