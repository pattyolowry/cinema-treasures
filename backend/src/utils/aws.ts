import config from "./config";
import { S3Client } from "@aws-sdk/client-s3";
import { SQSClient } from "@aws-sdk/client-sqs";

export const s3 = new S3Client({
  region: config.AWS_REGION,
});

export const sqs = new SQSClient({ region: config.AWS_REGION });
