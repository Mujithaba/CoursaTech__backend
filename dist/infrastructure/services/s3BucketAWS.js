"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_s3_1 = require("@aws-sdk/client-s3");
const lib_storage_1 = require("@aws-sdk/lib-storage");
const stream_1 = require("stream");
const crypto_1 = __importDefault(require("crypto"));
const path_1 = __importDefault(require("path"));
const s3_request_presigner_1 = require("@aws-sdk/s3-request-presigner");
class S3Uploader {
    constructor() {
        this.uploadImage = async (image) => {
            return this.uploadFile(image, "images");
        };
        this.uploadVideo = async (video) => {
            return this.uploadFile(video, "videos");
        };
        this.uploadPDF = async (pdf) => {
            return this.uploadFile(pdf, "pdfs");
        };
        this.getSignedUrl = async (fileName, expiresIn = 3600) => {
            const getObjectParams = {
                Bucket: this.bucketName,
                Key: fileName,
            };
            try {
                const command = new client_s3_1.GetObjectCommand(getObjectParams);
                const signedUrl = await (0, s3_request_presigner_1.getSignedUrl)(this.s3Client, command, {
                    expiresIn,
                });
                return signedUrl;
            }
            catch (error) {
                console.error(`Error generating signed URL for file ${fileName}:`, error);
                throw error;
            }
        };
        this.bucketName = process.env.BUCKET_NAME;
        this.bucketRegion = process.env.BUCKET_REGION;
        this.s3AccessKey = process.env.S3_ACCESS_KEY;
        this.s3SecretAccessKey = process.env.S3_SECRET_ACCESS_KEY;
        this.s3Client = new client_s3_1.S3Client({
            credentials: {
                accessKeyId: this.s3AccessKey,
                secretAccessKey: this.s3SecretAccessKey,
            },
            region: this.bucketRegion,
        });
    }
    generateUniqueFileName(originalName) {
        const ext = path_1.default.extname(originalName);
        const randomName = crypto_1.default.randomBytes(32).toString("hex");
        return `${randomName}${ext}`;
    }
    async uploadFile(file, folder) {
        console.log("Uploading to S3...");
        if (!file.buffer) {
            throw new Error("File buffer is missing.");
        }
        const stream = stream_1.Readable.from(file.buffer);
        const fileName = `${folder}/${this.generateUniqueFileName(path_1.default.basename(file.originalname, path_1.default.extname(file.originalname)))}`;
        const contentType = file.mimetype;
        const uploadParams = {
            Bucket: this.bucketName,
            Key: fileName,
            Body: stream,
            ContentType: contentType,
        };
        try {
            const uploader = new lib_storage_1.Upload({
                client: this.s3Client,
                params: uploadParams,
            });
            await uploader.done();
            console.log(`${file.originalname} uploaded successfully as ${fileName}`);
            return fileName;
        }
        catch (error) {
            console.error(`Error uploading ${file.originalname} to S3:`, error);
            throw error;
        }
    }
}
exports.default = S3Uploader;
