import webpush from "web-push";
import config from "../utils/config";
import User from "../models/user";
import connectToDatabase from "../utils/db";
import mongoose from "mongoose";

const main = async () => {
  await connectToDatabase(config.MONGODB_URI);
  webpush.setVapidDetails(
    `mailto:${config.SUPPORT_EMAIL}`,
    config.VAPID_PUBLIC_KEY!,
    config.VAPID_PRIVATE_KEY!,
  );

  console.log("Set vapid details");

  const users = await User.find({
    webPushSubscription: { $exists: true },
  });

  console.log("Fetched users");

  for (const user of users) {
    if (!user.webPushSubscription) continue;

    await webpush.sendNotification(
      user.webPushSubscription,
      JSON.stringify({
        title: "Treasure Trove Updated",
        body: `Patio updated his rating for The Matrix (1999): 9 --> 10`,
        url: `/treasure-trove/69c1e70d15ab05d3e9cf7c59`,
      }),
    );
    console.log("Sent push notification");
  }
  await mongoose.connection.close();
};

main().catch(console.error);
