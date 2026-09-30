function request({ url, method = 'GET', data = {}, header = {} }) {
  const token = wx.getStorageSync('sessionToken') || ''
  const authorization = token ? (token.indexOf('Bearer ') === 0 ? token : `Bearer ${token}`) : ''
  return new Promise((resolve, reject) => {
    wx.request({
      url,
      method,
      data,
      header: {
        'Content-Type': 'application/json',
        ...(authorization ? { Authorization: authorization } : {}),
        ...header
      },
      success(res) {
        if (res.statusCode >= 200 && res.statusCode < 300) resolve(res.data)
        else reject(res.data || { message: 'request failed' })
      },
      fail: reject
    })
  })
}

module.exports = { request }
