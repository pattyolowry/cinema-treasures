import { SQSClient, SendMessageCommand } from "@aws-sdk/client-sqs";
import config from "../utils/config";

const sqs = new SQSClient({ region: config.AWS_REGION });

const main = async () => {
  console.log(config.AWS_REGION);
  console.log(config.SQS_QUEUE_URL);
  await sqs.send(
    new SendMessageCommand({
      QueueUrl: config.SQS_QUEUE_URL!,
      MessageBody: JSON.stringify({ hello: "world" }),
    }),
  );
  console.log("sent");
};

main().catch(console.error);
