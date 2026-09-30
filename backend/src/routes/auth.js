const express = require('express')
const axios = require('axios')
const router = express.Router()

const APPID = process.env.WX_APPID || 'YOUR_WECHAT_APPID'
const SECRET = process.env.WX_SECRET || 'YOUR_WECHAT_SECRET'

function buildMockToken(openid, role = 'uploader') {
  const payload = {
    openid,
    role,
    ts: Date.now()
  }
  return Buffer.from(JSON.stringify(payload)).toString('base64url')
}

function parseToken(token) {
  if (!token || !token.startsWith('Bearer ')) return null
  try {
    const raw = token.replace('Bearer ', '')
    return JSON.parse(Buffer.from(raw, 'base64url').toString('utf8'))
  } catch (e) {
    return null
  }
}

router.post('/login', async (req, res) => {
  const { code, role = 'uploader' } = req.body
  if (!code) {
    return res.status(400).json({ success: false, message: '缺少 code' })
  }

  try {
    const wxRes = await axios.get('https://api.weixin.qq.com/sns/jscode2session', {
      params: {
        appid: APPID,
        secret: SECRET,
        js_code: code,
        grant_type: 'authorization_code'
      },
      timeout: 5000
    })

    const data = wxRes.data
    if (data.errcode) {
      return res.status(400).json({ success: false, message: data.errmsg || '微信返回错误' })
    }

    const openid = data.openid
    const token = buildMockToken(openid, role)

    return res.json({
      success: true,
      data: {
        openid,
        role,
        token
      }
    })
  } catch (err) {
    console.error('wx jscode2session error', err.message)
    return res.status(500).json({ success: false, message: '微信登录失败', error: err.message })
  }
})

router.get('/profile', (req, res) => {
  const auth = req.headers.authorization || ''
  const info = parseToken(auth)
  if (!info) {
    return res.status(401).json({ success: false, message: '未授权' })
  }

  return res.json({
    success: true,
    data: info
  })
})

module.exports = router
