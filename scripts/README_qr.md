生成二维码脚本说明

本目录包含两个脚本：

1. generate_qr_url.js
   - 用途：生成普通二维码（指向 H5 中转页面或直接链接）。
   - 输出：scripts/qr_url.png
   - 读取环境变量：BASE_URL, TASK_ID, ORG_ID, ORG_NAME
   - 使用：
     npm install qrcode dotenv
     BASE_URL="https://yourdomain.com/scan" TASK_ID=1 ORG_ID=1 ORG_NAME="某学院" node scripts/generate_qr_url.js

2. generate_miniapp_qrcode.js
   - 用途：生成微信小程序二维码（可直接用微信扫一扫打开小程序并带 scene 参数）。
   - 输出：scripts/miniapp-qrcode.png
   - 读取环境变量：WX_APPID, WX_SECRET, 可选 SCENE, PAGE, WIDTH
   - 使用：
     npm install axios dotenv
     WX_APPID=wx123... WX_SECRET=abcd... SCENE="orgId=1&taskId=15" PAGE="pages/capture/capture" node scripts/generate_miniapp_qrcode.js

安全提醒：
- WX_SECRET 为敏感信息，仅在服务端环境使用，切勿放到前端或提交到 Git 仓库。
- 生成小程序二维码需要调用微信���口，建议在受控服务器环境中运行。

示例：在仓库根目录执行（Linux / macOS）

```bash
# 安装必要依赖
npm install qrcode axios dotenv

# 生成普通 H5 链接二维码
BASE_URL="https://yourdomain.com/scan" TASK_ID=15 ORG_ID=1 ORG_NAME="某学院" node scripts/generate_qr_url.js

# 生成小程序二维码（需要有效 WX_APPID/WX_SECRET）
export WX_APPID=wx1234567890abcdef
export WX_SECRET=your_wechat_app_secret
export SCENE="orgId=1&taskId=15"
export PAGE="pages/capture/capture"
node scripts/generate_miniapp_qrcode.js
```
