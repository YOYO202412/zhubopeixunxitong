// pages/profile.js
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../lib/supabase'
import Head from 'next/head'

export default function Profile() {
  const router = useRouter()
  const [userData, setUserData] = useState(null)
  const [activeTab, setActiveTab] = useState('profile')

  useEffect(() => {
    loadUserData()
  }, [])

  const loadUserData = () => {
    const savedData = localStorage.getItem('userData')
    if (savedData) {
      setUserData(JSON.parse(savedData))
    } else {
      router.push('/auth/login')
    }
  }

  const logout = async () => {
    if (confirm('确定要退出登录吗？')) {
      await supabase.auth.signOut()
      localStorage.removeItem('userData')
      sessionStorage.removeItem('examState')
      router.push('/auth/login')
    }
  }

  const openContractModal = () => {
    const modal = document.getElementById('contract-modal')
    if (modal) {
      modal.style.display = 'flex'
    }
  }

  const updateExamCalendar = () => {
    if (!userData) return
    
    const calendar = document.getElementById('exam-calendar')
    if (!calendar) return
    
    const today = new Date()
    const year = today.getFullYear()
    const month = today.getMonth()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    
    let calendarHTML = '<div class="grid grid-cols-7 gap-1 md:gap-2">'
    
    // 添加星期标题
    const weekdays = ['日', '一', '二', '三', '四', '五', '六']
    weekdays.forEach(day => {
      calendarHTML += `<div class="text-center text-xs text-gray-500 py-1">${day}</div>`
    })
    
    // 添加日期
    for (let i = 1; i <= daysInMonth; i++) {
      const dateStr = `${year}-${month + 1}-${i}`
      const isChecked = userData.examCalendar && userData.examCalendar[dateStr]
      const isToday = i === today.getDate()
      
      calendarHTML += `
        <div class="calendar-day w-8 h-8 md:w-10 md:h-10 flex items-center justify-center rounded-full text-sm ${
          isChecked ? 'bg-gradient-to-r from-primary to-secondary text-white' : 
          isToday ? 'border-2 border-primary text-primary' : 'text-gray-700'
        }">
          ${i}
        </div>
      `
    }
    
    calendarHTML += '</div>'
    calendar.innerHTML = calendarHTML
  }

  useEffect(() => {
    if (userData) {
      updateExamCalendar()
    }
  }, [userData])

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

  const examModules = {
    1: '直播前综合考试',
    2: '基础素养',
    3: '模块表现力',
    4: '内容与口才', 
    5: '粉丝与营收',
    6: '心态与职业观'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 p-4">
      <Head>
        <title>个人中心 - 九天乐传媒</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet" />
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
          .user-card {
            background: linear-gradient(135deg, #FF3CAC, #784BA0);
            color: white;
            border-radius: 16px;
            overflow: hidden;
          }
          .calendar-day {
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 2px;
            cursor: pointer;
            transition: all 0.3s ease;
          }
          .question-item {
            border-left: 4px solid #784BA0;
            background: #f9f9f9;
          }
        `}</style>
      </Head>

      {/* 导航栏 */}
      <nav className="glass-morphism rounded-xl p-4 mb-6 flex justify-between items-center">
        <button 
          onClick={() => router.push('/')}
          className="px-4 py-2 bg-white rounded-lg hover:shadow-md transition-shadow"
        >
          <i className="fas fa-arrow-left mr-2"></i>返回首页
        </button>
        <h1 className="text-xl font-bold gradient-text">个人中心</h1>
        <button 
          onClick={logout}
          className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
        >
          <i className="fas fa-sign-out-alt mr-2"></i>退出
        </button>
      </nav>

      <div className="max-w-4xl mx-auto">
        {/* 用户信息卡片 */}
        <div className="user-card p-6 mb-6">
          <div className="flex items-center">
            <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center mr-4">
              <i className="fas fa-user text-2xl text-primary"></i>
            </div>
            <div>
              <h2 className="text-xl font-bold">{userData.nickname}</h2>
              <p className="opacity-80">{userData.realName || '未设置真实姓名'} | {userData.phone || '未设置手机号'}</p>
              {userData.hasAppliedTikTok && (
                <p className="text-sm mt-1 bg-white text-green-600 px-2 py-1 rounded inline-block">
                  ✓ 已申请TikTok
                </p>
              )}
            </div>
          </div>
        </div>

        {/* 标签页导航 */}
        <div className="bg-white rounded-xl shadow-lg mb-6">
          <div className="flex border-b">
            <button
              className={`flex-1 py-4 text-center font-medium ${
                activeTab === 'profile' 
                  ? 'text-primary border-b-2 border-primary' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('profile')}
            >
              <i className="fas fa-user mr-2"></i>个人信息
            </button>
            <button
              className={`flex-1 py-4 text-center font-medium ${
                activeTab === 'exam' 
                  ? 'text-primary border-b-2 border-primary' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('exam')}
            >
              <i className="fas fa-graduation-cap mr-2"></i>考试记录
            </button>
            <button
              className={`flex-1 py-4 text-center font-medium ${
                activeTab === 'contract' 
                  ? 'text-primary border-b-2 border-primary' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('contract')}
            >
              <i className="fas fa-file-contract mr-2"></i>电子合同
            </button>
          </div>

          {/* 标签页内容 */}
          <div className="p-6">
            {activeTab === 'profile' && (
              <div>
                <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
                  <h3 className="text-lg font-bold mb-4">本月考试打卡</h3>
                  <div id="exam-calendar"></div>
                  <div className="mt-4 text-center text-gray-600">
                    已打卡 {Object.keys(userData.examCalendar || {}).length} 天
                  </div>
                </div>

                <div className="text-center space-y-4">
                  <button 
                    onClick={() => setActiveTab('exam')}
                    className="w-full md:w-auto px-6 py-3 bg-gradient-to-r from-primary to-secondary text-white rounded-lg hover:opacity-90 transition-opacity"
                  >
                    <i className="fas fa-graduation-cap mr-2"></i>查看全部题目解析
                  </button>
                  
                  {!userData.hasAppliedTikTok ? (
                    <button 
                      onClick={openContractModal}
                      className="w-full md:w-auto px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                    >
                      <i className="fab fa-tiktok mr-2"></i>申请TikTok合同
                    </button>
                  ) : (
                    <button 
                      className="w-full md:w-auto px-6 py-3 bg-gray-400 text-white rounded-lg cursor-not-allowed"
                      disabled
                    >
                      <i className="fas fa-check mr-2"></i>已申请TikTok
                    </button>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'exam' && (
              <div>
                <h3 className="text-lg font-bold mb-4">考试记录</h3>
                <div className="space-y-4 mb-6">
                  {userData.examRecords && userData.examRecords.length > 0 ? (
                    userData.examRecords.map((record, index) => (
                      <div key={index} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                        <div>
                          <div className="font-medium">
                            {examModules[record.moduleId] || `模块 ${record.moduleId}`}
                          </div>
                          <div className="text-sm text-gray-500">
                            {new Date(record.date).toLocaleDateString()} {new Date(record.date).toLocaleTimeString()}
                          </div>
                        </div>
                        <div className={`text-lg font-bold ${
                          record.score >= 60 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {record.score}分
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-center py-8">暂无考试记录</p>
                  )}
                </div>

                <button 
                  onClick={showAllQuestions}
                  className="w-full px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  <i className="fas fa-book mr-2"></i>查看全部题目解析
                </button>
              </div>
            )}

            {activeTab === 'contract' && (
              <div>
                <h3 className="text-lg font-bold mb-4">电子合同管理</h3>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <h4 className="font-semibold text-blue-800 mb-2">
                    <i className="fas fa-info-circle mr-2"></i>TikTok独家代理合同
                  </h4>
                  <p className="text-blue-700 text-sm">
                    签署后即可开始TikTok直播生涯，享受公司提供的全方位运营支持、流量扶持和收益分成。
                  </p>
                </div>

                {!userData.hasAppliedTikTok ? (
                  <div className="text-center">
                    <button 
                      onClick={openContractModal}
                      className="px-6 py-3 bg-gradient-to-r from-primary to-secondary text-white rounded-lg hover:opacity-90 transition-opacity"
                    >
                      <i className="fas fa-file-signature mr-2"></i>立即签署合同
                    </button>
                    <p className="text-gray-600 text-sm mt-3">
                      签署前请仔细阅读合同条款，确认无误后再进行电子签名
                    </p>
                  </div>
                ) : (
                  <div className="text-center">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                      <i className="fas fa-check-circle text-green-500 text-2xl mb-2"></i>
                      <p className="text-green-700 font-semibold">已成功签署TikTok合同</p>
                    </div>
                    <button 
                      onClick={openContractsList}
                      className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                    >
                      <i className="fas fa-file-download mr-2"></i>查看已签署合同
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 合同模态框 */}
      <ContractModal userData={userData} setUserData={setUserData} />
      
      {/* 合同列表模态框 */}
      <ContractsListModal />
    </div>
  )
}

// 查看全部题目解析功能
function showAllQuestions() {
  // 这里可以跳转到专门的题目解析页面
  alert('题目解析功能开发中...')
}

// 打开合同列表
function openContractsList() {
  const modal = document.getElementById('contracts-list-modal')
  if (modal) {
    modal.style.display = 'flex'
    renderContractsList()
  }
}

// 渲染合同列表
function renderContractsList() {
  const container = document.getElementById('contracts-list')
  const list = JSON.parse(localStorage.getItem('signedContracts') || '[]')
  
  if (!container) return
  
  // 只显示当前用户的合同
  const userContracts = list.filter(item => 
    item.nickname === JSON.parse(localStorage.getItem('userData')).nickname
  )
  
  if (!userContracts.length) {
    container.innerHTML = '<p class="text-gray-500 text-center py-4">您尚未签署任何合同</p>'
    return
  }
  
  container.innerHTML = userContracts.map(item => `
    <div class="flex items-center justify-between bg-gray-50 p-4 rounded-lg mb-3">
      <div>
        <div class="font-medium">${item.nickname} (${item.realName || '-'})</div>
        <div class="text-sm text-gray-500">
          手机: ${item.phone || '-'} | 签署时间: ${new Date(item.signedAt).toLocaleString()}
        </div>
      </div>
      <div class="flex space-x-2">
        <button onclick='downloadContract("${item.id}")' class="px-3 py-1 bg-blue-100 text-blue-600 rounded text-sm hover:bg-blue-200 transition-colors">
          下载
        </button>
        <button onclick='deleteContract("${item.id}")' class="px-3 py-1 bg-red-100 text-red-600 rounded text-sm hover:bg-red-200 transition-colors">
          删除
        </button>
      </div>
    </div>
  `).join('')
}

// 合同模态框组件
function ContractModal({ userData, setUserData }) {
  const closeModal = () => {
    const modal = document.getElementById('contract-modal')
    if (modal) {
      modal.style.display = 'none'
    }
  }

  const saveSignedContract = () => {
    const agreeCheckbox = document.getElementById('agree-checkbox')
    if (!agreeCheckbox?.checked) {
      alert('请先同意合同条款')
      return
    }

    const signatureCanvas = document.getElementById('signature-pad')
    if (!signatureCanvas) {
      alert('签名板初始化失败')
      return
    }

    // 检查签名是否为空
    const tempCanvas = document.createElement('canvas')
    const tempCtx = tempCanvas.getContext('2d')
    tempCanvas.width = signatureCanvas.width
    tempCanvas.height = signatureCanvas.height
    tempCtx.drawImage(signatureCanvas, 0, 0)
    
    const imageData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height)
    const data = imageData.data
    let isEmpty = true
    
    for (let i = 0; i < data.length; i += 4) {
      if (data[i + 3] !== 0) {
        isEmpty = false
        break
      }
    }
    
    if (isEmpty) {
      alert('请先签名')
      return
    }

    const signatureDataUrl = signatureCanvas.toDataURL('image/png')
    const now = new Date()
    
    const record = {
      id: 'ctr_' + now.getTime(),
      nickname: userData.nickname,
      realName: userData.realName,
      phone: userData.phone,
      idCard: userData.idCard,
      signedAt: now.toISOString(),
      signature: signatureDataUrl
    }

    // 保存到本地存储
    const list = JSON.parse(localStorage.getItem('signedContracts') || '[]')
    list.unshift(record)
    localStorage.setItem('signedContracts', JSON.stringify(list))

    // 更新用户申请状态
    const updatedUserData = {
      ...userData,
      hasAppliedTikTok: true
    }
    setUserData(updatedUserData)
    localStorage.setItem('userData', JSON.stringify(updatedUserData))

    alert('签署成功！')
    closeModal()
  }

  return (
    <div id="contract-modal" className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 hidden">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-auto m-4">
        <button onClick={closeModal} className="absolute right-4 top-4 text-gray-500 hover:text-gray-700 z-10">
          <i className="fas fa-times"></i>
        </button>
        
        <div className="p-6">
          <h3 className="text-xl font-bold mb-4 gradient-text">TikTok独家代理合同</h3>
          
          <div className="text-sm text-gray-700 mb-6 space-y-4 max-h-96 overflow-y-auto p-4 border rounded-lg">
            <div className="contract-content">
              <h4 className="font-bold text-lg mb-4">独家代理合同</h4>
              
              <div className="mb-4">
                <p><strong>甲方：</strong>常宁市九天乐传媒有限公司</p>
                <p><strong>统一社会信用代码：</strong>91430482MAEFKQWR02</p>
                <p><strong>乙方：</strong>{userData.nickname} ({userData.realName || '未填写'})</p>
                <p><strong>手机号：</strong>{userData.phone || '未填写'}</p>
                <p><strong>身份证：</strong>{userData.idCard || '未填写'}</p>
              </div>

              <div className="space-y-4 text-sm">
                <section>
                  <h5 className="font-semibold mb-2">一、合作基础与确认</h5>
                  <p>乙方确认其TikTok账号用于本人直播，实际由乙方管理使用。乙方自愿申请加入甲方在TikTok平台设立的公会，在合作期间接受甲方的独家运营管理。</p>
                </section>

                <section>
                  <h5 className="font-semibold mb-2">二、合作内容与范围</h5>
                  <p>甲方作为乙方在互联网演艺业务（包括但不限于网络直播、短视频内容发布、网络互动演艺等活动）的独家代理商。本协议合作范围涵盖TikTok平台及所有其他现有及未来的互联网演艺平台。</p>
                </section>

                <section>
                  <h5 className="font-semibold mb-2">三、合作期限</h5>
                  <p>本协议合作期限自本协议签订之日起计算，有效期为3年。期限届满前一个月，若双方均未提交书面终止意向，本协议自动续约两年。</p>
                </section>

                <section>
                  <h5 className="font-semibold mb-2">四、收益分配</h5>
                  <p>TikTok平台扣除相应平台服务费后，甲方占可分配收益的20%；乙方占可分配收益的30%。收益按月结算，甲方在收到平台结算款项后20个工作日内支付乙方应得份额。</p>
                </section>

                <section>
                  <h5 className="font-semibold mb-2">五、乙方义务</h5>
                  <ul className="list-disc list-inside space-y-1">
                    <li>每月有效直播天数不少于26天</li>
                    <li>每日有效直播时长不少于6小时</li>
                    <li>每月累计有效直播时长不少于156小时</li>
                    <li>单场直播时长不足3小时不计入有效时长</li>
                    <li>每月高质量短视频不少于26个</li>
                    <li>每月连麦PK次数不少于100次</li>
                  </ul>
                </section>
              </div>

              <div className="mt-8 pt-4 border-t">
                <p className="text-xs text-gray-600 italic">
                  （乙方已仔细阅读本协议全部条款。签署即视为乙方认可本协议全部条款并自愿签订本协议。）
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <div className="flex items-center mb-4">
              <input type="checkbox" id="agree-checkbox" className="mr-2 w-4 h-4" />
              <label htmlFor="agree-checkbox" className="text-sm text-gray-700">
                我已阅读并同意以上合同条款
              </label>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">乙方签名：</label>
              <canvas 
                id="signature-pad" 
                width="600" 
                height="150"
                className="w-full h-32 border-2 border-dashed border-gray-300 rounded-lg touch-none"
              ></canvas>
            </div>

            <div className="flex justify-between">
              <button 
                onClick={() => {
                  const canvas = document.getElementById('signature-pad')
                  const ctx = canvas.getContext('2d')
                  ctx.clearRect(0, 0, canvas.width, canvas.height)
                }}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                <i className="fas fa-eraser mr-2"></i>清除签名
              </button>
              
              <button 
                onClick={saveSignedContract}
                className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              >
                <i className="fas fa-file-signature mr-2"></i>签署并保存
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// 合同列表模态框组件
function ContractsListModal() {
  const closeModal = () => {
    const modal = document.getElementById('contracts-list-modal')
    if (modal) {
      modal.style.display = 'none'
    }
  }

  return (
    <div id="contracts-list-modal" className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 hidden">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[80vh] overflow-auto m-4">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold gradient-text">已签署合同</h3>
            <button onClick={closeModal} className="text-gray-500 hover:text-gray-700">
              <i className="fas fa-times"></i>
            </button>
          </div>
          
          <div id="contracts-list" className="space-y-3 max-h-96 overflow-auto">
            {/* 合同列表将通过JavaScript动态生成 */}
          </div>
        </div>
      </div>
    </div>
  )
}

// 下载合同功能
function downloadContract(contractId) {
  alert('合同下载功能开发中...')
}

// 删除合同功能  
function deleteContract(contractId) {
  if (confirm('确定要删除此合同记录吗？')) {
    let list = JSON.parse(localStorage.getItem('signedContracts') || '[]')
    list = list.filter(item => item.id !== contractId)
    localStorage.setItem('signedContracts', JSON.stringify(list))
    renderContractsList()
  }
}