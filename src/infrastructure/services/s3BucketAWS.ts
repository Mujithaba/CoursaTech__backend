import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import { Readable } from "stream";
import crypto from "crypto";
import path from "path";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

interface IFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  buffer: Buffer;
  size: number;
  type: string;
}

export default class S3Uploader {
  private bucketName: string;
  private bucketRegion: string;
  private s3AccessKey: string;
  private s3SecretAccessKey: string;
  private s3Client: S3Client;

  constructor() {
    this.bucketName = process.env.BUCKET_NAME as string;
    this.bucketRegion = process.env.BUCKET_REGION as string;
    this.s3AccessKey = process.env.S3_ACCESS_KEY as string;
    this.s3SecretAccessKey = process.env.S3_SECRET_ACCESS_KEY as string;
    this.s3Client = new S3Client({
      credentials: {
        accessKeyId: this.s3AccessKey,
        secretAccessKey: this.s3SecretAccessKey,
      },
      region: this.bucketRegion,
    });
  }

  private generateUniqueFileName(originalName: string): string {
    const ext = path.extname(originalName);
    const randomName = crypto.randomBytes(32).toString("hex");
    return `${randomName}${ext}`;
  }

  private async uploadFile(
    file: Express.Multer.File,
    folder: string
  ): Promise<string> {
    console.log("Uploading to S3...");
    if (!file.buffer) {
      throw new Error("File buffer is missing.");
    }

    const stream = Readable.from(file.buffer);
    const fileName = `${folder}/${this.generateUniqueFileName(
      path.basename(file.originalname, path.extname(file.originalname))
    )}`;
    const contentType = file.mimetype;

    const uploadParams = {
      Bucket: this.bucketName,
      Key: fileName,
      Body: stream,
      ContentType: contentType,
    };

    try {
      const uploader = new Upload({
        client: this.s3Client,
        params: uploadParams,
      });
      await uploader.done();
      console.log(`${file.originalname} uploaded successfully as ${fileName}`);
      return fileName;
    } catch (error) {
      console.error(`Error uploading ${file.originalname} to S3:`, error);
      throw error;
    }
  }

  public uploadImage = async (image: Express.Multer.File): Promise<string> => {
    return this.uploadFile(image, "images");
  };

  public uploadVideo = async (video: Express.Multer.File): Promise<string> => {
    return this.uploadFile(video, "videos");
  };

  public uploadPDF = async (pdf: Express.Multer.File): Promise<string> => {
    return this.uploadFile(pdf, "pdfs");
  };

  public getSignedUrl = async (
    fileName: string,
    expiresIn: number = 3600
  ): Promise<string> => {
    const getObjectParams = {
      Bucket: this.bucketName,
      Key: fileName,
    };

    try {
      const command = new GetObjectCommand(getObjectParams);
      const signedUrl = await getSignedUrl(this.s3Client, command, {
        expiresIn,
      });
      return signedUrl;
    } catch (error) {
      console.error(`Error generating signed URL for file ${fileName}:`, error);
      throw error;
    }
  };
}
