function buildFolderPath({ orgId, taskId, date, placeName }) {
  const d = new Date(date)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const safePlace = (placeName || 'unknown').toString().replace(/[\\/:*?"<>|]/g, '_')
  return `org_${orgId}/task_${taskId}/${y}/${m}/${day}/${safePlace}/`
}

module.exports = {
  buildFolderPath
}
