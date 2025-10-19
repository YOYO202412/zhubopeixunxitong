// pages/admin/index.js
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../../lib/supabase'
import Head from 'next/head'

export default function AdminPanel() {
  const router = useRouter()
  const [users, setUsers] = useState([])
  const [contracts, setContracts] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('users')

  useEffect(() => {
    checkAdminAccess()
  }, [])

  const checkAdminAccess = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      router.push('/auth/login')
      return
    }

    // 检查用户是否是管理员
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', session.user.id)
      .single()

    if (!userData || userData.role !== 'admin') {
      alert('无权访问管理员页面')
      router.push('/')
      return
    }

    loadUsers()
    loadContracts()
  }

  const loadUsers = async () => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('加载用户失败:', error)
      return
    }

    setUsers(data || [])
    setLoading(false)
  }

  const loadContracts = async () => {
    // 从本地存储加载合同数据
    const contractsData = JSON.parse(localStorage.getItem('signedContracts') || '[]')
    setContracts(contractsData)
  }

  const toggleUserStatus = async (userId, currentStatus) => {
    if (!confirm(`确定要${currentStatus ? '封禁' : '解封'}此用户吗？`)) return

    const { error } = await supabase
      .from('users')
      .update({ banned: !currentStatus })
      .eq('id', userId)

    if (error) {
      alert('操作失败: ' + error.message)
      return
    }

    alert('操作成功')
    loadUsers()
  }

  const deleteUser = async (userId) => {
    if (!confirm('确定要删除此用户吗？此操作不可恢复！')) return

    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', userId)

    if (error) {
      alert('删除失败: ' + error.message)
      return
    }

    alert('用户已删除')
    loadUsers()
  }

  const deleteContract = (contractId) => {
    if (!confirm('确定要删除此合同记录吗？')) return

    const updatedContracts = contracts.filter(contract => contract.id !== contractId)
    setContracts(updatedContracts)
    localStorage.setItem('signedContracts', JSON.stringify(updatedContracts))
  }

  const logout = async () => {
    await supabase.auth.signOut()
    localStorage.removeItem('userData')
    router.push('/auth/login')
  }

  if (loading) {
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
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>管理员后台 - 九天乐传媒</title>
        <script src="https://cdn.tailwindcss.com"></script>
      </Head>

      {/* 导航栏 */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">管理员后台</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/')}
                className="text-gray-600 hover:text-gray-900"
              >
                返回首页
              </button>
              <button
                onClick={logout}
                className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
              >
                退出登录
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* 统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-blue-500 rounded-md p-3">
                  <i className="fas fa-users text-white text-xl"></i>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">总用户数</dt>
                    <dd className="text-lg font-medium text-gray-900">{users.length}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
                  <i className="fas fa-file-contract text-white text-xl"></i>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">已签署合同</dt>
                    <dd className="text-lg font-medium text-gray-900">{contracts.length}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-red-500 rounded-md p-3">
                  <i className="fas fa-ban text-white text-xl"></i>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">封禁用户</dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {users.filter(user => user.banned).length}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 标签页 */}
        <div className="bg-white shadow rounded-lg">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex">
              <button
                onClick={() => setActiveTab('users')}
                className={`whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm ${
                  activeTab === 'users'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <i className="fas fa-users mr-2"></i>
                用户管理
              </button>
              <button
                onClick={() => setActiveTab('contracts')}
                className={`whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm ${
                  activeTab === 'contracts'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <i className="fas fa-file-contract mr-2"></i>
                合同管理
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'users' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-lg font-medium text-gray-900">用户列表</h2>
                  <button
                    onClick={loadUsers}
                    className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    <i className="fas fa-sync-alt mr-2"></i>
                    刷新列表
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          用户信息
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          联系方式
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          注册时间
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          状态
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          操作
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {users.map((user) => (
                        <tr key={user.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {user.real_name || '未设置'}
                            </div>
                            <div className="text-sm text-gray-500">{user.id}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{user.phone || '未设置'}</div>
                            <div className="text-sm text-gray-500">{user.id_card || '未设置'}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(user.created_at).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              user.banned
                                ? 'bg-red-100 text-red-800'
                                : 'bg-green-100 text-green-800'
                            }`}>
                              {user.banned ? '已封禁' : '正常'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                            <button
                              onClick={() => toggleUserStatus(user.id, user.banned)}
                              className={`${
                                user.banned
                                  ? 'bg-green-100 text-green-600 hover:bg-green-200'
                                  : 'bg-yellow-100 text-yellow-600 hover:bg-yellow-200'
                              } px-3 py-1 rounded text-sm transition-colors`}
                            >
                              {user.banned ? '解封' : '封禁'}
                            </button>
                            <button
                              onClick={() => deleteUser(user.id)}
                              className="bg-red-100 text-red-600 hover:bg-red-200 px-3 py-1 rounded text-sm transition-colors"
                            >
                              删除
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {users.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      暂无用户数据
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'contracts' && (
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-6">合同管理</h2>
                
                <div className="space-y-4">
                  {contracts.map((contract) => (
                    <div key={contract.id} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium text-gray-900">
                            {contract.nickname} ({contract.realName || '未填写'})
                          </h3>
                          <p className="text-sm text-gray-500 mt-1">
                            手机: {contract.phone || '未填写'} | 
                            身份证: {contract.idCard || '未填写'}
                          </p>
                          <p className="text-sm text-gray-500">
                            签署时间: {new Date(contract.signedAt).toLocaleString()}
                          </p>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => downloadContract(contract)}
                            className="bg-blue-100 text-blue-600 hover:bg-blue-200 px-3 py-1 rounded text-sm transition-colors"
                          >
                            下载
                          </button>
                          <button
                            onClick={() => deleteContract(contract.id)}
                            className="bg-red-100 text-red-600 hover:bg-red-200 px-3 py-1 rounded text-sm transition-colors"
                          >
                            删除
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}

                  {contracts.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      暂无合同数据
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// 下载合同功能
function downloadContract(contract) {
  alert(`下载合同功能开发中...\n合同ID: ${contract.id}`)
  // 这里可以集成PDF生成和下载功能
}