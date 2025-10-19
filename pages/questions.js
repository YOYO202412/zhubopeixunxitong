// pages/questions.js
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'

// 完整的题库数据
const questionBank = {
  1: [
    {
      id: 1,
      type: 'single',
      question: '直播行业最核心的竞争力是什么？',
      options: [
        '持续学习和适应变化的能力',
        '拥有昂贵的直播设备',
        '固定的直播时间',
        '大量的粉丝基础'
      ],
      answer: 0,
      explanation: '正确。直播行业变化快速，唯一不变的是变化，持续学习和适应能力是最核心的竞争力。'
    },
    {
      id: 2,
      type: 'single',
      question: '以下哪项是优秀主播必备的职业素养？',
      options: [
        '抗压能力和稳定性',
        '每天直播12小时',
        '只关注礼物收入',
        '频繁更换平台'
      ],
      answer: 0,
      explanation: '正确。抗压能力和稳定性是主播长期发展的基础，比单纯的直播时长更重要。'
    }
  ],
  2: [
    {
      id: 3,
      type: 'single',
      question: '平台级别认知指的是什么？',
      options: [
        '了解平台规则和用户特点',
        '知道平台老板的名字',
        '记住平台客服电话',
        '了解平台成立时间'
      ],
      answer: 0,
      explanation: '正确。平台级别认知主要指了解平台规则、用户画像和运营机制。'
    }
  ],
  6: [
    {
      id: 4,
      type: 'single',
      question: '面对直播中的负面评论，正确的做法是？',
      options: [
        '冷静处理，必要时忽略',
        '立即与观众争吵',
        '情绪崩溃下播',
        '删除所有评论'
      ],
      answer: 0,
      explanation: '正确。保持冷静和专业是处理负面评论的最佳方式。'
    }
  ]
}

const moduleNames = {
  1: '直播前综合考试',
  2: '基础素养',
  3: '模块表现力',
  4: '内容与口才',
  5: '粉丝与营收',
  6: '心态与职业观'
}

export default function Questions() {
  const router = useRouter()
  const [userData, setUserData] = useState(null)

  useEffect(() => {
    const savedData = localStorage.getItem('userData')
    if (savedData) {
      setUserData(JSON.parse(savedData))
    } else {
      router.push('/auth/login')
    }
  }, [router])

  if (!userData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">加载中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <Head>
        <title>题目解析 - 九天乐传媒</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet" />
      </Head>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 头部 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">全部题目解析</h1>
              <p className="text-gray-600 mt-1">系统学习各模块知识点</p>
            </div>
            <button
              onClick={() => router.push('/profile')}
              className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
            >
              返回个人中心
            </button>
          </div>
        </div>

        {/* 题目内容 */}
        <div className="space-y-8">
          {Object.entries(questionBank).map(([moduleId, questions]) => (
            <div key={moduleId} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-4">
                <h2 className="text-xl font-bold text-white">
                  {moduleNames[moduleId] || `模块 ${moduleId}`}
                </h2>
              </div>
              
              <div className="p-6 space-y-6">
                {questions.map((question, index) => (
                  <div key={question.id} className="border-l-4 border-blue-500 bg-blue-50 rounded-r-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <span className="text-lg font-semibold text-gray-900">{index + 1}.</span>
                        <span className="text-lg font-medium text-gray-900">{question.question}</span>
                      </div>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {question.type === 'single' ? '单选题' : 
                         question.type === 'multiple' ? '多选题' : '判断题'}
                      </span>
                    </div>
                    
                    <div className="space-y-2 mb-4">
                      {question.options.map((option, i) => {
                        let isCorrect = false
                        if (question.type === 'multiple') {
                          isCorrect = Array.isArray(question.answer) && question.answer.includes(i)
                        } else {
                          isCorrect = question.answer === i
                        }
                        
                        return (
                          <div
                            key={i}
                            className={`flex items-center space-x-3 p-3 rounded-lg ${
                              isCorrect
                                ? 'bg-green-100 border border-green-200'
                                : 'bg-white border border-gray-200'
                            }`}
                          >
                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                              isCorrect
                                ? 'border-green-500 bg-green-500 text-white'
                                : 'border-gray-300'
                            }`}>
                              {isCorrect && <i className="fas fa-check text-xs"></i>}
                            </div>
                            <span className={`text-sm ${
                              isCorrect ? 'text-green-800 font-medium' : 'text-gray-700'
                            }`}>
                              {option}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                    
                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <i className="fas fa-lightbulb text-yellow-500"></i>
                        <span className="font-medium text-gray-900">解析</span>
                      </div>
                      <p className="text-gray-700 text-sm leading-relaxed">{question.explanation}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* 底部导航 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mt-8 text-center">
          <button
            onClick={() => router.push('/')}
            className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors"
          >
            <i className="fas fa-home mr-2"></i>
            返回首页
          </button>
        </div>
      </div>
    </div>
  )
}