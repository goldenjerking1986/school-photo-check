CREATE DATABASE IF NOT EXISTS school_photo_check CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE school_photo_check;

CREATE TABLE IF NOT EXISTS organizations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  code VARCHAR(50) UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  openid VARCHAR(200) NOT NULL UNIQUE,
  nickname VARCHAR(100),
  org_id INT,
  role ENUM('uploader', 'admin', 'auditor') DEFAULT 'uploader',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tasks (
  id INT AUTO_INCREMENT PRIMARY KEY,
  org_id INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  task_date DATE,
  status ENUM('active', 'closed') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS photos (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  org_id INT,
  task_id INT,
  uploader_id INT,
  file_path VARCHAR(1024) NOT NULL,
  thumb_path VARCHAR(1024),
  capture_time DATETIME,
  upload_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  latitude DOUBLE,
  longitude DOUBLE,
  location_text VARCHAR(512),
  org_name VARCHAR(255),
  md5 CHAR(64),
  status ENUM('uploaded', 'reviewed', 'rejected') DEFAULT 'uploaded',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS photo_logs (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  photo_id BIGINT NOT NULL,
  action ENUM('upload', 'view', 'download', 'review', 'reject') NOT NULL,
  operator_id INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS folders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  org_id INT NOT NULL,
  task_id INT,
  folder_path VARCHAR(1024) NOT NULL,
  folder_name VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
