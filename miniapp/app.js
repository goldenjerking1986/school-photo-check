App({
  onLaunch() {
    wx.login({
      success: (res) => {
        if (res.code) {
          wx.request({
            url: 'https://api.yourdomain.com/auth/login',
            method: 'POST',
            data: { code: res.code },
            success: (resp) => {
              const data = resp.data
              if (data && data.success && data.data) {
                wx.setStorageSync('sessionToken', data.data.token)
                wx.setStorageSync('openid', data.data.openid)
              } else {
                console.error('login failed', data)
              }
            },
            fail: (err) => {
              console.error('login request failed', err)
            }
          })
        }
      }
    })
  }
})
