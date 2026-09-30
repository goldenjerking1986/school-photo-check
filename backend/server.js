const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const path = require('path')
const authRoutes = require('./src/routes/auth')
const uploadRoutes = require('./src/routes/upload')
const photosRoutes = require('./src/routes/photos')
const config = require('./src/config')

const app = express()

app.use(cors())
app.use(bodyParser.json({ limit: '10mb' }))
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }))

// 静态网站：管理后台入口
const adminDir = path.join(__dirname, '..', 'admin')
app.use(express.static(adminDir))

app.use('/auth', authRoutes)
app.use('/upload', uploadRoutes)
app.use('/photos', photosRoutes)

app.get('/health', (req, res) => {
  res.json({ success: true, message: 'ok' })
})

app.listen(config.port, () => {
  console.log(`Server running on http://localhost:${config.port}`)
})
