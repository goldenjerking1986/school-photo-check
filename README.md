# 教学场所检查照片上传 - 使用说明补充（WeChat 小程序 AppID/Secret 与登录接入）

下面说明如何配置与使用微信小程序的 AppID/Secret，并把相关占位说明写入仓库（.env.example）。请在部署前按照下列步骤完成配置：

1) 在仓库中填写环境变量
- 根目录下有 `.env.example`，后台中也有 `backend/.env.example`。
- 复制为 `.env`（或通过你的部署工具填入环境变量），并替换以下项：
  - WX_APPID=wxxxxxxxxxxxxxxxxx
  - WX_SECRET=your_wechat_app_secret
  - JWT_SECRET=replace-with-very-strong-random-string
  - DB_*、COS_* 等根据你的环境替换

示例：
```
WX_APPID=wx1234567890abcdef
WX_SECRET=abcd1234efgh5678ijkl9012mnop3456
JWT_SECRET=超长随机字符串请妥善保管
DB_HOST=127.0.0.1
DB_USER=root
DB_PASS=your_db_password
DB_NAME=school_photo_check
```

2) 微信小程序后台（必须）
- 登录微信公众平台（小程序）管理后台。
- 在【设置 > 开发设置】中确认你的 AppID。
- 在【开发设置 > 服务器域名】中，把后端 API 域名加入 request、uploadFile、downloadFile、websocket（如果使用）白名单。注意：
  - 域名必须使用 HTTPS，且证书有效
  - 在调试阶段可以使用微信开发者工具的“本地调试”或通过 ngrok/本地 HTTPS 代理进行调试

3) 后端环境变量生效
- 运行后端前，确保环境变量已注入到运行环境（systemd、docker-compose、PM2、heroku、云函数等）。
- 在 Linux/macOS 临时设置示例：
  export WX_APPID=wx123...
  export WX_SECRET=abcd...
  export JWT_SECRET='very-strong-secret'

4) 小程序端更改
- 小程序中 `miniapp/pages/login/login.js` 使用 wx.login + wx.getUserProfile -> POST /auth/login 的流程。
- 小程序发起请求时，后端会用 WX_APPID/WX_SECRET 调用微信接口 `jscode2session` 换取 openid。
- 后端会将用户信息写入 `users` 表并返回 JWT，前端需要把 JWT 存到 storage（示例使用 key `sessionToken`）。

5) 测试流程
- 在微信开发者工具中（使用真实 AppID 或测试号）：
  1. 打开小程序，点击“微信登录并进入拍照”，同意授权。
  2. 小程序会把 code + userInfo 发到后端 `/auth/login`。
  3. 后端返回 { success: true, data: { token, user } }，小程序保存 token。
  4. 拍照并上传时，上传接口会带上 Authorization: Bearer <token>。

6) 常见问题与排查
- "微信登录配置缺失"：说明后端没有读取到 WX_APPID/WX_SECRET，请检查环境变量是否正确设置并重启进程。
- "401 未授权"：确认请求头是否包含 Authorization: Bearer <token>，并确认 token 未过期。
- 微信开发者工具请求被拒：请确保你的请求域名已在小程序后台白名单中，或使用 HTTPS 暴露服务。

7) 安全建议
- WX_SECRET、JWT_SECRET 等敏感信息请仅放在安全的环境变量管理中（不要提交到 Git）。
- 在生产环境尽量使用云提供的密钥管理服务（如腾讯云 KMS、阿里云 KMS）或 CI/CD 的 secret 管理。

---

如果你希望，我可以：
- 把 `.env.example` 的变量名格式化为 Docker Compose 友好版本并提交 `docker-compose.yml` 模板；
- 或者在 `README.md` 中加入一节“微信小程序接入快速检查清单”；
- 也可以把小程序端需要在微信后台填写的具体域名和回调网址补入 `docs/qr-code-generation.md`。

请选择下一步（如：生成 docker-compose / 补 README 详细清单 / 补 docs）。
