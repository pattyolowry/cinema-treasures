import { SQSClient, SendMessageCommand } from "@aws-sdk/client-sqs";
import config from "../utils/config";

const sqs = new SQSClient({ region: config.AWS_REGION });

const main = async () => {
  console.log(config.AWS_REGION);
  console.log(config.SQS_QUEUE_URL);
  await sqs.send(
    new SendMessageCommand({
      QueueUrl: config.SQS_QUEUE_URL!,
      MessageBody: JSON.stringify({
        type: "TREASURE_ADDED",
        user: "Patio",
        movieId: "69b47333e4360a983c3adb5d",
      }),
    }),
  );
  console.log("sent");
};

main().catch(console.error);
