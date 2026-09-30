# 教学场所检查照片上传 - 生产增强版说明

本增强版在最小可用 MVP 基础上补齐了以下关键能力：

- 更稳的鉴权：登录返回 token，后台请求校验 Bearer token
- 后台查询增强：支持 summary、过滤和按任务/日期统计
- 管理端登录面板：说明 token 登录方式，便于快速演示
- SQL 初始化补充：插入示例组织和任务，便于第一批测试

## 关键修改点

1. `backend/src/routes/auth.js`
   - 新增 `buildMockToken` / `parseToken`
   - 新增 `/profile` 端点，方便后台验证登录状态

2. `backend/src/routes/photos.js`
   - 增强了 `GET /photos` 和 `GET /photos/summary`
   - 增加了 `authRequired` middleware

3. `backend/src/routes/upload.js`
   - 上传接口要求 Bearer token，确保只有登录用户才能上传

4. `admin/index.html` / `admin/app.js` / `admin/styles.css`
   - 新增登录面板和总览卡片
   - 支持总览统计和列表查询

5. `backend/sql/schema.sql`
   - 增加示例组织和任务数据，方便测试

## 登录方式

演示中，后台管理页可以手动输入：

```text
Bearer <token>
```

在微信 login 接口返回结果中，token 即为后台登录所需凭据；生产环境建议换成 JWT + 密钥加密。

## 接下来可继续做

- 加入真实 JWT / Redis session
- 增加图片审核接口：review/reject
- 增加 Excel 导出
- 增加地图可视化（按地点聚集）
- 加入分权限：管理员、审核员、老师

## 运行方式

```bash
cd backend
npm install
npm run dev
```

然后打开：

```text
http://localhost:8080
```

如果你想继续，我下一步可以直接给你：
- 真实 JWT 版鉴权代码
- 审核端/审核状态接口
- Excel 导出组件
- 组织/角色和任务管理后台
