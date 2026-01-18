import React, { useState, useEffect, useRef } from 'react';
import { Send, User, Bot, CheckSquare, Square } from 'lucide-react';
import { QUESTIONS, BOT_CONFIG, END_MESSAGE } from '../constants';
import { ChatMessage, SurveyRecord, Question } from '../types';

interface ChatInterfaceProps {
  onSurveyComplete: (record: SurveyRecord) => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ onSurveyComplete }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentStep, setCurrentStep] = useState<number>(-1); // -1 is intro
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [answers, setAnswers] = useState<Partial<SurveyRecord>>({});
  const [selectedMulti, setSelectedMulti] = useState<string[]>([]);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Initial greeting
  useEffect(() => {
    setTimeout(() => {
      addMessage('bot', BOT_CONFIG.intro);
      setTimeout(() => nextQuestion(0), 1000);
    }, 500);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const addMessage = (sender: 'bot' | 'user', text: string, questionId?: string) => {
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      sender,
      text,
      questionId
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const nextQuestion = (stepIndex: number) => {
    if (stepIndex >= QUESTIONS.length) {
      finishSurvey();
      return;
    }

    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      const q = QUESTIONS[stepIndex];
      addMessage('bot', q.text);
      setCurrentStep(stepIndex);
    }, 600);
  };

  const finishSurvey = () => {
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      addMessage('bot', END_MESSAGE);
      
      // Construct final record carefully mapping all fields
      const finalRecord: SurveyRecord = {
        id: Date.now().toString(),
        role_focus: answers.role_focus as string || '未填',
        ai_freq: answers.ai_freq as string || '未填',
        
        teaching_pain: (answers.teaching_pain as unknown as string[]) || [],
        teaching_wish: (answers.teaching_wish as unknown as string[]) || [],
        
        paper_pain: (answers.paper_pain as unknown as string[]) || [],
        paper_wish: (answers.paper_wish as unknown as string[]) || [],
        
        grant_pain: (answers.grant_pain as unknown as string[]) || [],
        grant_wish: (answers.grant_wish as unknown as string[]) || [],
        
        agent_form: answers.agent_form as string || '未填',
        platform_pref: 'N/A', 
        concern: answers.concern as string || '未填',
        budget: answers.budget as string || '未填',
        dev_priority: answers.dev_priority as string || '未填',
        
        created_at: new Date().toISOString()
      };
      
      onSurveyComplete(finalRecord);
      setCurrentStep(-2); // Completed state
    }, 1000);
  };

  const handleAnswer = (value: string | string[]) => {
    const currentQ = QUESTIONS[currentStep];
    const key = currentQ.id as keyof SurveyRecord;

    setAnswers(prev => ({ ...prev, [key]: value }));

    // User message bubble
    if (Array.isArray(value)) {
      addMessage('user', value.join('；'));
    } else {
      addMessage('user', value);
    }

    // Acknowledgment
    if (currentQ.acknowledgment) {
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        addMessage('bot', currentQ.acknowledgment!);
        nextQuestion(currentStep + 1);
      }, 800);
    } else {
      nextQuestion(currentStep + 1);
    }
  };

  const handleMultiSelectToggle = (option: string) => {
    if (selectedMulti.includes(option)) {
      setSelectedMulti(prev => prev.filter(i => i !== option));
    } else {
      setSelectedMulti(prev => [...prev, option]);
    }
  };

  const submitMultiSelect = () => {
    if (selectedMulti.length === 0) return;
    handleAnswer(selectedMulti);
    setSelectedMulti([]);
  };

  const currentQ = currentStep >= 0 && currentStep < QUESTIONS.length ? QUESTIONS[currentStep] : null;

  return (
    <div className="flex flex-col h-full bg-slate-50 relative">
      {/* Clean Header */}
      <div className="bg-white/80 backdrop-blur-md border-b border-gray-100 px-6 py-4 flex items-center space-x-4 sticky top-0 z-10">
        <div className="relative">
          <img src={BOT_CONFIG.avatarUrl} alt="Bot" className="w-10 h-10 rounded-full object-cover bg-blue-50" />
          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full"></span>
        </div>
        <div>
          <h2 className="font-semibold text-gray-800">{BOT_CONFIG.name}</h2>
          <p className="text-xs text-gray-400">{BOT_CONFIG.role}</p>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 scrollbar-hide bg-slate-50">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.sender === 'bot' && (
               <div className="flex-shrink-0 mr-3 mt-1">
                 <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center border border-gray-100 shadow-sm">
                    <Bot size={16} className="text-blue-500" />
                 </div>
               </div>
            )}
            <div className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-5 py-3.5 text-sm leading-relaxed shadow-sm ${
              msg.sender === 'user' 
                ? 'bg-blue-600 text-white rounded-br-none' 
                : 'bg-white text-gray-700 border border-gray-100 rounded-tl-none'
            }`}>
              <p className="whitespace-pre-wrap">{msg.text}</p>
            </div>
          </div>
        ))}
        {isTyping && (
           <div className="flex justify-start">
             <div className="flex-shrink-0 mr-3 mt-1">
                <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center border border-gray-100 shadow-sm">
                  <Bot size={16} className="text-blue-500" />
                </div>
             </div>
             <div className="bg-white border border-gray-100 rounded-2xl rounded-tl-none px-5 py-4 shadow-sm">
               <div className="flex space-x-1.5">
                 <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></div>
                 <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-75"></div>
                 <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-150"></div>
               </div>
             </div>
           </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="bg-white border-t border-gray-100 p-4 sm:p-6 pb-8 sticky bottom-0 z-20">
        {currentStep === -2 ? (
            <div className="text-center py-8 bg-green-50/50 text-green-800 rounded-2xl border border-green-100">
                <p className="font-semibold text-lg">调研已完成</p>
                <p className="text-sm mt-2 text-green-600/80">您可以点击左侧“决策看板”查看统计结果</p>
                <button 
                  onClick={() => window.location.reload()}
                  className="mt-6 px-6 py-2 text-sm font-medium bg-white text-green-700 rounded-full shadow-sm border border-green-100 hover:bg-green-50 transition-colors"
                >
                  开启新对话
                </button>
            </div>
        ) : !currentQ ? (
          <div className="h-12"></div> 
        ) : (
          <div className="space-y-4 max-w-3xl mx-auto">
            
            {/* Multi Select UI */}
            {currentQ.type === 'multi' && currentQ.options && (
              <div className="space-y-4">
                 <p className="text-xs text-blue-600 font-medium mb-1 pl-1 flex items-center tracking-wide uppercase">
                    <CheckSquare size={12} className="mr-1.5"/> 
                    多选题目
                 </p>
                <div className="grid grid-cols-1 gap-2.5 max-h-60 overflow-y-auto scrollbar-hide pr-1">
                  {currentQ.options.map((opt) => {
                    const isSelected = selectedMulti.includes(opt);
                    return (
                      <button
                        key={opt}
                        onClick={() => handleMultiSelectToggle(opt)}
                        className={`w-full text-left px-5 py-3.5 text-sm border rounded-xl flex items-center justify-between transition-all duration-200 group ${
                          isSelected 
                            ? 'bg-blue-50/50 border-blue-500 text-blue-700 shadow-sm' 
                            : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        <span>{opt}</span>
                        <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                            isSelected ? 'bg-blue-600 border-blue-600' : 'border-gray-300 group-hover:border-gray-400'
                        }`}>
                             {isSelected && <CheckSquare size={14} className="text-white" />}
                        </div>
                      </button>
                    )
                  })}
                </div>
                <button
                  onClick={submitMultiSelect}
                  disabled={selectedMulti.length === 0}
                  className="w-full bg-blue-600 text-white py-4 rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700 transition-all shadow-lg shadow-blue-200/50 active:shadow-sm transform active:scale-[0.99]"
                >
                  确认提交 ({selectedMulti.length})
                </button>
              </div>
            )}

            {/* Single Select UI */}
            {currentQ.type === 'single' && currentQ.options && (
              <div className="grid grid-cols-1 gap-2.5">
                {currentQ.options.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => handleAnswer(opt)}
                    className="w-full text-left px-5 py-4 text-sm text-gray-700 bg-white hover:bg-gray-50 hover:border-blue-400 border border-gray-200 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
                  >
                    {opt}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatInterface;