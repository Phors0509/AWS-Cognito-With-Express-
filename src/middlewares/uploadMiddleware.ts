import { S3Client } from '@aws-sdk/client-s3';
import multer from "multer";
import multerS3 from "multer-s3";

const s3 = new S3Client({
    region: process.env.AWS_REGION,
});

export const upload = multer({
    storage: multerS3({
        s3: s3,
        bucket: "sophornbucket",
        metadata: (_req, file, cb) => {
            cb(null, { fieldName: file.fieldname });
        },
        key: (_req, file, cb) => {
            cb(null, `uploads/${Date.now().toString()}_${file.originalname}`);
        },
    }),
    limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB limit
    fileFilter: (_req, file, cb) => {
        // Accept images only
        if (!file.mimetype.startsWith('image/')) {
            return cb(new Error("Only images are allowed") as any, false);
        }
        cb(null, true);
    },
});
