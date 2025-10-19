// pages/exam/[moduleId].js - 修复版本
import { useRouter } from 'next/router'
import { useState, useEffect } from 'react'
import Head from 'next/head'
import { supabase } from '../../lib/supabase'
import { questionBank, examModules, getQuestionsByModule, getAllQuestions } from '../../data/examData'

export default function ExamPage() {
  const router = useRouter()
  const { moduleId } = router.query
  const [questions, setQuestions] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState({})
  const [timeLeft, setTimeLeft] = useState(600) // 10分钟
  const [examStarted, setExamStarted] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [module, setModule] = useState(null)

  // 初始化页面
  useEffect(() => {
    if (moduleId) {
      const foundModule = examModules.find(m => m.id === parseInt(moduleId))
      setModule(foundModule)
      setIsLoading(false)
    }
  }, [moduleId])

  // 格式化时间显示
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`
  }

  // 生成随机题目
  const generateQuestions = (id) => {
  console.log('生成题目，模块ID:', id)
  
  let questions = []
  const moduleId = parseInt(id)
  
  if (moduleId === 1) {
    // 综合考试：从所有题库中随机选择10题
    questions = getAllQuestions()
    console.log('所有题目数量:', questions.length)
    
    if (questions.length === 0) {
      console.error('题库为空，无法生成题目')
      return []
    }
    
    // 随机排序并选择前10题
    questions = questions
      .sort(() => Math.random() - 0.5)
      .slice(0, 10)
    
    console.log('综合考试题目数量:', questions.length)
  } else {
    // 普通模块考试
    questions = getQuestionsByModule(moduleId)
    console.log(`模块${moduleId}原始题目数量:`, questions.length)
    
    if (questions.length === 0) {
      console.error(`模块${moduleId}没有题目`)
      return []
    }
    
    // 随机排序并选择题目（最多30题）
    const count = Math.min(questions.length, 30)
    questions = questions
      .sort(() => Math.random() - 0.5)
      .slice(0, count)
    
    console.log(`模块${moduleId}考试题目数量:`, questions.length)
  }
  
  return questions
  }

  // 开始考试
  const startExam = () => {
    console.log('开始考试，模块:', moduleId)
    
    if (!moduleId) {
      alert('无效的考试模块')
      return
    }

    const generatedQuestions = generateQuestions(moduleId)
    
    if (generatedQuestions.length === 0) {
      alert('该模块暂无题目，请联系管理员')
      return
    }

    setQuestions(generatedQuestions)
    setExamStarted(true)
    setTimeLeft(600)
    setCurrentIndex(0)
    setAnswers({})
  }

  // 选择答案
  const selectAnswer = (optionIndex) => {
    const newAnswers = { ...answers }
    const question = questions[currentIndex]
    
    if (question.type === 'multiple') {
      // 多选题逻辑
      if (!newAnswers[currentIndex]) {
        newAnswers[currentIndex] = []
      }
      const currentAnswers = newAnswers[currentIndex]
      const index = currentAnswers.indexOf(optionIndex)
      
      if (index > -1) {
        currentAnswers.splice(index, 1)
      } else {
        currentAnswers.push(optionIndex)
      }
    } else {
      // 单选题或判断题
      newAnswers[currentIndex] = optionIndex
    }
    
    setAnswers(newAnswers)
  }

  // 下一题
  const nextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1)
    } else {
      finishExam()
    }
  }

  // 上一题
  const prevQuestion = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
    }
  }

  // 计算分数
  const calculateScore = () => {
    let correct = 0
    
    Object.entries(answers).forEach(([index, userAnswer]) => {
      const questionIndex = parseInt(index)
      const question = questions[questionIndex]
      const correctAnswer = question.answer
      
      if (question.type === 'multiple') {
        if (Array.isArray(userAnswer) && Array.isArray(correctAnswer)) {
          const userSorted = [...userAnswer].sort().toString()
          const correctSorted = [...correctAnswer].sort().toString()
          if (userSorted === correctSorted) {
            correct++
          }
        }
      } else {
        if (userAnswer === correctAnswer) {
          correct++
        }
      }
    })
    
    return Math.round((correct / questions.length) * 100)
  }

// 完成考试 - 添加调试版本
const finishExam = async () => {
  const score = calculateScore()
  const { data: { user } } = await supabase.auth.getUser()
  
  console.log('考试完成，开始保存数据...')
  console.log('用户ID:', user?.id)
  console.log('模块ID:', moduleId)
  console.log('分数:', score)
  
  if (user) {
    try {
      // 1. 保存考试记录
      const { data: recordData, error: recordError } = await supabase
        .from('exam_records')
        .insert([
          {
            user_id: user.id,
            module_id: parseInt(moduleId),
            score: score,
            answers: answers,
            time_used: 600 - timeLeft
          }
        ])
        .select() // 添加这个来获取返回的数据

      if (recordError) {
        console.error('保存考试记录失败:', recordError)
      } else {
        console.log('考试记录保存成功:', recordData)
      }

      // 2. 保存考试打卡
      const today = new Date()
      const dateStr = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`
      
      const { data: calendarData, error: calendarError } = await supabase
        .from('exam_calendar')
        .insert([
          {
            user_id: user.id,
            date: dateStr
          }
        ])
        .select()

      if (calendarError) {
        console.error('保存考试日历失败:', calendarError)
      } else {
        console.log('考试日历保存成功:', calendarData)
      }

    } catch (error) {
      console.error('保存考试数据时出错:', error)
    }
  }

  // 3. 跳转到结果页面
  router.push(`/exam/result?moduleId=${moduleId}&score=${score}`)
}

  // 计时器效果
  useEffect(() => {
    if (!examStarted || timeLeft <= 0) return

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          finishExam()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [examStarted, timeLeft])

  // 加载状态
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">加载考试内容...</p>
        </div>
      </div>
    )
  }

  if (!module) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">考试模块不存在</h1>
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

  // 考试开始前的准备页面
  if (!examStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
        <Head>
          <title>{module.name} - 九天乐传媒</title>
        </Head>
        
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <i className={`${module.icon} text-3xl text-blue-600`}></i>
          </div>
          
          <h1 className="text-2xl font-bold text-gray-800 mb-4">{module.name}</h1>
          
          <div className="bg-blue-50 rounded-lg p-4 mb-6 text-left">
            <h3 className="font-semibold text-blue-800 mb-2">考试信息：</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• 题目数量: {module.id === 1 ? '10题' : '最多30题'}</li>
              <li>• 考试时间: 10分钟</li>
              <li>• 及格分数: 60分</li>
              <li>• 题目类型: 单选/多选/判断</li>
            </ul>
          </div>
          
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-6">
            <p className="text-sm text-yellow-800">
              <i className="fas fa-exclamation-circle mr-2"></i>
              请确保网络连接稳定，考试开始后不能暂停
            </p>
          </div>
          
          <button
            onClick={startExam}
            className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:opacity-90 transition-opacity font-semibold text-lg"
          >
            <i className="fas fa-play mr-2"></i>
            开始考试
          </button>
          
          <button
            onClick={() => router.push('/')}
            className="w-full py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors mt-3"
          >
            返回首页
          </button>
        </div>
      </div>
    )
  }

  // 考试进行中
  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">正在加载题目...</p>
        </div>
      </div>
    )
  }

  const question = questions[currentIndex]
  const isLastQuestion = currentIndex === questions.length - 1
  const progress = ((currentIndex + 1) / questions.length) * 100

  return (
    <div className="min-h-screen bg-gray-50 py-4">
      <Head>
        <title>考试中 - {module.name}</title>
      </Head>
      
      {/* 顶部进度条 */}
      <div className="max-w-4xl mx-auto mb-4 px-4">
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <div className="flex justify-between items-center mb-2">
            <h1 className="text-lg font-bold text-gray-800">{module.name}</h1>
            <div className="text-lg font-mono bg-red-100 text-red-600 px-3 py-1 rounded">
              <i className="fas fa-clock mr-2"></i>
              {formatTime(timeLeft)}
            </div>
          </div>
          
          {/* 进度条 */}
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          
          <div className="flex justify-between text-sm text-gray-600 mt-1">
            <span>第 {currentIndex + 1} 题 / 共 {questions.length} 题</span>
            <span>{Math.round(progress)}%</span>
          </div>
        </div>
      </div>

      {/* 考试内容 */}
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-6">
        {/* 题目类型标签 */}
        <div className="mb-4">
          <span className="inline-block px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-sm font-medium">
            {question.type === 'single' ? '单选题' : 
             question.type === 'multiple' ? '多选题' : '判断题'}
          </span>
          {question.type === 'multiple' && (
            <span className="ml-2 text-sm text-gray-500">
              <i className="fas fa-info-circle mr-1"></i>可多选
            </span>
          )}
        </div>

        {/* 题目内容 */}
        <div className="text-lg font-medium text-gray-800 mb-6 leading-relaxed">
          {currentIndex + 1}. {question.question}
        </div>
        
        {/* 选项 */}
        <div className="space-y-3 mb-8">
          {question.options.map((option, i) => {
            let isSelected = false
            if (question.type === 'multiple') {
              isSelected = answers[currentIndex] && answers[currentIndex].includes(i)
            } else {
              isSelected = answers[currentIndex] === i
            }
            
            return (
              <div
                key={i}
                className={`flex items-start space-x-3 p-4 rounded-lg cursor-pointer border-2 transition-all ${
                  isSelected 
                    ? 'border-blue-500 bg-blue-50 shadow-sm' 
                    : 'border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                }`}
                onClick={() => selectAnswer(i)}
              >
                <div className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center mt-1 ${
                  isSelected 
                    ? 'border-blue-500 bg-blue-500 text-white' 
                    : 'border-gray-300'
                }`}>
                  {isSelected && <i className="fas fa-check text-xs"></i>}
                </div>
                <span className="text-gray-700 flex-1">{option}</span>
              </div>
            )
          })}
        </div>

        {/* 导航按钮 */}
        <div className="flex justify-between pt-4 border-t border-gray-200">
          <button
            onClick={prevQuestion}
            disabled={currentIndex === 0}
            className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            <i className="fas fa-arrow-left mr-2"></i>
            上一题
          </button>
          
          <button
            onClick={nextQuestion}
            className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:opacity-90 transition-opacity flex items-center"
          >
            {isLastQuestion ? (
              <>
                <i className="fas fa-flag-checkered mr-2"></i>
                提交答案
              </>
            ) : (
              <>
                下一题
                <i className="fas fa-arrow-right ml-2"></i>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}