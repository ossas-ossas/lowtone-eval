// utils/rules.ts
import { SummaryItem, Band } from './scoring';

export interface AdviceRule {
  condition: (summary: SummaryItem[]) => boolean;
  advice: string;
  priority: number; // 优先级，数字越小优先级越高
}

/**
 * 构建建议规则
 * @param summary 汇总结果
 * @returns 建议文本数组
 */
export function buildAdvice(summary: SummaryItem[]): string[] {
  const adviceBlocks: string[] = [];
  
  // 获取各类别的数据
  const getCategory = (categoryName: string) => 
    summary.find(item => item.category === categoryName);

  const touch = getCategory('触知觉');
  const vestibular = getCategory('前庭/本体');
  const social = getCategory('社会互动');
  const cognitive = getCategory('认知');
  const language = getCategory('语言');
  const grossMotor = getCategory('粗大动作');
  const fineMotor = getCategory('精细动作');
  const visual = getCategory('视觉');
  const auditory = getCategory('听知觉');
  const oral = getCategory('口腔动作');

  // 规则1：触觉和前庭本体感觉问题
  if (touch && vestibular && touch.ratio < 0.5 && vestibular.ratio < 0.5) {
    adviceBlocks.push('建议重点加强触觉及前庭刺激训练，如使用深压按摩、平衡垫训练、摇摆活动、旋转游戏等，帮助改善感觉统合能力。');
  }

  // 规则2：社会互动问题
  if (social && social.ratio < 0.5) {
    adviceBlocks.push('需降低社交场景要求，鼓励亲子互动、减少陌生环境刺激，可通过游戏、音乐、绘本等方式增进社交能力。');
  }

  // 规则3：认知能力问题
  if (cognitive && cognitive.ratio < 0.5) {
    adviceBlocks.push('建议加强认知训练，包括注意力集中练习、记忆游戏、分类排序活动、问题解决训练等，提升认知发展水平。');
  }

  // 规则4：语言发展问题
  if (language && language.ratio < 0.5) {
    adviceBlocks.push('需要加强语言刺激和训练，多与孩子对话交流，鼓励表达，可通过儿歌、故事、角色扮演等方式促进语言发展。');
  }

  // 规则5：粗大动作问题
  if (grossMotor && grossMotor.ratio < 0.5) {
    adviceBlocks.push('建议加强粗大动作训练，包括爬行、走路、跑步、跳跃、平衡等练习，可通过户外活动和运动游戏进行训练。');
  }

  // 规则6：精细动作问题
  if (fineMotor && fineMotor.ratio < 0.5) {
    adviceBlocks.push('需要加强精细动作训练，如抓握、捏取、穿珠、画画、剪纸等活动，提升手眼协调和手指灵活性。');
  }

  // 规则7：视觉问题
  if (visual && visual.ratio < 0.5) {
    adviceBlocks.push('建议加强视觉训练，包括视觉追踪、视觉记忆、视觉分辨等练习，可通过拼图、找不同、视觉游戏等方式训练。');
  }

  // 规则8：听觉问题
  if (auditory && auditory.ratio < 0.5) {
    adviceBlocks.push('需要加强听觉训练，包括听觉注意力、听觉记忆、听觉分辨等练习，可通过音乐、声音游戏、听指令等方式训练。');
  }

  // 规则9：口腔动作问题
  if (oral && oral.ratio < 0.5) {
    adviceBlocks.push('建议加强口腔动作训练，包括咀嚼、吞咽、发音等练习，可通过吹泡泡、咀嚼训练、发音游戏等方式改善。');
  }

  // 规则10：多项功能问题
  const poorCategories = summary.filter(item => item.band === 'P');
  if (poorCategories.length >= 3) {
    adviceBlocks.push('多项功能发育滞后，建议寻求专业机构进行综合评估和干预，制定个性化的训练计划。');
  }

  // 规则11：整体良好但有改善空间
  const goodCategories = summary.filter(item => item.band === 'G');
  if (goodCategories.length >= 5 && poorCategories.length === 0) {
    adviceBlocks.push('整体发育良好，建议继续保持现有训练方法，并针对个别项目进行强化练习。');
  }

  // 规则12：发育正常
  const normalCategories = summary.filter(item => item.band === 'N');
  if (normalCategories.length >= 8) {
    adviceBlocks.push('各项功能发育正常，符合年龄发展水平，建议继续保持良好的养育环境和适当的刺激。');
  }

  // 如果没有特定建议，提供一般性建议
  if (adviceBlocks.length === 0) {
    adviceBlocks.push('建议定期进行功能评估，根据发展情况调整训练计划，保持积极乐观的态度。');
  }

  return adviceBlocks;
}

/**
 * 生成个性化建议
 * @param summary 汇总结果
 * @param childAge 儿童年龄（月）
 * @returns 个性化建议
 */
export function generatePersonalizedAdvice(summary: SummaryItem[], childAge: number): {
  generalAdvice: string[];
  specificAdvice: string[];
  nextSteps: string[];
} {
  const generalAdvice = buildAdvice(summary);
  const specificAdvice: string[] = [];
  const nextSteps: string[] = [];

  // 根据年龄提供特定建议
  if (childAge < 12) {
    specificAdvice.push('此年龄段重点发展基础感觉和动作能力，建议多进行触觉、前庭刺激和基础动作练习。');
    nextSteps.push('3个月后重新评估');
  } else if (childAge < 24) {
    specificAdvice.push('此年龄段是语言和认知发展的关键期，建议加强语言刺激和认知训练。');
    nextSteps.push('6个月后重新评估');
  } else if (childAge < 36) {
    specificAdvice.push('此年龄段重点发展社交能力和精细动作，建议多进行社交互动和手部精细动作训练。');
    nextSteps.push('6个月后重新评估');
  } else {
    specificAdvice.push('此年龄段应全面发展各项能力，建议制定综合性的训练计划。');
    nextSteps.push('12个月后重新评估');
  }

  // 添加通用下一步
  nextSteps.push('定期记录训练进展');
  nextSteps.push('与专业机构保持联系');
  nextSteps.push('调整家庭训练计划');

  return {
    generalAdvice,
    specificAdvice,
    nextSteps
  };
}
