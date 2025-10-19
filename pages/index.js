// pages/index.js - 这是主要的首页文件
import { useEffect, useState } from 'react'
import Head from 'next/head'
import { supabase } from '../lib/supabase'

export default function Home() {
  const [user, setUser] = useState(null)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    // 检查用户登录状态
    checkUser()
    
    // 监听认证状态变化
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setUser(session.user)
          setIsLoggedIn(true)
        } else {
          setUser(null)
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
    }
  }

  // 这里只显示基础结构，完整代码需要逐步迁移
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200">
      <Head>
        <title>九天乐传媒</title>
        {/* 原有的CSS样式和JavaScript需要逐步迁移 */}
      </Head>
      
      {/* 导航栏 */}
      <nav className="glass-morphism fixed top-0 left-0 right-0 z-50 px-8 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {/* Logo */}
          <h1 className="text-xl font-bold gradient-text">九天乐传媒</h1>
        </div>
        <div className="flex items-center space-x-4">
          {isLoggedIn ? (
            <button className="px-4 py-2 rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow">
              <i className="fas fa-user mr-2"></i>{user?.email}
            </button>
          ) : (
            <button 
              onClick={() => window.location.href = '/auth/login'}
              className="px-4 py-2 rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow"
            >
              <i className="fas fa-user mr-2"></i>登录
            </button>
          )}
        </div>
      </nav>

      {/* 主要内容 */}
      <main className="pt-24 p-8">
        {isLoggedIn ? (
          <div>
            <h1 className="text-3xl font-bold text-center mb-8">欢迎回来！</h1>
            {/* 这里会显示原有的考试模块等内容 */}
          </div>
        ) : (
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-4">主播培训系统</h1>
            <p className="text-gray-600 mb-8">请先登录系统</p>
            <button 
              onClick={() => window.location.href = '/auth/login'}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:opacity-90 transition-opacity"
            >
              立即登录
            </button>
          </div>
        )}
      </main>
    </div>
  )
}