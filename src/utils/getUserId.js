
/**
 * @jest-environment node
 */

import jwt from "jsonwebtoken";

const getUserId = (request) => {
  // console.log("in getuserid", request.headers.cookie)
  const cookie = request.headers.cookie==="null" ? null: request.headers.cookie ;
  if (cookie) {
    const token = cookie.split("=");
    const decoded = jwt.verify(token[1], "thisisasecret");
    console.log("Decoded data", decoded)
    return decoded
  }

  return null;
};

export default getUserId;
