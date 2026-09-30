const { request } = require('../../utils/request')

Page({
  data: {
    taskId: '', orgId: '', orgName: '某学院', tempImagePath: '',
    watermarkedPath: '', captureTime: '', locationText: '', ready: false
  },

  onLoad(options) {
    const orgName = options.orgName ? decodeURIComponent(options.orgName) : wx.getStorageSync('orgName') || '某学院'
    this.setData({ taskId: options.taskId || '', orgId: options.orgId || '', orgName, ready: true })
  },

  takePhoto() {
    const ctx = wx.createCameraContext()
    ctx.takePhoto({
      quality: 'high',
      success: (res) => {
        this.setData({ tempImagePath: res.tempImagePath })
        this.getLocationAndGenerateWatermark(res.tempImagePath)
      },
      fail: () => wx.showToast({ title: '拍照失败', icon: 'none' })
    })
  },

  getLocationAndGenerateWatermark(imagePath) {
    wx.showLoading({ title: '定位与生成水印中...' })
    wx.getLocation({
      type: 'gcj02',
      success: (loc) => {
        const captureTime = new Date().toISOString().replace('T', ' ').split('.')[0]
        const locationText = `${loc.latitude.toFixed(5)}, ${loc.longitude.toFixed(5)}`
        this.setData({ captureTime, locationText })
        this.drawWatermark(imagePath, `${this.data.orgName} | ${captureTime} | ${locationText}`, (path) => {
          this.setData({ watermarkedPath: path })
          this.uploadPhoto(path, captureTime, loc.latitude, loc.longitude)
        })
      },
      fail: () => {
        wx.hideLoading()
        wx.showModal({ title: '定位失败', content: '请允许微信使用位置后再上传。', showCancel: false })
      }
    })
  },

  drawWatermark(imagePath, text, callback) {
    wx.getImageInfo({
      src: imagePath,
      success: (info) => {
        const ctx = wx.createCanvasContext('waterCanvas', this)
        const { width, height } = info
        ctx.drawImage(imagePath, 0, 0, width, height)
        const barHeight = Math.max(80, Math.round(height * 0.08))
        ctx.setFillStyle('rgba(0,0,0,0.45)')
        ctx.fillRect(0, height - barHeight, width, barHeight)
        ctx.setFillStyle('#fff')
        ctx.setFontSize(Math.max(26, Math.round(width * 0.03)))
        ctx.fillText(text, 20, height - 28)
        ctx.draw(false, () => wx.canvasToTempFilePath({
          canvasId: 'waterCanvas', x: 0, y: 0, width, height,
          destWidth: width, destHeight: height,
          success: (result) => callback(result.tempFilePath),
          fail: () => { wx.hideLoading(); wx.showToast({ title: '水印生成失败', icon: 'none' }) }
        }, this))
      },
      fail: () => { wx.hideLoading(); wx.showToast({ title: '图片读取失败', icon: 'none' }) }
    })
  },

  uploadPhoto(filePath, captureTime, latitude, longitude) {
    const token = wx.getStorageSync('sessionToken') || ''
    if (!token) {
      wx.hideLoading()
      wx.showModal({ title: '请先登录', content: '登录后才能上传照片。', showCancel: false })
      return
    }

    wx.uploadFile({
      url: 'https://api.yourdomain.com/upload/photo',
      filePath,
      name: 'file',
      formData: {
        taskId: this.data.taskId, orgId: this.data.orgId, captureTime,
        latitude, longitude, locationText: this.data.locationText, orgName: this.data.orgName
      },
      header: { Authorization: `Bearer ${token}` },
      success: (res) => {
        wx.hideLoading()
        let result
        try { result = JSON.parse(res.data) } catch (e) { result = null }
        if (result && result.success) {
          wx.showToast({ title: '上传成功' })
          setTimeout(() => wx.navigateBack(), 800)
        } else wx.showToast({ title: (result && result.message) || '上传失败', icon: 'none' })
      },
      fail: () => { wx.hideLoading(); wx.showToast({ title: '网络异常，请重试', icon: 'none' }) }
    })
  }
})
