import axios from "axios";
import utils from "./utils";
import type { PushSubscription } from "../types";

const baseUrl = `${utils.backendUrl()}/users/push-subscriptions`;

const addSubscription = async (subscription: PushSubscription) => {
  const response = await axios.post(
    baseUrl,
    subscription,
    utils.getAuthConfig(),
  );
  return response.data;
};

export default { addSubscription };
