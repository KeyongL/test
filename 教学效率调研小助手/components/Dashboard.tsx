import React, { useState } from 'react';
import { SurveyRecord } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { Download, Table as TableIcon, LayoutDashboard, Lock, BookOpen, PenTool, Target } from 'lucide-react';

interface DashboardProps {
  data: SurveyRecord[];
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#6366f1'];
const ADMIN_PASSWORD = "123456789"; // Password updated

const Dashboard: React.FC<DashboardProps> = ({ data }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      setErrorMsg("");
    } else {
      setErrorMsg("密码错误");
    }
  };

  const onPieEnter = (_: any, index: number) => {
    setActiveIndex(index);
  };

  const onPieLeave = () => {
    setActiveIndex(null);
  };

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-slate-50 p-4">
        <div className="bg-white p-8 rounded-2xl shadow-sm w-full max-w-sm">
          <div className="flex justify-center mb-6">
            <div className="p-3 bg-blue-50 rounded-full">
              <Lock className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          <h2 className="text-xl font-bold text-center text-gray-800 mb-2">后台管理登录</h2>
          <p className="text-sm text-gray-500 text-center mb-6">默认密码: 123456789</p>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <input
                type="password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="请输入密码"
                className="w-full px-4 py-3 rounded-lg border-gray-200 bg-gray-50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all text-sm"
              />
            </div>
            {errorMsg && <p className="text-red-500 text-xs text-center">{errorMsg}</p>}
            <button 
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition-colors shadow-blue-200 shadow-lg"
            >
              登录
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-500 p-8 text-center">
        <LayoutDashboard size={64} className="mb-4 text-gray-300" />
        <h3 className="text-xl font-medium text-gray-700">暂无数据</h3>
        <p>请先在“智能访谈”中完成问卷收集。</p>
      </div>
    );
  }

  // Helper to count single selection fields
  const countField = (field: keyof SurveyRecord) => {
    const counts = data.reduce((acc, curr) => {
      const val = curr[field] as string;
      acc[val] = (acc[val] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    return Object.keys(counts).map(key => ({ name: key, value: counts[key] })).sort((a,b) => b.value - a.value);
  };

  // Helper to count multi selection fields
  const countMultiField = (field: keyof SurveyRecord) => {
     const counts: Record<string, number> = {};
     data.forEach(record => {
         const items = record[field];
         // Check if items is an array (it should be for multi fields now)
         if (Array.isArray(items)) {
             items.forEach(item => {
                 counts[item] = (counts[item] || 0) + 1;
             });
         } else if (typeof items === 'string') {
             // Fallback for old data or single strings
             counts[items] = (counts[items] || 0) + 1;
         }
     });
     return Object.keys(counts).map(key => ({ name: key, value: counts[key] })).sort((a,b) => b.value - a.value);
  }

  const teachingWishData = countMultiField('teaching_wish');
  const grantPainData = countMultiField('grant_pain');
  const priorityData = countField('dev_priority');

  return (
    <div className="p-4 sm:p-8 bg-slate-50 min-h-full overflow-y-auto pb-24">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 tracking-tight">决策看板</h2>
          <p className="text-sm text-gray-500 mt-1">共收集 {data.length} 份有效样本</p>
        </div>
        <button 
            onClick={() => {
                const jsonString = `data:text/json;chatset=utf-8,${encodeURIComponent(
                JSON.stringify(data, null, 2)
                )}`;
                const link = document.createElement("a");
                link.href = jsonString;
                link.download = "survey_data_export.json";
                link.click();
            }}
            className="flex items-center gap-2 bg-white text-gray-700 px-4 py-2 rounded-lg text-sm hover:bg-gray-50 shadow-sm transition-all border border-gray-100">
          <Download size={16} />
          <span>导出</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        
        {/* Strategic Priority - Donut Chart */}
        <div className="bg-white p-6 rounded-2xl shadow-sm col-span-1 lg:col-span-2">
            <h3 className="font-semibold text-gray-800 mb-6 flex items-center">
                <Target className="w-5 h-5 mr-2 text-red-500" />
                MVP开发优先级
            </h3>
            <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={priorityData}
                            cx="50%"
                            cy="50%"
                            innerRadius={80}
                            outerRadius={110}
                            paddingAngle={5}
                            dataKey="value"
                            onMouseEnter={onPieEnter}
                            onMouseLeave={onPieLeave}
                            cursor="pointer"
                            stroke="none"
                        >
                            {priorityData.map((entry, index) => (
                                <Cell 
                                    key={`cell-${index}`} 
                                    fill={COLORS[index % COLORS.length]} 
                                    fillOpacity={activeIndex === null || activeIndex === index ? 1 : 0.3}
                                    className="transition-all duration-300"
                                />
                            ))}
                        </Pie>
                        <Tooltip 
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                        />
                        <Legend 
                            verticalAlign="bottom" 
                            align="center"
                            iconType="circle"
                            onMouseEnter={onPieEnter}
                            onMouseLeave={onPieLeave}
                            formatter={(value) => <span className="text-gray-600 font-medium ml-2 cursor-pointer">{value}</span>}
                        />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>

        {/* Teaching Wishes (Multi) */}
        <div className="bg-white p-6 rounded-2xl shadow-sm">
          <h3 className="font-semibold text-gray-700 mb-6 flex items-center">
            <BookOpen className="w-5 h-5 mr-2 text-blue-500" />
            教学场景：功能期待分布
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={teachingWishData} layout="vertical" margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" width={140} tick={{fontSize: 11, fill: '#64748b'}} axisLine={false} tickLine={false} />
                <Tooltip 
                    cursor={{fill: 'rgba(59, 130, 246, 0.05)'}} 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="value" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={20}>
                    {teachingWishData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Grant Pain Points (Multi) */}
        <div className="bg-white p-6 rounded-2xl shadow-sm">
          <h3 className="font-semibold text-gray-700 mb-6 flex items-center">
            <PenTool className="w-5 h-5 mr-2 text-purple-500" />
            课题申报：最大痛点分布
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={grantPainData} layout="vertical" margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" width={140} tick={{fontSize: 11, fill: '#64748b'}} axisLine={false} tickLine={false} />
                <Tooltip 
                    cursor={{fill: 'rgba(139, 92, 246, 0.05)'}}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="value" fill="#8b5cf6" radius={[0, 4, 4, 0]} barSize={20}>
                    {grantPainData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Detailed Table */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-50 flex items-center">
            <TableIcon className="w-5 h-5 mr-2 text-gray-400" />
            <h3 className="font-semibold text-gray-700">全量数据明细</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 text-gray-500 uppercase">
              <tr>
                <th className="px-6 py-4 font-medium">身份</th>
                <th className="px-6 py-4 font-medium">教学期待</th>
                <th className="px-6 py-4 font-medium">申报痛点</th>
                <th className="px-6 py-4 font-medium text-red-500">优先开发</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {data.slice().reverse().map((record) => (
                <tr key={record.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900">
                    {record.role_focus}
                    <div className="text-xs text-gray-400 mt-1">{record.ai_freq}</div>
                  </td>
                  <td className="px-6 py-4 max-w-xs truncate text-gray-500" title={Array.isArray(record.teaching_wish) ? record.teaching_wish.join(', ') : record.teaching_wish}>
                    {Array.isArray(record.teaching_wish) ? record.teaching_wish[0] + (record.teaching_wish.length > 1 ? ` 等${record.teaching_wish.length}项` : '') : record.teaching_wish}
                  </td>
                  <td className="px-6 py-4 max-w-xs truncate text-gray-500" title={Array.isArray(record.grant_pain) ? record.grant_pain.join(', ') : record.grant_pain}>
                     {Array.isArray(record.grant_pain) ? record.grant_pain[0] + (record.grant_pain.length > 1 ? ` 等${record.grant_pain.length}项` : '') : record.grant_pain}
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-800">
                     {record.dev_priority}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;