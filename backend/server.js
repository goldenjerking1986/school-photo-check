const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const path = require('path')
const authRoutes = require('./src/routes/auth')
const uploadRoutes = require('./src/routes/upload')
const photosRoutes = require('./src/routes/photos')
const reviewRoutes = require('./src/routes/review')
const exportRoutes = require('./src/routes/export')
const qrRoutes = require('./src/routes/qr')
const config = require('./src/config')

const app = express()

app.use(cors())
app.use(bodyParser.json({ limit: '20mb' }))
app.use(bodyParser.urlencoded({ extended: true, limit: '20mb' }))

const adminDir = path.join(__dirname, '..', 'admin')
app.use(express.static(adminDir))

app.use('/auth', authRoutes)
app.use('/upload', uploadRoutes)
app.use('/photos', photosRoutes)
app.use('/review', reviewRoutes)
app.use('/export', exportRoutes)
app.use('/api/qr', qrRoutes)

app.get('/health', (req, res) => {
  res.json({ success: true, message: 'ok' })
})

app.listen(config.port, () => {
  console.log(`Server running on http://localhost:${config.port}`)
})
