# 二维码与扫码接入说明

建议使用微信小程序码或二维码中携带任务参数：

```text
https://yourdomain.com/scan?orgId=1&taskId=15&orgName=%E6%9F%90%E5%A4%A7%E5%AD%A6
```

在页面中读取参数后，跳转到拍照页：

```javascript
wx.navigateTo({
  url: '/pages/capture/capture?taskId=1&orgId=1&orgName=%E6%9F%90%E5%A4%A7%E5%AD%A6'
})
```

更多推荐方式：
- 使用微信小程序码（path 带参数）
- 后台生成二维码，并在扫码后直接打开小程序
- 在小程序中做权限和任务校验
