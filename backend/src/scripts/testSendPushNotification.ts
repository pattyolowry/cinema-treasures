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
    webPushSubscriptions: { $exists: true, $ne: [] },
  });

  console.log("Fetched users");

  for (const user of users) {
    for (const subscription of user.webPushSubscriptions) {
      await webpush.sendNotification(
        subscription,
        JSON.stringify({
          title: "Treasure Trove Updated",
          body: `Patio updated his rating for The Matrix (1999): None --> 10`,
          url: `/treasure-trove`,
        }),
      );
      console.log("Sent push notification");
    }
  }
  await mongoose.connection.close();
};

main().catch(console.error);
