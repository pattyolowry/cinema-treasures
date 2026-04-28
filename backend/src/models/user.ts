import mongoose from "mongoose";
import { PushSubscription } from "../types";

const webPushSubscriptionSchema = new mongoose.Schema<PushSubscription>(
  {
    endpoint: {
      type: String,
      required: true,
    },

    keys: {
      type: {
        p256dh: {
          type: String,
          required: true,
        },
        auth: {
          type: String,
          required: true,
        },
      },
      required: true,
      _id: false,
    },
  },
  {
    _id: false,
  },
);

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  admin: Boolean,
  webPushSubscriptions: {
    type: [webPushSubscriptionSchema],
    default: [],
  },
});

userSchema.set("toJSON", {
  transform: (_document, returnedObject: any) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
    delete returnedObject.passwordHash;
  },
});

const User = mongoose.model("User", userSchema);
export default User;
