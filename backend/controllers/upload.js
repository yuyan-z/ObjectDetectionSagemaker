import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import dotenv from "dotenv";
dotenv.config();

const now = new Date().toISOString();
const date = now.split("T")[0];
const year = date.split("-")[0];
const month = date.split("-")[1];
const day = date.split("-")[2];

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

export const uploadImage = async (req, res) => {
  try {
    
    const user_id = req.user._id;
    // console.log("uploadImage", user_id, req.files);

    if (!req.files || req.files.length === 0) {
      return res.status(400).send("No files uploaded.");
    }

    const uploadedFiles = [];
    for (const file of req.files) {
      const originalName = file.originalname;
      const key = `${user_id}/${process.env.PREFIX_INPUT}/${year}/${month}/${day}/${originalName}`
      const input = {
        Bucket: process.env.AWS_S3_BUCKET,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype
      };

      const command = new PutObjectCommand(input);
      const response = await s3.send(command);

      const fileUrl = `s3://${input.Bucket}/${input.Key}`;
      uploadedFiles.push({ name: originalName, url: fileUrl });
    }

    console.log("Uploaded files:", uploadedFiles);

    return res.json({
      message: "Files uploaded successfully.",
      status: "Success",
      count: uploadedFiles.length,
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: "S3 Upload failed",
      status: "Failed"
    });
  }
};
