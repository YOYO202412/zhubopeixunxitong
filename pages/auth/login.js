// pages/auth/login.js
import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useRouter } from 'next/router'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [realName, setRealName] = useState('')
  const [phone, setPhone] = useState('')
  const [idCard, setIdCard] = useState('')
  const [inviteCode, setInviteCode] = useState('')
  const [isLoginMode, setIsLoginMode] = useState(true)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const toggleMode = () => {
    setIsLoginMode(!isLoginMode)
    // 清空表单
    setEmail('')
    setPassword('')
    setRealName('')
    setPhone('')
    setIdCard('')
    setInviteCode('')
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      // 使用Supabase进行登录
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        throw error
      }

      if (data.user) {
        // 登录成功，跳转到首页
        alert('登录成功！')
        router.push('/')
      }
    } catch (error) {
      console.error('登录错误:', error)
      alert('登录失败: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    setLoading(true)

    // 基础验证
    if (!email || !password || !realName || !phone || !idCard || !inviteCode) {
      alert('请填写所有信息')
      setLoading(false)
      return
    }

    // 验证手机号格式
    const phoneRegex = /^1[3-9]\d{9}$/
    if (!phoneRegex.test(phone)) {
      alert('请输入正确的手机号码')
      setLoading(false)
      return
    }

    // 验证身份证格式
    const idCardRegex = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/
    if (!idCardRegex.test(idCard)) {
      alert('请输入正确的身份证号码')
      setLoading(false)
      return
    }

    try {
      // 直接调用API注册
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          realName,
          phone,
          idCard,
          inviteCode
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || '注册失败')
      }

      alert('注册成功！请使用刚才注册的账号登录')
      setIsLoginMode(true)
      // 清空表单
      setEmail('')
      setPassword('')
      setRealName('')
      setPhone('')
      setIdCard('')
      setInviteCode('')

    } catch (error) {
      console.error('注册错误:', error)
      alert('注册失败: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-lg">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            {isLoginMode ? '登录主播培训系统' : '注册新账号'}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {isLoginMode ? '请输入账号信息登录' : '请填写完整信息注册'}
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={isLoginMode ? handleLogin : handleRegister}>
          <div className="space-y-4">
            {/* 邮箱/用户名 */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                邮箱地址
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="mt-1 appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="请输入邮箱地址"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            {/* 密码 */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                密码
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="mt-1 appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="请输入密码"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {/* 注册时才显示的字段 */}
            {!isLoginMode && (
              <>
                {/* 真实姓名 */}
                <div>
                  <label htmlFor="realName" className="block text-sm font-medium text-gray-700">
                    真实姓名
                  </label>
                  <input
                    id="realName"
                    name="realName"
                    type="text"
                    required
                    className="mt-1 appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                    placeholder="请输入真实姓名"
                    value={realName}
                    onChange={(e) => setRealName(e.target.value)}
                  />
                </div>

                {/* 手机号码 */}
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                    手机号码
                  </label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    required
                    className="mt-1 appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                    placeholder="请输入手机号码"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>

                {/* 身份证号 */}
                <div>
                  <label htmlFor="idCard" className="block text-sm font-medium text-gray-700">
                    身份证号
                  </label>
                  <input
                    id="idCard"
                    name="idCard"
                    type="text"
                    required
                    className="mt-1 appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                    placeholder="请输入身份证号码"
                    value={idCard}
                    onChange={(e) => setIdCard(e.target.value)}
                  />
                </div>

                {/* 邀请码 */}
                <div>
                  <label htmlFor="inviteCode" className="block text-sm font-medium text-gray-700">
                    邀请码
                  </label>
                  <input
                    id="inviteCode"
                    name="inviteCode"
                    type="password"
                    required
                    className="mt-1 appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                    placeholder="请输入邀请码"
                    value={inviteCode}
                    onChange={(e) => setInviteCode(e.target.value)}
                  />
                </div>

                {/* 推荐激励计划 */}
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <h4 className="text-amber-800 font-bold text-sm mb-2">
                    <i className="fas fa-gift mr-2"></i>推荐激励计划
                  </h4>
                  <p className="text-amber-700 text-xs">
                    每推荐一个新主播完成有效开播时长任务就能获得丰富是现金介绍费，也可以选择成为该主播的经纪人，永久获得该主播流水的奖励分成。联系方式：15581688480
                  </p>
                </div>
              </>
            )}
          </div>

          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={toggleMode}
              className="text-sm text-indigo-600 hover:text-indigo-500"
            >
              {isLoginMode ? '切换到注册' : '切换到登录'}
            </button>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {loading ? '处理中...' : (isLoginMode ? '登录' : '注册')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}