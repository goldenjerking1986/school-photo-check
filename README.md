# 教学场所检查照片上传 - 完整代码包 (微信小程序 + 后端 + 管理后台)

这个仓库包含一个可运行的最小可用产品（MVP）实现：
- 微信小程序：拍照、读取地理位置、弹入水印（时间、地点、单位）、上传照片
- 后端：接收照片、上传对象存储、保存元数据、提供查询接口
- 管理后台：浏览、筛选、查看、下载照片列表
- MySQL 建表脚本：用来维护任务、照片、组织和日志信息

## 目录结构

```text
school-photo-check/
├─ miniapp/                       # 微信小程序
│  ├─ app.js
│  ├─ app.json
│  ├─ app.wxss
│  ├─ project.config.json
│  ├─ pages/
│  │  ├─ login/
│  │  │  ├─ login.js
│  │  │  ├─ login.wxml
│  │  │  └─ login.wxss
│  │  └─ capture/
│  │     ├─ capture.js
│  │     ├─ capture.wxml
│  │     └─ capture.wxss
│  └─ utils/
│     └─ request.js
├─ backend/
│  ├─ package.json
│  ├─ .gitignore
│  ├─ server.js
│  ├─ src/
│  │  ├─ config.js
│  │  ├─ db.js
│  │  ├─ routes/
│  │  │  ├─ auth.js
│  │  │  ├─ upload.js
│  │  │  └─ photos.js
│  │  ├─ services/
│  │  │  ├─ folder.js
│  │  │  └─ oss.js
│  │  └─ utils/
│  │     └─ logger.js
│  └─ sql/
│     └─ schema.sql
├─ admin/
│  ├─ index.html
│  ├─ app.js
│  └─ styles.css
├─ docs/
│  └─ qr-code-generation.md
└─ README.md
```

## 关键功能
- 微信扫一扫打开小程序
- 拍照上传校验照片
- 自动获取地理位置
- 图片烧入时间 + 地点 + 单位水印
- 后端给照片生成归档目录
- 管理后台可以查看照片列表、按日期/地点/任务筛选
- 数据库记录上传日志和 MD5

## 快速开始

### 1）安装后端依赖

```bash
cd backend
npm install
```

### 2）准备数据库

在 MySQL 中创建数据库并执行：

```bash
mysql -u root -p < backend/sql/schema.sql
```

### 3）配置环境变量/参数

修改 `backend/src/config.js`，填入：
- 数据库配置
- 微信小程序 AppID/Secret
- COS（或 OSS）参数

### 4）启动后端

```bash
cd backend
npm run dev
```

### 5）启动管理后台

使用一个静态文件服务器即可，例如：

```bash
cd admin
python3 -m http.server 8080
```

随后访问：
- http://localhost:8080

### 6）启动微信小程序

在微信开发者工具中打开 `miniapp/` 目录。

请替换：
- `miniapp/app.js` 中的后端请求地址 `https://api.yourdomain.com`
- `miniapp/pages/capture/capture.js` 中的上传地址 `https://api.yourdomain.com/upload/photo`

## 管理后台功能

后台支持：
- 查看照片列表
- 按 orgId / taskId / date 过滤
- 显示文件 URL、拍摄时间、地点、状态
- 导出/查看图片链接

## 后端说明

后端接口：
- `POST /auth/login`：微信 code -> openid/token
- `POST /upload/photo`：上传图片并保存到 COS
- `GET /photos`：查询照片列表
- `GET /health`：健康检查

## 生产注意事项
- 使用 HTTPS
- 加强 JWT / session 校验
- 保护 COS Secret Key
- 对上传照片做格式、大小和内容校验
- 在后台增加审核与下载权限控制

## 扫码场景

建议二维码内容放任务参数：

```text
https://yourdomain.com/scan?orgId=1&taskId=15&orgName=%E6%9F%90%E5%A4%A7%E5%AD%A6
```

然后在微信小程序 or H5 页面中解析参数并跳转到拍照页。

## 许可证

MIT
