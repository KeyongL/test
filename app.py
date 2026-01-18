import streamlit as st
import pandas as pd
from datetime import datetime
import os

# 设置页面配置
st.set_page_config(
    page_title="教学效率调研小助手",
    page_icon="📚",
    layout="centered"
)

# 定义问卷题目
def get_questions():
    return [
        # --- 基础画像 ---
        {
            "id": 'role_focus',
            "text": "1. [基础] 您目前在高校的主要工作重心是？",
            "type": 'single',
            "options": ["教学任务为主", "科研任务为主", "教学科研并重", "行政管理为主"]
        },
        {
            "id": 'ai_freq',
            "text": "2. [习惯] 您平时使用AI工具的频率？",
            "type": 'single',
            "options": ["几乎不用", "偶尔辅助翻译/搜索", "经常使用", "深度依赖，已融入工作流"]
        },

        # --- 教学篇 ---
        {
            "id": 'teaching_pain',
            "text": "3. [教学] 在备课与授课环节，哪些事最耗费时间？（可多选）",
            "type": 'multi',
            "options": [
                "PPT课件制作/美化",
                "查找新颖的教学案例/素材",
                "批改作业/实验报告",
                "出试卷/登分",
                "学生答疑/考勤管理",
                "课程思政元素融入"
            ]
        },
        {
            "id": 'teaching_wish',
            "text": "4. [教学] 如果有AI助手，您最希望它具备哪些功能？（可多选）",
            "type": 'multi',
            "options": [
                "一键生成精美PPT课件",
                "自动批改作业并生成评语",
                "智能生成教案/教学大纲",
                "24小时助教自动答疑",
                "自动出题与智能组卷",
                "课堂互动辅助(签到/提问)",
                "学情分析与成绩预测"
            ]
        },

        # --- 论文写作篇 ---
        {
            "id": 'paper_pain',
            "text": "5. [论文] 在学术论文写作过程中，最大的拦路虎是？（可多选）",
            "type": 'multi',
            "options": [
                "海量文献阅读与整理总结",
                "创新点挖掘/选题困难",
                "英文论文润色/翻译/降重",
                "参考文献格式调整/排版",
                "实验数据处理与图表绘制"
            ]
        },
        {
            "id": 'paper_wish',
            "text": "6. [论文] 您最希望AI智能体提供什么功能？（可多选）",
            "type": 'multi',
            "options": [
                "文献综述自动生成",
                "论文深度润色与降重",
                "根据数据自动生成图表/分析",
                "全文格式一键排版",
                "投稿期刊智能推荐",
                "学术专业翻译",
                "研究热点趋势分析"
            ]
        },

        # --- 课题申报篇 ---
        {
            "id": 'grant_pain',
            "text": "7. [课题] 撰写\"课题申报书\"时，最让您头疼的是？（可多选）",
            "type": 'multi',
            "options": [
                "研究现状/国内外综述撰写",
                "提炼创新点与研究价值",
                "参考文献的收集与填报",
                "繁琐的格式调整与形式审查",
                "根据不同基金要求调整内容"
            ]
        },
        {
            "id": 'grant_wish',
            "text": "8. [课题] 针对申报书，您最需要AI辅助什么？（可多选）",
            "type": 'multi',
            "options": [
                "基于简单的想法生成申报书初稿",
                "针对特定基金要求的逻辑优化建议",
                "自动补全研究背景与参考文献",
                "形式审查与格式自动校对",
                "历年立项课题分析与参考",
                "预算编制辅助"
            ]
        },

        # --- 产品形态与决策 ---
        {
            "id": 'agent_form',
            "text": "9. [形态] 您希望这个工具最好长什么样？",
            "type": 'single',
            "options": [
                "嵌入在Word/WPS里的插件（边写边用）",
                "嵌入在PPT里的插件",
                "网页端平台（功能最全）",
                "微信/手机端助手（随时可用）"
            ]
        },
        {
            "id": 'concern',
            "text": "10. [顾虑] 阻碍您使用AI辅助工作的最大顾虑是？",
            "type": 'single',
            "options": [
                "数据隐私/课题泄密",
                "生成内容胡编乱造（幻觉）",
                "被判定为学术不端",
                "费用太高"
            ]
        },
        {
            "id": 'budget',
            "text": "11. [费用] 如果能切实解决上述痛点，您的付费意愿是？",
            "type": 'single',
            "options": [
                "希望完全免费/使用学校采购版",
                "个人订阅（<30元/月）",
                "个人订阅（30-60元/月）",
                "按单次服务付费"
            ]
        },
        {
            "id": 'dev_priority',
            "text": "12. [关键] 最后，如果一定要排个序，您希望我们优先开发哪个板块？",
            "type": 'single',
            "options": [
                "先做【教学辅助】（PPT/批改等）",
                "先做【论文辅助】（写作/润色等）",
                "先做【课题申报】（本子撰写等）"
            ]
        },
        {
            "id": 'contact_opt',
            "text": "13. [内测] 感谢！内测版即将上线，您是否愿意第一时间体验？",
            "type": 'single',
            "options": [
                "愿意，非常期待",
                "看情况再说",
                "暂时不需要"
            ]
        }
    ]

# 确保数据文件存在
DATA_FILE = "survey_data.csv"
if not os.path.exists(DATA_FILE):
    # 定义包含所有问题ID的列
    columns = ["submit_time"] + [q["id"] for q in get_questions()]
    df = pd.DataFrame(columns=columns)
    df.to_csv(DATA_FILE, index=False, encoding="utf-8-sig")

# 初始化Session State
def init_session_state():
    if "current_question" not in st.session_state:
        st.session_state.current_question = 0
    if "answers" not in st.session_state:
        st.session_state.answers = {}
    if "submitted" not in st.session_state:
        st.session_state.submitted = False

init_session_state()

# 问卷主体
def survey_interface():
    questions = get_questions()
    total_questions = len(questions)
    
    st.title("📚 AI智能体赋能调研")
    
    if st.session_state.submitted:
        st.success("✅ 提交成功，感谢您的填写！")
        if st.button("重新开始"):
            # 重置Session State
            st.session_state.current_question = 0
            st.session_state.answers = {}
            st.session_state.submitted = False
            st.rerun()
    else:
        # 显示当前题目
        current_idx = st.session_state.current_question
        if 0 <= current_idx < total_questions:
            q = questions[current_idx]
            
            # 进度指示
            st.progress((current_idx + 1) / total_questions)
            st.write(f"**问题 {current_idx + 1}/{total_questions}**")
            
            st.write(f"**{q['text']}**")
            
            # 单选或多选题
            if q['type'] == 'single':
                # 单选题
                current_answer = st.session_state.answers.get(q['id'])
                index = q['options'].index(current_answer) if current_answer in q['options'] else None
                answer = st.radio(
                    "请选择",
                    options=q['options'],
                    index=index,
                    key=q['id'],
                    horizontal=False
                )
                st.session_state.answers[q['id']] = answer
            elif q['type'] == 'multi':
                # 多选题
                selected = st.session_state.answers.get(q['id'], [])
                for option in q['options']:
                    if st.checkbox(option, option in selected, key=f"{q['id']}_{option}"):
                        if option not in selected:
                            selected.append(option)
                    elif option in selected:
                        selected.remove(option)
                st.session_state.answers[q['id']] = selected
            
            # 导航按钮
            col1, col2 = st.columns(2)
            
            with col1:
                if current_idx > 0:
                    if st.button("上一题"):
                        st.session_state.current_question -= 1
                        st.rerun()
            
            with col2:
                if current_idx < total_questions - 1:
                    if st.button("下一题"):
                        # 验证当前题是否已回答
                        if q['type'] == 'single' and st.session_state.answers.get(q['id']) is None:
                            st.error("请选择一个答案")
                        else:
                            st.session_state.current_question += 1
                            st.rerun()
                else:
                    # 最后一题，显示提交按钮
                    if st.button("提交", type="primary"):
                        # 验证所有单选题是否已回答
                        missing_answers = []
                        for q in questions:
                            if q['type'] == 'single' and st.session_state.answers.get(q['id']) is None:
                                missing_answers.append(q['text'])
                        
                        if missing_answers:
                            st.error(f"请回答所有问题")
                        else:
                            # 记录当前时间
                            submit_time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
                            
                            # 准备数据记录
                            record = {
                                "submit_time": submit_time
                            }
                            
                            # 添加所有问题的答案
                            for q in questions:
                                if q['type'] == 'single':
                                    record[q['id']] = st.session_state.answers[q['id']]
                                elif q['type'] == 'multi':
                                    # 将多选答案转换为字符串，用分号分隔
                                    record[q['id']] = "; ".join(st.session_state.answers[q['id']])
                            
                            # 保存数据到CSV
                            new_record = pd.DataFrame([record])
                            new_record.to_csv(DATA_FILE, mode="a", header=False, index=False, encoding="utf-8-sig")
                            
                            # 标记为已提交
                            st.session_state.submitted = True
                            st.rerun()

# 主应用逻辑
survey_interface()