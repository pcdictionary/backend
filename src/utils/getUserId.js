
/**
 * @jest-environment node
 */

import jwt from "jsonwebtoken";

const getUserId = (request) => {
  const cookie = request.headers.cookie==="null" ? null: request.headers.cookie ;
  if (cookie) {
    const token = cookie.split("=");
    const decoded = jwt.verify(token[1], "thisisasecret");
    return decoded
  }

  return null;
};

export default getUserId;
