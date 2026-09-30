const express = require('express')
const db = require('../db')
const { requireAuth, requireRole } = require('../auth')
const router = express.Router()

// PATCH /review/:photoId  body: { status: 'reviewed'|'rejected', remark: '...' }
router.patch('/:photoId', requireAuth, requireRole('admin'), async (req, res) => {
  const { photoId } = req.params
  const { status, remark } = req.body

  const allowed = ['reviewed', 'rejected']
  if (!allowed.includes(status)) {
    return res.status(400).json({ success: false, message: '状态非法' })
  }

  try {
    const [result] = await db.execute(
      'UPDATE photos SET status = ?, remark = ? WHERE id = ?',
      [status, remark || '', photoId]
    )

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: '照片不存在' })
    }

    // 写审计日志
    await db.execute('INSERT INTO photo_logs (photo_id, action, operator_id, created_at) VALUES (?, ?, ?, NOW())', [photoId, status === 'reviewed' ? 'review' : 'reject', req.user.id || null])

    return res.json({ success: true, message: '状态更新成功' })
  } catch (err) {
    console.error('review error', err)
    return res.status(500).json({ success: false, message: '审核失败', error: err.message })
  }
})

module.exports = router
