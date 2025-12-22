const AWS = require('aws-sdk');

/**
 * S3 Service for audio file storage
 */

class S3Service {
  constructor() {
    this.s3 = new AWS.S3({
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      region: process.env.AWS_REGION,
    });
    this.bucket = process.env.AWS_S3_BUCKET;
  }

  /**
   * Upload audio file to S3
   */
  async uploadAudio(buffer, key) {
    try {
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
      throw new Error('Failed to upload audio file');
    }
  }

  /**
   * Download audio file from S3
   */
  async downloadAudio(url) {
    try {
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
