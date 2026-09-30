function request({ url, method = 'GET', data = {}, header = {} }) {
  const token = wx.getStorageSync('sessionToken') || ''
  return new Promise((resolve, reject) => {
    wx.request({
      url,
      method,
      data,
      header: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        ...header
      },
      success(res) {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(res.data)
        } else {
          reject(res.data || { message: 'request failed' })
        }
      },
      fail(err) {
        reject(err)
      }
    })
  })
}

module.exports = { request }
