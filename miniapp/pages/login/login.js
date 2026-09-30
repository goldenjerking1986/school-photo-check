Page({
  data: {
    orgName: '某学院',
    loading: false
  },

  onLoad(options) {
    if (options.orgName) {
      const decoded = decodeURIComponent(options.orgName)
      this.setData({ orgName: decoded })
      wx.setStorageSync('orgName', decoded)
    }
  },

  onGetUserProfile() {
    if (this.data.loading) return
    this.setData({ loading: true })

    wx.login({
      success: (loginRes) => {
        if (!loginRes.code) {
          this.loginFailed('未获取到微信登录凭证')
          return
        }

        wx.getUserProfile({
          desc: '用于记录上传者姓名和头像',
          success: (profileRes) => {
            this.exchangeToken(loginRes.code, profileRes.userInfo)
          },
          fail: () => {
            // 用户不授权头像昵称仍可登录，后端只使用 openid
            this.exchangeToken(loginRes.code, null)
          }
        })
      },
      fail: () => this.loginFailed('微信登录失败')
    })
  },

  exchangeToken(code, userInfo) {
    wx.request({
      url: 'https://api.yourdomain.com/auth/login',
      method: 'POST',
      data: { code, userInfo },
      success: (resp) => {
        const result = resp.data
        if (!result || !result.success || !result.data || !result.data.token) {
          this.loginFailed((result && result.message) || '登录接口返回异常')
          return
        }

        wx.setStorageSync('sessionToken', result.data.token)
        wx.setStorageSync('user', result.data.user)
        wx.showToast({ title: '登录成功' })
        setTimeout(() => {
          wx.navigateTo({ url: '/pages/capture/capture?taskId=1&orgId=1' })
        }, 500)
      },
      fail: () => this.loginFailed('网络异常，登录失败'),
      complete: () => this.setData({ loading: false })
    })
  },

  loginFailed(message) {
    this.setData({ loading: false })
    wx.showToast({ title: message, icon: 'none' })
  }
})
