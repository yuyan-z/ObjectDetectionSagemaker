import { S3Client, GetObjectCommand, ListObjectsV2Command } from "@aws-sdk/client-s3";
import dotenv from "dotenv";

dotenv.config();

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

export const getOutput = async (req, res) => {
  try {
    const user_id = req.user._id;
    const { date } = req.body;
    const year = date.split("-")[0];
    const month = date.split("-")[1];
    const day = date.split("-")[2];
    const prefix = `${user_id}/${process.env.PREFIX_OUTPUT}/${year}/${month}/${day}/`;
    console.log("getOutput", prefix);

    const listCommand = new ListObjectsV2Command({
      Bucket: process.env.AWS_S3_BUCKET,
      Prefix: prefix,
    });
    const listResponse = await s3.send(listCommand);
    const files = listResponse.Contents || [];

    const results = [];
    for (const file of files) {
      const getCommand = new GetObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET,
        Key: file.Key,
      });

      const s3Response = await s3.send(getCommand);
      const streamToBuffer = (stream) =>
        new Promise((resolve, reject) => {
          const chunks = [];
          stream.on("data", (chunk) => chunks.push(chunk));
          stream.on("end", () => resolve(Buffer.concat(chunks)));
          stream.on("error", reject);
        });

      const butter = await streamToBuffer(s3Response.Body);
      results.push({
        key: file.Key.replace(prefix, ""),
        base64: butter.toString("base64")
      });
    }

    return res.status(200).json({ files: results, count: results.length });
  } catch (error) {
    console.error("getOuput error:", error);
    return res.status(500).json({ message: "Failed to load data from S3." });
  }
};
