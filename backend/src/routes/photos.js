const express = require('express')
const db = require('../db')
const router = express.Router()

router.get('/', async (req, res) => {
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

module.exports = router
