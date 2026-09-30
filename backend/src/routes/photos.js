const express = require('express')
const db = require('../db')
const router = express.Router()

function authRequired(req, res, next) {
  const auth = req.headers.authorization || ''
  if (!auth || !auth.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: '未授权' })
  }
  next()
}

router.get('/', authRequired, async (req, res) => {
  try {
    const { orgId, taskId, date } = req.query
    let sql = 'SELECT id, org_id, task_id, file_path, thumb_path, capture_time, upload_time, latitude, longitude, location_text, org_name, md5, status FROM photos WHERE 1=1'
    const params = []

    if (orgId) {
      sql += ' AND org_id = ?'
      params.push(orgId)
    }
    if (taskId) {
      sql += ' AND task_id = ?'
      params.push(taskId)
    }
    if (date) {
      sql += ' AND DATE(capture_time) = ?'
      params.push(date)
    }

    sql += ' ORDER BY capture_time DESC LIMIT 1000'
    const [rows] = await db.execute(sql, params)
    return res.json({ success: true, data: rows })
  } catch (err) {
    console.error('photos list error', err)
    return res.status(500).json({ success: false, message: '服务器异常', error: err.message })
  }
})

router.get('/summary', authRequired, async (req, res) => {
  try {
    const { orgId, taskId } = req.query
    let sql = 'SELECT COUNT(*) as total, SUM(CASE WHEN status = "uploaded" THEN 1 ELSE 0 END) as uploaded, SUM(CASE WHEN status = "reviewed" THEN 1 ELSE 0 END) as reviewed, SUM(CASE WHEN status = "rejected" THEN 1 ELSE 0 END) as rejected FROM photos WHERE 1=1'
    const params = []
    if (orgId) {
      sql += ' AND org_id = ?'
      params.push(orgId)
    }
    if (taskId) {
      sql += ' AND task_id = ?'
      params.push(taskId)
    }
    const [rows] = await db.execute(sql, params)
    return res.json({ success: true, data: rows[0] })
  } catch (err) {
    console.error('photos summary error', err)
    return res.status(500).json({ success: false, message: '服务器异常', error: err.message })
  }
})

module.exports = router
