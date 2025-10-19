// pages/index.js - 修复 Hydration 错误版本
import { useEffect, useState } from 'react'
import Head from 'next/head'
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

export default function Home() {
  const [user, setUser] = useState(null)
  const [userData, setUserData] = useState(null)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [mounted, setMounted] = useState(false) // 新增：跟踪组件是否已挂载
  const router = useRouter()

  useEffect(() => {
    setMounted(true) // 组件已挂载
    checkUser()
    
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setUser(session.user)
          setIsLoggedIn(true)
          await fetchUserData(session.user.id)
        } else {
          setUser(null)
          setUserData(null)
          setIsLoggedIn(false)
        }
      }
    )

    return () => {
      authListener?.subscription.unsubscribe()
    }
  }, [])

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      setUser(user)
      setIsLoggedIn(true)
      await fetchUserData(user.id)
    }
  }

  const fetchUserData = async (userId) => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()

    if (data && !error) {
      setUserData(data)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  const startExam = (moduleId) => {
    router.push(`/exam/${moduleId}`)
  }

  const showUserPanel = () => {
    router.push('/user')
  }

  // 创建模块卡片
  const createModuleCard = (module, index) => {
    return (
      <div 
        key={module.id} 
        className={`
          bento-card glass-morphism rounded-2xl p-4 md:p-6 
          transition-all duration-300 ease-in-out
          hover:transform hover:-translate-y-1 hover:shadow-xl
          ${index === 0 ? 'md:col-span-2 md:row-span-2' : ''}
        `}
      >
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xl md:text-2xl font-bold gradient-text">
            {module.name}
          </h3>
          <i className={`${module.icon} text-xl md:text-2xl text-[#FF3CAC]`}></i>
        </div>
        
        <div className="space-y-1 md:space-y-2 mb-3">
          {module.items.map((item, i) => (
            <div key={i} className="flex items-center space-x-2">
              <i className="fa-solid fa-check text-green-500 text-sm md:text-base"></i>
              <span className="text-gray-700 text-sm md:text-base">{item}</span>
            </div>
          ))}
        </div>
        
        <div className="mt-3 flex items-center justify-between">
          <div className="relative w-12 h-12 md:w-16 md:h-16">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="50%"
                cy="50%"
                r="40%"
                stroke="#e6e6e6"
                strokeWidth="4"
                fill="transparent"
              />
              <circle
                cx="50%"
                cy="50%"
                r="40%"
                stroke={`url(#gradient-${index})`}
                strokeWidth="4"
                fill="transparent"
                strokeDasharray={2 * Math.PI * 40}
                strokeDashoffset={2 * Math.PI * 40 * (1 - module.progress / 100)}
                className="progress-ring"
              />
            </svg>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-xs md:text-sm font-bold">
              {module.progress}%
            </div>
          </div>
          
          <button 
            onClick={() => startExam(module.id)}
            className="px-3 py-1 md:px-4 md:py-2 text-sm md:text-base bg-gradient-to-r from-[#FF3CAC] to-[#784BA0] text-white rounded-lg hover:opacity-90 transition-opacity"
          >
            开始考试
          </button>
        </div>
      </div>
    )
  }

  // 在组件挂载前显示加载状态
  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 p-2 md:p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF3CAC] mx-auto mb-4"></div>
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>
    )
  }

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 p-2 md:p-8 flex items-center justify-center">
        <Head>
          <title>九天乐传媒 - 请登录</title>
          <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet" />
        </Head>
        <div className="text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-4 gradient-text">主播培训系统</h1>
          <p className="text-gray-600 mb-8">请先登录系统</p>
          <button 
            onClick={() => router.push('/auth/login')}
            className="px-6 py-3 bg-gradient-to-r from-[#FF3CAC] to-[#784BA0] text-white rounded-lg hover:opacity-90 transition-opacity"
          >
            立即登录
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 p-2 md:p-8">
      <Head>
        <title>九天乐传媒 - 主播培训系统</title>
        <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet" />
      </Head>
      
      {/* 移动端顶部导航 */}
      <nav className="mobile-nav glass-morphism md:hidden">
        <div className="flex items-center space-x-2">
          <svg width="30" height="30" viewBox="0 0 24 24" className="w-8 h-8">
            <path fill="#FF3CAC" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-5-9h10v2H7z"/>
          </svg>
          <h1 className="text-lg font-bold gradient-text">主播培训</h1>
        </div>
      </nav>

      {/* 桌面端顶部导航 */}
      <nav className="desktop-nav glass-morphism fixed top-0 left-0 right-0 z-50 px-8 py-4 hidden md:flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <svg width="40" height="40" viewBox="0 0 24 24" className="w-10 h-10">
            <path fill="#FF3CAC" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-5-9h10v2H7z"/>
          </svg>
          <h1 className="text-xl font-bold gradient-text">九天乐传媒</h1>
        </div>
        
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => router.push('/user')}
            className="px-4 py-2 rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow"
          >
            <i className="fas fa-user mr-2"></i>{user?.email || '用户'}
          </button>
        </div>
      </nav>

      {/* 主要内容 */}
      <main className="mt-16 md:mt-24">
        <div className="welcome-section text-center mb-8 md:mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-3 md:mb-4 gradient-text">主播培训系统</h2>
          <p className="text-gray-600 text-sm md:text-base">这里将帮助你掌握成为优秀主播所需的各项技能</p>
        </div>

        {/* Bento Grid 布局 */}
        <div id="bento-grid" className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 max-w-6xl mx-auto">
          {examModules.map((module, index) => createModuleCard(module, index))}
        </div>
      </main>

      {/* 移动端底部菜单 */}
      <div className="mobile-menu md:hidden">
        <div className="mobile-menu-btn text-primary" onClick={() => router.push('/')}>
          <i className="fas fa-home text-lg"></i>
          <span>首页</span>
        </div>
        <div className="mobile-menu-btn text-gray-600" onClick={showUserPanel}>
          <i className="fas fa-user text-lg"></i>
          <span>我的</span>
        </div>
        <div className="mobile-menu-btn text-gray-600" onClick={() => alert('分享功能即将开放')}>
          <i className="fas fa-share-alt text-lg"></i>
          <span>分享</span>
        </div>
      </div>

      {/* 底部信息 */}
      <footer className="mt-12 md:mt-16 text-center text-gray-600 text-sm md:text-base">
        <p>© 2025 优游传媒有限公司 | 九天乐传媒有限公司</p>
      </footer>

      {/* SVG 渐变定义 */}
      <svg width="0" height="0">
        <defs>
          <linearGradient id="gradient-0" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#FF3CAC"/>
            <stop offset="50%" stopColor="#784BA0"/>
            <stop offset="100%" stopColor="#2B86C5"/>
          </linearGradient>
          <linearGradient id="gradient-1" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#784BA0"/>
            <stop offset="50%" stopColor="#2B86C5"/>
            <stop offset="100%" stopColor="#FF3CAC"/>
          </linearGradient>
          <linearGradient id="gradient-2" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#2B86C5"/>
            <stop offset="50%" stopColor="#FF3CAC"/>
            <stop offset="100%" stopColor="#784BA0"/>
          </linearGradient>
          <linearGradient id="gradient-3" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#FF3CAC"/>
            <stop offset="100%" stopColor="#2B86C5"/>
          </linearGradient>
          <linearGradient id="gradient-4" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#784BA0"/>
            <stop offset="100%" stopColor="#FF3CAC"/>
          </linearGradient>
          <linearGradient id="gradient-5" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#2B86C5"/>
            <stop offset="100%" stopColor="#784BA0"/>
          </linearGradient>
        </defs>
      </svg>

      <style jsx global>{`
        .glass-morphism {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .gradient-text {
          background: linear-gradient(45deg, #FF3CAC, #784BA0, #2B86C5);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }

        .bento-card {
          transition: all 0.3s ease;
        }

        .bento-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 20px rgba(0,0,0,0.1);
        }

        .progress-ring {
          transition: stroke-dashoffset 0.35s;
        }

        .mobile-menu {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          z-index: 40;
          display: flex;
          justify-content: space-around;
          padding: 10px;
          background: white;
          box-shadow: 0 -2px 10px rgba(0,0,0,0.1);
        }
        
        .mobile-menu-btn {
          display: flex;
          flex-direction: column;
          align-items: center;
          font-size: 12px;
          cursor: pointer;
        }

        .mobile-nav {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 50;
          padding: 12px;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          justify-content: space-between;
          align-items: center;
        }

        @media (max-width: 768px) {
          body {
            padding: 10px;
            padding-bottom: 70px;
          }
          
          .desktop-nav {
            display: none;
          }
          
          #bento-grid {
            grid-template-columns: 1fr;
            gap: 16px;
          }
          
          .bento-card {
            width: 100%;
            padding: 20px;
          }
          
          .bento-card:first-child {
            grid-column: 1;
            grid-row: 1;
          }
          
          main {
            margin-top: 70px;
          }
          
          .welcome-section h2 {
            font-size: 28px;
          }
          
          .welcome-section p {
            font-size: 16px;
          }
        }
        
        @media (min-width: 769px) {
          .mobile-nav, .mobile-menu {
            display: none;
          }
        }
      `}</style>
    </div>
  )
}