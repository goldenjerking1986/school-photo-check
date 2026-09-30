/**
 * generate_miniapp_qrcode.js
 *
 * 生成微信小程序码（可直接在微信中扫码打开小程序并携带 scene 参数）
 * 需要在环境变量中配置：WX_APPID, WX_SECRET
 * 可选：SCENE (如 'orgId=1&taskId=15'), PAGE (如 'pages/capture/capture'), WIDTH
 *
 * 用法：
 *   1. 安装依赖：npm install axios dotenv fs
 *   2. 创建 .env 文件或在环境中设置 WX_APPID, WX_SECRET
 *   3. 运行：node scripts/generate_miniapp_qrcode.js
 *
 * 输出：scripts/miniapp-qrcode.png
 *
 * 注意：调用微信接口需在服务器环境（不要将 secret 放在客户端）。
 */

require('dotenv').config()
const axios = require('axios')
const fs = require('fs')
const path = require('path')

const APPID = process.env.WX_APPID
const SECRET = process.env.WX_SECRET
const SCENE = process.env.SCENE || 'orgId=1&taskId=15'
const PAGE = process.env.PAGE || 'pages/capture/capture'
const WIDTH = parseInt(process.env.WIDTH || '430', 10)

if (!APPID || !SECRET) {
  console.error('请先在环境变量中设置 WX_APPID 和 WX_SECRET（或参考 .env.example）')
  process.exit(2)
}

async function getAccessToken() {
  const url = 'https://api.weixin.qq.com/cgi-bin/token'
  const res = await axios.get(url, {
    params: {
      grant_type: 'client_credential',
      appid: APPID,
      secret: SECRET
    },
    timeout: 8000
  })
  if (!res.data || !res.data.access_token) {
    throw new Error(`获取 access_token 失败: ${JSON.stringify(res.data)}`)
  }
  return res.data.access_token
}

async function generate() {
  try {
    const token = await getAccessToken()
    const apiUrl = `https://api.weixin.qq.com/wxa/getwxacodeunlimit?access_token=${token}`

    const payload = {
      scene: SCENE,
      page: PAGE,
      width: WIDTH,
      auto_color: false
    }

    // 微信接口返回的是二进制图片
    const resp = await axios.post(apiUrl, payload, { responseType: 'arraybuffer', timeout: 15000 })

    if (resp.headers['content-type'] && resp.headers['content-type'].includes('application/json')) {
      const text = resp.data.toString('utf8')
      console.error('微信接口返回错误：', text)
      process.exit(3)
    }

    const outPath = path.join(__dirname, 'miniapp-qrcode.png')
    fs.writeFileSync(outPath, resp.data)
    console.log(`小程序二维码已生成: ${outPath}`)
    console.log(`scene=${SCENE} page=${PAGE}`)
  } catch (err) {
    console.error('生成小程序二维码失败:', err.message || err)
    process.exit(1)
  }
}

generate()
