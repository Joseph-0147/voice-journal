const AWS = require('aws-sdk');
const fs = require('fs');
const path = require('path');
const { randomUUID } = require('crypto');

/**
 * S3 Service for audio file storage
 */

class S3Service {
  constructor() {
    this.useLocalStorage =
      process.env.NODE_ENV !== 'production' &&
      (!process.env.AWS_ACCESS_KEY_ID ||
        !process.env.AWS_SECRET_ACCESS_KEY ||
        process.env.AWS_ACCESS_KEY_ID === 'your-aws-access-key' ||
        process.env.AWS_SECRET_ACCESS_KEY === 'your-aws-secret-key');
    this.localUploadDir = path.join(process.cwd(), 'uploads', 'audio');

    this.s3 = new AWS.S3({
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      region: process.env.AWS_REGION,
    });
    this.bucket = process.env.AWS_S3_BUCKET;
  }

  ensureLocalUploadDir() {
    fs.mkdirSync(this.localUploadDir, { recursive: true });
  }

  isLocalAudioUrl(url) {
    return typeof url === 'string' && url.startsWith('/uploads/audio/');
  }

  getLocalFilePath(url) {
    const relativePath = url.replace('/uploads/audio/', '');
    return path.join(this.localUploadDir, relativePath);
  }

  /**
   * Upload audio file to S3
   */
  async uploadAudio(buffer, key) {
    try {
      if (this.useLocalStorage) {
        this.ensureLocalUploadDir();
        const safeName = `${randomUUID()}_${path.basename(key)}`;
        const filePath = path.join(this.localUploadDir, safeName);
        fs.writeFileSync(filePath, buffer);
        return `/uploads/audio/${safeName}`;
      }

      const params = {
        Bucket: this.bucket,
        Key: key,
        Body: buffer,
        ContentType: 'audio/m4a',
        ServerSideEncryption: 'AES256',
      };

      const result = await this.s3.upload(params).promise();
      return result.Location;
    } catch (error) {
      console.error('S3 upload error:', error);

      if (process.env.NODE_ENV !== 'production') {
        this.ensureLocalUploadDir();
        const safeName = `${randomUUID()}_${path.basename(key)}`;
        const filePath = path.join(this.localUploadDir, safeName);
        fs.writeFileSync(filePath, buffer);
        return `/uploads/audio/${safeName}`;
      }

      throw new Error('Failed to upload audio file');
    }
  }

  /**
   * Download audio file from S3
   */
  async downloadAudio(url) {
    try {
      if (this.isLocalAudioUrl(url)) {
        return fs.readFileSync(this.getLocalFilePath(url));
      }

      const key = url.split('/').slice(-2).join('/'); // Extract key from URL
      
      const params = {
        Bucket: this.bucket,
        Key: key,
      };

      const result = await this.s3.getObject(params).promise();
      return result.Body;
    } catch (error) {
      console.error('S3 download error:', error);
      throw new Error('Failed to download audio file');
    }
  }

  /**
   * Delete audio file from S3
   */
  async deleteAudio(url) {
    try {
      if (this.isLocalAudioUrl(url)) {
        const filePath = this.getLocalFilePath(url);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
        return;
      }

      const key = url.split('/').slice(-2).join('/');
      
      const params = {
        Bucket: this.bucket,
        Key: key,
      };

      await this.s3.deleteObject(params).promise();
    } catch (error) {
      console.error('S3 delete error:', error);
      throw new Error('Failed to delete audio file');
    }
  }

  /**
   * Generate presigned URL for audio playback
   */
  async getSignedUrl(url, expiresIn = 3600) {
    try {
      if (this.isLocalAudioUrl(url)) {
        return url;
      }

      const key = url.split('/').slice(-2).join('/');
      
      const params = {
        Bucket: this.bucket,
        Key: key,
        Expires: expiresIn, // 1 hour default
      };

      return this.s3.getSignedUrl('getObject', params);
    } catch (error) {
      console.error('S3 signed URL error:', error);
      throw new Error('Failed to generate signed URL');
    }
  }
}

module.exports = new S3Service();
