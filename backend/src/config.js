module.exports = {
  port: process.env.PORT || 3000,
  jwtSecret: process.env.JWT_SECRET || 'replace-with-real-secret',
  db: {
    host: process.env.DB_HOST || '127.0.0.1',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || 'root',
    database: process.env.DB_NAME || 'school_photo_check',
    port: process.env.DB_PORT || 3306
  },
  cos: {
    bucket: process.env.COS_BUCKET || 'your-bucket-1250000000',
    region: process.env.COS_REGION || 'ap-guangzhou',
    secretId: process.env.COS_SECRET_ID || 'YOUR_SECRET_ID',
    secretKey: process.env.COS_SECRET_KEY || 'YOUR_SECRET_KEY'
  },
  uploadPath: process.env.UPLOAD_PATH || 'tmp/uploads'
}
