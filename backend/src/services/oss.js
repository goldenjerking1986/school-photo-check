const fs = require('fs')
const crypto = require('crypto')
const COS = require('cos-nodejs-sdk-v5')
const config = require('../config')

const cos = new COS({
  SecretId: config.cos.secretId,
  SecretKey: config.cos.secretKey
})

function uploadToCos(filePath, targetKey) {
  return new Promise((resolve, reject) => {
    cos.putObject({
      Bucket: config.cos.bucket,
      Region: config.cos.region,
      Key: targetKey,
      Body: fs.createReadStream(filePath),
      ContentLength: fs.statSync(filePath).size
    }, (err, data) => {
      if (err) return reject(err)
      resolve({
        url: `https://${config.cos.bucket}.cos.${config.cos.region}.myqcloud.com/${targetKey}`,
        data
      })
    })
  })
}

function calculateMd5(filePath) {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash('md5')
    const stream = fs.createReadStream(filePath)
    stream.on('error', reject)
    stream.on('data', chunk => hash.update(chunk))
    stream.on('end', () => resolve(hash.digest('hex')))
  })
}

module.exports = {
  uploadToCos,
  calculateMd5
}
