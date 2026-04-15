import cookie from "cookie";
import { verifyToken } from "../utils/verifyToken.js";

export const socketAuthMiddleware = (socket, next) => {
  try {
    let token;

    // console.log("HEADERS:", socket.handshake.headers);
    // console.log("AUTH:", socket.handshake.auth);
    // console.log("QUERY:", socket.handshake.query);

   
    const cookies = cookie.parse(socket.handshake.headers.cookie || "");
    token = cookies.token;

   
    if (!token) {
      token = socket.handshake.auth?.token;
    }

    
    if (!token) {
      token = socket.handshake.query?.token;
    }

    //console.log("FINAL TOKEN:", token);

    if (!token) {
      return next(new Error("No token provided"));
    }

    const decoded = verifyToken(token);
    socket.user = decoded;

    next();
  } catch (err) {
    console.log("ERROR:", err.message);
    next(new Error("Unauthorized"));
  }
};
