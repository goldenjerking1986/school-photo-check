const { request } = require('../../utils/request')

Page({
  data: {
    taskId: '',
    orgId: '',
    orgName: '某学院',
    tempImagePath: '',
    watermarkedPath: '',
    captureTime: '',
    locationText: '',
    ready: false
  },

  onLoad(options) {
    const taskId = options.taskId || ''
    const orgId = options.orgId || ''
    const orgName = options.orgName ? decodeURIComponent(options.orgName) : wx.getStorageSync('orgName') || '某学院'
    this.setData({ taskId, orgId, orgName, ready: true })
  },

  takePhoto() {
    const ctx = wx.createCameraContext()
    ctx.takePhoto({
      quality: 'high',
      success: (res) => {
        const imagePath = res.tempImagePath
        this.setData({ tempImagePath: imagePath })
        this.getLocationAndGenerateWatermark(imagePath)
      },
      fail: () => {
        wx.showToast({ title: '拍照失败', icon: 'none' })
      }
    })
  },

  getLocationAndGenerateWatermark(imagePath) {
    wx.showLoading({ title: '定位与生成水印中...' })

    wx.getLocation({
      type: 'gcj02',
      success: (loc) => {
        const lat = loc.latitude
        const lon = loc.longitude
        const ts = new Date()
        const captureTime = ts.toISOString().replace('T', ' ').split('.')[0]
        this.setData({ captureTime, locationText: `${lat.toFixed(5)}, ${lon.toFixed(5)}` })

        const watermarkText = `${this.data.orgName} | ${captureTime} | ${this.data.locationText}`

        this.drawWatermark(imagePath, watermarkText, (watermarkedPath) => {
          this.setData({ watermarkedPath: watermarkedPath })
          this.uploadPhoto(watermarkedPath, captureTime, lat, lon)
        })
      },
      fail: () => {
        wx.hideLoading()
        wx.showModal({
          title: '定位失败',
          content: '获取位置信息失败，请允许定位后再上传。',
          showCancel: false
        })
      }
    })
  },

  drawWatermark(imagePath, watermarkText, callback) {
    wx.getImageInfo({
      src: imagePath,
      success: (info) => {
        const width = info.width
        const height = info.height
        const canvasId = 'waterCanvas'
        const ctx = wx.createCanvasContext(canvasId, this)

        ctx.drawImage(imagePath, 0, 0, width, height)

        const barHeight = Math.round(Math.max(60, height * 0.06))
        ctx.setFillStyle('rgba(0,0,0,0.42)')
        ctx.fillRect(0, height - barHeight, width, barHeight)

        const fontSize = Math.round(Math.max(28, width * 0.03))
        ctx.setFontSize(fontSize)
        ctx.setFillStyle('#ffffff')
        ctx.setTextAlign('left')

        const padding = 20
        const approxChars = Math.floor((width - 2 * padding) / (fontSize * 0.6))
        const lines = []
        let text = watermarkText
        while (text.length > approxChars) {
          lines.push(text.slice(0, approxChars))
          text = text.slice(approxChars)
        }
        if (text.length) lines.push(text)

        lines.forEach((ln, idx) => {
          const y = height - barHeight + padding + (idx + 1) * (fontSize + 4)
          ctx.fillText(ln, padding, y)
        })

        ctx.setFontSize(Math.round(fontSize * 0.9))
        ctx.fillText('教学场所检查', width - 220, height - barHeight + padding + 20)

        ctx.draw(false, () => {
          wx.canvasToTempFilePath({
            canvasId,
            x: 0,
            y: 0,
            width,
            height,
            destWidth: width,
            destHeight: height,
            success: (res) => {
              callback(res.tempFilePath)
            },
            fail: (err) => {
              wx.hideLoading()
              wx.showToast({ title: '水印生成失败', icon: 'none' })
              console.error('canvasToTempFilePath fail', err)
            }
          }, this)
        })
      },
      fail: (err) => {
        wx.hideLoading()
        wx.showToast({ title: '读取图片信息失败', icon: 'none' })
        console.error('getImageInfo fail', err)
      }
    })
  },

  uploadPhoto(filePath, captureTime, lat, lon) {
    const uploadUrl = 'https://api.yourdomain.com/upload/photo'

    wx.uploadFile({
      url: uploadUrl,
      filePath,
      name: 'file',
      formData: {
        taskId: this.data.taskId,
        orgId: this.data.orgId,
        captureTime,
        latitude: lat,
        longitude: lon,
        locationText: this.data.locationText,
        orgName: this.data.orgName
      },
      header: {
        Authorization: `Bearer ${wx.getStorageSync('sessionToken')}`
      },
      success: (res) => {
        wx.hideLoading()
        try {
          const data = JSON.parse(res.data)
          if (data.success) {
            wx.showToast({ title: '上传成功' })
            setTimeout(() => {
              wx.navigateBack()
            }, 800)
          } else {
            wx.showToast({ title: data.message || '上传失败', icon: 'none' })
          }
        } catch (e) {
          wx.showToast({ title: '上传返回解析失败', icon: 'none' })
        }
      },
      fail: (err) => {
        wx.hideLoading()
        wx.showToast({ title: '网络异常，请重试', icon: 'none' })
        console.error('uploadFile fail', err)
      }
    })
  }
})
