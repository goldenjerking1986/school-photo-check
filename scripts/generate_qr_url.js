/**
 * generate_qr_url.js
 *
 * 生成普通二维码（H5 链接）的脚本
 * 用法：
 *   1. 安装依赖：npm install qrcode dotenv
 *   2. 创建 .env 文件或在环境中设置 BASE_URL, TASK_ID, ORG_ID, ORG_NAME
 *   3. 运行：node scripts/generate_qr_url.js
 *
 * 输出：scripts/qr_url.png
 */

require('dotenv').config()
const QRCode = require('qrcode')
const fs = require('fs')
const path = require('path')

// 从环境读取或使用默认值
const BASE_URL = process.env.BASE_URL || 'https://yourdomain.com/scan'
const TASK_ID = process.env.TASK_ID || '1'
const ORG_ID = process.env.ORG_ID || '1'
const ORG_NAME = process.env.ORG_NAME || '某学院'

// 构造 URL
const params = new URLSearchParams({ taskId: TASK_ID, orgId: ORG_ID, orgName: ORG_NAME })
const url = `${BASE_URL}?${params.toString()}`

const outPath = path.join(__dirname, 'qr_url.png')

QRCode.toFile(outPath, url, {
  errorCorrectionLevel: 'H',
  margin: 2,
  width: 600
}, (err) => {
  if (err) {
    console.error('生成二维码失败', err)
    process.exit(1)
  }
  console.log(`普通二维码已生成: ${outPath}`)
  console.log(`扫描打开链接: ${url}`)
})
