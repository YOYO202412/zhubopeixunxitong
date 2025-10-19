// pages/exam/result.js - 修复版本
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import Head from 'next/head'
import { examModules } from '../../data/examData'

export default function ExamResult() {
  const router = useRouter()
  const { moduleId, score, totalQuestions, correctAnswers } = router.query
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>
    )
  }

  if (!moduleId || !score) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl text-red-600 mb-4">无效的考试结果</h1>
          <button 
            onClick={() => router.push('/')}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            返回首页
          </button>
        </div>
      </div>
    )
  }

  const module = examModules.find(m => m.id === parseInt(moduleId))
  const numericScore = parseInt(score)
  const isPassed = numericScore >= 60

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center py-8 px-4">
      <Head>
        <title>考试结果 - 九天乐传媒</title>
      </Head>
      
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-6 md:p-8 text-center">
        {/* 结果图标 */}
        <div className="w-24 h-24 mx-auto mb-6 rounded-full flex items-center justify-center bg-gradient-to-br from-green-100 to-blue-100">
          {isPassed ? (
            <i className="fas fa-trophy text-4xl text-yellow-500"></i>
          ) : (
            <i className="fas fa-redo text-4xl text-blue-500"></i>
          )}
        </div>

        <h1 className="text-2xl md:text-3xl font-bold mb-2">
          {isPassed ? '恭喜通过考试！🎉' : '继续努力，下次会更好！💪'}
        </h1>
        
        <p className="text-gray-600 mb-8">{module?.name}</p>

        {/* 分数环 */}
        <div className="relative w-48 h-48 mx-auto mb-8">
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="50%"
              cy="50%"
              r="45%"
              stroke="#e5e7eb"
              strokeWidth="8"
              fill="transparent"
            />
            <circle
              cx="50%"
              cy="50%"
              r="45%"
              stroke={isPassed ? "#10b981" : "#ef4444"}
              strokeWidth="8"
              fill="transparent"
              strokeDasharray={2 * Math.PI * 45}
              strokeDashoffset={2 * Math.PI * 45 * (1 - numericScore / 100)}
              className="transition-all duration-1000 ease-out"
            />
          </svg>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
            <div className={`text-4xl md:text-5xl font-bold ${isPassed ? 'text-green-600' : 'text-red-600'}`}>
              {numericScore}
            </div>
            <div className="text-gray-500 text-lg">分</div>
          </div>
        </div>

        {/* 详细统计 */}
        <div className="grid grid-cols-2 gap-4 mb-8 max-w-xs mx-auto">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-blue-600">{correctAnswers || Math.round((numericScore / 100) * (totalQuestions || 10))}</div>
            <div className="text-sm text-blue-500">答对题数</div>
          </div>
          <div className="bg-green-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-green-600">{totalQuestions || (moduleId == 1 ? 10 : 30)}</div>
            <div className="text-sm text-green-500">总题数</div>
          </div>
        </div>

        {/* 提示信息 */}
        <div className={`rounded-lg p-4 mb-8 ${
          isPassed ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-200'
        }`}>
          <p className={`text-sm ${isPassed ? 'text-green-700' : 'text-yellow-700'}`}>
            <i className={`fas ${isPassed ? 'fa-check-circle' : 'fa-exclamation-triangle'} mr-2`}></i>
            {isPassed 
              ? '您已成功通过本次考试，可以继续学习其他模块。' 
              : '距离及格只差一点，建议复习相关知识后再次尝试。'
            }
          </p>
        </div>

        {/* 操作按钮 */}
        <div className="flex flex-col md:flex-row justify-center space-y-3 md:space-y-0 md:space-x-4">
          <button
            onClick={() => router.push('/')}
            className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors flex items-center justify-center"
          >
            <i className="fas fa-home mr-2"></i>
            返回首页
          </button>
          
          <button
            onClick={() => router.push('/user')}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center"
          >
            <i className="fas fa-user mr-2"></i>
            个人中心
          </button>
          
          {!isPassed && (
            <button
              onClick={() => router.push(`/exam/${moduleId}`)}
              className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center"
            >
              <i className="fas fa-redo mr-2"></i>
              重新考试
            </button>
          )}
        </div>
      </div>
    </div>
  )
}