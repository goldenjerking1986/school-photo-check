const express = require('express')
const multer = require('multer')
const fs = require('fs')
const path = require('path')
const db = require('../db')
const { buildFolderPath } = require('../services/folder')
const { uploadToCos, calculateMd5 } = require('../services/oss')

const router = express.Router()
const tmpDir = path.join(process.cwd(), 'tmp', 'uploads')
fs.mkdirSync(tmpDir, { recursive: true })
const upload = multer({ dest: tmpDir, limits: { fileSize: 10 * 1024 * 1024 } })

function authRequired(req, res, next) {
  const auth = req.headers.authorization || ''
  if (!auth || !auth.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: '未授权' })
  }
  next()
}

router.post('/photo', authRequired, upload.single('file'), async (req, res) => {
  try {
    const file = req.file
    if (!file) {
      return res.status(400).json({ success: false, message: '缺少文件' })
    }

    const {
      taskId = null,
      orgId = null,
      captureTime = null,
      latitude = null,
      longitude = null,
      locationText = null,
      orgName = null
    } = req.body

    const date = captureTime || new Date().toISOString()
    const folderPath = buildFolderPath({
      orgId: orgId || 'unknown',
      taskId: taskId || 'unknown',
      date,
      placeName: locationText || 'unknown'
    })

    const md5 = await calculateMd5(file.path)
    const ext = path.extname(file.originalname) || '.jpg'
    const filename = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}${ext}`
    const targetKey = `${folderPath}${filename}`

    const uploadResult = await uploadToCos(file.path, targetKey)

    try { fs.unlinkSync(file.path) } catch (e) {}

    const sql = `INSERT INTO photos
      (org_id, task_id, uploader_id, file_path, capture_time, latitude, longitude, location_text, org_name, md5, status, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'uploaded', NOW())`

    const params = [
      orgId ? Number(orgId) : null,
      taskId ? Number(taskId) : null,
      null,
      uploadResult.url,
      captureTime || new Date(),
      latitude ? Number(latitude) : null,
      longitude ? Number(longitude) : null,
      locationText || null,
      orgName || null,
      md5
    ]

    const [result] = await db.execute(sql, params)

    return res.json({
      success: true,
      message: '上传成功',
      data: {
        photoId: result.insertId,
        url: uploadResult.url,
        folder: folderPath
      }
    })
  } catch (err) {
    console.error('upload/photo error', err)
    return res.status(500).json({ success: false, message: '服务器异常', error: err.message })
  }
})

module.exports = router
