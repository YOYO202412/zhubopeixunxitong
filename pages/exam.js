// pages/exam.js
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'

// 题库数据
const questionBank = {
  1: [ // 综合考试题目
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
    },
    {
      id: 3,
      type: 'multiple',
      question: '直播前需要做哪些准备工作？',
      options: [
        '设备检查和测试',
        '内容策划和流程安排',
        '妆容和形象整理',
        '了解当天热点话题'
      ],
      answer: [0, 1, 2, 3],
      explanation: '全部正确。充分的准备工作是成功直播的基础，包括设备、内容、形象和热点了解。'
    },
    {
      id: 4,
      type: 'judgment',
      question: '主播只需要关注直播时的表现，直播后的数据分析不重要。',
      options: ['正确', '错误'],
      answer: 1,
      explanation: '错误。直播后的数据分析同样重要，可以帮助优化直播内容和提升效果。'
    },
    {
      id: 5,
      type: 'single',
      question: '与粉丝互动时，最重要的是什么？',
      options: [
        '真诚和尊重',
        '催促粉丝送礼物',
        '只回复大额礼物粉丝',
        '保持高冷形象'
      ],
      answer: 0,
      explanation: '正确。真诚和尊重是建立长期粉丝关系的基础。'
    }
  ],
  2: [ // 基础素养模块题目
    {
      id: 6,
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
    },
    {
      id: 7,
      type: 'judgment',
      question: '基础设备使用包括声卡、摄像头、灯光等设备的正确使用方法。',
      options: ['正确', '错误'],
      answer: 0,
      explanation: '正确。熟悉基础设备的使用是主播的基本功。'
    }
  ],
  6: [ // 心态与职业观模块题目
    {
      id: 8,
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
    },
    {
      id: 9,
      type: 'multiple',
      question: '职业规划应该包括哪些方面？',
      options: [
        '短期目标设定',
        '技能提升计划',
        '收入预期管理',
        '职业发展路径'
      ],
      answer: [0, 1, 2, 3],
      explanation: '全部正确。完整的职业规划应该涵盖目标、技能、收入和路径等多个方面。'
    },
    {
      id: 10,
      type: 'judgment',
      question: '学习意愿是主播持续成长的关键因素。',
      options: ['正确', '错误'],
      answer: 0,
      explanation: '正确。直播行业变化快速，持续学习是保持竞争力的必要条件。'
    }
  ]
}

export default function Exam() {
  const router = useRouter()
  const { module } = router.query
  const [examState, setExamState] = useState(null)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [userAnswers, setUserAnswers] = useState({})
  const [timeLeft, setTimeLeft] = useState(600) // 10分钟
  const [isFinished, setIsFinished] = useState(false)
  const [score, setScore] = useState(0)

  const moduleNames = {
    1: '直播前综合考试',
    2: '基础素养',
    3: '模块表现力', 
    4: '内容与口才',
    5: '粉丝与营收',
    6: '心态与职业观'
  }

  useEffect(() => {
    if (module) {
      initializeExam()
    }
  }, [module])

  useEffect(() => {
    if (examState && timeLeft > 0 && !isFinished) {
      const timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1)
      }, 1000)
      return () => clearTimeout(timer)
    } else if (timeLeft === 0 && !isFinished) {
      finishExam()
    }
  }, [timeLeft, isFinished])

  const initializeExam = () => {
    const moduleId = parseInt(module)
    const questions = generateQuestions(moduleId)
    setExamState({
      moduleId,
      questions,
      startTime: new Date().toISOString()
    })
    setTimeLeft(moduleId === 1 ? 600 : 600) // 综合考试10分钟，其他10分钟
  }

  const generateQuestions = (moduleId) => {
    const questions = questionBank[moduleId] || []
    return questions.sort(() => Math.random() - 0.5).slice(0, 5) // 每次5题
  }

  const handleAnswerSelect = (answerIndex) => {
    const currentQ = examState.questions[currentQuestion]
    
    if (currentQ.type === 'multiple') {
      const currentAnswers = userAnswers[currentQuestion] || []
      const newAnswers = currentAnswers.includes(answerIndex)
        ? currentAnswers.filter(a => a !== answerIndex)
        : [...currentAnswers, answerIndex]
      setUserAnswers({ ...userAnswers, [currentQuestion]: newAnswers })
    } else {
      setUserAnswers({ ...userAnswers, [currentQuestion]: answerIndex })
    }
  }

  const nextQuestion = () => {
    if (currentQuestion < examState.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    } else {
      finishExam()
    }
  }

  const prevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1)
    }
  }

  const finishExam = () => {
    const calculatedScore = calculateScore()
    setScore(calculatedScore)
    setIsFinished(true)
    
    // 保存考试记录
    const userData = JSON.parse(localStorage.getItem('userData') || '{}')
    const examRecords = userData.examRecords || []
    examRecords.push({
      moduleId: examState.moduleId,
      score: calculatedScore,
      date: new Date().toISOString(),
      totalQuestions: examState.questions.length
    })
    userData.examRecords = examRecords
    
    // 更新打卡记录
    const today = new Date().toISOString().split('T')[0]
    userData.examCalendar = userData.examCalendar || {}
    userData.examCalendar[today] = true
    
    localStorage.setItem('userData', JSON.stringify(userData))
  }

  const calculateScore = () => {
    let correct = 0
    examState.questions.forEach((question, index) => {
      const userAnswer = userAnswers[index]
      const correctAnswer = question.answer
      
      if (question.type === 'multiple') {
        if (Array.isArray(userAnswer) && Array.isArray(correctAnswer)) {
          const userSorted = [...userAnswer].sort().toString()
          const correctSorted = [...correctAnswer].sort().toString()
          if (userSorted === correctSorted) correct++
        }
      } else {
        if (userAnswer === correctAnswer) correct++
      }
    })
    
    return Math.round((correct / examState.questions.length) * 100)
  }

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`
  }

  if (!examState) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">加载考试题目...</p>
        </div>
      </div>
    )
  }

  if (isFinished) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <Head>
          <title>考试结果 - 九天乐传媒</title>
          <script src="https://cdn.tailwindcss.com"></script>
          <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet" />
        </Head>
        
        <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-6 md:p-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">考试完成！</h1>
            <p className="text-gray-600 mb-8">{moduleNames[examState.moduleId]}</p>
            
            <div className="relative w-48 h-48 mx-auto mb-8">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className={`text-5xl font-bold ${
                    score >= 60 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {score}
                  </div>
                  <div className="text-gray-500">分</div>
                </div>
              </div>
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="50%"
                  cy="50%"
                  r="45%"
                  stroke="#f3f4f6"
                  strokeWidth="8"
                  fill="transparent"
                />
                <circle
                  cx="50%"
                  cy="50%"
                  r="45%"
                  stroke={score >= 60 ? "#10b981" : "#ef4444"}
                  strokeWidth="8"
                  fill="transparent"
                  strokeDasharray={`${2 * Math.PI * 45} ${2 * Math.PI * 45}`}
                  strokeDashoffset={2 * Math.PI * 45 * (1 - score / 100)}
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
            </div>
            
            <div className="mb-8">
              <p className={`text-xl font-semibold ${
                score >= 60 ? 'text-green-600' : 'text-red-600'
              }`}>
                {score >= 60 ? '🎉 恭喜通过考试！' : '💪 继续加油，下次会更好！'}
              </p>
              <p className="text-gray-600 mt-2">
                答对题目：{Math.round(score * examState.questions.length / 100)} / {examState.questions.length}
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => router.push('/')}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                返回首页
              </button>
              <button
                onClick={() => router.push('/profile')}
                className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                个人中心
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const currentQ = examState.questions[currentQuestion]
  const userAnswer = userAnswers[currentQuestion]

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <Head>
        <title>考试中 - 九天乐传媒</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet" />
      </Head>
      
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-6 md:p-8">
        {/* 考试头部信息 */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {moduleNames[examState.moduleId]}
            </h1>
            <p className="text-gray-600 mt-1">
              第 {currentQuestion + 1} 题 / 共 {examState.questions.length} 题
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-2xl font-mono font-bold text-red-600 bg-red-50 px-4 py-2 rounded-lg">
              {formatTime(timeLeft)}
            </div>
          </div>
        </div>

        {/* 题目内容 */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
              {currentQ.type === 'single' ? '单选题' : 
               currentQ.type === 'multiple' ? '多选题' : '判断题'}
            </span>
          </div>
          
          <h2 className="text-xl font-semibold text-gray-900 mb-6 leading-relaxed">
            {currentQ.question}
          </h2>

          {/* 选项 */}
          <div className="space-y-3">
            {currentQ.options.map((option, index) => {
              const isSelected = currentQ.type === 'multiple' 
                ? userAnswer?.includes(index)
                : userAnswer === index
                
              return (
                <div
                  key={index}
                  onClick={() => handleAnswerSelect(index)}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                      isSelected 
                        ? 'border-blue-500 bg-blue-500 text-white' 
                        : 'border-gray-300'
                    }`}>
                      {isSelected && <i className="fas fa-check text-xs"></i>}
                    </div>
                    <span className="text-gray-900">{option}</span>
                  </div>
                </div>
              )
            })}
          </div>

          {currentQ.type === 'multiple' && (
            <p className="text-sm text-gray-500 mt-4 flex items-center gap-2">
              <i className="fas fa-info-circle"></i>
              多选题，请选择所有正确选项
            </p>
          )}
        </div>

        {/* 导航按钮 */}
        <div className="flex justify-between items-center pt-6 border-t border-gray-200">
          <button
            onClick={prevQuestion}
            disabled={currentQuestion === 0}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              currentQuestion === 0
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-gray-600 text-white hover:bg-gray-700'
            }`}
          >
            上一题
          </button>
          
          <button
            onClick={nextQuestion}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            {currentQuestion === examState.questions.length - 1 ? '提交答案' : '下一题'}
          </button>
        </div>
      </div>
    </div>
  )
}