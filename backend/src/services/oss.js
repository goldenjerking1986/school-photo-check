const fs = require('fs')
const path = require('path')
const crypto = require('crypto')
const COS = require('cos-nodejs-sdk-v5')
const OSS = require('ali-oss')
const config = require('../config')

let cosClient = null
if (config.cos && config.cos.secretId && config.cos.secretKey) {
  cosClient = new COS({
    SecretId: config.cos.secretId,
    SecretKey: config.cos.secretKey
  })
}

let ossClient = null
if (config.oss && config.oss.accessKeyId && config.oss.accessKeySecret) {
  ossClient = new OSS({
    region: config.oss.region,
    accessKeyId: config.oss.accessKeyId,
    accessKeySecret: config.oss.accessKeySecret,
    bucket: config.oss.bucket
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

function uploadToCos(filePath, targetKey) {
  return new Promise((resolve, reject) => {
    if (!cosClient) return reject(new Error('COS not configured'))
    cosClient.putObject({
      Bucket: config.cos.bucket,
      Region: config.cos.region,
      Key: targetKey,
      Body: fs.createReadStream(filePath),
      ContentLength: fs.statSync(filePath).size
    }, (err, data) => {
      if (err) return reject(err)
      resolve({ url: `https://${config.cos.bucket}.cos.${config.cos.region}.myqcloud.com/${targetKey}`, data })
    })
  })
}

async function uploadBufferToCos(buffer, targetKey) {
  if (!cosClient) throw new Error('COS not configured')
  return new Promise((resolve, reject) => {
    cosClient.putObject({
      Bucket: config.cos.bucket,
      Region: config.cos.region,
      Key: targetKey,
      Body: buffer,
      ContentLength: buffer.length
    }, (err, data) => {
      if (err) return reject(err)
      resolve({ url: `https://${config.cos.bucket}.cos.${config.cos.region}.myqcloud.com/${targetKey}`, data })
    })
  })
}

async function uploadBufferToOss(buffer, targetKey) {
  if (!ossClient) throw new Error('OSS not configured')
  // ali-oss put can accept Buffer
  const result = await ossClient.put(targetKey, buffer)
  // result.url may be filled
  return { url: result.url || `https://${config.oss.bucket}.${config.oss.region}.aliyuncs.com/${targetKey}`, data: result }
}

async function uploadBuffer(buffer, targetKey) {
  const provider = (process.env.STORAGE_PROVIDER || 'cos').toLowerCase()
  if (provider === 'oss') {
    return await uploadBufferToOss(buffer, targetKey)
  }
  // default cos
  return await uploadBufferToCos(buffer, targetKey)
}

module.exports = {
  uploadToCos,
  calculateMd5,
  uploadBuffer,
  uploadBufferToCos,
  uploadBufferToOss
}
