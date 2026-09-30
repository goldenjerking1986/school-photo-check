const express = require('express')
const multer = require('multer')
const fs = require('fs')
const path = require('path')
const db = require('../db')
const { requireAuth } = require('../auth')
const { buildFolderPath } = require('../services/folder')
const { uploadToCos, calculateMd5 } = require('../services/oss')

const router = express.Router()
const tmpDir = path.join(process.cwd(), 'tmp', 'uploads')
fs.mkdirSync(tmpDir, { recursive: true })
const upload = multer({
  dest: tmpDir,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png']
    cb(null, allowed.includes(file.mimetype))
  }
})

router.post('/photo', requireAuth, upload.single('file'), async (req, res) => {
  let localPath
  try {
    const file = req.file
    localPath = file && file.path
    if (!file) {
      return res.status(400).json({ success: false, message: '只允许上传 JPG 或 PNG 图片' })
    }

    const {
      taskId = null,
      orgId = req.user.orgId || null,
      captureTime = null,
      latitude = null,
      longitude = null,
      locationText = null,
      orgName = null
    } = req.body

    const folderPath = buildFolderPath({
      orgId: orgId || 'unknown',
      taskId: taskId || 'unknown',
      date: captureTime || new Date().toISOString(),
      placeName: locationText || 'unknown'
    })

    const md5 = await calculateMd5(file.path)
    const ext = file.mimetype === 'image/png' ? '.png' : '.jpg'
    const filename = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}${ext}`
    const uploadResult = await uploadToCos(file.path, `${folderPath}${filename}`)

    const [result] = await db.execute(
      `INSERT INTO photos
       (org_id, task_id, uploader_id, file_path, capture_time, latitude, longitude, location_text, org_name, md5, status, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'uploaded', NOW())`,
      [
        orgId ? Number(orgId) : null,
        taskId ? Number(taskId) : null,
        req.user.id || null,
        uploadResult.url,
        captureTime || new Date(),
        latitude !== null && latitude !== '' ? Number(latitude) : null,
        longitude !== null && longitude !== '' ? Number(longitude) : null,
        locationText || null,
        orgName || null,
        md5
      ]
    )

    await db.execute(
      'INSERT INTO photo_logs (photo_id, action, operator_id, created_at) VALUES (?, ?, ?, NOW())',
      [result.insertId, 'upload', req.user.id || null]
    )

    return res.json({
      success: true,
      message: '上传成功',
      data: { photoId: result.insertId, url: uploadResult.url, folder: folderPath }
    })
  } catch (err) {
    console.error('upload/photo error', err)
    return res.status(500).json({ success: false, message: '服务器异常' })
  } finally {
    if (localPath) {
      try { fs.unlinkSync(localPath) } catch (e) {}
    }
  }
})

module.exports = router
