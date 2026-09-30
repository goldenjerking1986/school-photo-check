Page({
  data: {
    orgName: '某学院'
  },

  onLoad(options) {
    const orgName = options.orgName
    if (orgName) {
      const decoded = decodeURIComponent(orgName)
      this.setData({ orgName: decoded })
      wx.setStorageSync('orgName', decoded)
    }
  },

  goCapture() {
    wx.navigateTo({
      url: '/pages/capture/capture?taskId=1&orgId=1'
    })
  }
})
