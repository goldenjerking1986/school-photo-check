const express = require('express')
const db = require('../db')
const XLSX = require('xlsx')
const { requireAuth, requireRole } = require('../auth')
const router = express.Router()

router.get('/excel', requireAuth, requireRole('admin'), async (req, res) => {
  const { orgId, taskId } = req.query
  let sql = 'SELECT id, org_id, task_id, capture_time, latitude, longitude, location_text, org_name, status, remark FROM photos WHERE 1=1'
  const params = []

  if (orgId) {
    sql += ' AND org_id = ?'
    params.push(orgId)
  }

  if (taskId) {
    sql += ' AND task_id = ?'
    params.push(taskId)
  }

  try {
    const [rows] = await db.execute(sql, params)

    const sheet = XLSX.utils.json_to_sheet(rows)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, sheet, '照片列表')

    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' })
    res.setHeader('Content-Disposition', 'attachment; filename=photo-report.xlsx')
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    return res.send(buffer)
  } catch (err) {
    console.error('export excel error', err)
    return res.status(500).json({ success: false, message: '导出失败', error: err.message })
  }
})

module.exports = router
