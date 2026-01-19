import streamlit as st
import pandas as pd
from datetime import datetime
import os
import sqlite3
import json

# 加载配置文件
def load_config():
    """加载问卷配置文件，不存在则返回None"""
    try:
        with open("survey_config.json", "r", encoding="utf-8") as f:
            return json.load(f)
    except FileNotFoundError:
        return None
    except json.JSONDecodeError:
        return None

CONFIG = load_config()

# 设置页面配置
if CONFIG and "app_config" in CONFIG:
    st.set_page_config(
        page_title=CONFIG["app_config"].get("title", "教学效率调研小助手"),
        page_icon=CONFIG["app_config"].get("icon", "📚"),
        layout="centered"
    )
else:
    st.set_page_config(
        page_title="教学效率调研小助手",
        page_icon="📚",
        layout="centered"
    )

# 数据库文件路径
DB_FILE = "survey_data.db"

# 定义问卷题目（默认回退）
BASE_QUESTIONS = [
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

# 读取配置中的问卷题目（优先使用配置文件）
def get_questions():
    if CONFIG and "questions" in CONFIG:
        return CONFIG["questions"]
    return BASE_QUESTIONS

# 初始化数据库
def init_database():
    """初始化SQLite数据库，创建表结构"""
    conn = sqlite3.connect(DB_FILE)
    c = conn.cursor()
    
    # 创建表，使用 JSON 存储答案（更灵活）
    c.execute('''CREATE TABLE IF NOT EXISTS survey_responses
                 (id INTEGER PRIMARY KEY AUTOINCREMENT,
                  submit_time TEXT NOT NULL,
                  answers TEXT NOT NULL,
                  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)''')
    
    conn.commit()
    conn.close()

# 初始化数据库
init_database()

# 初始化Session State
def init_session_state():
    if "current_question" not in st.session_state:
        st.session_state.current_question = 0
    if "answers" not in st.session_state:
        st.session_state.answers = {}
    if "submitted" not in st.session_state:
        st.session_state.submitted = False

init_session_state()

# 保存数据到数据库
def save_to_database(answers, submit_time):
    """将问卷答案保存到SQLite数据库"""
    conn = sqlite3.connect(DB_FILE)
    c = conn.cursor()
    
    # 将答案字典转换为JSON字符串存储
    answers_json = json.dumps(answers, ensure_ascii=False)
    
    c.execute('''INSERT INTO survey_responses (submit_time, answers)
                 VALUES (?, ?)''', (submit_time, answers_json))
    
    conn.commit()
    conn.close()

# 从数据库读取所有数据
def load_from_database():
    """从数据库读取所有问卷数据"""
    conn = sqlite3.connect(DB_FILE)
    c = conn.cursor()
    
    c.execute('''SELECT id, submit_time, answers, created_at 
                 FROM survey_responses 
                 ORDER BY created_at DESC''')
    
    rows = c.fetchall()
    conn.close()
    
    # 转换为DataFrame格式
    data = []
    questions = get_questions()
    question_ids = ["submit_time"] + [q["id"] for q in questions]
    
    for row in rows:
        record = {"id": row[0], "submit_time": row[1], "created_at": row[3]}
        answers = json.loads(row[2])
        record.update(answers)
        data.append(record)
    
    if data:
        df = pd.DataFrame(data)
        return df
    else:
        return pd.DataFrame(columns=question_ids)

# 问卷主体
def survey_interface():
    questions = get_questions()
    total_questions = len(questions)
    
    # 从配置读取标题，如果没有则使用默认值
    app_title = "📚 AI智能体赋能教学调研"
    if CONFIG and 'app_config' in CONFIG and 'title' in CONFIG['app_config']:
        app_title = f"📚 {CONFIG['app_config']['title']}"
    st.title(app_title)
    
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
                            
                            # 准备答案数据（保持原始格式）
                            answers = {}
                            for q in questions:
                                if q['type'] == 'single':
                                    answers[q['id']] = st.session_state.answers[q['id']]
                                elif q['type'] == 'multi':
                                    # 多选题保存为列表
                                    answers[q['id']] = st.session_state.answers[q['id']]
                            
                            # 添加提交时间到答案中
                            answers['submit_time'] = submit_time
                            
                            # 保存到数据库
                            save_to_database(answers, submit_time)
                            
                            # 标记为已提交
                            st.session_state.submitted = True
                            st.rerun()

# 数据查看页面
def data_viewer():
    """数据查看和管理页面"""
    st.title("📊 调研数据查看")
    
    # 密码保护（从配置读取）
    password = st.sidebar.text_input("请输入访问密码", type="password")
    
    # 默认密码
    correct_password = "admin123"
    if CONFIG and 'app_config' in CONFIG and 'password' in CONFIG['app_config']:
        correct_password = CONFIG['app_config']['password']
        
    if password != correct_password:
        st.warning("请输入正确的密码以查看数据")
        return
    
    # 加载数据
    try:
        df = load_from_database()
        
        if df.empty:
            st.info("暂无数据，请等待问卷提交")
            return
        
        # 统计信息
        col1, col2, col3 = st.columns(3)
        with col1:
            st.metric("总提交数", len(df))
        with col2:
            if 'submit_time' in df.columns:
                latest = df['submit_time'].iloc[0] if len(df) > 0 else "无"
                st.metric("最新提交", latest[:10] if isinstance(latest, str) else latest)
        with col3:
            st.metric("数据库文件", DB_FILE)
        
        st.divider()
        
        # 数据表格
        st.subheader("📋 详细数据")
        
        # 导出功能
        col1, col2 = st.columns([1, 4])
        with col1:
            csv = df.to_csv(index=False, encoding="utf-8-sig")
            st.download_button(
                label="📥 导出CSV",
                data=csv,
                file_name=f"survey_data_{datetime.now().strftime('%Y%m%d')}.csv",
                mime="text/csv"
            )
        
        # 显示数据表
        st.dataframe(df, use_container_width=True, height=400)
        
        # 简单的统计分析
        st.divider()
        st.subheader("📈 快速统计")
        
        # 显示单选题的分布
        questions = get_questions()
        single_questions = [q for q in questions if q['type'] == 'single']
        
        for q in single_questions[:3]:  # 只显示前3个单选题的统计
            if q['id'] in df.columns:
                st.write(f"**{q['text']}**")
                counts = df[q['id']].value_counts()
                st.bar_chart(counts)
                st.write("")
        
    except Exception as e:
        st.error(f"加载数据时出错: {str(e)}")
        st.info("如果数据库文件不存在，请先提交一份问卷")

# 主应用逻辑
# 侧边栏导航
page = st.sidebar.selectbox("选择页面", ["📝 填写问卷", "📊 查看数据"])

if page == "📝 填写问卷":
    survey_interface()
else:
    data_viewer()