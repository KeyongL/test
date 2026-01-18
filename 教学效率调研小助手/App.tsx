import React, { useState, useEffect } from 'react';
import ChatInterface from './components/ChatInterface';
import Dashboard from './components/Dashboard';
import { SurveyRecord } from './types';
import { MessageCircle, Settings, BarChart2 } from 'lucide-react';

// Seed data for demonstration
const SEED_DATA: SurveyRecord[] = [
  {
    id: "1",
    role_focus: "教学任务为主",
    ai_freq: "偶尔辅助翻译/搜索",
    teaching_pain: ["PPT课件制作/美化", "查找新颖的教学案例/素材"],
    teaching_wish: ["一键生成精美PPT课件", "课堂互动辅助(签到/提问)"],
    paper_pain: ["创新点挖掘/选题困难"],
    paper_wish: ["文献综述自动生成"],
    grant_pain: ["繁琐的格式调整与形式审查", "提炼创新点与研究价值"],
    grant_wish: ["形式审查与格式自动校对"],
    agent_form: "嵌入在PPT里的插件",
    platform_pref: "N/A",
    concern: "生成内容胡编乱造（幻觉）",
    budget: "个人订阅（<30元/月）",
    dev_priority: "先做【教学辅助】（PPT/批改等）",
    created_at: new Date(Date.now() - 86400000).toISOString()
  },
  {
    id: "2",
    role_focus: "科研任务为主",
    ai_freq: "深度依赖，已融入工作流",
    teaching_pain: ["学生答疑/考勤管理"],
    teaching_wish: ["24小时助教自动答疑", "学情分析与成绩预测"],
    paper_pain: ["海量文献阅读与整理总结", "英文论文润色/翻译/降重"],
    paper_wish: ["论文深度润色与降重"],
    grant_pain: ["研究现状/国内外综述撰写"],
    grant_wish: ["基于简单的想法生成申报书初稿"],
    agent_form: "网页端平台（功能最全）",
    platform_pref: "N/A",
    concern: "数据隐私/课题泄密",
    budget: "希望完全免费/使用学校采购版",
    dev_priority: "先做【课题申报】（本子撰写等）",
    created_at: new Date(Date.now() - 43200000).toISOString()
  }
];

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'chat' | 'dashboard'>('chat');
  const [surveyData, setSurveyData] = useState<SurveyRecord[]>([]);

  // Load data from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('agent_survey_data_v3'); // New key for new schema v3
    if (stored) {
      setSurveyData(JSON.parse(stored));
    } else {
        // Initialize with seed data for better first impression
        setSurveyData(SEED_DATA);
        localStorage.setItem('agent_survey_data_v3', JSON.stringify(SEED_DATA));
    }
  }, []);

  const handleSurveyComplete = (record: SurveyRecord) => {
    const updatedData = [...surveyData, record];
    setSurveyData(updatedData);
    localStorage.setItem('agent_survey_data_v3', JSON.stringify(updatedData));
  };

  return (
    <div className="flex flex-col h-screen max-w-md mx-auto sm:max-w-4xl bg-white sm:my-8 sm:rounded-2xl sm:shadow-lg sm:border border-gray-100 overflow-hidden">
      
      {/* Desktop/Tablet Layout Split */}
      <div className="flex-1 flex flex-col sm:flex-row overflow-hidden">
        
        {/* Navigation / Sidebar (Light Theme for Cleaner Look) */}
        <div className="sm:w-64 bg-white border-t sm:border-t-0 sm:border-r border-gray-100 flex sm:flex-col justify-around sm:justify-start sm:p-6 z-30 order-2 sm:order-1">
           <div className="hidden sm:block mb-8 px-2">
                <div className="w-8 h-8 bg-blue-600 rounded-lg mb-3 flex items-center justify-center">
                    <BarChart2 className="text-white w-5 h-5" />
                </div>
                <h1 className="text-lg font-bold tracking-tight text-gray-900">AI赋能调研</h1>
                <p className="text-xs text-gray-400 mt-1">Teaching & Research</p>
           </div>
           
           <button 
             onClick={() => setActiveTab('chat')}
             className={`flex items-center space-x-3 p-3 rounded-xl transition-all duration-200 group ${
               activeTab === 'chat' 
                 ? 'bg-blue-50 text-blue-700 font-medium' 
                 : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
             }`}
           >
             <MessageCircle size={20} className={activeTab === 'chat' ? "text-blue-600" : "text-gray-400 group-hover:text-gray-600"} />
             <span className="text-xs sm:text-sm">智能访谈</span>
           </button>

           <button 
             onClick={() => setActiveTab('dashboard')}
             className={`flex items-center space-x-3 p-3 rounded-xl transition-all duration-200 group ${
               activeTab === 'dashboard' 
                 ? 'bg-blue-50 text-blue-700 font-medium' 
                 : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
             }`}
           >
             <Settings size={20} className={activeTab === 'dashboard' ? "text-blue-600" : "text-gray-400 group-hover:text-gray-600"} />
             <span className="text-xs sm:text-sm">决策看板</span>
           </button>
        </div>

        {/* Main Content */}
        <div className="flex-1 bg-white relative overflow-hidden order-1 sm:order-2 flex flex-col">
          {activeTab === 'chat' ? (
            <ChatInterface onSurveyComplete={handleSurveyComplete} />
          ) : (
            <Dashboard data={surveyData} />
          )}
        </div>
      </div>
    </div>
  );
};

export default App;