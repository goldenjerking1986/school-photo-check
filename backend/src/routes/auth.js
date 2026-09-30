const express = require('express')
const axios = require('axios')
const db = require('../db')
const { signToken } = require('../auth')
const router = express.Router()

const APPID = process.env.WX_APPID
const SECRET = process.env.WX_SECRET

router.post('/login', async (req, res) => {
  const { code, userInfo = null } = req.body
  if (!code) return res.status(400).json({ success: false, message: '缺少 code' })
  if (!APPID || !SECRET) return res.status(500).json({ success: false, message: '微信登录配置缺失' })

  try {
    const { data } = await axios.get('https://api.weixin.qq.com/sns/jscode2session', {
      params: { appid: APPID, secret: SECRET, js_code: code, grant_type: 'authorization_code' },
      timeout: 8000
    })
    if (data.errcode || !data.openid) return res.status(400).json({ success: false, message: data.errmsg || '微信登录失败' })

    const nickname = userInfo && userInfo.nickName ? String(userInfo.nickName).slice(0, 100) : null
    const avatar = userInfo && userInfo.avatarUrl ? String(userInfo.avatarUrl).slice(0, 512) : null
    const [rows] = await db.execute('SELECT id, role, org_id FROM users WHERE openid = ? LIMIT 1', [data.openid])
    let id, role, orgId

    if (rows.length) {
      id = rows[0].id; role = rows[0].role || 'uploader'; orgId = rows[0].org_id || null
      await db.execute('UPDATE users SET nickname = COALESCE(?, nickname), avatar = COALESCE(?, avatar), updated_at = NOW() WHERE id = ?', [nickname, avatar, id])
    } else {
      const [result] = await db.execute('INSERT INTO users (openid, nickname, avatar, role, created_at, updated_at) VALUES (?, ?, ?, ?, NOW(), NOW())', [data.openid, nickname, avatar, 'uploader'])
      id = result.insertId; role = 'uploader'; orgId = null
    }

    return res.json({ success: true, data: { token: signToken({ id, openid: data.openid, role, orgId }), user: { id, openid: data.openid, role, orgId, nickname, avatar } } })
  } catch (err) {
    console.error('auth.login error', err)
    return res.status(500).json({ success: false, message: '登录失败' })
  }
})

module.exports = router
