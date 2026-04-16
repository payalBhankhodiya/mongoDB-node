import Notification from "../models/notification.model.js";
import { getIO } from "../socket/socket.js";

export const sendNotification = async ({
  recipient,
  sender,
  type,
  post = null,
}) => {

  
  // save in DB
  const notification = await Notification.create({
    recipient,
    sender,
    type,
    post,
  });

  // send real-time
  try {
  const io = getIO();
  io.to(recipient.toString()).emit("newNotification", notification);
} catch (err) {
  console.error("Socket emit error:", err.message);
}
};
