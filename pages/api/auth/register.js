// pages/api/auth/register.js
import { createClient } from '@supabase/supabase-js'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { email, password, realName, phone, idCard, inviteCode } = req.body

  // 验证邀请码
  if (inviteCode !== 'cnyoyo') {
    return res.status(400).json({ error: '邀请码不正确' })
  }

  try {
    // 使用服务端密钥创建Supabase客户端（绕过RLS）
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY, // 确保这个环境变量已设置
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // 1. 创建认证用户
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true // 自动确认邮箱，避免邮箱验证
    })

    if (authError) {
      console.error('认证创建错误:', authError)
      return res.status(400).json({ error: authError.message })
    }

    if (!authData.user) {
      return res.status(400).json({ error: '用户创建失败' })
    }

    // 2. 在users表中创建记录
    const { data: userData, error: userError } = await supabaseAdmin
      .from('users')
      .insert([
        {
          id: authData.user.id,
          real_name: realName,
          phone: phone,
          id_card: idCard,
          nickname: email.split('@')[0],
          role: 'user'
        }
      ])
      .select()

    if (userError) {
      console.error('用户表插入错误:', userError)
      // 如果用户表插入失败，删除刚创建的认证用户
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id)
      return res.status(400).json({ error: userError.message })
    }

    res.status(200).json({ 
      success: true, 
      message: '注册成功',
      user: userData[0]
    })

  } catch (error) {
    console.error('注册API错误:', error)
    res.status(500).json({ error: '服务器内部错误: ' + error.message })
  }
}