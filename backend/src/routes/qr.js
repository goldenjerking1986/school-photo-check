const express = require('express')
const axios = require('axios')
const QRCode = require('qrcode')
const { requireAuth } = require('../auth')

const router = express.Router()

// POST /api/qr/generate
// body: { type: 'url'|'miniapp', url, scene, page, width }
router.post('/generate', requireAuth, async (req, res) => {
  try {
    const { type } = req.body
    const width = parseInt(req.body.width || '430', 10)

    if (type === 'miniapp') {
      const APPID = process.env.WX_APPID
      const SECRET = process.env.WX_SECRET
      const scene = req.body.scene
      const page = req.body.page || 'pages/capture/capture'

      if (!APPID || !SECRET) return res.status(500).json({ success: false, message: 'WX_APPID/WX_SECRET 未配置' })
      if (!scene) return res.status(400).json({ success: false, message: '缺少 scene 参数' })

      // get access_token
      const tokenRes = await axios.get('https://api.weixin.qq.com/cgi-bin/token', {
        params: { grant_type: 'client_credential', appid: APPID, secret: SECRET },
        timeout: 8000
      })
      const tokenData = tokenRes.data
      if (!tokenData || !tokenData.access_token) {
        return res.status(500).json({ success: false, message: '获取 access_token 失败', detail: tokenData })
      }

      const accessToken = tokenData.access_token
      const apiUrl = `https://api.weixin.qq.com/wxa/getwxacodeunlimit?access_token=${accessToken}`
      const payload = { scene, page, width, auto_color: false }

      const qrResp = await axios.post(apiUrl, payload, { responseType: 'arraybuffer', timeout: 15000 })
      const contentType = qrResp.headers['content-type'] || ''
      if (contentType.includes('application/json')) {
        const text = qrResp.data.toString('utf8')
        return res.status(500).json({ success: false, message: '微信接口返回错误', detail: text })
      }

      const buffer = Buffer.from(qrResp.data)
      res.setHeader('Content-Type', 'image/png')
      res.setHeader('Content-Disposition', 'inline; filename="miniapp-qrcode.png"')
      return res.send(buffer)

    } else if (type === 'url') {
      const url = req.body.url
      if (!url) return res.status(400).json({ success: false, message: '缺少 url 参数' })

      // generate QR PNG buffer
      const opts = { errorCorrectionLevel: 'H', type: 'png', width }
      const buffer = await QRCode.toBuffer(url, opts)
      res.setHeader('Content-Type', 'image/png')
      res.setHeader('Content-Disposition', 'inline; filename="qr.png"')
      return res.send(buffer)

    } else {
      return res.status(400).json({ success: false, message: 'type 参数应为 miniapp 或 url' })
    }
  } catch (err) {
    console.error('qr generate error', err.message || err)
    return res.status(500).json({ success: false, message: '生成二维码失败', error: err.message })
  }
})

module.exports = router
