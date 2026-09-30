const express = require('express')
const axios = require('axios')
const router = express.Router()

const APPID = process.env.WX_APPID || 'YOUR_WECHAT_APPID'
const SECRET = process.env.WX_SECRET || 'YOUR_WECHAT_SECRET'

router.post('/login', async (req, res) => {
  const { code } = req.body
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
    const token = `mock-token-${openid}-${Date.now()}`

    return res.json({
      success: true,
      data: {
        openid,
        token
      }
    })
  } catch (err) {
    console.error('wx jscode2session error', err.message)
    return res.status(500).json({ success: false, message: '微信登录失败', error: err.message })
  }
})

module.exports = router
