// utils/scoring.ts
export type Band = 'N' | 'G' | 'F' | 'P';

export interface Answer {
  category: string;
  value: 'yes' | 'no' | 'unknown';
}

export interface SummaryItem {
  category: string;
  numerator: number;
  denominator: number;
  ratio: number;
  band: Band;
}

export interface Submission {
  _id?: string;
  childName: string;
  dob: string;
  assessmentDate: string;
  answers: Answer[];
  summary: SummaryItem[];
  ownerOpenId: string;
  createdAt?: Date;
}

/**
 * 根据比例计算分档
 * @param ratio 比例值 (0-1)
 * @returns 分档结果
 */
export function ratioToBand(ratio: number): Band {
  const r = Number.isFinite(ratio) ? ratio : 0;
  const eps = 1e-6;
  
  // 常态：分子 = 分母 (ratio = 1)
  if (Math.abs(r - 1) < eps) return 'N';
  
  // 良好：分子/分母 ≥ 2/3 且 < 1
  if (r >= (2/3 - eps) && r < (1 - eps)) return 'G';
  
  // 普通：分子/分母 = 1/2 (±容差)
  if (Math.abs(r - 0.5) < eps) return 'F';
  
  // 差：分子/分母 < 1/2
  if (r < 0.5 - eps) return 'P';
  
  // 介于 0.5–2/3 且非恰好 0.5，归为普通
  if (r >= 0.5 && r < 2/3) return 'F';
  
  return 'N';
}

/**
 * 按类别汇总答案
 * @param answers 答案数组
 * @returns 汇总结果
 */
export function summarizeByCategory(answers: Answer[]): SummaryItem[] {
  const map = new Map<string, { num: number; den: number }>();
  
  // 统计每个类别的分子和分母
  for (const answer of answers) {
    if (!map.has(answer.category)) {
      map.set(answer.category, { num: 0, den: 0 });
    }
    
    const agg = map.get(answer.category)!;
    agg.den += 1; // 分母+1
    
    if (answer.value === 'yes') {
      agg.num += 1; // 分子+1
    }
  }
  
  // 转换为汇总结果
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

/**
 * 获取分档对应的颜色
 * @param band 分档
 * @returns 颜色值
 */
export function getBandColor(band: Band): string {
  const colors = {
    'N': '#1890FF', // 蓝色 - 常态
    'G': '#52C41A', // 绿色 - 良好
    'F': '#FAAD14', // 黄色 - 普通
    'P': '#FF4D4F'  // 红色 - 差
  };
  return colors[band];
}

/**
 * 获取分档对应的中文名称
 * @param band 分档
 * @returns 中文名称
 */
export function getBandName(band: Band): string {
  const names = {
    'N': '常态',
    'G': '良好',
    'F': '普通',
    'P': '差'
  };
  return names[band];
}

/**
 * 获取分档对应的CSS类名
 * @param band 分档
 * @returns CSS类名
 */
export function getBandClass(band: Band): string {
  return `band-${band.toLowerCase()}`;
}

/**
 * 计算总体发育水平
 * @param summary 汇总结果
 * @returns 总体水平描述
 */
export function calculateOverallLevel(summary: SummaryItem[]): {
  level: string;
  description: string;
  color: string;
} {
  if (summary.length === 0) {
    return {
      level: '无法评估',
      description: '暂无评估数据',
      color: '#999999'
    };
  }

  // 计算平均比例
  const avgRatio = summary.reduce((sum, item) => sum + item.ratio, 0) / summary.length;
  const avgBand = ratioToBand(avgRatio);

  const levels = {
    'N': { level: '发育正常', description: '各项功能发育良好，符合年龄发展水平', color: '#1890FF' },
    'G': { level: '发育良好', description: '大部分功能发育良好，个别项目需要关注', color: '#52C41A' },
    'F': { level: '发育一般', description: '部分功能需要加强训练和干预', color: '#FAAD14' },
    'P': { level: '发育迟缓', description: '多项功能发育滞后，建议及时干预', color: '#FF4D4F' }
  };

  return levels[avgBand];
}

/**
 * 验证提交数据
 * @param submission 提交数据
 * @returns 验证结果
 */
export function validateSubmission(submission: Partial<Submission>): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!submission.childName || submission.childName.trim() === '') {
    errors.push('请输入儿童姓名');
  }

  if (!submission.dob || submission.dob.trim() === '') {
    errors.push('请输入出生日期');
  }

  if (!submission.assessmentDate || submission.assessmentDate.trim() === '') {
    errors.push('请输入评估日期');
  }

  if (!submission.answers || submission.answers.length === 0) {
    errors.push('请完成量表评估');
  }

  // 验证日期格式
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (submission.dob && !dateRegex.test(submission.dob)) {
    errors.push('出生日期格式不正确，应为YYYY-MM-DD');
  }

  if (submission.assessmentDate && !dateRegex.test(submission.assessmentDate)) {
    errors.push('评估日期格式不正确，应为YYYY-MM-DD');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}
