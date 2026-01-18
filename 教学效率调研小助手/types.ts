export type QuestionType = 'single' | 'multi' | 'text' | 'end';

export interface Question {
  id: string;
  text: string;
  type: QuestionType;
  options?: string[];
  placeholder?: string;
  acknowledgment?: string;
}

// 扩展后的13个维度数据结构
export interface SurveyRecord {
  id: string;
  role_focus: string;      // Q1 身份重心
  ai_freq: string;         // Q2 AI使用频率
  
  // 教学篇
  teaching_pain: string[]; // Q3 教学痛点 (多选)
  teaching_wish: string[]; // Q4 教学核心期待 (多选)
  
  // 论文篇
  paper_pain: string[];    // Q5 论文痛点 (多选)
  paper_wish: string[];    // Q6 论文核心期待 (多选)
  
  // 课题申报篇
  grant_pain: string[];    // Q7 申报书痛点 (多选)
  grant_wish: string[];    // Q8 申报书核心期待 (多选)
  
  // 产品偏好
  agent_form: string;      // Q9 产品形态
  platform_pref: string;   // Q10 终端偏好
  concern: string;         // Q11 核心顾虑
  budget: string;          // Q12 预算
  
  // 战略决策
  dev_priority: string;    // Q13 研发优先级 (先做哪个?)
  
  created_at: string;
}

export interface ChatMessage {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  isTyping?: boolean;
  questionId?: string;
}