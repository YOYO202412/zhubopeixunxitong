// pages/user.js - 修复 Hydration 错误版本
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../lib/supabase'

// 考试模块数据移到组件外部
const examModules = [
  {
    id: 1,
    name: '直播前综合考试',
    icon: 'fa-solid fa-star',
    items: ['随机抽取10道题目', '涵盖所有模块内容', '检验综合能力', '开播前必考'],
    progress: 100,
    isComprehensive: true
  },
  {
    id: 2,
    name: '基础素养',
    icon: 'fa-solid fa-gem',
    items: ['平台规则认知', '法律法规意识', '职业道德规范', '网络安全知识'],
    progress: 75
  },
  {
    id: 3,
    name: '镜头表现力',
    icon: 'fa-solid fa-video',
    items: ['表情管理', '肢体语言', '镜头感训练', '形象塑造'],
    progress: 60
  },
  {
    id: 4,
    name: '内容与口才',
    icon: 'fa-solid fa-comments',
    items: ['话题策划', '互动技巧', '语言表达', '应变能力'],
    progress: 45
  },
  {
    id: 5,
    name: '粉丝与营收',
    icon: 'fa-solid fa-coins',
    items: ['粉丝维护', '营收技巧', '数据分析', '商业合作'],
    progress: 30
  },
  {
    id: 6,
    name: '心态与职业观',
    icon: 'fa-solid fa-heart',
    items: ['抗压能力', '直播时长稳定性', '学习意愿', '职业规划'],
    progress: 15
  }
]

export default function UserPanel() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [userData, setUserData] = useState(null)
  const [examRecords, setExamRecords] = useState([])
  const [examCalendar, setExamCalendar] = useState({})
  const [mounted, setMounted] = useState(false) // 新增：跟踪组件是否已挂载

  useEffect(() => {
    setMounted(true)
    checkUser()
  }, [])

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/auth/login')
      return
    }
    setUser(user)
    loadUserData(user.id)
    loadExamRecords(user.id)
    loadExamCalendar(user.id)
  }

  const loadUserData = async (userId) => {
    const { data } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()
    setUserData(data)
  }

  const loadExamRecords = async (userId) => {
    const { data } = await supabase
      .from('exam_records')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    setExamRecords(data || [])
  }

  const loadExamCalendar = async (userId) => {
    const { data } = await supabase
      .from('exam_calendar')
      .select('date')
      .eq('user_id', userId)
    
    const calendar = {}
    data?.forEach(item => {
      calendar[item.date] = true
    })
    setExamCalendar(calendar)
  }

  const logout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  // 在组件挂载前显示加载状态
  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF3CAC] mx-auto mb-4"></div>
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF3CAC] mx-auto mb-4"></div>
          <p className="text-gray-600">加载用户信息...</p>
        </div>
      </div>
    )
  }

  // 生成考试日历
  const generateCalendar = () => {
    const today = new Date()
    const year = today.getFullYear()
    const month = today.getMonth()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    
    let calendarHTML = []
    
    for (let i = 1; i <= daysInMonth; i++) {
      const dateStr = `${year}-${month + 1}-${i}`
      const isChecked = examCalendar[dateStr]
      const isToday = i === today.getDate()
      
      calendarHTML.push(
        <div
          key={i}
          className={`calendar-day ${isChecked ? 'checked' : ''} ${
            isToday ? 'font-bold border-2 border-blue-500' : ''
          }`}
        >
          {i}
        </div>
      )
    }
    
    return calendarHTML
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto">
        {/* 用户信息卡片 */}
        <div className="user-card p-6 mb-6">
          <div className="flex items-center">
            <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center mr-4">
              <i className="fas fa-user text-2xl text-[#FF3CAC]"></i>
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{user.email}</h2>
              <p className="text-white opacity-80">
                {userData?.real_name || '未设置真实姓名'} | {userData?.phone || '未设置手机号'}
              </p>
            </div>
          </div>
        </div>

        {/* 考试打卡日历 */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h3 className="text-lg font-bold mb-4">本月考试打卡</h3>
          <div className="grid grid-cols-7 gap-2">
            {generateCalendar()}
          </div>
          <div className="mt-4 text-center text-gray-600">
            已打卡 {Object.keys(examCalendar).length} 天
          </div>
        </div>

        {/* 考试记录 */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-bold mb-4">考试记录</h3>
          <div className="space-y-4">
            {examRecords.length > 0 ? (
              examRecords.map(record => {
                const module = examModules.find(m => m.id === record.module_id)
                return (
                  <div key={record.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium">{module?.name || '未知模块'}</div>
                      <div className="text-sm text-gray-500">
                        {new Date(record.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    <div className={`text-lg font-bold ${
                      record.score >= 60 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {record.score}分
                    </div>
                  </div>
                )
              })
            ) : (
              <p className="text-gray-500 text-center">暂无考试记录</p>
            )}
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="mt-6 text-center">
          <button
            onClick={() => router.push('/')}
            className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors mr-4"
          >
            返回首页
          </button>
          <button
            onClick={logout}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            <i className="fas fa-sign-out-alt mr-2"></i>退出登录
          </button>
        </div>
      </div>

      <style jsx global>{`
        .user-card {
          background: linear-gradient(135deg, #FF3CAC, #784BA0);
          color: white;
          border-radius: 16px;
          overflow: hidden;
        }

        .calendar-day {
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          margin: 4px;
          cursor: pointer;
          border: 1px solid #e5e7eb;
        }

        .calendar-day.checked {
          background: linear-gradient(45deg, #FF3CAC, #784BA0);
          color: white;
        }
      `}</style>
    </div>
  )
}